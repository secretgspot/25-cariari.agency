
import { json } from '@sveltejs/kit';

/**
 * @api {get} /api/properties Request Properties information
 * @apiName GetProperties
 * @apiGroup Properties
 *
 * @apiParam {String} [property_for] Filter by property for (e.g., "Sale", "Rent").
 * @apiParam {Number} [price_max] Maximum price.
 * @apiParam {Number} [rent_max] Maximum rent.
 * @apiParam {Number} [beds_min] Minimum number of bedrooms.
 * @apiParam {Number} [baths_min] Minimum number of bathrooms.
 * @apiParam {Number} [lot_size_min] Minimum lot size.
 * @apiParam {String} [contact_phone] Filter by contact phone (partial match).
 * @apiParam {String} [contact_realtor] Filter by contact realtor (partial match).
 * @apiParam {String} [contact_email] Filter by contact email (partial match).
 * @apiParam {Number} [year_built_min] Minimum year built.
 * @apiParam {Number} [year_built_max] Maximum year built.
 * @apiParam {String} [land_use] Filter by land use (partial match).
 * @apiParam {Number} [building_size_min] Minimum building size.
 * @apiParam {Number} [building_size_max] Maximum building size.
 * @apiParam {String} [msl] Filter by MLS number (partial match).
 * @apiParam {String} [sort] Field to sort by (e.g., "price", "created_at").
 * @apiParam {String} [order] Sort order ("asc" or "desc").
 *
 * @apiSuccess {Object[]} properties List of properties.
 */
export async function GET(event) {
	const supabaseClient = event.locals.supabase;
	const { searchParams } = new URL(event.request.url);

	let query = supabaseClient.from('properties_preview')
		.select('*');

	// Filtering
	let propertyForDebug = null;
	if (searchParams.has('property_for')) {
		let value = searchParams.get('property_for');
		propertyForDebug = value;
		if (value) {
			// Convert to Title Case for case-insensitive matching
			value = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
			query = query.filter('property_for', 'cs', `["${value}"]`);
		}
	}
	if (searchParams.has('price_max')) {
		query = query.lte('price', searchParams.get('price_max')).gt('price', 0);
	}
	if (searchParams.has('rent_max')) {
		query = query.lte('rent', searchParams.get('rent_max')).gt('rent', 0);
	}
	if (searchParams.has('beds_min')) {
		query = query.gte('beds', searchParams.get('beds_min')).gt('beds', 0);
	}
	if (searchParams.has('baths_min')) {
		query = query.gte('baths', searchParams.get('baths_min')).gt('baths', 0);
	}
	if (searchParams.has('lot_size_min')) {
		query = query.gte('lot_size', searchParams.get('lot_size_min')).gt('lot_size', 0);
	}
	if (searchParams.has('contact_phone')) {
		query = query.ilike('contact_phone', `%${searchParams.get('contact_phone')}%`);
	}
	if (searchParams.has('contact_realtor')) {
		query = query.ilike('contact_realtor', `%${searchParams.get('contact_realtor')}%`);
	}
	if (searchParams.has('contact_email')) {
		query = query.ilike('contact_email', `%${searchParams.get('contact_email')}%`);
	}
	if (searchParams.has('year_built_min')) {
		query = query.gte('year_built', searchParams.get('year_built_min')).gt('year_built', 0);
	}
	if (searchParams.has('year_built_max')) {
		query = query.lte('year_built', searchParams.get('year_built_max'));
	}
	if (searchParams.has('land_use')) {
		query = query.ilike('land_use', `%${searchParams.get('land_use')}%`);
	}
	if (searchParams.has('building_size_min')) {
		query = query.gte('building_size', searchParams.get('building_size_min')).gt('building_size', 0);
	}
	if (searchParams.has('building_size_max')) {
		query = query.lte('building_size', searchParams.get('building_size_max'));
	}
	if (searchParams.has('msl')) {
		query = query.ilike('msl', `%${searchParams.get('msl')}%`);
	}

	// Sorting
	const sort = searchParams.get('sort');
	const order = searchParams.get('order');

	if (sort && order) {
		query = query.order(sort, { ascending: order === 'asc' });
	} else {
		query = query.order('created_at', { ascending: false }).order('updated_at', { ascending: false });
	}

	let data, err;
	try {
		const result = await query;
		data = result.data;
		err = result.error;
	} catch (e) {
		return json({
			status: 'error',
			error: {
				code: 'DATABASE_ERROR',
				message: 'Exception thrown during query execution.',
				details: e.message,
				property_for_debug: propertyForDebug
			}
		}, { status: 500 });
	}

	if (err) {
		return json({
			status: 'error',
			error: {
				code: 'DATABASE_ERROR',
				message: 'Failed to retrieve properties.',
				details: err.message,
				property_for_debug: propertyForDebug
			}
		}, { status: 500 });
	}

	return json({
		status: 'success',
		data: data
	});
};
