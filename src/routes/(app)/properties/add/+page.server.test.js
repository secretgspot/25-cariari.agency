import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { actions } from './+page.server.js';

const RESERVATION_TOKEN = '11111111-1111-4111-8111-111111111111';

function createRequest(reservationToken) {
	const formData = new FormData();
	formData.set('msl', 'CR-001');
	formData.set('msl_reservation_token', reservationToken);
	formData.set('location', '{}');
	formData.set('property_for', '["Sale"]');
	formData.set('features', '[]');

	return new Request('https://example.test/properties/add?/add', {
		method: 'POST',
		body: formData,
	});
}

function createEvent({ reservationConfirmed, insertResult }) {
	let insertedProperty;
	let insertCalls = 0;

	return {
		event: {
			request: createRequest(RESERVATION_TOKEN),
			locals: {
				supabase: {
					auth: {
						getUser: async () => ({ data: { user: { id: 'user-id' } }, error: null }),
					},
					rpc: async (name, args) => {
						assert.equal(name, 'confirm_property_msl_reservation');
						assert.deepEqual(args, {
							p_reservation_token: RESERVATION_TOKEN,
							p_msl: 'CR-001',
						});
						return { data: reservationConfirmed, error: null };
					},
					from: (table) => {
						assert.equal(table, 'properties');
						return {
							insert: (property) => {
								insertCalls += 1;
								insertedProperty = property;
								return {
									select: () => ({
										maybeSingle: async () => insertResult,
									}),
								};
							},
						};
					},
				},
			},
		},
		get insertedProperty() {
			return insertedProperty;
		},
		get insertCalls() {
			return insertCalls;
		},
	};
}

describe('POST /properties/add MSL reservation', () => {
	it('rejects an expired reservation without inserting a property', async () => {
		const context = createEvent({ reservationConfirmed: false });
		const result = await actions.add(context.event);

		assert.equal(result.status, 409);
		assert.match(result.data.message, /reservation expired/i);
		assert.equal(context.insertCalls, 0);
	});

	it('confirms the reservation before inserting the property', async () => {
		const context = createEvent({
			reservationConfirmed: true,
			insertResult: {
				data: { id: 'property-id', msl: 'CR-001' },
				error: null,
			},
		});
		const result = await actions.add(context.event);

		assert.equal(result.success, true);
		assert.equal(context.insertCalls, 1);
		assert.equal(context.insertedProperty.msl, 'CR-001');
	});
});
