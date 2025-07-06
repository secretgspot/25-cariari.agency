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