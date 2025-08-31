<script>
	/*
	import Dialog from './Dialog.svelte';

	let alertDialogRef;
	let confirmDialogRef;

	const showAlert = () => {
		alertDialogRef.showModal();
	};

	const handleAlertConfirm = () => {
		console.log('Alert OKAY clicked!');
		// You can do something after the alert is confirmed
	};

	const showConfirm = () => {
		confirmDialogRef.showModal();
	};

	const handleConfirmAction = () => {
		console.log('Confirm button clicked!');
		// Perform action after confirmation
	};

	const handleCancelAction = () => {
		console.log('Cancel button clicked!');
		// Handle cancellation
	};


	<button onclick={showAlert}>Show Alert Dialog</button>
	<button onclick={showConfirm}>Show Confirm Dialog</button>

	<!-- Alert Dialog Instance -->
	<Dialog
			bind:this={alertDialogRef}
			title="Heads Up!"
			message="This is a simple alert message. Click OKAY to dismiss."
			type="alert"
			onConfirm={handleAlertConfirm}
	/>

	<!-- Confirm Dialog Instance -->
	<Dialog
			bind:this={confirmDialogRef}
			title="Confirm Action"
			message="Are you sure you want to proceed with this action? This cannot be undone."
			type="confirm"
			onConfirm={handleConfirmAction}
			onCancel={handleCancelAction}
	/>
*/

	import { onMount, onDestroy } from 'svelte';
	import { Button } from '$lib/buttons';
	import Icon from '$lib/Icon.svelte';

	// Define props using Svelte 5 runes
	const {
		title = 'Dialog Title',
		message = 'This is a message from the dialog.',
		type = 'alert', // 'alert' for OK, 'confirm' for Confirm/Cancel
		onConfirm = () => {},
		onCancel = () => {},
	} = $props();

	// State to control dialog visibility
	let dialogRef; // Reference to the native <dialog> element
	let isOpen = $state(false); // Reactive state for dialog visibility

	// Function to show the modal dialog
	const showModal = () => {
		if (dialogRef) {
			dialogRef.showModal();
			isOpen = true;
		}
	};

	// Function to close the dialog
	const closeDialog = (returnValue) => {
		if (dialogRef) {
			dialogRef.close(returnValue);
			isOpen = false;
		}
	};

	// Handle the native dialog's 'close' event
	const handleCloseEvent = () => {
		isOpen = false; // Sync internal state with native dialog state
		const returnValue = dialogRef.returnValue;

		if (type === 'alert') {
			if (returnValue === 'ok') {
				onConfirm();
			}
		} else if (type === 'confirm') {
			if (returnValue === 'confirmed') {
				onConfirm();
			} else if (returnValue === 'canceled' || returnValue === 'closed') {
				// 'canceled' is from the explicit button, 'closed' is from Escape key or X button
				onCancel();
			}
		}
	};

	// Expose methods for parent components to call via bind:this
	export { showModal, closeDialog };

	onMount(() => {
		if (dialogRef) {
			dialogRef.addEventListener('close', handleCloseEvent);
		}
	});

	onDestroy(() => {
		if (dialogRef) {
			dialogRef.removeEventListener('close', handleCloseEvent);
		}
	});
</script>

<!-- The native HTML <dialog> element -->
<dialog
	bind:this={dialogRef}
	class="modal dialog"
	aria-modal="true"
	aria-labelledby="dialog-title"
	aria-describedby="dialog-description">
	<!-- Dialog Header -->
	<header>
		<h2 id="dialog-title">{title}</h2>
		<Button
			type="button"
			size="icon"
			outline
			aria-label="Close dialog"
			onclick={() => closeDialog('closed')}>
			{#snippet icon()}
				<Icon kind="del" size="18" />
			{/snippet}
		</Button>
	</header>

	<!-- Dialog Content -->
	<div id="dialog-description">
		<p>{message}</p>
	</div>

	<!-- Dialog Footer -->
	<footer>
		{#if type === 'alert'}
			<Button type="button" size="block" onclick={() => closeDialog('ok')}>OKAY</Button>
		{:else if type === 'confirm'}
			<Button type="button" size="block" onclick={() => closeDialog('canceled')}
				>Cancel</Button>
			<Button type="button" size="block" red onclick={() => closeDialog('confirmed')}
				>Confirm</Button>
		{/if}
	</footer>
</dialog>

<style>
	/* Basic animation for the dialog itself */
	dialog {
		/* opacity: 0; */
		display: grid;
		grid-template-rows: min-content 1fr min-content;
		align-items: center;
		min-width: 369px;
		/* min-height: 369px; */
		width: min-content;
		height: min-content;
		border: var(--border-size-1) solid var(--surface-4);
		border-radius: var(--radius-2);
		pointer-events: none;
		z-index: 6;
		position: fixed;
		align-self: anchor-center;
		background: var(--surface-1);
		color: var(--text-1);

		&,
		&::backdrop {
			background-image: radial-gradient(var(--surface-2), var(--surface-1) 60%);
			backdrop-filter: blur(3px);
			transition:
				display var(--transition) allow-discrete,
				overlay var(--transition) allow-discrete,
				transform var(--transition),
				opacity var(--transition);
			opacity: 0; /* Start hidden for animation */
		}

		&[open] {
			opacity: 1;
			pointer-events: auto;
			transform: scale(1);
			&::backdrop {
				opacity: 1; /* Fade in when open */
			}
		}

		/* offstage styles */
		@starting-style {
			&[open],
			&[open]::backdrop {
				opacity: 0;
			}
		}

		/* only scale if okay with user */
		@media (prefers-reduced-motion: no-preference) {
			transform: scale(0.93);
		}

		header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			#dialog-title {
				margin: 0;
				flex: 1;
				text-align: left;
			}
		}

		#dialog-description {
			margin: var(--size-3);
		}

		footer {
			display: flex;
			gap: var(--size-3);
		}
	}
</style>
