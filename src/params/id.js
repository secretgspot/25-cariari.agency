// Accepts both UUID and MSL (cr-100 style) as valid params for [id] matcher
// This matcher replaces the default uuid.js matcher for the new route

export const match = (param) => {
	const uuidPattern = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;
	const mslPattern = /^cr-\d+$/i;
	return uuidPattern.test(param) || mslPattern.test(param);
};
