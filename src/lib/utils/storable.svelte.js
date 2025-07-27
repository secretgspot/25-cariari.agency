// This file should be named 'storable.svelte.js' (or 'storable.svelte.ts')
// to allow the Svelte compiler to process the $state and $effect runes.

import { browser } from '$app/environment';
// In Svelte 5, $state and $effect are compiler runes and do not need to be imported.
// They are globally recognized within .svelte files and JavaScript/TypeScript files
// that are processed by the Svelte compiler (like this .svelte.js file).

/**
 * Creates a reactive state variable that persists its value to localStorage.
 *
 * @param {string} key The unique key to use for storing the value in localStorage.
 * @param {any} initialValue The initial value for the state if no value is found in localStorage.
 * @returns {{ value: any, set: (newValue: any) => void, update: (callback: (currentValue: any) => any) => void }}
 * An object with a reactive 'value' getter, a 'set' method, and an 'update' method.
 */
export function storable(key, initialValue) {
	// 1. Define the reactive state using $state.
	// This variable will hold the current value of our storable item.
	let internalData = $state(initialValue);

	// 2. Use $effect to load the initial value from localStorage.
	// This effect runs once when the component using this storable is mounted,
	// or when the module is initialized on the client-side.
	$effect(() => {
		if (browser) { // Ensure we are in a browser environment to access localStorage
			try {
				const storedValue = localStorage.getItem(key);
				if (storedValue !== null) {
					// If a value is found in localStorage, parse it and set it as the initial state.
					internalData = JSON.parse(storedValue);
				}
			} catch (e) {
				// Log any errors during loading (e.g., localStorage full, malformed JSON)
				console.error(`[Storable] Error loading "${key}" from localStorage:`, e);
				// Fallback to the initialValue if loading fails
				internalData = initialValue;
			}
		}
	});

	// 3. Use another $effect to save the current value to localStorage whenever it changes.
	// This effect re-runs whenever 'internalData' is updated.
	$effect(() => {
		if (browser) { // Ensure we are in a browser environment
			try {
				// Stringify the current state and save it to localStorage
				localStorage.setItem(key, JSON.stringify(internalData));
			} catch (e) {
				// Log any errors during saving
				console.error(`[Storable] Error saving "${key}" to localStorage:`, e);
			}
		}
	});

	// 4. Return an interface similar to a writable store, but using runes' direct access.
	return {
		// 'value' is a getter, so accessing `myStorable.value` will always give the latest reactive state.
		get value() {
			return internalData;
		},
		// 'set' method directly updates the $state variable.
		set: (newValue) => {
			internalData = newValue;
		},
		// 'update' method provides a functional way to update the state based on its current value.
		update: (callback) => {
			internalData = callback(internalData);
		}
	};
}
