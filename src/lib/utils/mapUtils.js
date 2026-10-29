import { isEmpty } from './validators.js';

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const MARKER_FADE_DAYS = 30;
const MARKER_COLORS = {
	sale: { fresh: '#67F5A5', base: '#14AE5C' },
	rent: { fresh: '#FFD166', base: '#E5A000' },
	unknown: '#6B7280',
};

function interpolateHexColor(start, end, progress) {
	const channels = [1, 3, 5].map((index) => {
		const startValue = Number.parseInt(start.slice(index, index + 2), 16);
		const endValue = Number.parseInt(end.slice(index, index + 2), 16);
		return Math.round(startValue + (endValue - startValue) * progress)
			.toString(16)
			.padStart(2, '0');
	});

	return `#${channels.join('')}`;
}

/**
 * Returns a color-only marker background, fading new listings to their base colors over 30 days.
 * @param {string|string[]} propertyFor - The property's listing type(s).
 * @param {string} createdAt - The property's database creation timestamp.
 * @param {number} [now] - Current time in milliseconds, useful for deterministic checks.
 * @returns {string} A CSS color or split-color background.
 */
export const getPropertyMarkerBackground = (propertyFor, createdAt, now = Date.now()) => {
	const types = Array.isArray(propertyFor)
		? propertyFor
		: typeof propertyFor === 'string'
			? propertyFor.split(',').map((type) => type.trim())
			: [];
	const hasSale = types.includes('Sale');
	const hasRent = types.includes('Rent');

	if (!hasSale && !hasRent) return MARKER_COLORS.unknown;

	const createdTime = typeof createdAt === 'string' ? Date.parse(createdAt) : Number.NaN;
	const age = Number.isFinite(createdTime)
		? Math.max(0, now - createdTime)
		: MARKER_FADE_DAYS * DAY_IN_MS;
	const progress = Math.min(1, age / (MARKER_FADE_DAYS * DAY_IN_MS));
	const getColor = ({ fresh, base }) => interpolateHexColor(fresh, base, progress);

	if (hasSale && hasRent) {
		const saleColor = getColor(MARKER_COLORS.sale);
		const rentColor = getColor(MARKER_COLORS.rent);
		return `linear-gradient(90deg, ${saleColor} 50%, ${rentColor} 50%)`;
	}

	return getColor(hasSale ? MARKER_COLORS.sale : MARKER_COLORS.rent);
};

/**
 * Validates if a marker object has valid and active location data.
 * @param {object} marker - The marker object to validate.
 * @returns {boolean} - True if the marker is valid, false otherwise.
 */
export const isValidMarker = (marker) => {
	return (
		marker &&
		typeof marker === 'object' &&
		marker.id &&
		marker.location &&
		!isEmpty(marker.location.lat) &&
		!isEmpty(marker.location.lng) &&
		!isNaN(Number(marker.location.lat)) &&
		!isNaN(Number(marker.location.lng)) &&
		marker.is_active === true
	);
};

/**
 * Converts property_for to a valid icon name.
 * @param {string|string[]} propertyFor - The property_for value(s).
 * @returns {string} - The generated icon name.
 */
export const getPropertyIconName = (propertyFor) => {
	try {
		if (Array.isArray(propertyFor)) {
			return propertyFor.join('_').replace(/[^a-zA-Z0-9_]/g, '_');
		} else if (typeof propertyFor === 'string') {
			return propertyFor.replace(/[^a-zA-Z0-9_]/g, '_');
		} else {
			return 'default';
		}
	} catch (error) {
		console.error('Error getting property icon name:', error);
		return 'default';
	}
};

/**
 * Validates if a position object has valid latitude and longitude.
 * @param {object} pos - The position object to validate.
 * @returns {boolean} - True if the position is valid, false otherwise.
 */
export const isValidPosition = (pos) =>
	pos &&
	typeof pos === 'object' &&
	!isEmpty(pos.lat) &&
	!isEmpty(pos.lng) &&
	!isNaN(Number(pos.lat)) &&
	!isNaN(Number(pos.lng)) &&
	Math.abs(Number(pos.lat)) <= 90 &&
	Math.abs(Number(pos.lng)) <= 180;

/**
 * Normalizes a position input into a {lat, lng} object.
 * @param {object|number[]} pos - The position input.
 * @returns {{lat: number, lng: number}|null} - Normalized position or null if invalid.
 */
export const normalizePosition = (pos) => {
	if (!pos) return null;
	try {
		if (Array.isArray(pos) && pos.length >= 2) {
			return { lat: Number(pos[0]), lng: Number(pos[1]) };
		}
		if (typeof pos === 'object' && pos.lat !== undefined && pos.lng !== undefined) {
			return { lat: Number(pos.lat), lng: Number(pos.lng) };
		}
		return null;
	} catch (error) {
		console.error('Error normalizing position:', error);
		return null;
	}
};


/**
 * Checks if a marker matches the currently selected identifier (id or MSL).
 * @param {string} id - Property ID.
 * @param {string} [msl] - Property MSL code.
 * @param {string|null} selected - Currently selected identifier.
 * @returns {boolean}
 */
export const isMarkerSelected = (id, msl, selected) => {
	if (!selected) return false;
	const sel = String(selected).toLowerCase();
	return id === selected || (msl && msl.toLowerCase() === sel);
};
