import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { actions } from './+page.server.js';

async function submitVisibleCount(value) {
	const formData = new FormData();
	if (value !== undefined) formData.set('visibleCount', value);

	return actions.default({
		request: new Request('https://example.test/properties', {
			method: 'POST',
			body: formData
		})
	});
}

describe('POST /properties load-more action', () => {
	it('accepts a positive visible count', async () => {
		assert.deepEqual(await submitVisibleCount('48'), { visibleCount: 48 });
	});

	it('rejects missing, invalid, and unsafe counts', async () => {
		for (const value of [undefined, '0', '-1', '1.5', '9007199254740992']) {
			const result = await submitVisibleCount(value);
			assert.equal(result.status, 400);
			assert.equal(result.data.visibleCount, 24);
			assert.match(result.data.error, /visible properties is invalid/);
		}
	});
});
