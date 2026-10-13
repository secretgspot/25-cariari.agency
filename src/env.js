import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	PUBLIC_SUPABASE_URL: { public: true, static: true },
	PUBLIC_SUPABASE_ANON_KEY: { public: true, static: true },
	DEFAULT_AGENT_EMAIL: { schema: (input) => input ?? '' },
	VITE_GOOGLE_EMAIL: { static: true },
	VITE_GOOGLE_EMAIL_PASSWORD: { static: true }
});
