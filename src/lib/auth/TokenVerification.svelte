<script>
	/**
	 * TokenVerification.svelte
	 * A modern, reusable OTP input component with individual digit boxes,
	 * auto-advance, shake animation on error, and accessibility support.
	 * 
	 * Props:
	 * - length: number of digits (default: 6)
	 * - value: bound token value
	 * - onComplete: callback when all digits are filled
	 * - onError: callback when verification fails
	 * - disabled: disable all inputs
	 * - error: error message to display
	 * - autoFocus: auto-focus first input on mount
	 */
	
	import { createEventDispatcher } from 'svelte';
	import Notify from '$lib/Notify.svelte';
	
	// Extract props immediately to avoid "reference only captures initial value" warnings
	let { 
		length = 6, 
		value = '', 
		onComplete, 
		onError, 
		disabled = false, 
		error = '', 
		autoFocus = true
	} = $props();
	
	const dispatch = createEventDispatcher();
	
	// Internal state for individual digit inputs
		let digits = $state([]);
		let focusIndex = $state(0);
		let shake = $state(false);
		let showError = $state(false);
		let errorMessage = $state('');

		// Initialize digits array when length changes
		$effect(() => {
			digits = Array(length).fill('');
		});

		// Derived values
		let combinedValue = $derived(digits.join(''));
		let isComplete = $derived(combinedValue.length === length);
	
	// Handle digit input
	function handleInput(index, e) {
		const input = e.target;
		const val = input.value.replace(/\D/g, ''); // Only allow digits
		
		if (val.length === 1) {
			digits[index] = val;
			
			// Auto-advance to next input
			if (index < length - 1) {
				focusIndex = index + 1;
				// Use setTimeout to allow DOM to update
				setTimeout(() => {
					const nextInput = document.querySelector(`[data-digit-index="${index + 1}"]`);
					nextInput?.focus();
				}, 0);
			} else {
				// Last digit - trigger completion
				dispatch('complete', { value: combinedValue });
				onComplete?.(combinedValue);
			}
		}
	}
	
	// Handle backspace
	function handleKeydown(index, e) {
		if (e.key === 'Backspace' && !digits[index] && index > 0) {
			// Move to previous input
			focusIndex = index - 1;
			setTimeout(() => {
				const prevInput = document.querySelector(`[data-digit-index="${index - 1}"]`);
				prevInput?.focus();
			}, 0);
		}
		
		// Allow paste
		if (e.type === 'paste' || (e.ctrlKey && e.key === 'v')) {
			setTimeout(() => handlePaste(e), 0);
		}
	}
	
	// Handle paste
	function handlePaste(e) {
		const pasteData = (e.clipboardData || window.clipboardData).getData('text');
		const cleanDigits = pasteData.replace(/\D/g, '').slice(0, length);
		
		if (cleanDigits.length > 0) {
			digits = cleanDigits.split('').concat(Array(length - cleanDigits.length).fill(''));
			
			// Focus next empty or last input
			const nextEmpty = digits.findIndex((d, i) => !d);
			focusIndex = nextEmpty >= 0 ? nextEmpty : length - 1;
			
			setTimeout(() => {
				const input = document.querySelector(`[data-digit-index="${focusIndex}"]`);
				input?.focus();
			}, 0);
			
			if (isComplete) {
				dispatch('complete', { value: combinedValue });
				onComplete?.(combinedValue);
			}
		}
		
		e.preventDefault();
	}
	
	// Trigger shake animation
	function triggerShake(message) {
		errorMessage = message;
		showError = true;
		shake = true;
		
		setTimeout(() => {
			shake = false;
		}, 500);
		
		// Focus first input after shake
		setTimeout(() => {
			const firstInput = document.querySelector('[data-digit-index="0"]');
			firstInput?.focus();
		}, 550);
		
		dispatch('error', { message });
		onError?.(message);
	}
	
	// Clear error
	function clearError() {
		showError = false;
		errorMessage = '';
	}
	
	// Focus first input on mount
	$effect(() => {
		if (autoFocus) {
			setTimeout(() => {
				const firstInput = document.querySelector('[data-digit-index="0"]');
				firstInput?.focus();
			}, 100);
		}
	});
	
	// Watch for external error prop
	$effect(() => {
		if (error) {
			triggerShake(error);
		}
	});
</script>

{#if error || showError}
	<Notify type="danger" role="alert">
		{errorMessage || error}
	</Notify>
{/if}

<div class="token-verification" role="group" aria-label="Verification code">
	{#each Array(length) as _, index (index)}
		<input
			type="text"
			data-digit-index={index}
			maxlength="1"
			inputmode="numeric"
			pattern="[0-9]*"
			bind:value={digits[index]}
			oninput={(e) => handleInput(index, e)}
			onkeydown={(e) => handleKeydown(index, e)}
			onpaste={handlePaste}
			disabled={disabled}
			aria-label={`Digit ${index + 1} of ${length}`}
			aria-invalid={shake}
			autocomplete="one-time-code"
			class:shake={shake}
			class:filled={digits[index]}
		/>
	{/each}
</div>

<style>
	.token-verification {
		display: flex;
		gap: var(--size-2);
		justify-content: center;
		margin: var(--size-3) 0;
		flex-wrap: wrap;
	}
	
	.token-verification input {
		width: 48px;
		height: 56px;
		font-size: var(--font-size-4);
		font-weight: 600;
		text-align: center;
		border: var(--border-size-2) solid var(--surface-4);
		border-radius: var(--radius-3);
		background: var(--surface-1);
		color: var(--text-1);
		transition: all 150ms ease;
		box-shadow: 
			0 2px 4px rgba(0, 0, 0, 0.05),
			inset 0 1px 2px rgba(0, 0, 0, 0.03);
	}
	
	.token-verification input:hover:not(:disabled) {
		border-color: var(--surface-5);
		box-shadow: 
			0 4px 8px rgba(0, 0, 0, 0.08),
			inset 0 1px 2px rgba(0, 0, 0, 0.03);
	}
	
	.token-verification input:focus {
		outline: none;
		border-color: var(--accent);
		box-shadow: 
			0 0 0 3px var(--accent-alpha, rgba(99, 102, 241, 0.2)),
			0 4px 8px rgba(0, 0, 0, 0.08);
		z-index: 1;
	}
	
	.token-verification input.filled {
		border-color: var(--accent);
		background: var(--accent-alpha, rgba(99, 102, 241, 0.05));
	}
	
	.token-verification input:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		background: var(--surface-2);
	}
	
	/* Shake animation */
	.token-verification input.shake {
		animation: shake 500ms cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
		border-color: var(--danger, #ef4444);
		background: var(--danger-alpha, rgba(239, 68, 68, 0.1));
	}
	
	@keyframes shake {
		0%, 100% { transform: translateX(0); }
		10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
		20%, 40%, 60%, 80% { transform: translateX(4px); }
	}
	
	/* Staggered animation delay for each input */
	.token-verification input:nth-child(1).shake { animation-delay: 0ms; }
	.token-verification input:nth-child(2).shake { animation-delay: 20ms; }
	.token-verification input:nth-child(3).shake { animation-delay: 40ms; }
	.token-verification input:nth-child(4).shake { animation-delay: 60ms; }
	.token-verification input:nth-child(5).shake { animation-delay: 80ms; }
	.token-verification input:nth-child(6).shake { animation-delay: 100ms; }
	.token-verification input:nth-child(7).shake { animation-delay: 120ms; }
	.token-verification input:nth-child(8).shake { animation-delay: 140ms; }
	
	/* Mobile responsive */
	@media (max-width: 480px) {
		.token-verification {
			gap: var(--size-1);
		}
		
		.token-verification input {
			width: 40px;
			height: 48px;
			font-size: var(--font-size-3);
		}
	}
	
	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.token-verification input.shake {
			animation: none;
			border-color: var(--danger, #ef4444);
			background: var(--danger-alpha, rgba(239, 68, 68, 0.1));
		}
	}
	
	/* High contrast mode */
	@media (prefers-contrast: high) {
		.token-verification input {
			border-width: 3px;
		}
		
		.token-verification input:focus {
			box-shadow: 0 0 0 4px var(--accent);
		}
	}
</style>