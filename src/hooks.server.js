import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { dev } from '$app/environment';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			getAll: () => event.cookies.getAll(),
			setAll: (cookiesToSet) => {
				cookiesToSet.forEach(({ name, value, options }) => {
					const cookieOptions = {
						...options,
						path: '/',
					};
					if (dev) {
						cookieOptions.secure = false;
						delete cookieOptions.domain;
					}
					event.cookies.set(name, value, cookieOptions);
				});
			},
		},
	})


	/**
	 * a little helper that is called for every page.
	 * for example, as part of the load function in src/routes/+layout.ts
	 */
	event.locals.getSession = async () => {
		const {
			data: { user },
			error,
		} = await event.locals.supabase.auth.getUser()

		if (error || !user) {
			console.log('hooks.server.js: user authentication failed 👎');
			return {
				user: null,
				is_logged_in: false,
				is_admin: false
			}
		}

		console.log('hooks.server.js: user details fetched successfully 👍');
		const is_logged_in = true;
		const is_admin = user?.app_metadata?.claims_admin || false;

		return {
			user,
			is_admin,
			is_logged_in,
		}
	}

	event.locals.supabase.auth.onAuthStateChange((event, session) => {
		if (event === 'SIGNED_IN') {
			console.log('hooks.server.js: User has signed in 🔥');
		} else if (event === 'SIGNED_OUT') {
			console.log('hooks.server.js: User has signed out 💥');
		}
	});

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version'
		},
	});
}