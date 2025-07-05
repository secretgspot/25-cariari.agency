<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" class="logo" width="120"/>

# How can I organize my project files to share the Supabase client between server and client code in SvelteKit

To **share the Supabase client between server and client code in a SvelteKit 2 project**, the best practice is to organize your project files so that you have **separate client and server Supabase client instances** but keep them accessible via a shared module structure. This approach ensures proper environment variable usage, security, and compatibility with SvelteKit’s server/client boundaries.

## Recommended Project Structure and Approach

```
src/
├── lib/
│   ├── supabaseClient.ts         # Supabase client for client-side usage
│   ├── supabaseServerClient.ts   # Supabase client factory for server-side usage
│   └── types/                    # Optional: TypeScript types for your database
├── routes/
│   ├── +page.svelte              # Client component using supabaseClient
│   ├── +page.server.ts           # Server load function using supabaseServerClient
│   └── api/                     # API endpoints (if any)
```


### 1. **Client-side Supabase Client**

Create a client that uses **public environment variables** (prefixed with `VITE_PUBLIC_`) and is safe to expose in the browser.

```ts
// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import { VITE_PUBLIC_SUPABASE_URL, VITE_PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export const supabase = createClient(VITE_PUBLIC_SUPABASE_URL, VITE_PUBLIC_SUPABASE_ANON_KEY);
```

- This client is imported in Svelte components or client-side scripts.
- Uses environment variables exposed to the browser.
- Ideal for client-side queries, UI updates, and real-time subscriptions.


### 2. **Server-side Supabase Client**

Create a server client factory that can accept request context (like cookies) for authenticated SSR requests.

```ts
// src/lib/supabaseServerClient.ts
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export function createSupabaseServerClient(cookies?: any) {
  return createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    // Optionally pass cookies for auth session handling
    // cookies,
  });
}
```

- This factory function is called inside server load functions or API routes.
- Uses environment variables only accessible on the server.
- Allows passing cookies or headers for session validation (useful with `@supabase/ssr` or auth helpers).


### 3. **Usage in Server Load Functions**

```ts
// src/routes/+page.server.ts
import { createSupabaseServerClient } from '$lib/supabaseServerClient';

export const load = async ({ cookies }) => {
  const supabase = createSupabaseServerClient(cookies);

  const { data, error } = await supabase.from('todos').select('*');

  if (error) throw new Error(error.message);

  return { todos: data };
};
```


### 4. **Usage in Client Components**

```svelte
<script lang="ts">
  import { supabase } from '$lib/supabaseClient';
  let todos = [];

  async function loadTodos() {
    const { data, error } = await supabase.from('todos').select('*');
    if (!error) todos = data;
  }

  loadTodos();
</script>

<ul>
  {#each todos as todo}
    <li>{todo.title}</li>
  {/each}
</ul>
```


## Why This Structure?

- **Clear separation** of client and server code respects SvelteKit’s environment boundaries and avoids bundling server-only code into client bundles.
- **Shared module location (`src/lib`)** makes importing easy and consistent.
- **Environment variables** are used correctly to expose only what’s safe to the client.
- **Supports authenticated SSR** by passing cookies to the server client.
- **Aligns with Supabase and SvelteKit official docs and community best practices** ([^1][^5][^6]).


## Summary Table

| File | Purpose | Runs on | Notes |
| :-- | :-- | :-- | :-- |
| `supabaseClient.ts` | Supabase client for client code | Client | Uses `VITE_PUBLIC_` env variables |
| `supabaseServerClient.ts` | Supabase client factory for server | Server | Can accept cookies for auth |
| `+page.server.ts` | Server load function | Server | Uses server client to fetch data |
| `+page.svelte` | Client component | Client | Uses client client for UI interactions |

**In summary:**
Organize your Supabase clients in separate files inside `src/lib` — one for client-side use (`supabaseClient.ts`) and one factory for server-side use (`supabaseServerClient.ts`). This way, you can safely and easily share Supabase functionality across your SvelteKit 2 app’s server and client code while respecting environment boundaries and security best practices.

### References

- Supabase official SvelteKit quickstart and environment setup [^1]
- Supakit example for auth and client loading [^2]
- Supabase SSR auth tutorial with SvelteKit [^3]
- Supabase user management app guide [^5]
- Supabase server-side auth setup [^6]

<div style="text-align: center">⁂</div>

[^1]: https://supabase.com/docs/guides/getting-started/quickstarts/sveltekit

[^2]: https://github.com/j4w8n/supakit

[^3]: https://dev.to/kvetoslavnovak/supabase-ssr-auth-48j4

[^4]: https://joyofcode.xyz/avoid-sharing-server-and-client-state-in-sveltekit

[^5]: https://supabase.com/docs/guides/getting-started/tutorials/with-sveltekit

[^6]: https://supabase.com/docs/guides/auth/server-side/sveltekit

[^7]: https://www.reddit.com/r/Supabase/comments/1fkgdo6/how_to_use_supabase_on_serverside_only_in/

[^8]: https://www.youtube.com/watch?v=1tsUB58KX2s

[^9]: https://www.youtube.com/watch?v=VDzqnOKhuXY

