import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GET } from './+server.js';

function createSupabaseMock({ data = [], count = 0 } = {}) {
	const calls = [];
	const query = {
		select(...args) {
			calls.push(['select', ...args]);
			return this;
		},
		order(...args) {
			calls.push(['order', ...args]);
			return this;
		},
		range(...args) {
			calls.push(['range', ...args]);
			return this;
		},
		then(resolve, reject) {
			return Promise.resolve({ data, count, error: null }).then(resolve, reject);
		}
	};

	return {
		calls,
		client: {
			from(table) {
				calls.push(['from', table]);
				return query;
			}
		}
	};
}

describe('GET /api/properties pagination', () => {
	it('bounds the query and returns count metadata without changing the data array', async () => {
		const { calls, client } = createSupabaseMock({ data: [{ id: 'one' }], count: 51 });
		const response = await GET({
			locals: { supabase: client },
			request: new Request('https://example.test/api/properties?page=2&limit=24')
		});

		assert.equal(response.status, 200);
		assert.deepEqual(await response.json(), {
			status: 'success',
			data: [{ id: 'one' }],
			pagination: { page: 2, limit: 24, total: 51, totalPages: 3 }
		});
		assert.deepEqual(calls.find(([name]) => name === 'range'), ['range', 24, 47]);
		assert.ok(calls.some(([name, column, options]) =>
			name === 'order' && column === 'id' && options.ascending === false
		));
	});

	it('rejects invalid pagination before querying Supabase', async () => {
		const { calls, client } = createSupabaseMock();
		const response = await GET({
			locals: { supabase: client },
			request: new Request('https://example.test/api/properties?page=0')
		});

		assert.equal(response.status, 400);
		assert.equal((await response.json()).error.code, 'INVALID_PAGINATION');
		assert.equal(calls.length, 0);
	});
});
