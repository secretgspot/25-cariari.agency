<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" class="logo" width="120"/>

## Why Using `supabase.auth.getSession()` or `onAuthStateChange()` User Objects Can Be Insecure

When you retrieve the user object from `supabase.auth.getSession()` or from the session passed to `supabase.auth.onAuthStateChange()`, you are accessing data that is read directly from the local storage medium—typically cookies or localStorage. This approach has important security implications, especially on the server side.

### Key Security Concerns

- **Lack of Authenticity Verification:**
The session data retrieved by `getSession()` is not verified against the Supabase Auth server. It simply reads the JWT (JSON Web Token) from storage and parses it. If the token has been tampered with or is expired, this method will not detect it, and you may end up trusting unauthenticated or malicious data[^1][^2][^3][^4].
- **Potential for Tampering:**
Since cookies and local storage can be manipulated by the client, relying solely on their contents without server-side verification opens up the risk of session spoofing or replay attacks. This is especially problematic in server-side code, such as middleware or API routes[^5][^4][^6][^7].
- **Supabase's Official Guidance:**
Supabase documentation and maintainers explicitly warn:
> "Never trust supabase.auth.getSession() inside server code such as middleware. It isn't guaranteed to revalidate the Auth token. It's safe to trust getUser() instead"[^4].


### Why `supabase.auth.getUser()` Is Safer

- **Server-Side Verification:**
`getUser()` makes a network request to the Supabase Auth server, which validates the JWT's authenticity, expiry, and signature. This ensures that the user data you receive is trustworthy and up-to-date[^1][^2][^3][^4].
- **Authorization Checks:**
For any server-side logic that depends on user identity or permissions, always use `getUser()` to prevent unauthorized access or privilege escalation[^3][^4].


### When Is `getSession()` Acceptable?

- **Client-Side Use:**
On the client, where the environment is inherently insecure, `getSession()` can be used for quick access to session data for UI purposes. However, any sensitive actions or server-side checks should always use `getUser()`[^2][^8].
- **Performance Considerations:**
While `getUser()` introduces a network request and some latency, this is the trade-off for security. For non-sensitive, purely client-side features, `getSession()` may be used for speed, but never for authentication or authorization decisions[^9][^2][^8].


### Best Practices

- **On the Server:**
    - Always use `supabase.auth.getUser()` to verify user identity and session authenticity.
    - Never trust user/session data from `getSession()` or `onAuthStateChange()` events for server-side logic[^3][^4][^6].
- **On the Client:**
    - You may use `getSession()` for UI state, but never for security-sensitive operations.
    - For any action that requires trust (e.g., API calls, permission checks), use `getUser()` or have the server perform the check[^2][^3].


### Summary Table

| Method | Security Level | Use Case | Server-Side | Client-Side |
| :-- | :-- | :-- | :-- | :-- |
| `supabase.auth.getSession()` | Low | UI state, non-secure | ❌ | ✔️ |
| `supabase.auth.onAuthStateChange()` | Low | UI state, event handling | ❌ | ✔️ |
| `supabase.auth.getUser()` | High | Auth, authorization | ✔️ | ✔️ |

### References to Official Guidance

- "Never trust supabase.auth.getSession() inside server code such as middleware. It isn't guaranteed to revalidate the Auth token. It's safe to trust getUser() instead"[^4].
- "Should always be used when checking for user authorization on the server. On the client, you can instead use getSession().session.user for faster results. getSession is insecure on the server"[^3].
- "Using supabase.auth.getSession() is potentially insecure as it loads data directly from the storage medium (typically cookies) which may not be authentic. Prefer using supabase.auth.getUser() instead"[^1][^10][^7].

**In summary:**
For any code that must trust the user's identity—especially on the server—always use `supabase.auth.getUser()`. Only use `getSession()` for non-sensitive, client-side scenarios where performance is more important than security.

<div style="text-align: center">⁂</div>

[^1]: https://stackoverflow.com/questions/78518201/how-to-properly-use-supabase-auth-getsession

[^2]: https://www.reddit.com/r/Supabase/comments/1d8vg80/getuser_vs_getsesssion_to_check_if_user_is_signed/

[^3]: https://supabase.com/docs/reference/javascript/auth-getuser

[^4]: https://supabase.com/docs/guides/auth/server-side/nextjs

[^5]: https://github.com/orgs/supabase/discussions/32917

[^6]: https://github.com/supabase/auth-js/issues/910

[^7]: https://www.reddit.com/r/Supabase/comments/1c34myk/what_can_i_understand_from_this_that_supabase_is/

[^8]: https://github.com/orgs/supabase/discussions/4400

[^9]: https://github.com/supabase/auth-js/issues/898

[^10]: https://stackoverflow.com/questions/78297790/using-supabase-auth-getsession-is-potentially-insecure

[^11]: https://www.reddit.com/r/Supabase/comments/1i5a706/supabaseauthgetsession_insecure_warning_on_the/

[^12]: https://supabase.com/docs/reference/javascript/auth-getsession

[^13]: https://supabase.com/docs/reference/javascript/auth-onauthstatechange

[^14]: https://supabase.com/docs/guides/auth/sessions

[^15]: https://docs-gbhowitjv-supabase.vercel.app/docs/reference/javascript/auth-onauthstatechange

[^16]: https://stackoverflow.com/questions/73949121/why-is-supabase-auth-onauthstatechange-spontaneously-trigging-after-about-10-m

[^17]: https://supabase.com/docs/guides/storage/s3/authentication

[^18]: https://github.com/orgs/supabase/discussions/28983

[^19]: https://supabase.com/docs/guides/auth/social-login/auth-google

[^20]: https://supabase.com/docs/guides/auth/quickstarts/react

