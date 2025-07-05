import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { createBrowserClient } from '@supabase/ssr';

/** @type {import('./$types').LayoutLoad} */
export const load = async ({ fetch, data, depends }) => {
	depends('supabase:auth');

	const supabase = createBrowserClient(
		PUBLIC_SUPABASE_URL,
		PUBLIC_SUPABASE_ANON_KEY,
		{
			global: {
				fetch,
			},
			cookies: {
				getAll() {
					return data.session.cookies;
				},
				setAll(cookiesToSet) {
					cookiesToSet.forEach(({ name, value, options }) => {
						document.cookie = `${name}=${value}; Path=/; ${options?.maxAge ? `Max-Age=${options.maxAge};` : ''} ${options?.expires ? `Expires=${options.expires.toUTCString()};` : ''} ${options?.httpOnly ? 'HttpOnly;' : ''} ${options?.secure ? 'Secure;' : ''} ${options?.sameSite ? `SameSite=${options.sameSite};` : ''}`;
					});
				},
			},
		}
	);

	const { session } = data;

	return { supabase, session };
};