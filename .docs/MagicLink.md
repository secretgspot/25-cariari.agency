To remove the email confirmation step and implement the simplified OTP (magic link) authentication flow in your SvelteKit application, you can make the following changes:

1. Update the API route for handling the magic link request:

In your src/routes/(api)/magic-link/+server.js file, modify the POST endpoint to handle the simplified OTP flow:

```js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function POST({ request }) {
  const { email } = await request.json();

  try {
    // Check if the user exists in the auth.users table
    const { data: user, error: userError } = await supabase
      .from('auth.users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError) {
      return new Response(JSON.stringify({ error: userError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // If the user doesn't exist, create a new user record
    if (!user) {
      const { data: newUser, error: createError } = await supabase
        .from('auth.users')
        .insert({ email })
        .select()
        .single();

      if (createError) {
        return new Response(JSON.stringify({ error: createError.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Generate a new magic link token and store it in the auth.otp_tokens table
    const { data: otp, error: otpError } = await supabase
      .from('auth.otp_tokens')
      .insert({ email, consumed: false })
      .select()
      .single();

    if (otpError) {
      return new Response(JSON.stringify({ error: otpError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ otp: otp.token }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
```

2. Update the Svelte component for the magic link request form:

In your src/routes/(auth)/login/+page.svelte file, modify the form submission logic to use the updated API route:

```js
<script>
  import { createClient } from '@supabase/supabase-js';

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  let email = '';
  let error = null;

  async function handleMagicLinkRequest() {
    try {
      const { data, error: apiError } = await fetch('/magic-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      }).then((res) => res.json());

      if (apiError) {
        error = apiError;
      } else {
        // Store the magic link token in the client-side state or session
        localStorage.setItem('magicLinkToken', data.otp);
        // Redirect the user to the login page or display a success message
      }
    } catch (err) {
      error = err.message;
    }
  }
</script>

<form on:submit|preventDefault={handleMagicLinkRequest}>
  <label>
    Email:
    <input type="email" bind:value={email} required />
  </label>
  <button type="submit">Send Magic Link</button>
  {#if error}
    <p>Error: {error}</p>
  {/if}
</form>
```

3. Update the login flow in the +page.svelte file:

In your src/routes/+page.svelte file, modify the login flow to use the magic link token instead of the email confirmation:

```js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function handleLogin() {
  const magicLinkToken = localStorage.getItem('magicLinkToken');

  if (magicLinkToken) {
    const { error } = await supabase.auth.verifyOtp({
      token: magicLinkToken,
      type: 'magiclink',
    });

    if (error) {
      // Handle the error
    } else {
      // Redirect the user to the dashboard or perform other login-related actions
    }
  } else {
    // Redirect the user to the magic link request page
  }
}
```

With these changes, your SvelteKit application will implement the simplified OTP (magic link) authentication flow, where the user can log in without the need for email confirmation. The key steps are:

1. Checking if the user exists in the auth.users table, and creating a new user record if needed.
2. Generating a new magic link token and storing it in the auth.otp_tokens table.
3. Verifying the magic link token when the user clicks the login link.

This approach provides a seamless login experience for your users, while still maintaining the security of the authentication process.

## Somewhat working method

in supabase confirm sign up template
<https://supabase.com/dashboard/project/gewanooofykqznuzrrno/auth/templates>

```txt
<a href="http://localhost:5173/confirm?token_hash={{ .TokenHash }}&next={{ .RedirectTo }}&type=email">Localhost Log In</a>

<br/>

<a href="{{ .SiteURL }}/confirm?token_hash={{ .TokenHash }}&next={{ .RedirectTo }}&type=email">Log In</a>
```

### (auth)\login\+page.server.js

```js
import { fail, redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ url }) {
 const redirectTo = url.searchParams.get('redirectTo');
 return { redirectTo };
}

export const actions = {
 default: async ({ request, url, locals: { supabase } }) => {
  const formData = await request.formData();
  const email = formData.get('email');
  const redirectTo = formData.get('redirectTo');

  console.log('🐍 redirectTo: ', redirectTo);

  const { error } = await supabase.auth.signInWithOtp({
   email,
   options: {
    // This is the crucial part for server-side auth
    emailRedirectTo: `${redirectTo}`
    // emailRedirectTo: `${redirectTo || '/'}`
   }
  });

  if (error) {
   return fail(500, {
    success: false,
    message: error.message,
    email
   });
  }

  return {
   success: true,
   message: 'A magic login link has been sent to your email. You may close this page.'
  };
 }
};
```

### (auth)\login\+page.svelte

```txt
<script>
 import { enhance } from '$app/forms';
 import { goto, invalidateAll } from '$app/navigation';
 import { navigating, page } from '$app/state';
 import Notify from '$lib/Notify.svelte';
 import { Button } from '$lib/buttons';
 import Logo from '$lib/Logo.svelte';

 let { data, form } = $props();

 let email = $state(form?.email || '');
 let isLoading = $state(false);
</script>

<svelte:head>
 <title>Sign-in Cariari Agency</title>
</svelte:head>

{#if !navigating.complete}
 <Logo type="regular" color="bw" fixed onclick={() => goto('/')} />
{/if}

<aside class="login">
 {#if form?.success}
  <Notify type="success">{form.message}</Notify>
 {:else}
  <p>
   No password or personal identification is required to list your properties.<br />
   Signing in with an email allows you to edit properties you've listed.
  </p>
  <form
   method="POST"
   use:enhance={() => {
    isLoading = true;
    return async ({ update }) => {
     await update();
     isLoading = false;
    };
   }}>
   <input type="hidden" name="redirectTo" value={data.redirectTo} />
   <input
    type="email"
    name="email"
    bind:value={email}
    placeholder="Your email address"
    aria-label="Your email address"
    autocomplete="email"
    required />
   <Button shadow size="block" {isLoading} disabled={isLoading} type="submit">
    Request a magic link
   </Button>
  </form>
 {/if}

 {#if form?.message && !form?.success}
  <Notify type="danger">{form.message}</Notify>
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
 input[type='email'] {
  display: block;
  padding: var(--padding-small);
  color: var(--primary-content);
  border: var(--border);
  border-radius: var(--border-radius);
  width: 100%;
  background: transparent;
 }
</style>
```

### (auth)\confirm\+server.js

```js
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url, locals: { supabase } }) {
 const token_hash = url.searchParams.get('token_hash');
 const type = url.searchParams.get('type');
 const next = url.searchParams.get('next') ?? '/';

 console.log('👽👽👽 next decode: ', next);

 if (token_hash && type) {
  const { error } = await supabase.auth.verifyOtp({ token_hash, type });
  if (!error) {
   redirect(303, `/${next.slice(1)}`);
  }
 }

 // return the user to an (auth)/error page with some instructions or to homepage
 redirect(303, '/');
}
```
