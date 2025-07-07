<script>
	import Notify from '$lib/Notify.svelte';
	import { page } from '$app/state';
	import { goto, invalidateAll } from '$app/navigation';
	// import Text from '$lib/Text.svelte'; // Keeping commented out as per your original
	import { Button } from '$lib/buttons';
	import { isEmpty } from '$lib/utils/helpers.js';

	let { data } = $props();

	// State variables for the component
	let errorMessage = $state('');
	let successMessage = $state('');
	let isLoading = $state(false);
	let email = $state('');
	let token = $state('');
	let currentView = $state('magic');

	// console.log('(auth)/login/+page.svelte page: ', page);

	/**
	 * Handles the submission of the email for magic link request.
	 */
	async function handleRequestMagicLink() {
		// Reset messages and set loading state
		errorMessage = '';
		successMessage = '';
		isLoading = true;

		// Client-side validation for email
		if (isEmpty(email)) {
			errorMessage = 'Email address cannot be empty.';
			isLoading = false;
			return;
		}

		// Call Supabase to sign in with OTP (magic link)
		const { error: otpError } = await data.supabase.auth.signInWithOtp({
			email,
			sendOtp: true,
		});

		if (otpError) {
			// Display error message from Supabase
			errorMessage = otpError.message;
		} else {
			// Transition to verification view and show success message
			currentView = 'verify';
			successMessage = 'Verification token has been sent to your email!';
		}

		// Reset loading state
		isLoading = false;
	}

	/**
	 * Handles the verification of the magic link token.
	 */
	async function handleVerifyToken() {
		// Reset messages and set loading state
		errorMessage = '';
		successMessage = '';
		isLoading = true;

		// Client-side validation for token (optional, but good practice)
		if (isEmpty(token)) {
			errorMessage = 'Verification token cannot be empty.';
			isLoading = false;
			return;
		}

		// Call Supabase to verify the OTP
		const { data: verifyData, error: verifyOtpError } =
			await data.supabase.auth.verifyOtp({
				email,
				token,
				type: 'magiclink', // Ensure this type matches what Supabase expects for magic links
			});

		if (verifyOtpError) {
			// If verification fails, revert to magic link view, clear token, and show error
			currentView = 'magic';
			token = ''; // Clear token for re-entry
			errorMessage = verifyOtpError.message;
		} else {
			// If verification succeeds, show success message, invalidate all data, and redirect
			successMessage = 'Successfully verified! Redirecting...';
			currentView = 'verified'; // Optionally show a temporary 'verified' state

			// Invalidate all server-side data to ensure session is refreshed
			await invalidateAll();

			// Redirect to the intended page or default to root
			// data.redirectTo will be populated from the URL query param if present
			goto(data.redirectTo || '/');
		}

		// Reset loading state
		isLoading = false;
	}
</script>

<aside class="login">
	{#if currentView === 'magic'}
		<p>
			No password or personal identification is required to list your properties.<br />
			Signing in with an email allows you to edit properties you've listed.
		</p>

		<input
			type="email"
			name="email"
			bind:value={email}
			placeholder="Your email address"
			aria-label="Your email address"
			autocomplete="email"
			required />
		<Button
			shadow
			size="block"
			loading={isLoading}
			disabled={isLoading}
			onclick={handleRequestMagicLink}>
			Request a magic link
		</Button>
	{/if}

	{#if currentView === 'verify'}
		<p>Please enter the token you've received by email and press 'Verify'.</p>

		<input
			type="text"
			name="token"
			bind:value={token}
			placeholder="e.g., 123456"
			aria-label="Verification token"
			inputmode="numeric"
			pattern="[0-9]*"
			required />
		<Button
			shadow
			size="block"
			loading={isLoading}
			disabled={isLoading}
			onclick={handleVerifyToken}>
			Verify login token
		</Button>
	{/if}

	{#if successMessage}
		<Notify type="success">{successMessage}</Notify>
	{/if}
	{#if errorMessage}
		<Notify type="danger">{errorMessage}</Notify>
	{/if}
</aside>

<style>
	aside.login {
		display: flex;
		flex-direction: column;
		gap: var(--gap-small);
		align-self: center;
		justify-self: center;
		justify-content: center;
		flex: 1;
		padding: var(--padding-medium);
	}
	input[type='text'],
	input[type='email'] {
		display: block;
		padding: var(--padding-small);
		color: var(--primary-content);
		border: var(--border);
		border-radius: var(--border-radius);
		width: 100%;
		background: transparent;
	}
	/* p {
    max-width: 369px;
  } */
</style>
