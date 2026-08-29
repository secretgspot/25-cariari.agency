<script>
	import { enhance } from '$app/forms';
	import { Button } from '$lib/buttons';

	/** @type {{data: any, form?: any}} */
	let { data, form } = $props();

	const property = $derived(data?.property);
	const propertyId = $derived(property?.id);
	const msl = $derived(property?.msl);

	let sending = $state(false);
	let success = $state(false);
	let error = $state(false);
</script>

<div class="inquiry-form">
	<header class="form-header">
		<h3>Property Inquiry</h3>
		<p class="subtitle">Reference: <strong>{msl}</strong></p>
	</header>

	{#if success}
		<div class="success">
			<svg class="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 201 95">
				<path fill="var(--success)" d="M69.01 94.94c-.58 0-1.14-.12-1.62-.52-.71-.58-1.02-1.56-1.28-2.52a157.5 157.5 0 0 1-5.28-34.13c-.02 1.37.08 3.63.41 7.3a338.1 338.1 0 0 0 1.43 12.73c.15 1.44-.48 3.06-1.78 4.56a14.55 14.55 0 0 1-6.4 4.05c-3.03 1-6.48 1.24-9.98.67A17.11 17.11 0 0 1 38.48 85a11.35 11.35 0 0 1-3.61-3.3l-.29.16a21.45 21.45 0 0 1-8.48 2.28c-2.75.18-5.67-.05-8.93-.71C11.36 82.26 5.6 79.93.21 77.63c-.17-.07-.25-.3-.19-.5s.24-.3.41-.22c5.37 2.28 11.09 4.6 16.85 5.77 3.22.65 6.09.88 8.79.7 3.03-.2 5.8-.95 8.26-2.21l.15-.08c-.22-.36-.41-.74-.59-1.13a10.56 10.56 0 0 1-.8-5c.13-1.36.7-2.52 1.54-3.08.61-.41 1.37-.5 2.12-.23.85.3 1.58 1.02 1.96 1.92a5.92 5.92 0 0 1-.55 5.19 7.87 7.87 0 0 1-2.68 2.6c1.49 2.06 4.2 4.16 9.14 4.95 3.41.55 6.77.33 9.72-.65 2.52-.83 4.7-2.21 6.12-3.86 1.15-1.33 1.71-2.72 1.59-3.92l-.16-1.3c-.28-2.27-.87-7.01-1.27-11.43-.22-2.48-.36-4.52-.4-6.07-.07-2.58.12-3.33.28-3.67.11-.24.24-.45.4-.65.09-.47.26-.92.56-1.3.28-.35.66-.61 1.19-.82.78-.31 1.64-.55 2.67-.76l2-.4c14.03-2.81 28.53-5.71 42.93-7.27.53-.06 1.25-.14 1.86.23.95.57 1.23 1.87 1.4 3.17a384.84 384.84 0 0 1 2.83 33.28v.17c.04.86.08 1.82-.08 2.68-.2 1.05-.69 1.76-1.46 2.13-1.45.69-3.05.82-4.6.95-.64.05-1.29.1-1.91.2-6.76 1.02-13.62 2.2-20.25 3.33a1191.3 1191.3 0 0 1-18.35 3.04c-1.02.16-1.83-.44-2.44-1.8-.48-1.05-.74-2.4-.94-3.46-.08-.38-.14-.72-.21-.98a160.1 160.1 0 0 1-2.43-12.91c-.74-4.8-1.24-8.76-1.58-12.48l-.1-.9c-.31-2.44-.56-4.92.08-5.84a.79.79 0 0 1 .63-.38c.25-.02.75.13 3.37 2.09 1.69 1.27 3.94 3.04 6.32 4.9 3.56 2.8 7.59 5.98 10.93 8.39a54.24 54.24 0 0 0 4.36 2.9c1.59.93 2.17 1 2.38.97 1.08-.18 6.13-5.03 11.9-11.96 2.79-3.35 5.16-6.48 6.84-9.05 2.52-3.86 2.8-5.4 2.74-5.97-.02-.2-.07-.7-1.15-.56-4.57.54-19.59 3-44.65 7.3l-.39.07c-1.28.2-2.96.49-3.86 1.4-.07.49-.06 1-.04 1.5.44 11.9 2.22 23.68 5.29 35.02.23.87.49 1.68 1.03 2.12.62.5 1.48.4 2.37.26 3.15-.53 5.46-.95 7.69-1.35 3-.54 5.83-1.06 10.17-1.74 2.53-.4 7.42-1.28 11.36-2l4.97-.88c1.19-.21 2.46-.38 3.68-.56 2.31-.32 4.7-.66 6.87-1.23 1.08-.28 1.7..." />
			</svg>
			<p>
				<strong>Thank you for your inquiry!</strong><br /> The listing agent for <strong>{msl}</strong> will respond as soon as possible.
			</p>
		</div>
	{:else}
		<form method="POST" class="form" use:enhance={() => {
			sending = true;
			return async ({ result, update }) => {
				await update();
				sending = false;
				if (result?.type === 'success') {
					success = true;
					error = false;
				} else if (result?.type === 'error') {
					success = false;
					error = true;
				}
			};
		}}>
			<div class="inputs">
				<fieldset>
					<legend>Name</legend>
					<input
						type="text"
						id="name"
						name="name"
						autocomplete="name"
						required
						placeholder="Juan Pérez"
						value={form?.data?.name ?? ''}
					/>
				</fieldset>
			</div>
			<div class="inputs">
				<fieldset>
					<legend>Phone</legend>
					<input
						type="tel"
						id="phone"
						name="phone"
						autocomplete="tel"
						required
						placeholder="+506 8870-8877"
						value={form?.data?.phone ?? ''}
					/>
				</fieldset>
			</div>
			<div class="inputs">
				<fieldset>
					<legend>Email</legend>
					<input
						type="email"
						id="email"
						name="email"
						autocomplete="email"
						required
						placeholder="juan@example.com"
						value={form?.data?.email ?? ''}
					/>
				</fieldset>
			</div>
			<div class="inputs">
				<fieldset>
					<legend>Message <span class="optional">(optional)</span></legend>
					<textarea
						id="message"
						name="message"
						rows="5"
						placeholder="I'm interested in this property. Please tell me more about..."
					>{form?.data?.message ?? ''}</textarea>
				</fieldset>
			</div>

			<!-- Honeypot field for bot detection -->
			<div class="honeypot" aria-hidden="true">
				<label for="website">Website</label>
				<input type="text" id="website" name="website" tabindex="-1" autocomplete="off" />
			</div>

			<input type="hidden" name="property_id" value={propertyId} />

			<div class="button-wrap">
				<Button type="submit" size="block" shadow loading={sending} disabled={sending}>
					{#if sending}
						Sending...
					{:else}
						Send Inquiry
					{/if}
				</Button>
				{#if error || form?.errors}
					<span class="error">Error sending inquiry. Please try again.</span>
				{/if}
			</div>
		</form>
	{/if}
</div>

<style>
	.inquiry-form {
		background: var(--surface-1);
		border-radius: var(--radius-2);
		padding: var(--size-4);
		border: var(--border-size-1) solid var(--surface-3);
		/* Match page layout: aside uses 80vw mobile / 60vw tablet+, centered */
		width: 80vw;
		margin: 0 auto;
		box-sizing: border-box;

		@media (min-width: 481px) {
			width: 60vw;
		}
	}

	.form-header {
		text-align: center;
		margin-bottom: var(--size-4);
		padding-bottom: var(--size-3);
		border-bottom: var(--border-size-1) solid var(--surface-3);
	}

	.form-header h3 {
		margin: 0 0 var(--size-1);
		color: var(--text-1);
		font-weight: 400;
		font-size: 1.1rem;
	}

	.subtitle {
		margin: 0;
		color: var(--text-2);
		font-size: 0.85rem;
	}

	.form {
		display: grid;
		gap: 2ch;
	}

	.inputs {
		display: flex;
		flex-direction: column;
	}

	fieldset {
		border-radius: var(--radius-2);
		border: none;
		display: grid;
		gap: var(--size-2);
		padding: 0;

		legend {
			text-transform: uppercase;
			font-size: 0.81rem;
			color: var(--text-2);
			margin-block: 0 var(--size-1);
			display: flex;
			align-items: center;
			gap: var(--size-1);
		}

		.optional {
			text-transform: none;
			font-weight: 400;
			color: var(--text-3);
			font-size: 0.75rem;
		}
	}

	fieldset input[type='text'],
	fieldset input[type='tel'],
	fieldset input[type='email'],
	fieldset textarea {
		display: block;
		padding: var(--size-2);
		color: var(--text-1);
		border: var(--border-size-1) solid var(--surface-4);
		border-radius: var(--radius-2);
		width: 100%;
		background: transparent;
		font-family: inherit;
		font-size: 1rem;
		transition: border-color var(--transition), box-shadow var(--transition);
		box-sizing: border-box;
	}

	fieldset input::placeholder,
	fieldset textarea::placeholder {
		color: var(--text-3);
	}

	fieldset input:focus,
	fieldset textarea:focus {
		outline: none;
		border-color: var(--accent);
		box-shadow: 0 0 0 2px var(--accent-alpha-2);
	}

	.button-wrap {
		margin-block-start: var(--size-3);
	}

	.success {
		border: 3px solid var(--success);
		border-radius: var(--radius-2);
		padding: var(--size-6);
		display: grid;
		place-content: center;
		text-align: center;
		gap: var(--size-3);

		.icon {
			width: 56px;
			height: 56px;
		}

		p {
			line-height: 1.5;
			margin: 0;
		}
	}

	span.error {
		margin-block: var(--size-2) 0;
		display: block;
		color: var(--red-4);
		font-size: 0.9rem;
		text-align: center;
	}

	.honeypot {
		display: none;
		position: absolute;
		left: -9999px;
	}
</style>