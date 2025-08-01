import { writable } from 'svelte/store';
import { playChimeSequence, chimePatterns } from '$lib/utils/audio';
import { vibrate, vibratePatterns } from '$lib/utils/vibrate';

// Create the writable store for toasts
export const toasts = writable([]);

// Counter for unique IDs
let idCounter = 0;

/**
 * Add a new toast notification
 * @param {Object} toast - Toast configuration object
 * @param {string} toast.message - The message to display
 * @param {string} [toast.type='info'] - Toast type: 'success', 'error', 'info'
 * @param {boolean} [toast.dismissible=false] - Whether to show dismiss button
 * @param {number} [toast.timeout=1200] - Auto-dismiss timeout in ms (0 = no auto-dismiss)
 */
export const addToast = (toast) => {
	const id = `toast_${Date.now()}_${++idCounter}`;

	const defaults = {
		id,
		type: 'info',
		dismissible: false,
		timeout: 1200,
	};

	const newToast = { ...defaults, ...toast };

	// Add toast to the store
	toasts.update(currentToasts => [newToast, ...currentToasts]);

	// Play sound and vibrate based on toast type
	switch (newToast.type) {
		case 'success':
			playChimeSequence(chimePatterns.successA);
			vibrate(vibratePatterns.successB);
			break;
		case 'error':
			playChimeSequence(chimePatterns.failC);
			vibrate(vibratePatterns.failB);
			break;
		default:
			playChimeSequence(chimePatterns.swipe);
			vibrate(vibratePatterns.basic);
			break;
	}

	// Auto-dismiss after timeout
	if (newToast.timeout) {
		setTimeout(() => dismissToast(id), newToast.timeout);
	}

	return id; // Return ID in case caller needs it
};

/**
 * Dismiss a specific toast by ID
 * @param {string} id - The toast ID to dismiss
 */
export const dismissToast = (id) => {
	toasts.update(currentToasts => currentToasts.filter(t => t.id !== id));
};

/**
 * Clear all active toasts
 */
export const clearAllToasts = () => {
	toasts.set([]);
};

/**
 * Convenience methods for common toast types
 */
export const showSuccess = (message, options = {}) => {
	return addToast({ message, type: 'success', ...options });
};

export const showError = (message, options = {}) => {
	return addToast({ message, type: 'error', ...options });
};

export const showInfo = (message, options = {}) => {
	return addToast({ message, type: 'info', ...options });
};