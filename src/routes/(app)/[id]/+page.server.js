import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import transporter from '$lib/utils/emailSetup.server.js';

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

				console.log('🔍 Inquiry form submission:', { name, phone, email, propertyId, website: formData.get('website') });

				if (!name || !phone || !email || !propertyId) {
					console.log('❌ Missing required fields');
					return { errors: { message: 'All required fields must be filled' } };
				}

				// Validate email format
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				if (!emailRegex.test(email)) {
					console.log('❌ Invalid email format:', email);
					return { errors: { message: 'Invalid email format' } };
				}

				// Verify property exists - get full contact info
				const { data: property, error: propError } = await supabaseClient
					.from('properties')
					.select('id, msl, contact_email, contact_realtor, contact_phone')
					.eq('id', propertyId)
					.single();

				if (propError || !property) {
					console.log('❌ Property not found:', propError?.message);
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

				console.log('📝 Inserting inquiry:', inquiryData);

				// Save to database
				const { error: insertError, data: inserted } = await supabaseClient
					.from('inquiries')
					.insert(inquiryData)
					.select()
					.single();

				if (insertError) {
					console.error('❌ Failed to save inquiry:', insertError);
					return { errors: { message: 'Failed to submit inquiry. Please try again.' } };
				}

				console.log('✅ Inquiry saved:', inserted);

		// Send email notification to listing agent (using shared transporter like contact form)
		try {
			// Determine recipient - prefer realtor's email, fallback to default
			const agentEmail = property.contact_email || env.DEFAULT_AGENT_EMAIL;
			const agentName = property.contact_realtor || 'Listing Agent';
			const agentPhone = property.contact_phone || null;

			if (agentEmail) {
				await new Promise((resolve, reject) => {
					transporter.sendMail(
						{
							from: env.VITE_GOOGLE_EMAIL || 'Cariari Agency <noreply@cariari.agency>',
							to: agentEmail,
							subject: `New Inquiry for Property ${property.msl}`,
							html: `
								<div style="font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #333333;">
									<h3 style="color: #000000; font-size: 20px; margin-bottom: 15px;">New Property Inquiry</h3>
									<p style="margin-bottom: 8px;"><strong>Property:</strong> <span style="color: #000000;">${property.msl}</span></p>
									<p style="margin-bottom: 8px;"><strong>Listing Agent:</strong> <span style="color: #000000;">${agentName}</span></p>
									<p style="margin-bottom: 20px;"><strong>From:</strong> <span style="color: #000000;">${name}</span> (${email})</p>
									<p style="margin-bottom: 8px;"><strong>Phone:</strong> <span style="color: #000000;">${phone}</span></p>
									<p style="margin-bottom: 8px;"><strong>Message:</strong></p>
									<div style="background-color: #f8f8f8; border: 1px solid #e0e0e0; padding: 15px; border-radius: 5px; margin-top: 15px; word-wrap: break-word;">
										${formData.get('message') || 'No message provided'}
									</div>
									<p style="margin-top: 20px; font-size: 14px; color: #777777;">This message was sent via the inquiry form on your website.</p>
								</div>
							`,
						},
						(err, info) => {
							if (err) {
								console.error('📬 Error sending email:', err);
								reject(err);
							} else {
								console.log('📬 Email sent:', info.response);
								resolve(info);
							}
						}
					);
				});
			} else if (agentPhone) {
				// No email available - log that phone fallback would be used
				console.log(`📬 No email for ${agentName}, inquiry saved. Agent phone: ${agentPhone}`);
			} else {
				console.log('📬 No contact info for agent, inquiry saved to database only');
			}
		} catch (emailError) {
			console.error('Failed to send email notification:', emailError);
			// Don't fail the request if email fails - inquiry is saved
		}

		return { success: true };
	}
};