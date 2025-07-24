
import { json } from '@sveltejs/kit';

/**
 * @api {get} /api/properties/:id Request Property information
 * @apiName GetProperty
 * @apiGroup Properties
 *
 * @apiParam {String} id Property unique ID.
 *
 * @apiSuccess {Object} property Property details.
 */
export async function GET(event) {
	const supabaseClient = event.locals.supabase;
	const { id } = event.params;

	const uuidPattern = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;
	const mslPattern = /^cr-\d+$/i;

	let data, err;
	if (uuidPattern.test(id)) {
		// Lookup by UUID
		({ data, error: err } = await supabaseClient.from('properties_preview')
			.select('*')
			.eq('id', id)
			.single());
	} else if (mslPattern.test(id)) {
		// Lookup by MSL (case-insensitive)
		({ data, error: err } = await supabaseClient.from('properties_preview')
			.select('*')
			.ilike('msl', id)
			.single());
	} else {
		return json({
			status: 'error',
			error: {
				code: 'INVALID_ID',
				message: `Invalid property identifier: ${id}`
			}
		}, { status: 404 });
	}

	if (err || !data) {
		return json({
			status: 'error',
			error: {
				code: 'NOT_FOUND',
				message: `Property with id/msl ${id} not found.`,
				details: err ? err.message : undefined
			}
		}, { status: 404 });
	}

	return json({
		status: 'success',
		data: data
	});
};
