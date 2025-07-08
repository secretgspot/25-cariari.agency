import { writable } from 'svelte/store';

export const filterStore = writable({
	filter_type: 'Residential',
	filter_for: ['Rent', 'Sale'],
	rent: 10000,
	price: 10000000,
	beds: 99,
	baths: 99,
	rooms: 99,
	active: true,
	msl: ''
});

export function getFilteredProperties(properties, filter) {
	return properties.filter((property) => {
		// Filter by property type
		if (filter.filter_type && property.land_use !== filter.filter_type) {
			return false;
		}

		// Filter by transaction type (Rent, Sale, Investment)
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
		if (property.beds > filter.beds) {
			return false;
		}

		// Filter by number of baths
		if (property.baths > filter.baths) {
			return false;
		}

		// Filter by number of rooms
		if (property.rooms > filter.rooms) {
			return false;
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


