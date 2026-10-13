import { defineParams } from '@sveltejs/kit/params';

// Accepts both UUID and MSL (cr-100 style) as valid params for [id] matcher
// This matcher replaces the default uuid.js matcher for the new route
const matchId = (param) => {
	const uuidPattern = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;
	const mslPattern = /^cr-\d+$/i;

	return uuidPattern.test(param) || mslPattern.test(param);
};

// import type { ParamMatcher } from '@sveltejs/kit';
const matchUuid = (param) => {
	return (/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/).test(param);
};

export const params = defineParams({
	id: (param) => (matchId(param) ? param : undefined),
	uuid: (param) => (matchUuid(param) ? param : undefined)
});
