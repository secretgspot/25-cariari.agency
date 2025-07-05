<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" class="logo" width="120"/>

## Example: Integrating Supabase Client in a SvelteKit 2 App

Below is a step-by-step example of how to set up and use the Supabase client (`supabaseClient`) in a SvelteKit 2 project.

### 1. Install Dependencies

```bash
npm install @supabase/supabase-js
```


### 2. Set Up Environment Variables

Create a `.env` file at the root of your project and add your Supabase credentials:

```
VITE_PUBLIC_SUPABASE_URL=your_supabase_url
VITE_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace the values with your actual Supabase project URL and anon key, which you can find in your Supabase dashboard[^1][^2][^3].

### 3. Create the Supabase Client

Create a file at `src/lib/supabaseClient.js` (or `.ts` for TypeScript):

```js
// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_PUBLIC_SUPABASE_URL,
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY
);
```

Or, if using SvelteKit's `$env/static/public` (TypeScript example):

```ts
// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
```

This client can now be imported and used throughout your app[^1][^3][^4][^5].

### 4. Using the Supabase Client in SvelteKit

**Example: Fetching Data in a Page**

```js
// src/routes/+page.js
import { supabase } from '$lib/supabaseClient';

export async function load() {
  const { data, error } = await supabase.from('your_table').select('*');
  return { data, error };
}
```

**Example: In a Svelte Component**

```svelte
<script>
  import { supabase } from '$lib/supabaseClient';
  let items = [];

  async function fetchItems() {
    const { data, error } = await supabase.from('items').select('*');
    if (data) items = data;
  }

  fetchItems();
</script>

<ul>
  {#each items as item}
    <li>{item.name}</li>
  {/each}
</ul>
```


---

### 5. Notes and Best Practices

- **Never expose service keys** in client code—only use the public anon key.
- **Enable Row Level Security (RLS)** in your Supabase tables for secure, per-user data access.
- **Use the client in both server and client code** as needed, but always follow security best practices[^1][^2][^3].


### Summary Table

| Step | File/Location | Example/Action |
| :-- | :-- | :-- |
| Install | Terminal | `npm install @supabase/supabase-js` |
| Env Vars | `.env` | Add `VITE_PUBLIC_SUPABASE_URL` and `VITE_PUBLIC_SUPABASE_ANON_KEY` |
| Client Setup | `src/lib/supabaseClient.js` | Initialize and export Supabase client |
| Usage (Server) | `+page.js` | Import and use `supabase` for data fetching |
| Usage (Component) | Svelte file | Import and use `supabase` for CRUD actions |

By following these steps, you can quickly and securely integrate Supabase into your SvelteKit 2 application for full-stack development[^1][^2][^3][^4][^5].

**References:**

- Official Supabase SvelteKit Quickstart[^1]
- Supabase User Management Example[^2]
- Community integration guides[^3][^4][^5]

<div style="text-align: center">⁂</div>

[^1]: https://supabase.com/docs/guides/getting-started/quickstarts/sveltekit

[^2]: https://supabase.com/docs/guides/getting-started/tutorials/with-sveltekit

[^3]: https://www.fractalmandala.in/posts/sveltekitsupabaseintegration

[^4]: https://blog.robino.dev/posts/supabase-sveltekit

[^5]: https://dev.to/jdwright/sveltekit-with-vercel-and-supabase-1ik

[^6]: https://github.com/supabase-community/supabase-sveltekit-example/blob/main/README.md

[^7]: https://dev.to/kvetoslavnovak/sveltekit-with-supabase-auth-helpers-578a

[^8]: https://dev.to/jdgamble555/perfect-local-sveltekit-supabase-setup-in-2025-4adp

[^9]: https://supabase.com/docs/guides/auth/server-side/sveltekit

[^10]: https://supabase.com/docs/guides/getting-started/tutorials/with-svelte

[^11]: https://www.youtube.com/watch?v=nMBDL4ABq8M

[^12]: https://docs-451de2d9m-supabase.vercel.app/docs/guides/getting-started/tutorials/with-sveltekit

[^13]: https://www.youtube.com/watch?v=JZRzP5QFXV8

[^14]: https://www.reddit.com/r/sveltejs/comments/16w2o41/supabase_auth_and_sveltekit_docs_suck_so_here_we/

[^15]: https://github.com/supabase-community/supabase-sveltekit-example

[^16]: https://www.reddit.com/r/Supabase/comments/18ly678/sveltekit_20_with_supabasessr/

[^17]: https://www.youtube.com/watch?v=lEWghUOta-4

[^18]: https://github.com/orgs/supabase/discussions/5218

[^19]: https://www.reddit.com/r/sveltejs/comments/160okff/help_setting_up_supabase_auth_with_sveltekit/

