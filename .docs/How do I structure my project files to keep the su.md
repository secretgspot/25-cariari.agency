<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" class="logo" width="120"/>

# How do I structure my project files to keep the supabaseClient accessible across server and client code

To keep your Supabase client accessible across both **server** and **client** code in a SvelteKit 2 project, the recommended approach is to **separate the client and server Supabase client instances into different files**, organized clearly in your project structure. This prevents accidental server-only code from running on the client and vice versa, while allowing shared usage of Supabase functionality.

## Recommended Project File Structure

```
src/
├── lib/
│   ├── supabaseClient.ts         # Supabase client for client-side usage
│   ├── supabaseServerClient.ts   # Supabase client configured for server-side usage (SSR)
│   └── db/                      # Optional: database-specific helpers or types
├── routes/
│   ├── +page.svelte              # Svelte page component (client + server)
│   ├── +page.server.ts           # Server load functions using supabaseServerClient
│   └── api/                     # API endpoints (if any)
```

## Example Implementations

### 1. `supabaseClient.ts` — Client-only Supabase client

```ts
// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
```

- This file is imported in client-side code (Svelte components, client-side hooks).
- Uses environment variables prefixed with `PUBLIC_` so they are exposed to the browser.
- Runs **only on the client**.

### 2. `supabaseServerClient.ts` — Server-only Supabase client for SSR

```ts
// src/lib/supabaseServerClient.ts
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export function createSupabaseServerClient(cookies: any) {
  return createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    // Pass cookies for authenticated SSR requests if needed
    // e.g., for auth-helpers or @supabase/ssr integration
    // cookies,
  });
}
```

- This client is instantiated inside **server load functions** or API routes.
- Can be configured to handle cookies for authenticated requests.
- Runs **only on the server** (e.g., inside `+page.server.ts` or `+server.ts`).

### 3. Usage in Server Load Function

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

### 4. Usage in Client Component

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

- **Clear separation**: Files ending with `.server.ts` or `.server.js` run only on the server; `.ts` or `.js` files without `.server` suffix can run on client and server.
- **Avoids bundling server-only code into client bundles**, reducing bundle size and preventing runtime errors.
- **Allows passing cookies or request context for SSR auth** in server client.
- **Easier maintenance**: You know exactly which client to use depending on environment.

## Additional Tips

- Use SvelteKit’s environment variable conventions (`$env/static/public` for public vars).
- Enable Row Level Security (RLS) in Supabase to secure data access.
- For authentication, consider `@supabase/auth-helpers-sveltekit` or `@supabase/ssr` to handle sessions and cookies properly on server.
- Keep shared types and utilities under `src/lib` or a dedicated folder like `src/lib/db`.

## Summary Table

| File | Purpose | Runs on | Notes |
| :-- | :-- | :-- | :-- |
| `supabaseClient.ts` | Supabase client for client code | Client | Uses public env vars, no cookies |
| `supabaseServerClient.ts` | Supabase client factory for server | Server | Accepts cookies for SSR auth, secure |
| `+page.server.ts` | Server load function using server client | Server | Fetch data securely before rendering |
| `+page.svelte` | Client component using client client | Client | UI rendering and client-side data fetching |

**In summary:**
Structure your SvelteKit 2 project by creating **separate Supabase client modules** for client and server environments inside `src/lib/`. Import the appropriate client in your server load functions or client components to keep your code clean, secure, and maintainable.

<div style="text-align: center">⁂</div>









