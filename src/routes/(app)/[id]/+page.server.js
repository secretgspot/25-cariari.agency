import { error, fail } from '@sveltejs/kit';
import { DEFAULT_AGENT_EMAIL, VITE_GOOGLE_EMAIL } from '$app/env/private';
import transporter from '#lib/utils/emailSetup.server.js';
import { createInquiryEmail } from '#lib/utils/emailTemplates.server.js';
import { applyRateLimit } from '#lib/utils/rateLimit.js';
import { escapeHtml, isValidEmail, readTextField } from '#lib/utils/formFields.server.js';

/** @type {import('./$types').PageServerLoad} */
export async function load(event) {
	const supabaseClient = event.locals.supabase;
	const { id } = event.params;
	const sessionInfo = (await event.locals.getSession?.()) || {};
	const isAdmin = Boolean(sessionInfo?.is_admin);

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

	let sanitizedProperty = property;
	if (!isAdmin) {
		sanitizedProperty = {
			...property,
			contact_email: null,
			contact_phone: null
		};
	}

	return {
		property: sanitizedProperty,
		is_admin: isAdmin
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

		// Send email notification based on site settings lead routing preference
		try {
			const { data: settings } = await supabaseClient
				.from('site_settings')
				.select('forward_inquiries_to_realtor, contact_email, default_agent_email')
				.eq('id', 1)
				.single();

			const forwardToRealtor = settings?.forward_inquiries_to_realtor === true;

			if (forwardToRealtor) {
				const agentEmail = property.contact_email || settings?.default_agent_email || DEFAULT_AGENT_EMAIL;
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
									console.log(`📬 Inquiry forwarded to listing agent ${agentName} (${agentEmail}) for ${property.msl}`);
									resolve(info);
								}
							}
						);
					});
				} else {
					if (agentEmail) {
						console.error(`📬 Invalid listing agent email (${agentEmail}) for ${property.msl}; inquiry saved, notification not sent.`);
					} else {
						console.warn(`📬 No listing agent email for ${property.msl}; inquiry saved, notification not sent.`);
					}
				}
			} else {
				// Admin Control Mode: Route inquiry to central Agency Admin
				const destinationEmail = settings?.contact_email || VITE_GOOGLE_EMAIL || DEFAULT_AGENT_EMAIL;
				const realtorName = property.contact_realtor || 'None Assigned';

				if (destinationEmail && isValidEmail(destinationEmail)) {
					const safeMsl = escapeHtml(property.msl);
					const safeRealtorName = escapeHtml(realtorName);
					const safeRealtorEmail = escapeHtml(property.contact_email || 'No email specified');
					const safeName = escapeHtml(name);
					const safeEmail = escapeHtml(email);
					const safePhone = escapeHtml(phone);
					const safeMessage = escapeHtml(message || 'No message provided');

					const adminSubject = `[Agency Lead] New Inquiry for ${property.msl}`;
					const adminText = [
						`[Agency Lead] New Inquiry for ${property.msl}`,
						'Note: Direct realtor forwarding is disabled so admin has full control over lead routing.',
						`Listing Agent: ${realtorName} (${property.contact_email || 'No email specified'})`,
						'',
						`Property: ${property.msl}`,
						`From: ${name} (${email})`,
						`Phone: ${phone}`,
						'Message:',
						message || 'No message provided',
					].join('\n');

					const adminHtml = `
						<div style="font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #333333;">
							<div style="background-color: #fdf8e2; border-left: 4px solid #C49A2F; padding: 12px 16px; margin-bottom: 20px; font-size: 14px; color: #4a3b10;">
								<strong>[Agency Lead Notice]</strong> Direct realtor forwarding is disabled so admin has full control over lead routing.<br>
								<strong>Listing Agent on Record:</strong> ${safeRealtorName} &bull; ${safeRealtorEmail}
							</div>
							<h3 style="color: #000000; font-size: 20px; margin-bottom: 15px;">New Property Inquiry for ${safeMsl}</h3>
							<p style="margin-bottom: 8px;"><strong>Property:</strong> <span style="color: #000000;">${safeMsl}</span></p>
							<p style="margin-bottom: 8px;"><strong>Listing Agent:</strong> <span style="color: #000000;">${safeRealtorName}</span></p>
							<p style="margin-bottom: 20px;"><strong>From:</strong> <span style="color: #000000;">${safeName}</span> (<a href="mailto:${safeEmail}" style="color: #C49A2F; text-decoration: none;">${safeEmail}</a>)</p>
							<p style="margin-bottom: 8px;"><strong>Phone:</strong> <a href="tel:${safePhone}" style="color: #C49A2F; text-decoration: none;">${safePhone}</a></p>
							<p style="margin-bottom: 8px;"><strong>Message:</strong></p>
							<div style="background-color: #f8f8f8; border: 1px solid #e0e0e0; padding: 15px; border-radius: 5px; margin-top: 15px; word-wrap: break-word; white-space: pre-wrap;">${safeMessage}</div>
							<p style="margin-top: 20px; font-size: 14px; color: #777777;">This lead was routed to Agency Admin via Cariari Agency inquiry form (Realtor forwarding disabled).</p>
						</div>
					`;

					await new Promise((resolve, reject) => {
						transporter.sendMail(
							{
								from: VITE_GOOGLE_EMAIL || 'Cariari Agency <noreply@cariari.agency>',
								to: destinationEmail,
								subject: adminSubject,
								text: adminText,
								html: adminHtml,
							},
							(err, info) => {
								if (err) {
									reject(err);
								} else {
									console.log(`📥 Inquiry saved & routed to Agency Admin (${destinationEmail}) for ${property.msl} (Realtor forwarding disabled)`);
									resolve(info);
								}
							}
						);
					});
				} else {
					if (destinationEmail) {
						console.error(`📥 Invalid Agency Admin email (${destinationEmail}) for ${property.msl}; inquiry saved, notification not sent.`);
					} else {
						console.warn(`📥 No Agency Admin email configured for ${property.msl}; inquiry saved, notification not sent.`);
					}
				}
			}
		} catch (emailError) {
			console.error(`📬 Inquiry email failed for ${property.msl} from ${name} <${email}>:`, emailError?.message || emailError);
			// Don't fail the request if email fails - inquiry is saved
		}

		return { success: true };
	}
};
