
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

	const { data, error: err } = await supabaseClient.from('properties_preview')
		.select('*')
        .eq('id', id)
		.single();

	if (err) {
        return json({
            status: 'error',
            error: {
                code: 'NOT_FOUND',
                message: `Property with id ${id} not found.`,
                details: err.message
            }
        }, { status: 404 });
    }

	return json({
        status: 'success',
        data: data
    });
};
