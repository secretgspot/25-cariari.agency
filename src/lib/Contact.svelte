<script>
	import { enhance } from '$app/forms';
	import { Button } from '$lib/buttons';
	let { data, form } = $props();
	let sending = $state(false);
	let success = $state(false);
	let error = $state(false);
</script>

<section class="contact" id="contact">
	<div class="message">
		<header>
			<h2>Get in touch.</h2>
		</header>
		<hr />
		<p>
			We're dedicated to helping homes in the Cariari area of La Asunción, Heredia sell
			efficiently and effectively.
		</p>
		<footer>
			<h3>{import.meta.env.VITE_PHONE}</h3>
		</footer>
	</div>

	<form
		method="POST"
		class="contact-form"
		use:enhance={() => {
			sending = true;

			return async ({ result, update }) => {
				await update();
				sending = false;
				if (result.type === 'success') {
					success = true;
					error = false;
				} else if (result.type === 'error') {
					success = false;
					error = true;
				}
			};
		}}>
		<div class="inputs">
			<fieldset>
				<legend>Name</legend>
				<input type="text" id="name" name="name" autocomplete="name" required />
			</fieldset>
		</div>
		<div class="inputs">
			<fieldset>
				<legend>Email</legend>
				<input type="email" id="email" name="email" autocomplete="email" required />
			</fieldset>
		</div>
		<div class="inputs">
			<fieldset>
				<legend>Message</legend>
				<textarea id="message" name="message" rows="5"></textarea>
			</fieldset>
		</div>
		<div class="button-wrap">
			<Button type="submit" left shadow loading={sending} disabled={sending}>
				{#snippet icon()}
					📧
				{/snippet}
				{#if sending}
					Sending...
				{:else}
					Send
				{/if}
			</Button>
			{#if error}
				<span class="error"> Error sending message. </span>
			{/if}
		</div>
	</form>
</section>

{#if success}
	<p class="success">
		<!-- Thank you for reaching out! We've received your message and will respond as soon as possible. -->
		{m.contact_success()}
	</p>
{/if}

<style>
	.contact {
		/* @media (prefers-color-scheme: dark) {
			--text-1: oklch(95% none none);
			--text-2: oklch(85% none none);
			--text-3: oklch(70% none none);
		} */

		/* font-family: system-ui, sans-serif; */
		display: grid;
		place-content: center;
		grid-column: 1 / -1;

		/* Small tablets and larger mobile devices (481px - 768px) */
		@media (min-width: 481px) {
			grid-template-columns: 1fr 1.5fr;
			margin: 5vmin;
		}

		/* Tablets and small laptops (769px - 1024px) */
		@media (min-width: 769px) {
		}

		/* Large desktops and high-resolution screens (1025px and up) */
		@media (min-width: 1025px) {
		}

		/* Extra-large screens (1440px and up) */
		@media (min-width: 1440px) {
		}
	}

	hr {
		height: 3px;
		width: 18ch;
		border: none;
		border-radius: 3px;
		background: LinkText;
		background: linear-gradient(
				to bottom right in oklab,
				oklch(70% 0.5 340),
				oklch(90% 0.5 200)
			)
			fixed;
	}

	.message {
		display: grid;
		gap: 2ch;
		margin-inline: 12vmin;
		margin-block: 7.2vmin;

		/* Small tablets and larger mobile devices (481px - 768px) */
		@media (min-width: 481px) {
			margin-inline: 5vmin;
			margin-block: 7.5vmin;
		}

		header {
			display: grid;
			/* color: var(--primary-content); */
		}

		p {
			max-inline-size: 40ch;
			text-wrap: balance;
			line-height: 1.5;
			/* color: var(--txt-tertiary); */
		}

		h2 {
			text-wrap: balance;
		}

		footer {
			color: var(--accent-content);
		}
	}

	.contact-form {
		display: grid;
		gap: 1.5ch;
		/* margin-inline: 5vmin; */
		margin-block: 7.5vmin;
		background: var(--primary);
		padding: var(--padding-medium);
		border-radius: var(--border-radius);
		box-shadow: var(--shadow-large);

		.inputs {
			display: flex;
			flex-direction: column;
		}

		fieldset {
			/* border: var(--border); */
			border-radius: var(--border-radius);
			border: none;
			display: grid;
			gap: var(--gap-small);
			padding: 0;

			/* &.flow {
				grid-auto-flow: column;
			} */

			legend {
				text-transform: uppercase;
				font-size: 0.81rem;
				color: var(--secondary-content);
				margin-block: 0 var(--padding-extra-small);
			}
		}

		fieldset input[type='text'],
		fieldset input[type='email'],
		fieldset textarea {
			display: block;
			padding: var(--padding-small);
			color: var(--primary-content);
			border: var(--border);
			border-radius: var(--border-radius);
			width: 100%;
			background: transparent;
		}

		.button-wrap {
			margin-block-start: var(--padding-medium);
		}
	}

	p.success {
		max-width: 43ch;
		padding: 1rem;
		border: 3px solid var(--success);
		border-radius: var(--border-radius);
	}

	form {
		position: relative;
		overflow: hidden;
		border-radius: var(--border-radius);

		&::before {
			content: '';
			position: absolute;
			top: 25%;
			left: -50%;
			width: 200%;
			height: 50%;
			background-image: var(--gradient-gold);
			animation: animate 6s linear infinite;
			transition: all 0.3s linear;
		}

		&::after {
			content: '';
			position: absolute;
			background: var(--primary);
			inset: 1px;
			border-radius: calc(var(--border-radius) / 2);
		}

		> div {
			z-index: 3;
		}
	}

	@keyframes animate {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>
