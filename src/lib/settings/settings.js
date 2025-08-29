// $lib/settings/settings.js
import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

/**
 * Default settings configuration
 */
const DEFAULT_SETTINGS = {
	// Color Theme
	theme: 'System', // System, Light, Dark

	// Audio Effects
	button_sounds: true,
	// navigation_sound: false,
	notification_sound: true,

	// Vibration Effects
	button_buzz: true,
	// navigation_buzz: true,
	notification_buzz: true,

	// Audio Patterns
	button_sound_pattern: 'click',
	// navigation_sound_pattern: 'navigate',
	notification_sound_pattern: 'notification',
	notification_error_sound_pattern: 'fail',
	notification_success_sound_pattern: 'success',

	// Vibration Patterns
	button_vibration_pattern: 'click',
	// navigation_vibration_pattern: 'navigate',
	notification_vibration_pattern: 'notification',
	notification_error_vibration_pattern: 'fail',
	notification_success_vibration_pattern: 'success'
};

/**
 * Load settings from localStorage or use defaults
 */
function loadSettings() {
	if (!browser) return DEFAULT_SETTINGS;

	try {
		const storedSettings = localStorage.getItem('app_settings');
		if (storedSettings) {
			const parsed = JSON.parse(storedSettings);
			// Deep merge to ensure new settings keys are added to existing user profiles
			return {
				...DEFAULT_SETTINGS,
				...parsed
			};
		}
	} catch (error) {
		console.warn('Failed to load settings from localStorage:', error);
	}

	return DEFAULT_SETTINGS;
}

/**
 * Save settings to localStorage
 */
function saveState(state) {
	if (!browser) return;

	try {
		localStorage.setItem('app_settings', JSON.stringify(state));
	} catch (error) {
		console.error('Failed to save state to localStorage:', error);
	}
}

const initialSettings = loadSettings();

// The store itself is the main export for components to use
export const settings = writable(initialSettings);

// Subscribe to changes and save to localStorage
if (browser) {
	settings.subscribe(saveState);
}

// --- New Derived Store for Theme ---
function createSystemThemeStore() {
	if (!browser) {
		return writable('light'); // Default for SSR
	}
	const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
	const store = writable(mediaQuery.matches ? 'dark' : 'light');

	const listener = (e) => store.set(e.matches ? 'dark' : 'light');
	mediaQuery.addEventListener('change', listener);

	// Svelte runes don't have a built-in unmount, so we rely on browser context
	// to manage this listener, which is acceptable for a global setting.

	return store;
}

const systemTheme = createSystemThemeStore();

export const effectiveTheme = derived(
	[settings, systemTheme],
	([$settings, $systemTheme]) => {
		if ($settings.theme === 'System') {
			return $systemTheme;
		}
		return $settings.theme.toLowerCase();
	}
);


/**
 * Resets all settings to their default values and clears localStorage.
 */
export function resetSettings() {
	if (browser) {
		localStorage.removeItem('app_settings');
	}
	settings.set(DEFAULT_SETTINGS);
}
