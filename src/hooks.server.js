import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { createServerClient } from '@supabase/ssr';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			getAll() {
				return event.cookies.getAll()
			},
			setAll(cookiesToSet) {
				/**
				 * Note: You have to add the `path` variable to the
				 * set and remove method due to sveltekit's cookie API
				 * requiring this to be set, setting the path to an empty string
				 * will replicate previous/standard behavior (https://kit.svelte.dev/docs/types#public-types-cookies)
				 */
				cookiesToSet.forEach(({ name, value, options }) =>
					event.cookies.set(name, value, { ...options, path: '/' })
				)
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