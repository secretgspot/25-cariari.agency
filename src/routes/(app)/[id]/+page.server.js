import { error, fail } from '@sveltejs/kit';
import { DEFAULT_AGENT_EMAIL, VITE_GOOGLE_EMAIL } from '$app/env/private';
import transporter from '#lib/utils/emailSetup.server.js';
import { createInquiryEmail } from '#lib/utils/emailTemplates.server.js';
import { applyRateLimit } from '#lib/utils/rateLimit.js';
import { isValidEmail, readTextField } from '#lib/utils/formFields.server.js';

/** @type {import('./$types').PageServerLoad} */
export async function load(event) {
	const supabaseClient = event.locals.supabase;
	const { id } = event.params;

	// Patterns
	const uuidPattern = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;
	const mslPattern = /^cr-\d+$/i;

	let property, err;

	if (uuidPattern.test(id)) {
		// Lookup by UUID
		({ data: property, error: err } = await supabaseClient
			.from('properties')
			.select(`*, photos(file_path, file_url)`)
			.eq('id', id)
			.order('created_at', { referencedTable: 'photos', ascending: true })
			.single());
	} else if (mslPattern.test(id)) {
		// Lookup by MSL (case-insensitive)
		({ data: property, error: err } = await supabaseClient
			.from('properties')
			.select(`*, photos(file_path, file_url)`)
			.ilike('msl', id)
			.order('created_at', { referencedTable: 'photos', ascending: true })
			.single());
	} else {
		error(404, `Invalid property identifier: ${id}`);
	}

	if (err || !property) error(404, `Can't get property with id/msl: ${id}, ${err ? err.message : 'Not found'}`);

	return {
		property
	};
}

/** @type {import('./$types').Actions} */
export const actions = {
	default: async (event) => {
		// Rate limiting check (max 5 inquiries per hour per client)
		const rateLimit = applyRateLimit(event.request, 'inquiry');
		if (!rateLimit.allowed) {
			console.warn('🚦 Inquiry form rate limit reached');
			const minutes = Math.ceil(rateLimit.retryAfter / 60);
			return fail(429, {
				rateLimited: true,
				message: `Too many inquiries sent. Please wait ${minutes} minute${minutes === 1 ? '' : 's'} before trying again.`
			});
		}

		const supabaseClient = event.locals.supabase;
		const formData = await event.request.formData();

		// Honeypot check - if filled, it's a bot
		const website = formData.get('website');
		if (website) {
			console.warn('🤖 Inquiry form honeypot triggered');
			return fail(400, {
				errors: { message: 'Unable to submit inquiry. Please refresh the page and try again.' },
			});
		}

		// Validate required fields
		const name = readTextField(formData, 'name', { maxLength: 200 });
		const phone = readTextField(formData, 'phone', { maxLength: 50 });
		const email = readTextField(formData, 'email', { maxLength: 254 });
		const propertyId = readTextField(formData, 'property_id', { maxLength: 36 });
		const message = readTextField(formData, 'message', { required: false });

		if (
			!name ||
			/[\u0000-\u001f\u007f]/.test(name) ||
			!phone ||
			!email ||
			!isValidEmail(email) ||
			!propertyId ||
			message === null
		) {
			console.warn('❌ Inquiry form rejected: invalid contact details');
			return fail(400, { errors: { message: 'Please provide valid contact details.' } });
		}

		// Verify property exists - get full contact info
		const { data: property, error: propError } = await supabaseClient
			.from('properties')
			.select('id, msl, contact_email, contact_realtor, contact_phone')
			.eq('id', propertyId)
			.single();

		if (propError || !property) {
			console.error(`❌ Inquiry rejected: property ${propertyId} not found for ${name} <${email}>:`, propError?.message);
			return fail(404, { errors: { message: 'Property not found' } });
		}

		// Prepare inquiry data
		const inquiryData = {
			property_id: propertyId,
			name,
			phone,
			email,
			message: message || null,
			status: 'new'
		};

		// Save to database (no .select().single() so RLS permits public write without requiring public SELECT)
		const { error: insertError } = await supabaseClient
			.from('inquiries')
			.insert(inquiryData);

		if (insertError) {
			console.error(`❌ Failed to save inquiry for property ${property.msl} from ${name} <${email}>:`, insertError.message);
			return fail(500, { errors: { message: 'Failed to submit inquiry. Please try again.' } });
		}

		console.log(`📥 Inquiry saved for ${property.msl} from ${name} <${email}>`);

		// Send email notification to listing agent (using shared transporter like contact form)
		try {
			// Determine recipient - prefer realtor's email, fallback to default
			const agentEmail = property.contact_email || DEFAULT_AGENT_EMAIL;

			const agentName = property.contact_realtor
				? `Listing Agent ${property.contact_realtor}`
				: 'Listing Agent';

			if (agentEmail && isValidEmail(agentEmail)) {
				await new Promise((resolve, reject) => {
					transporter.sendMail(
						{
							from: VITE_GOOGLE_EMAIL || 'Cariari Agency <noreply@cariari.agency>',
							to: agentEmail,
							...createInquiryEmail({
								msl: property.msl,
								agentName: property.contact_realtor || 'Listing Agent',
								name,
								email,
								phone,
								message,
							}),
						},
						(err, info) => {
							if (err) {
								reject(err);
							} else {
								console.log(`📬 Inquiry email sent for ${property.msl} to ${agentName}`);
								resolve(info);
							}
						}
					);
				});
			} else {
				if (agentEmail) {
					console.error(`📬 Invalid listing agent email for ${property.msl}; inquiry saved, notification not sent.`);
				} else {
					console.warn(`📬 No listing agent email for ${property.msl}; inquiry saved, notification not sent.`);
				}
			}
		} catch (emailError) {
			console.error(`📬 Inquiry email failed for ${property.msl} from ${name} <${email}>:`, emailError.message);
			// Don't fail the request if email fails - inquiry is saved
		}

		return { success: true };
	}
};
