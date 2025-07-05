<script>
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	
	import Text from '$lib/Text.svelte';
	import { Button } from '$lib/buttons';
	import { isEmpty } from '$lib/utils/helpers.js';

	let error = $state(''),
		message = $state(''),
		loading = $state(false),
		email = $state(''),
		token = $state(''),
		view = $state('magic');

	async function submit() {
		error = '';
		message = '';
		loading = true;

		if (isEmpty(email)) {
			error = 'Email must not be empty';
			loading = false;
			return false;
		}

		const { error: err } = await supabase.auth.signInWithOtp({
			email,
			sendOtp: true,
		});
		// const { error: err } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo:  "https://example.com/login" } });

		if (err) error = err.message;
		else {
			view = 'verify';
			message = 'Verification token sent!';
			// goto("/");
		}

		loading = false;
	}

	async function verify() {
		error = '';
		message = '';
		loading = true;

		const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
			email,
			token,
			type: 'magiclink',
		});

		if (verifyError) {
			view = 'magic';
			token = '';
			error = verifyError.message;
		} else message = 'Verified!';

		loading = false;
	}
</script>

<aside class="login">
	{#if view == 'magic'}
		<p>
			No password or personal identification is required to list your properties.<br />
			Signing in with an email will allow you to edit properties you've listed.
		</p>

		<input
			type="email"
			name="email"
			bind:value={email}
			placeholder="Your email"
			required />
		<Button shadow size="block" {loading} disabled={loading} onclick={submit}
			>Request a magic link</Button>
	{/if}
	{#if view == 'verify'}
		<p>Please enter token you've received by email and press Verify</p>

		<input type="text" name="token" bind:value={token} placeholder="ex:123456" required />
		<Button shadow size="block" {loading} disabled={loading} onclick={verify}
			>Verify login token</Button>
	{/if}

	{#if message}
		<Text type="success">{message}</Text>
	{/if}

	{#if error}
		<Text type="error">{error}</Text>
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
	p {
		max-width: 369px;
	}
</style>
