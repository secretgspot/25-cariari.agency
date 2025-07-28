<script>
	import { enhance } from '$app/forms';
	import { Button } from '$lib/buttons';

	let { data } = $props();

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

	{#if success}
		<div class="success">
			<svg
				class="icon"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 201 95">
				<path
					fill="var(--success)"
					d="M69.01 94.94c-.58 0-1.14-.12-1.62-.52-.71-.58-1.02-1.56-1.28-2.52a157.5 157.5 0 0 1-5.28-34.13c-.02 1.37.08 3.63.41 7.3a338.1 338.1 0 0 0 1.43 12.73c.15 1.44-.48 3.06-1.78 4.56a14.55 14.55 0 0 1-6.4 4.05c-3.03 1-6.48 1.24-9.98.67A17.11 17.11 0 0 1 38.48 85a11.35 11.35 0 0 1-3.61-3.3l-.29.16a21.45 21.45 0 0 1-8.48 2.28c-2.75.18-5.67-.05-8.93-.71C11.36 82.26 5.6 79.93.21 77.63c-.17-.07-.25-.3-.19-.5s.24-.3.41-.22c5.37 2.28 11.09 4.6 16.85 5.77 3.22.65 6.09.88 8.79.7 3.03-.2 5.8-.95 8.26-2.21l.15-.08c-.22-.36-.41-.74-.59-1.13a10.56 10.56 0 0 1-.8-5c.13-1.36.7-2.52 1.54-3.08.61-.41 1.37-.5 2.12-.23.85.3 1.58 1.02 1.96 1.92a5.92 5.92 0 0 1-.55 5.19 7.87 7.87 0 0 1-2.68 2.6c1.49 2.06 4.2 4.16 9.14 4.95 3.41.55 6.77.33 9.72-.65 2.52-.83 4.7-2.21 6.12-3.86 1.15-1.33 1.71-2.72 1.59-3.92l-.16-1.3c-.28-2.27-.87-7.01-1.27-11.43-.22-2.48-.36-4.52-.4-6.07-.07-2.58.12-3.33.28-3.67.11-.24.24-.45.4-.65.09-.47.26-.92.56-1.3.28-.35.66-.61 1.19-.82.78-.31 1.64-.55 2.67-.76l2-.4c14.03-2.81 28.53-5.71 42.93-7.27.53-.06 1.25-.14 1.86.23.95.57 1.23 1.87 1.4 3.17a384.84 384.84 0 0 1 2.83 33.28v.17c.04.86.08 1.82-.08 2.68-.2 1.05-.69 1.76-1.46 2.13-1.45.69-3.05.82-4.6.95-.64.05-1.29.1-1.91.2-6.76 1.02-13.62 2.2-20.25 3.33a1191.3 1191.3 0 0 1-18.35 3.04c-1.02.16-1.83-.44-2.44-1.8-.48-1.05-.74-2.4-.94-3.46-.08-.38-.14-.72-.21-.98a160.1 160.1 0 0 1-2.43-12.91c-.74-4.8-1.24-8.76-1.58-12.48l-.1-.9c-.31-2.44-.56-4.92.08-5.84a.79.79 0 0 1 .63-.38c.25-.02.75.13 3.37 2.09 1.69 1.27 3.94 3.04 6.32 4.9 3.56 2.8 7.59 5.98 10.93 8.39a54.24 54.24 0 0 0 4.36 2.9c1.59.93 2.17 1 2.38.97 1.08-.18 6.13-5.03 11.9-11.96 2.79-3.35 5.16-6.48 6.84-9.05 2.52-3.86 2.8-5.4 2.74-5.97-.02-.2-.07-.7-1.15-.56-4.57.54-19.59 3-44.65 7.3l-.39.07c-1.28.2-2.96.49-3.86 1.4-.07.49-.06 1-.04 1.5.44 11.9 2.22 23.68 5.29 35.02.23.87.49 1.68 1.03 2.12.62.5 1.48.4 2.37.26 3.15-.53 5.46-.95 7.69-1.35 3-.54 5.83-1.06 10.17-1.74 2.53-.4 7.42-1.28 11.36-2l4.97-.88c1.19-.21 2.46-.38 3.68-.56 2.31-.32 4.7-.66 6.87-1.23 1.08-.28 1.71-1.71 1.89-4.23.15-2.23-.08-4.76-.24-6.44l-.1-1.2c-.04-.7-.13-1.53-.22-2.42-.36-3.5-.54-5.86.17-6.62a.74.74 0 0 1 .74-.23c1.58.38 3.25.89 4.87 1.37 1.75.53 3.4 1.03 4.5 1.22 1.41.25 4.82.49 8.43.08 1.87-.21 4.12-.64 5.99-1.5a6.6 6.6 0 0 1-1.03-3.43c-.02-1 .16-2.02.55-3.06.36-.98.88-1.66 1.5-1.96a1.85 1.85 0 0 1 1.85.16 3.31 3.31 0 0 1 1.42 2.19 5.6 5.6 0 0 1-1.09 4.65 7.29 7.29 0 0 1-2.14 1.75c.44.53.98 1 1.59 1.43 1.06.73 2.32 1.26 3.62 1.53 4.11.84 8.21-1 10.93-2.67a30.1 30.1 0 0 0 8.74-8.34 42 42 0 0 0 5.62-12.45 63.34 63.34 0 0 0 1.86-8.53l.06-.45.2-1.54a8.67 8.67 0 0 1-2.46-2.64 3.4 3.4 0 0 1-.3-2.95c.34-.91.88-1 1.16-.97.94.1 1.95 1.68 2.16 2.7.24 1.13.22 2.32.12 3.46.78.56 1.7 1.09 2.72 1.59 2.32 1.12 4.87 1.86 6.51 1.87.14 0 .67-.2 2.02-2.56 2.57-4.51 6.09-13.36 8.53-20.14 1.38-3.83 2.58-7.43 3.37-10.15.73-2.5.97-3.76 1.05-4.4-.26.27-.63.62-1.12 1.06-.96.86-2.35 2.05-4.25 3.63l-1.65 1.37c-2.41 2.45-5.18 5.34-8.08 8.36-4.46 4.65-9.07 9.46-12.55 12.84-.8.78-.93 1.79-1.08 3.08l-.02.2c-.07.6-.14 2.1-.2 3.7-.06 1.53-.13 3.26-.23 4.6-.05.75-.11 1.3-.17 1.72-.1.64-.21.9-.41 1.02h-.01c-.11.05-.34.1-.58-.16-.11-.12-.23-.3-.34-.55-.59-1.3-1.25-4.75-1.59-8.21a35.04 35.04 0 0 1-.18-4.57c.06-1.51.3-2.42.73-2.78 3.53-2.94 8.35-6.85 13-10.63 3.95-3.21 8.03-6.51 11.32-9.23.78-.8 1.52-1.54 2.22-2.23a59.23 59.23 0 0 1 3.87-3.6l-1 .4c-1.27.57-3 1.48-5.14 2.7-3.81 2.17-8.9 5.32-14.74 9.12-10.59 6.89-21.4 14.48-23.14 16.24a1.2 1.2 0 0 0-.33.46c-.02.09-.04.2 0 .25.18.23 1.04.22 1.95-.03 1.03-.28 2.2-.57 3.43-.88 2.07-.52 4.41-1.1 6.51-1.74.17-.05.35.07.39.27.04.2-.06.4-.23.46-2.12.65-4.47 1.24-6.55 1.75-1.23.3-2.39.59-3.42.87-.14.04-.65.17-1.18.2-.69.06-1.15-.07-1.4-.4-.14-.17-.27-.5-.13-1 .1-.34.32-.58.52-.78 1.77-1.8 12.27-9.17 22.94-16.13a322.07 322.07 0 0 1 14.72-9.14c6.25-3.53 7.68-3.74 8.22-3.58.19.05.3.17.36.27.27.27.27.89.03 2.12-.73 3.7-3.79 12.86-7.13 21.28a137.04 137.04 0 0 1-4.75 10.88 29.21 29.21 0 0 1-1.97 3.45c-.66.95-1.18 1.4-1.62 1.4-1.74-.02-4.33-.76-6.75-1.93-.7-.34-1.63-.83-2.56-1.47l-.17 1.24-.06.45a65.24 65.24 0 0 1-1.88 8.64 42.57 42.57 0 0 1-5.73 12.68 30.69 30.69 0 0 1-8.94 8.53c-2.32 1.43-5.62 2.97-9.11 2.97-.74 0-1.48-.07-2.23-.22a9.92 9.92 0 0 1-5.73-3.38c-.36.18-.75.34-1.16.49-1.45.54-3.2.92-5.19 1.15-3.66.42-7.14.18-8.59-.08-1.13-.2-2.8-.71-4.56-1.24a88.93 88.93 0 0 0-4.84-1.37c-.1-.02-.15 0-.18.04-.12.13-.31.57-.27 2.13.03 1.14.17 2.52.3 3.84.09.9.18 1.75.22 2.47l.1 1.17c.16 1.7.4 4.28.24 6.58-.2 2.9-1.01 4.55-2.39 4.92-2.2.58-4.61.9-6.94 1.24-1.28.18-2.48.35-3.67.56-1.23.2-3.04.54-4.96.89-3.94.7-8.84 1.59-11.37 1.99-4.34.69-7.16 1.2-10.15 1.74-2.24.4-4.54.82-7.7 1.36-.4.07-.81.13-1.21.13v-.02Zm-6.3-39.51s-.1.02-.16.1c-.12.18-.31.69-.24 2.22.04 1.05.19 2.2.3 3.05l.11.92c.34 3.7.84 7.65 1.58 12.43.59 3.85 1.35 8.38 2.42 12.83.07.29.14.64.21 1.02.2 1.03.45 2.3.89 3.29.48 1.06 1.04 1.5 1.78 1.39 6.12-.95 12.33-2.01 18.34-3.04 6.64-1.13 13.5-2.31 20.26-3.33.64-.1 1.31-.16 1.95-.21 1.5-.13 3.05-.26 4.4-.9 1.3-.62 1.22-2.45 1.15-4.07v-.17a391.4 391.4 0 0 0-2.83-33.2c-.15-1.11-.37-2.2-1.06-2.61-.41-.25-.92-.22-1.5-.15-14.38 1.56-28.87 4.46-42.88 7.26l-1.99.4c-1.01.2-1.83.43-2.58.73-.36.14-.63.3-.82.5.99-.51 2.22-.71 3.23-.88l.39-.07c25.07-4.3 40.1-6.76 44.67-7.31 1.48-.18 1.79.69 1.85 1.23.13 1.24-.81 3.37-2.87 6.52-1.7 2.59-4.08 5.75-6.89 9.12a128.77 128.77 0 0 1-7.49 8.29c-2.45 2.45-4.05 3.76-4.78 3.89-.32.05-.96 0-2.76-1.04a55.3 55.3 0 0 1-4.41-2.94 361.4 361.4 0 0 1-10.96-8.4c-2.34-1.84-4.55-3.58-6.23-4.84a34.65 34.65 0 0 0-2.09-1.5c-.73-.47-.94-.52-.98-.52l-.01-.01ZM35.87 72.27c-.34 0-.66.09-.93.28-.66.44-1.11 1.38-1.22 2.5-.14 1.5.14 3.25.73 4.57.17.37.37.76.61 1.15a7.47 7.47 0 0 0 2.57-2.44c.39-.65.66-1.42.76-2.18.1-.81.01-1.58-.26-2.23a2.78 2.78 0 0 0-1.57-1.53 2.08 2.08 0 0 0-.68-.12h-.01Zm106.81-13.82c-.18 0-.35.04-.51.12-.59.29-.96 1-1.16 1.56a6.46 6.46 0 0 0 .03 5.04c.13.29.29.58.48.86a6.98 6.98 0 0 0 2.12-1.68 4.74 4.74 0 0 0 .93-3.98 2.52 2.52 0 0 0-1.09-1.67 1.53 1.53 0 0 0-.79-.25h-.01Zm44.96-47.04-6.55 5.32c-4.66 3.78-9.47 7.68-13 10.62-.1.09-.61.7-.44 4.47.1 2.1.4 4.63.8 6.78.19 1.04.41 1.94.61 2.6.15.5.28.78.36.92.06-.3.15-.9.23-2.18.09-1.3.15-2.91.21-4.33.07-1.68.13-3.13.2-3.77l.02-.2c.16-1.33.31-2.6 1.31-3.56 3.48-3.37 8.08-8.18 12.53-12.82l3.71-3.86h.01ZM172.88 29.8c-.1 0-.3.05-.47.52-.27.7-.18 1.44.25 2.23a7.9 7.9 0 0 0 1.99 2.2c.07-.96.06-1.92-.13-2.82-.18-.84-1.01-2.07-1.6-2.13h-.05.01Z" />
			</svg>

			<p>
				<strong>Thank you for reaching out!</strong><br /> We've received your message and
				will respond as soon as possible.
			</p>
		</div>
	{:else}
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
					<span class="error"> Error sending a message. </span>
				{/if}
			</div>
		</form>
	{/if}
</section>

<style>
	.contact {
		display: grid;
		grid-column: 1 / -1;
		margin-block: var(--padding-large);

		/* Small tablets and larger mobile devices (481px - 768px) */
		@media (min-width: 481px) {
			place-content: center;
			grid-template-columns: 1fr 2fr;
			grid-column: 2 / -2;
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
		border-radius: var(--border-radius);
		background: LinkText;
		background: var(--gradient-gold) fixed;
	}

	.message {
		display: grid;
		margin-block: var(--padding-large);
		place-content: center;
		text-align: center;

		/* Small tablets and larger mobile devices (481px - 768px) */
		@media (min-width: 481px) {
			margin-inline: 0 var(--padding-large);
			text-align: left;
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
		gap: 2ch;
		margin-block: var(--padding-large);
		background: var(--primary);
		padding: var(--padding-medium);
		border-radius: var(--border-radius);

		.inputs {
			display: flex;
			flex-direction: column;
		}

		fieldset {
			border-radius: var(--border-radius);
			border: none;
			display: grid;
			gap: var(--gap-small);
			padding: 0;

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

	.success {
		border: 3px solid var(--success);
		border-radius: var(--border-radius);
		padding: var(--padding-large);
		place-content: center;
		margin-inline: var(--padding-large);
		/* Small tablets and larger mobile devices (481px - 768px) */
		@media (min-width: 481px) {
			margin-inline: 0;
		}

		p {
			text-wrap: balance;
			line-height: 1.5;
		}
	}

	span.error {
		margin-block: var(--padding-small) 0;
		display: block;
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
			transition: all var(--transition) linear;
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
