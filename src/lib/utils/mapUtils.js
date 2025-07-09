import { isEmpty } from './helpers.js';

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
