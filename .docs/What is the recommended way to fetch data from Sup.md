<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" class="logo" width="120"/>

# What is the recommended way to fetch data from Supabase in a SvelteKit2 page load function

The **recommended way to fetch data from Supabase in a SvelteKit 2 page load function** is to use a **server-side load function** (`+page.server.ts` or `.js`) where you create or import a Supabase client and query the database. This approach leverages SSR (server-side rendering) for faster initial page loads and better SEO, while keeping your API keys secure.

### Typical Setup and Example

#### 1. Create a typed Supabase client (optional but recommended)

```ts
// src/lib/db/client.ts
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from './types'; // your generated types (optional)

export const db = createClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
```


#### 2. Fetch data in the server load function

```ts
// src/routes/+page.server.ts
import { db } from '$lib/db/client';
import { error } from '@sveltejs/kit';

export const load = async () => {
  const { data: todos, error: db_error } = await db.from('todos').select('*');

  if (db_error) {
    throw error(500, db_error.message);
  }

  return { todos };
};
```


#### 3. Access data in the page component

```svelte
<script lang="ts">
  export let data;
  const { todos } = data;
</script>

<ul>
  {#each todos as todo}
    <li>{todo.title}</li>
  {/each}
</ul>
```


### Why this approach?

- **Server-side load functions run before the page is rendered**, so the data is ready on initial load (better UX and SEO).
- Keeps your Supabase anon key secure on the server side.
- Works well with Supabase's Row Level Security (RLS) when combined with authenticated sessions.
- Supports URL parameters and other load function inputs.


### Additional best practices

- Use `@supabase/auth-helpers-sveltekit` or `@supabase/ssr` for seamless auth integration and session handling.
- Pass the authenticated session from the root layout server load to child pages.
- Use `depends()` and `invalidate()` in load functions to keep data fresh on auth state changes.
- For client-side reactive data fetching (e.g., after page load), use `onMount` with the Supabase client.


### Summary

| Step | Location | Purpose |
| :-- | :-- | :-- |
| Supabase client | `src/lib/db/client.ts` | Initialize Supabase client |
| Server load function | `+page.server.ts` | Fetch data securely on server side |
| Page component | `+page.svelte` | Render fetched data |

### References

- Supabase official SvelteKit quickstart and auth helpers [GitHub README](https://github.com/supabase/auth-helpers/blob/main/packages/sveltekit/README.md)
- SvelteKit load function docs: https://svelte.dev/docs/kit/load
- Example from community Q\&A and blogs showing server-side data fetching with Supabase and SvelteKit[^1][^3][^4][^5]

**In summary:**
Use a **server-side load function (`+page.server.ts`)** to fetch data from Supabase with a securely initialized client. Return the data from the load function and consume it in your Svelte component. This method balances performance, security, and flexibility, and is the recommended pattern for SvelteKit 2 apps with Supabase.

<div style="text-align: center">⁂</div>

[^1]: https://stackoverflow.com/questions/74307809/sveltekit-supabase-get-data-onmount-keep-pre-fetch-working

[^2]: https://www.reddit.com/r/Supabase/comments/1faoij1/using_sveltekit_fetch_with_supabase/

[^3]: https://github.com/supabase/auth-helpers/blob/main/packages/sveltekit/README.md

[^4]: https://blog.robino.dev/posts/supabase-sveltekit

[^5]: https://supabase.com/docs/guides/getting-started/quickstarts/sveltekit

[^6]: https://svelte.dev/docs/kit/load

[^7]: https://supabase.com/docs/reference/javascript/select

[^8]: https://supabase.com/docs/guides/auth/server-side/sveltekit

[^9]: https://www.youtube.com/watch?v=nMBDL4ABq8M

[^10]: https://github.com/orgs/supabase/discussions/19605

