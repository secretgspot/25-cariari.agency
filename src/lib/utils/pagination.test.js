import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
	DEFAULT_API_PAGE_SIZE,
	MAX_API_PAGE_SIZE,
	parsePagination
} from './pagination.js';

describe('pagination parameters', () => {
	const options = { defaultLimit: DEFAULT_API_PAGE_SIZE, maxLimit: MAX_API_PAGE_SIZE };

	it('uses the first page and default limit when omitted', () => {
		assert.deepEqual(parsePagination(new URLSearchParams(), options), {
			page: 1,
			limit: 50,
			offset: 0
		});
	});

	it('calculates a bounded page offset', () => {
		assert.deepEqual(parsePagination(new URLSearchParams('page=3&limit=24'), options), {
			page: 3,
			limit: 24,
			offset: 48
		});
	});

	it('rejects invalid, oversized, and overflowing values', () => {
		assert.match(parsePagination(new URLSearchParams('page=0'), options).error, /positive integer/);
		assert.match(parsePagination(new URLSearchParams('limit=101'), options).error, /cannot exceed/);
		assert.match(
			parsePagination(new URLSearchParams('page=9007199254740991&limit=100'), options).error,
			/too large/
		);
	});
});
