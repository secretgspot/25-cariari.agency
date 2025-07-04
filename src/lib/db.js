import { createClient, getSupabase } from '@supabase/auth-helpers-sveltekit';
// import { env } from '$env/dynamic/public';
// or use the static env
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { goto, invalidateAll } from '$app/navigation';
import { writable } from 'svelte/store';
// import { fail, redirect, error } from '@sveltejs/kit';

const options = {
	db: {
		schema: 'public',
	},
	auth: {
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: true,
	},
	global: {
		headers: { 'x-created-by': 'secretGspot' },
	},
};

export const supabase = createClient(
	PUBLIC_SUPABASE_URL,
	PUBLIC_SUPABASE_ANON_KEY,
	options
)

export const userStore = writable(supabase.auth.getSession())

supabase.auth.onAuthStateChange(async (event, session) => {
	// console.log('EVENT CHANGE: ', event);

	if (event == 'SIGNED_IN') {
		userStore.set(session.user);
		console.log('SIGNED_IN  🔥🔥🔥');
		// invalidateAll();
	};
	if (event == 'SIGNED_OUT') {
		console.log('SIGNED_OUT 💩💩💩');
		userStore.set({});
		// invalidateAll();
		// goto('/');
	};
	if (event == 'TOKEN_REFRESHED') console.log('TOKEN_REFRESHED');
	if (event == 'USER_UPDATED') console.log('USER_UPDATED');
	if (event == 'USER_DELETED') console.log('USER_DELETED');
	if (event == 'PASSWORD_RECOVERY') {
		console.log('PASSWORD_RECOVERY');
		const newPassword = prompt("¿Cuál te gustaría que fuera tu nueva contraseña?");
		const { data, error } = await supabase.auth.updateUser({ password: newPassword });
		if (error) alert(`Hubo un error al actualizar la contraseña: ${error.message}`);
		if (data) {
			console.log('Password updated successfully');
			goto('/');
		};
	}
})

export default {
	get user() {
		return userStore
	},
}