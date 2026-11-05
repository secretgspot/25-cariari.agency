export const DEFAULT_API_PAGE_SIZE = 50;
export const MAX_API_PAGE_SIZE = 100;

export function parsePagination(searchParams, { defaultLimit, maxLimit }) {
	const page = parsePositiveInteger(searchParams.get('page'), 1);
	const limit = parsePositiveInteger(searchParams.get('limit'), defaultLimit);

	if (page === null) {
		return { error: 'The page parameter must be a positive integer.' };
	}

	if (limit === null) {
		return { error: 'The limit parameter must be a positive integer.' };
	}

	if (limit > maxLimit) {
		return { error: `The limit parameter cannot exceed ${maxLimit}.` };
	}

	const offset = (page - 1) * limit;
	if (!Number.isSafeInteger(offset) || !Number.isSafeInteger(offset + limit - 1)) {
		return { error: 'The requested page is too large.' };
	}

	return { page, limit, offset };
}

function parsePositiveInteger(value, defaultValue) {
	if (value === null) return defaultValue;
	if (!/^[1-9]\d*$/.test(value)) return null;

	const number = Number(value);
	return Number.isSafeInteger(number) ? number : null;
}
