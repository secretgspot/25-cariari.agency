import { writable } from 'svelte/store';

export const filterStore = writable({
	filter_type: 'Residential',
	filter_for: ['Rent', 'Sale'],
	rent: 10000,
	price: 10000000,
	beds: 'Any',
	baths: 'Any',
	lot_size: '',

	active: true,
	user_only: false,
	msl: ''
});

export function getFilteredProperties(properties, filter, user) {
	return properties.filter((property) => {
		// Filter by user
		if (filter.user_only && property.user_id !== user?.id) {
			return false;
		}

		// Filter by property type
		if (filter.filter_type && property.land_use !== filter.filter_type) {
			return false;
		}

		// Filter by transaction type (Rent, Sale)
		if (filter.filter_for.length > 0) {
			const hasMatchingTransaction = property.property_for.some((type) =>
				filter.filter_for.includes(type)
			);
			if (!hasMatchingTransaction) {
				return false;
			}
		}

		// Filter by rent price
		if (filter.filter_for.includes('Rent') && property.rent > filter.rent) {
			return false;
		}

		// Filter by sale price
		if (filter.filter_for.includes('Sale') && property.price > filter.price) {
			return false;
		}

		// Filter by number of beds
		if (filter.beds !== 'Any') {
			const minBeds = parseInt(filter.beds.replace('+', ''));
			const propertyBeds = Number(property.beds) || 0;
			// console.log(`Property ID: ${property.id}, Beds: ${property.beds} (parsed: ${propertyBeds}), Filter: ${filter.beds} (parsed: ${minBeds})`);
			if (propertyBeds < minBeds) {
				return false;
			}
		}

		// Filter by number of baths
		if (filter.baths !== 'Any') {
			const minBaths = parseInt(filter.baths.replace('+', ''));
			const propertyBaths = Number(property.baths) || 0;
			// console.log(`Property ID: ${property.id}, Baths: ${property.baths} (parsed: ${propertyBaths}), Filter: ${filter.baths} (parsed: ${minBaths})`);
			if (propertyBaths < minBaths) {
				return false;
			}
		}

		// Filter by lot size
		if (filter.lot_size) {
			const minLotSize = Number(filter.lot_size);
			const propertyLotSize = Number(property.lot_size) || 0;
			if (propertyLotSize < minLotSize) {
				return false;
			}
		}

		// Filter by active status
		if (property.is_active !== filter.active) {
			return false;
		}

		// Filter by MLS number
		if (filter.msl && !property.msl.includes(filter.msl)) {
			return false;
		}

		return true;
	});
}


