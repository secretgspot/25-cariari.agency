<script>
	import Notify from '$lib/Notify.svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { navigating } from '$app/state';
	import Logo from '$lib/Logo.svelte';
	import { Button } from '$lib/buttons';
	import { isEmpty } from '$lib/utils/validators.js';
	import TokenVerification from '$lib/auth/TokenVerification.svelte';

	let { data } = $props();

	// State variables for the component
	let errorMessage = $state('');
	let successMessage = $state('');
	let isLoading = $state(false);
	let email = $state('');
	let currentView = $state('magic');

	/**
	 * Handles the submission of the email for login code request.
	 */
	async function handleRequestCode() {
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

		// Call Supabase to sign in with OTP (sends a code)
		const { error: otpError } = await data.supabase.auth.signInWithOtp({
			email,
			options: {
				shouldCreateUser: true,
			},
		});

		if (otpError) {
			// Display error message from Supabase
			errorMessage = otpError.message;
		} else {
			// Transition to verification view and show success message
			currentView = 'verify';
			successMessage = 'A login Token has been sent to your email!';
		}

		// Reset loading state
		isLoading = false;
	}

	/**
	 * Handles the verification of the login code via TokenVerification component.
	 */
	async function handleVerifyComplete(tokenValue) {
		errorMessage = '';
		successMessage = '';
		isLoading = true;

		// Call Supabase to verify the OTP
		const { data: verifyData, error: verifyOtpError } =
			await data.supabase.auth.verifyOtp({
				email,
				token: tokenValue,
				type: 'email',
			});

		if (verifyOtpError) {
			// If verification fails, trigger shake animation and show error
			errorMessage = verifyOtpError.message;
		} else {
			// If verification succeeds, show success message, invalidate all data, and redirect
			successMessage = 'Successfully verified! Redirecting...';
			currentView = 'verified';

			// Invalidate all server-side data to ensure session is refreshed
			await invalidateAll();

			// Redirect to the intended page or default to root
			goto(data.redirectTo || '/');
		}

		// Reset loading state
		isLoading = false;
	}

	function handleVerifyError(message) {
		errorMessage = message;
	}
</script>

<svelte:head>
	<title>Sign-in Cariari Agency</title>
</svelte:head>

{#if !navigating.complete}
	<Logo type="regular" color="bw" fixed onclick={() => goto('/')} />
{/if}

<section class="login">
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
			required
			onkeydown={(e) => e.key === 'Enter' && handleRequestCode()} />
		<Button
			shadow
			size="block"
			loading={isLoading}
			disabled={isLoading}
			onclick={handleRequestCode}>
			Request login code
		</Button>
	{/if}

	{#if currentView === 'verify'}
		<p>Please enter the 6-digit code you received by email.</p>

		<TokenVerification
			length={6}
			onComplete={handleVerifyComplete}
			onError={handleVerifyError}
			error={errorMessage}
			disabled={isLoading}
			autoFocus={true}
		/>

		{#if successMessage}
			<Notify type="success">{successMessage}</Notify>
		{/if}
		{#if errorMessage}
			<Notify type="danger">{errorMessage}</Notify>
		{/if}
	{/if}

	{#if successMessage && currentView !== 'verify'}
		<Notify type="success">{successMessage}</Notify>
	{/if}
	{#if errorMessage && currentView !== 'verify'}
		<Notify type="danger">{errorMessage}</Notify>
	{/if}
</section>

<style>
	section.login {
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
		align-self: center;
		justify-self: center;
		justify-content: center;
		flex: 1;
		padding: var(--size-3);
		max-width: 39ch;
		/* Small tablets and larger mobile devices (481px - 768px) */
		@media (min-width: 481px) {
			max-width: 54ch;
		}
	}
	input[type='text'],
	input[type='email'] {
		display: block;
		padding: var(--size-2);
		color: var(--text-1);
		border: var(--border-size-1) solid var(--surface-4);
		border-radius: var(--radius-2);
		width: 100%;
		background: transparent;
	}
</style>
