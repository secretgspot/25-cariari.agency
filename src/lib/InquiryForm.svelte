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
	<div class="form-header">
		<h3>Contact About This Property</h3>
		<p class="subtitle">Reference: <strong>{msl}</strong></p>
	</div>

	{#if success}
		<div class="success">
			<h3>Inquiry Sent Successfully</h3>
			<p>Thank you for your interest in <strong>{msl}</strong>. The listing agent will contact you shortly.</p>
		</div>
	{:else}
		<form method="POST" use:enhance={() => {
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
			<div class="form-grid">
				<div class="form-field">
					<label for="name">Your Name <span class="required" aria-hidden="true">*</span></label>
					<input
						type="text"
						id="name"
						name="name"
						required
						autocomplete="name"
						placeholder="Juan Pérez"
						aria-describedby="name-hint"
						value={form?.data?.name ?? ''}
					/>
					<span id="name-hint" class="hint">Full name</span>
				</div>

				<div class="form-field">
					<label for="phone">Phone <span class="required" aria-hidden="true">*</span></label>
					<input
						type="tel"
						id="phone"
						name="phone"
						required
						autocomplete="tel"
						placeholder="+506 8870-8877"
						aria-describedby="phone-hint"
						value={form?.data?.phone ?? ''}
					/>
					<span id="phone-hint" class="hint">WhatsApp or mobile</span>
				</div>

				<div class="form-field full-width">
					<label for="email">Email <span class="required" aria-hidden="true">*</span></label>
					<input
						type="email"
						id="email"
						name="email"
						required
						autocomplete="email"
						placeholder="juan@example.com"
						value={form?.data?.email ?? ''}
					/>
				</div>

				<div class="form-field full-width">
					<label for="message">Message (optional)</label>
					<textarea
						id="message"
						name="message"
						rows="4"
						placeholder="I'm interested in this property. Please tell me more about..."
					>{form?.data?.message ?? ''}</textarea>
				</div>

				<!-- Honeypot field for bot detection -->
				<div class="honeypot" aria-hidden="true">
					<label for="website">Website</label>
					<input
						type="text"
						id="website"
						name="website"
						tabindex="-1"
						autocomplete="off"
					/>
				</div>
			</div>

			<input type="hidden" name="property_id" value={propertyId} />

			<Button type="submit" size="block" shadow loading={sending} disabled={sending}>
				{#if sending}
					Sending...
				{:else}
					Send Inquiry
				{/if}
			</Button>

			{#if error}
				<p class="error">Error sending inquiry. Please try again.</p>
			{/if}

			<p class="privacy-note">
				<svg width="14" height="14" viewBox="0 0 512 512" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="256" cy="256" r="240" />
					<path d="M256 160v192M256 256a8 8 0 1 0 0 16" />
				</svg>
				Your information will only be shared with the listing agent for this property.
			</p>
		</form>
	{/if}
</div>

<style>
	.inquiry-form {
		background: var(--surface-1);
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-2);
		padding: var(--size-6);
		max-width: 600px;
		margin: 0 auto;
	}

	.form-header {
		text-align: center;
		margin-bottom: var(--size-6);
	}

	.form-header h3 {
		margin: 0 0 var(--size-2);
		color: var(--text-1);
		font-weight: 400;
	}

	.subtitle {
		margin: 0;
		color: var(--text-2);
		font-size: 0.9rem;
	}

	.form-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--size-4);
		margin-bottom: var(--size-4);
	}

	.form-field {
		display: flex;
		flex-direction: column;
		gap: var(--size-1);
	}

	.form-field.full-width {
		grid-column: 1 / -1;
	}

	.form-field label {
		font-size: 0.85rem;
		font-weight: 500;
		color: var(--text-1);
		display: flex;
		align-items: center;
		gap: var(--size-1);
	}

	.required {
		color: var(--red-4);
	}

	.form-field input,
	.form-field textarea {
		background: var(--surface-2);
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-2);
		padding: var(--size-2) var(--size-3);
		color: var(--text-1);
		font-family: inherit;
		font-size: 1rem;
		transition: border-color var(--transition), box-shadow var(--transition);
	}

	.form-field input:focus,
	.form-field textarea:focus {
		outline: none;
		border-color: var(--accent);
		box-shadow: 0 0 0 2px var(--accent-alpha-2);
	}

	.form-field input::placeholder,
	.form-field textarea::placeholder {
		color: var(--text-3);
	}

	.hint {
		font-size: 0.75rem;
		color: var(--text-3);
	}

	.honeypot {
		display: none;
		position: absolute;
		left: -9999px;
	}

	.error {
		margin-top: var(--size-3);
		padding: var(--size-2);
		background: var(--red-1);
		border: var(--border-size-1) solid var(--red-3);
		border-radius: var(--radius-2);
		color: var(--red-4);
		font-size: 0.9rem;
		text-align: center;
	}

	.privacy-note {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--size-2);
		margin-top: var(--size-4);
		padding-top: var(--size-4);
		border-top: var(--border-size-1) solid var(--surface-3);
		font-size: 0.8rem;
		color: var(--text-3);
	}

	.success {
		text-align: center;
		padding: var(--size-4);
	}

	.success h3 {
		margin: 0 0 var(--size-2);
		color: var(--green-4);
	}

	.success p {
		margin: 0;
		color: var(--text-2);
	}

	@media (max-width: 640px) {
		.form-grid {
			grid-template-columns: 1fr;
		}
	}
</style>