<script>
	  import { page } from '$app/state';
import { goto, invalidateAll } from '$app/navigation';
import Text from '$lib/Text.svelte';
import { Button } from '$lib/buttons';
import { isEmpty } from '$lib/utils/helpers.js';

let { redirectTo = '/' } = $props();

let error = $state('');
let message = $state('');
let loading = $state(false);
let email = $state('');
let token = $state('');
let view = $state('magic');

async function submit() {
  error = '';
  message = '';
  loading = true;

  if (isEmpty(email)) {
    error = 'Email must not be empty';
    loading = false;
    return false;
  }

  const { error: err } = await page.data.supabase.auth.signInWithOtp({
    email,
    sendOtp: true,
  });

  if (err) {
    error = err.message;
  } else {
    view = 'verify';
    message = 'Verification token sent!';
  }

  loading = false;
}

async function verify() {
  error = '';
  message = '';
  loading = true;

  const { data: verifyData, error: verifyError } = await page.data.supabase.auth.verifyOtp({
    email,
    token,
    type: 'magiclink',
  });

  if (verifyError) {
    view = 'magic';
    token = '';
    error = verifyError.message;
  } else {
    message = 'Verified!';
    view = 'verified';
    await invalidateAll();
    goto(redirectTo);
  }

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
