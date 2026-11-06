


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
 * @apiParam {Number} [page=1] One-based result page.
 * @apiParam {Number} [limit=50] Results per page (maximum 100).
 *
 * @apiSuccess {Object[]} properties List of properties.
 */
import {
	DEFAULT_API_PAGE_SIZE,
	MAX_API_PAGE_SIZE,
	parsePagination
} from '#lib/utils/pagination.js';

const MAX_FILTER_TEXT_LENGTH = 200;
const NUMERIC_FILTERS = [
	{ param: 'price_max', column: 'price', method: 'lte', excludeZero: true },
	{ param: 'rent_max', column: 'rent', method: 'lte', excludeZero: true },
	{ param: 'beds_min', column: 'beds', method: 'gte', excludeZero: true },
	{ param: 'baths_min', column: 'baths', method: 'gte', excludeZero: true },
	{ param: 'lot_size_min', column: 'lot_size', method: 'gte', excludeZero: true },
	{ param: 'year_built_min', column: 'year_built', method: 'gte', excludeZero: true, integer: true },
	{ param: 'year_built_max', column: 'year_built', method: 'lte', integer: true },
	{ param: 'building_size_min', column: 'building_size', method: 'gte', excludeZero: true },
	{ param: 'building_size_max', column: 'building_size', method: 'lte' }
];
const TEXT_FILTERS = [
	'contact_phone',
	'contact_realtor',
	'contact_email',
	'land_use',
	'msl'
];

function filterError(message) {
	return Response.json(
		{
			status: 'error',
			error: {
				code: 'INVALID_FILTER',
				message
			}
		},
		{ status: 400 }
	);
}

function validateFilters(searchParams) {
	const numericValues = {};
	const textValues = {};

	for (const { param, integer } of NUMERIC_FILTERS) {
		const values = searchParams.getAll(param);
		if (!values.length) continue;
		if (values.length !== 1) {
			return { error: `${param} must be supplied only once.` };
		}

		const value = values[0].trim();
		if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(value)) {
			return { error: `${param} must be a non-negative number.` };
		}

		const number = Number(value);
		if (!Number.isFinite(number) || (integer && !Number.isSafeInteger(number))) {
			return {
				error: integer
					? `${param} must be a non-negative safe integer.`
					: `${param} must be a finite non-negative number.`
			};
		}
		numericValues[param] = number;
	}

	for (const [minimum, maximum] of [
		['year_built_min', 'year_built_max'],
		['building_size_min', 'building_size_max']
	]) {
		if (
			numericValues[minimum] !== undefined &&
			numericValues[maximum] !== undefined &&
			numericValues[minimum] > numericValues[maximum]
		) {
			return { error: `${minimum} cannot be greater than ${maximum}.` };
		}
	}

	const propertyForValues = searchParams.getAll('property_for');
	let propertyFor;
	if (propertyForValues.length) {
		if (propertyForValues.length !== 1) {
			return { error: 'property_for must be supplied only once.' };
		}
		const normalized = propertyForValues[0].trim().toLowerCase();
		if (normalized !== 'sale' && normalized !== 'rent') {
			return { error: 'property_for must be Sale or Rent.' };
		}
		propertyFor = normalized === 'sale' ? 'Sale' : 'Rent';
	}

	for (const param of TEXT_FILTERS) {
		const values = searchParams.getAll(param);
		if (!values.length) continue;
		if (values.length !== 1) {
			return { error: `${param} must be supplied only once.` };
		}
		const value = values[0].trim();
		if (!value || value.length > MAX_FILTER_TEXT_LENGTH || /[\u0000-\u001f\u007f]/.test(value)) {
			return {
				error: `${param} must contain between 1 and ${MAX_FILTER_TEXT_LENGTH} characters without control characters.`
			};
		}
		textValues[param] = value;
	}

	return { numericValues, textValues, propertyFor };
}

export async function GET(event) {
	const supabaseClient = event.locals.supabase;
	const { searchParams } = new URL(event.request.url);
	const pagination = parsePagination(searchParams, {
		defaultLimit: DEFAULT_API_PAGE_SIZE,
		maxLimit: MAX_API_PAGE_SIZE
	});

	if (pagination.error) {
		return Response.json(
			{
				status: 'error',
				error: {
					code: 'INVALID_PAGINATION',
					message: pagination.error
				}
			},
			{ status: 400 }
		);
	}

	const filters = validateFilters(searchParams);
	if (filters.error) {
		return filterError(filters.error);
	}

	let query = supabaseClient.from('properties_preview')
		.select('*', { count: 'exact' });

	// Filtering
	const propertyForDebug = searchParams.get('property_for');
	if (filters.propertyFor) {
		query = query.filter('property_for', 'cs', `["${filters.propertyFor}"]`);
	}

	for (const { param, column, method, excludeZero } of NUMERIC_FILTERS) {
		const value = filters.numericValues[param];
		if (value === undefined) continue;
		query = query[method](column, value);
		if (excludeZero) query = query.gt(column, 0);
	}
	for (const param of TEXT_FILTERS) {
		const value = filters.textValues[param];
		if (value !== undefined) {
			query = query.ilike(param, `%${value}%`);
		}
	}

	// Sorting
	const sort = searchParams.get('sort');
	const order = searchParams.get('order');

	if (sort && order) {
		if (!['price', 'created_at', 'updated_at'].includes(sort) || !['asc', 'desc'].includes(order)) {
			return Response.json(
				{
					status: 'error',
					error: {
						code: 'INVALID_SORT',
						message: 'Sort must be price, created_at, or updated_at, and order must be asc or desc.'
					}
				},
				{ status: 400 }
			);
		}
		query = query.order(sort, { ascending: order === 'asc' });
	} else {
		query = query.order('created_at', { ascending: false }).order('updated_at', { ascending: false });
	}
	query = query.order('id', { ascending: false }).range(
		pagination.offset,
		pagination.offset + pagination.limit - 1
	);

	let data, err, count;
	try {
		const result = await query;
		data = result.data;
		err = result.error;
		count = result.count;
	} catch (e) {
		return Response.json({
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
		return Response.json({
			status: 'error',
			error: {
				code: 'DATABASE_ERROR',
				message: 'Failed to retrieve properties.',
				details: err.message,
				property_for_debug: propertyForDebug
			}
		}, { status: 500 });
	}

	return Response.json({
		status: 'success',
		data: data ?? [],
		pagination: {
			page: pagination.page,
			limit: pagination.limit,
			total: count ?? 0,
			totalPages: Math.ceil((count ?? 0) / pagination.limit)
		}
	});
};
