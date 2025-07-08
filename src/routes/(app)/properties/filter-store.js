import { writable } from 'svelte/store';

export const filterStore = writable({
	rent: 10000,
	price: 10000000,
	beds: 99,
	baths: 99,
	rooms: 99,
	filter_for: ['Rent', 'Sale'],
	active: true,
	msl: ''
});

const filterFunctions = {
    is_active: (is_active, activeFilter) => is_active == activeFilter,
    land_use: (land_use, filterType) => land_use == filterType,
    property_for: (property_for, filterFor) => property_for.find((x) => filterFor.includes(x)),
    rent: (rent, rentFilter) => rent <= rentFilter,
    price: (price, priceFilter) => price <= priceFilter,
    beds: (beds, bedsFilter) => beds <= bedsFilter,
    baths: (baths, bathsFilter) => baths <= bathsFilter,
    rooms: (rooms, roomsFilter) => rooms <= roomsFilter,
    msl: (msl, mslFilter) => msl.includes(mslFilter),
};

export function getFilteredProperties(properties, currentFilter) {
    return properties.filter((item) => {
        return Object.keys(filterFunctions).every((key) => {
            const filter = filterFunctions[key];
            if (typeof filter !== 'function') return true;

            // Pass the item's property value and the corresponding filter value from currentFilter
            switch (key) {
                case 'is_active':
                    return filter(item[key], currentFilter.active);
                case 'land_use':
                    return filter(item[key], currentFilter.filter_type);
                case 'property_for':
                    return filter(item[key], currentFilter.filter_for);
                case 'rent':
                    return filter(item[key], currentFilter.rent);
                case 'price':
                    return filter(item[key], currentFilter.price);
                case 'beds':
                    return filter(item[key], currentFilter.beds);
                case 'baths':
                    return filter(item[key], currentFilter.baths);
                case 'rooms':
                    return filter(item[key], currentFilter.rooms);
                case 'msl':
                    return filter(item[key], currentFilter.msl);
                default:
                    return true;
            }
        });
    });
}
