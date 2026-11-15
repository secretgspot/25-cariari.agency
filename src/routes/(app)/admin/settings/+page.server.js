import { redirect, error, fail } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load(event) {
	const session = await event.locals.getSession();
	const user = session?.user;
	const is_admin = session?.is_admin;

	if (!user) {
		redirect(307, '/login?redirectTo=/admin/settings');
	}

	if (!is_admin) {
		error(403, 'Unauthorized: Administrator access required');
	}

	const supabase = event.locals.supabase;
	const { data: settings, error: fetchError } = await supabase
		.from('site_settings')
		.select('*')
		.eq('id', 1)
		.maybeSingle();

	if (fetchError) {
		console.error('Error fetching site_settings:', fetchError);
	}

	// Default fallback if settings row does not exist yet
	const defaultSettings = {
		id: 1,
		site_name: 'Cariari Agency',
		site_tagline: 'Costa Rica Real Estate',
		contact_email: 'info@cariari.agency',
		contact_phone: '+506 2222-2222',
		office_address: 'San José, Costa Rica',
		default_agent_email: 'agent@cariari.agency',
		social_facebook: '',
		social_instagram: '',
		social_linkedin: '',
		social_youtube: '',
		forward_inquiries_to_realtor: false,
		maintenance_mode: false,
		enable_registration: true,
		max_upload_size_mb: 10,
		allowed_image_types: 'jpg,jpeg,png,webp',
		items_per_page: 12
	};

	return {
		settings: settings || defaultSettings,
		user,
		is_admin: true
	};
}

/** @type {import('./$types').Actions} */
export const actions = {
	default: async (event) => {
		const session = await event.locals.getSession();
		const user = session?.user;
		const is_admin = session?.is_admin;

		if (!user || !is_admin) {
			return fail(403, { error: 'Unauthorized: Administrator access required' });
		}

		const formData = await event.request.formData();

		// Parse boolean and text values
		const forward_inquiries_to_realtor =
			formData.get('forward_inquiries_to_realtor') === 'on' ||
			formData.get('forward_inquiries_to_realtor') === 'true';
		const maintenance_mode =
			formData.get('maintenance_mode') === 'on' ||
			formData.get('maintenance_mode') === 'true';
		const enable_registration =
			formData.get('enable_registration') === 'on' ||
			formData.get('enable_registration') === 'true';

		const site_name = formData.get('site_name')?.toString().trim() || 'Cariari Agency';
		const site_tagline = formData.get('site_tagline')?.toString().trim() || '';
		const contact_email =
			formData.get('contact_email')?.toString().trim() || 'info@cariari.agency';
		const contact_phone = formData.get('contact_phone')?.toString().trim() || '';
		const office_address = formData.get('office_address')?.toString().trim() || '';
		const default_agent_email =
			formData.get('default_agent_email')?.toString().trim() || contact_email;
		const social_facebook = formData.get('social_facebook')?.toString().trim() || '';
		const social_instagram = formData.get('social_instagram')?.toString().trim() || '';
		const social_linkedin = formData.get('social_linkedin')?.toString().trim() || '';
		const social_youtube = formData.get('social_youtube')?.toString().trim() || '';

		const payload = {
			id: 1,
			site_name,
			site_tagline,
			contact_email,
			contact_phone,
			office_address,
			default_agent_email,
			social_facebook,
			social_instagram,
			social_linkedin,
			social_youtube,
			forward_inquiries_to_realtor,
			maintenance_mode,
			enable_registration,
			updated_at: new Date().toISOString(),
			updated_by: user.id
		};

		const supabase = event.locals.supabase;
		const { error: updateError } = await supabase
			.from('site_settings')
			.upsert(payload, { onConflict: 'id' });

		if (updateError) {
			console.error('Error saving site_settings:', updateError);
			return fail(500, {
				error: `Failed to save settings: ${updateError.message}`,
				values: payload
			});
		}

		return {
			success: true,
			message: 'Settings saved successfully'
		};
	}
};
