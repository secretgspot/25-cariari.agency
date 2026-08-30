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

{#if success}
	<div class="success">
		<p>
			<strong>Thank you for your inquiry!</strong><br /> The listing agent for <strong>{msl}</strong> will respond as soon as possible.
		</p>
	</div>
{:else}
	<div class="inquiry-form">
		<header class="form-header">
			<h3>Property Inquiry</h3>
			<p class="subtitle">Reference: <strong>{msl}</strong></p>
		</header>

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
	</div>
{/if}

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

	/* Success state - matches Contact form exactly: single green border, no icon */
	.success {
		border: 3px solid var(--success);
		border-radius: var(--radius-2);
		padding: var(--size-6);
		display: grid;
		place-content: center;
		text-align: center;
		width: 80vw;
		margin: 0 auto;
		box-sizing: border-box;

		@media (min-width: 481px) {
			width: 60vw;
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