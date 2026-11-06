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
		filter(...args) {
			calls.push(['filter', ...args]);
			return this;
		},
		lte(...args) {
			calls.push(['lte', ...args]);
			return this;
		},
		gte(...args) {
			calls.push(['gte', ...args]);
			return this;
		},
		gt(...args) {
			calls.push(['gt', ...args]);
			return this;
		},
		ilike(...args) {
			calls.push(['ilike', ...args]);
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

describe('GET /api/properties filter validation', () => {
	async function get(url, client = createSupabaseMock().client) {
		return GET({
			locals: { supabase: client },
			request: new Request(`https://example.test/api/properties${url}`)
		});
	}

	it('rejects malformed, negative, and non-integer year filters before querying Supabase', async () => {
		for (const params of [
			'price_max=NaN',
			'rent_max=Infinity',
			'beds_min=-1',
			'baths_min=',
			'lot_size_min=1e3',
			'year_built_min=2020.5',
			'year_built_max=9007199254740992',
			'building_size_min=-0.1',
			'building_size_max=abc'
		]) {
			const { calls, client } = createSupabaseMock();
			const response = await get(`?${params}`, client);

			assert.equal(response.status, 400, params);
			assert.equal((await response.json()).error.code, 'INVALID_FILTER', params);
			assert.equal(calls.length, 0, params);
		}
	});

	it('rejects inverted year and building-size ranges', async () => {
		for (const params of [
			'year_built_min=2020&year_built_max=2010',
			'building_size_min=200&building_size_max=100'
		]) {
			const { calls, client } = createSupabaseMock();
			const response = await get(`?${params}`, client);

			assert.equal(response.status, 400, params);
			assert.equal((await response.json()).error.code, 'INVALID_FILTER', params);
			assert.equal(calls.length, 0, params);
		}
	});

	it('rejects unsupported, empty, repeated, and overlong text filters', async () => {
		for (const params of [
			'property_for=Buy',
			'property_for=',
			'property_for=Sale&property_for=Rent',
			'land_use=%20%20',
			`msl=${'x'.repeat(201)}`,
			'contact_email=agent%0A@example.test'
		]) {
			const { calls, client } = createSupabaseMock();
			const response = await get(`?${params}`, client);

			assert.equal(response.status, 400, params.slice(0, 40));
			assert.equal((await response.json()).error.code, 'INVALID_FILTER', params.slice(0, 40));
			assert.equal(calls.length, 0, params.slice(0, 40));
		}
	});

	it('preserves valid numeric and text filter behavior', async () => {
		const { calls, client } = createSupabaseMock();
		const response = await get(
			'?property_for=sAlE&price_max=400000.50&beds_min=2&year_built_min=2000&year_built_max=2025&building_size_min=80&building_size_max=250&msl=CR-003',
			client
		);

		assert.equal(response.status, 200);
		assert.ok(calls.some(([name, column, operator, value]) =>
			name === 'filter' && column === 'property_for' && operator === 'cs' && value === '["Sale"]'
		));
		assert.ok(calls.some(([name, column, value]) =>
			name === 'lte' && column === 'price' && value === 400000.5
		));
		assert.ok(calls.some(([name, column, value]) =>
			name === 'gt' && column === 'price' && value === 0
		));
		assert.ok(calls.some(([name, column, value]) =>
			name === 'gte' && column === 'beds' && value === 2
		));
		assert.ok(calls.some(([name, column, value]) =>
			name === 'ilike' && column === 'msl' && value === '%CR-003%'
		));
	});
});
