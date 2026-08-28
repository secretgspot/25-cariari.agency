import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import nodemailer from 'nodemailer';

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
		const supabaseClient = event.locals.supabase;
		const formData = await event.request.formData();

		// Honeypot check - if filled, it's a bot
		const website = formData.get('website');
		if (website) {
			// Silently succeed for bots
			return { success: true };
		}

		// Validate required fields
		const name = formData.get('name');
		const phone = formData.get('phone');
		const email = formData.get('email');
		const propertyId = formData.get('property_id');

		if (!name || !phone || !email || !propertyId) {
			return { errors: { message: 'All required fields must be filled' } };
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return { errors: { message: 'Invalid email format' } };
		}

		// Verify property exists
		const { data: property, error: propError } = await supabaseClient
			.from('properties')
			.select('id, msl, contact_email')
			.eq('id', propertyId)
			.single();

		if (propError || !property) {
			return { errors: { message: 'Property not found' } };
		}

		// Prepare inquiry data
		const inquiryData = {
			property_id: propertyId,
			name,
			phone,
			email,
			message: formData.get('message') || null,
			status: 'new'
		};

		// Save to database
		const { error: insertError } = await supabaseClient
			.from('inquiries')
			.insert(inquiryData)
			.select()
			.single();

		if (insertError) {
			console.error('Failed to save inquiry:', insertError);
			return { errors: { message: 'Failed to submit inquiry. Please try again.' } };
		}

		// Send email notification to listing agent
		try {
			const transporter = nodemailer.createTransport({
				host: env.SMTP_HOST,
				port: Number(env.SMTP_PORT) || 587,
				secure: env.SMTP_SECURE === 'true',
				auth: {
					user: env.SMTP_USER,
					pass: env.SMTP_PASS
				}
			});

			const agentEmail = property.contact_email || env.DEFAULT_AGENT_EMAIL;

			if (agentEmail) {
				await transporter.sendMail({
					from: env.SMTP_FROM || 'Cariari Agency <noreply@cariari.agency>',
					to: agentEmail,
					subject: `New Inquiry for Property ${property.msl}`,
					html: `
						<h2>New Property Inquiry</h2>
						<p><strong>Property:</strong> ${property.msl} (ID: ${propertyId})</p>
						<p><strong>From:</strong> ${name} (${email})</p>
						<p><strong>Phone:</strong> ${phone}</p>
						<p><strong>Message:</strong></p>
						<p>${formData.get('message') || 'No message provided'}</p>
					`
				});
			}
		} catch (emailError) {
			console.error('Failed to send email notification:', emailError);
			// Don't fail the request if email fails - inquiry is saved
		}

		return { success: true };
	}
};
