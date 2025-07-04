import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export function storable(data) {
	const store = writable(data);
	const { subscribe, set, update } = store;

	browser &&
		localStorage.storable &&
		set(JSON.parse(localStorage.storable));

	return {
		subscribe,
		set: n => {
			browser && (localStorage.storable = JSON.stringify(n));
			set(n);
		},
		update: cb => {
			const updatedStore = cb(get(store));

			browser && (localStorage.storable = JSON.stringify(updatedStore));
			set(updatedStore);
		}
	};
}