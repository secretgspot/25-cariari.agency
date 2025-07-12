<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" class="logo" width="120"/>

## Handling Passwordless Login Flows in SvelteKit with Supabase

You can achieve the login experience you described—where both new and existing users are smoothly handled with a token-based login—using Supabase's OTP (One-Time Password) flow, but with some refinements to enhance control and user experience.

### Desired Flow Recap

1. **Existing User:**
    - User clicks "Edit" (not logged in).
    - App shows email input for token request.
    - After entering email, user sees a "waiting for token" screen.
    - User enters token from email; app redirects back to "Edit" page, now authenticated.
2. **New User:**
    - Same as above, but Supabase creates the user automatically (email is verified by token input, bypassing the extra email confirmation step).

### Best Practices \& Recommendations

#### 1. Use OTP (Code-Based) Login Instead of Magic Links

- Supabase's `signInWithOtp` can be configured to send a code (OTP) instead of a magic link.
- This supports a **two-step flow**:
a. User requests a code.
b. User enters the code in your app (no need to click an email link).
- This method works identically for new and existing users:
    - If the email doesn't exist, Supabase creates the user and treats the code entry as verification.
    - If the email exists, the code is sent for login.


#### 2. Implement a Two-Step UI

- **Step 1:** Email input form to request token.
- **Step 2:** Token input form (displayed after requesting token).
- After successful verification, redirect to the original page (e.g., the edit page).


#### 3. Bypass Additional Email Verification

- With the OTP method, entering the correct code **verifies the email** and logs in the user in one step, for both new and existing users[^1][^2].
- No separate "verify your email" step is needed.


#### 4. Redirect Handling

- Store the intended redirect path (e.g., `/edit/123`) in local storage or in a query parameter.
- After successful login, redirect the user back to the originally requested page.


#### 5. Example Flow with Supabase

- **Request OTP:**

```js
const { error } = await supabase.auth.signInWithOtp({
  email,
  options: { shouldCreateUser: true } // default is true
});
```

- **Verify OTP:**

```js
const { data, error } = await supabase.auth.verifyOtp({
  email,
  token, // The code the user enters
  type: 'email'
});
```

- On success, the user is authenticated and can be redirected.


#### 6. UX Improvements

- Display clear instructions and error messages.
- Consider adding a "resend code" option with a cooldown.
- For best security and usability, codes should expire after a short period (Supabase defaults to 1 hour for magic links, but you can customize)[^1].


### Summary Table

| Step | Existing User | New User | Notes |
| :-- | :-- | :-- | :-- |
| Enter email | ✅ | ✅ | Both see the same UI |
| Receive OTP code | ✅ | ✅ | Supabase sends code to email |
| Enter code in app | ✅ | ✅ | Code verifies and logs in user |
| Redirect to edit | ✅ | ✅ | Use stored redirect path |
| Email verification | Automatic (via OTP) | Automatic (via OTP) | No extra step needed |

### References

- Supabase Docs: [Passwordless email logins](https://supabase.com/docs/guides/auth/auth-email-passwordless)[^1]
- Supabase Docs: [signInWithOtp](https://supabase.com/docs/reference/javascript/auth-signinwithotp)[^2]

**In short:**
Switching to a code-based OTP flow with Supabase gives you a unified, frictionless experience for both new and existing users, matching your requirements exactly. This approach is robust, user-friendly, and avoids the inconsistencies of magic link redirects.

<div style="text-align: center">⁂</div>

[^1]: https://supabase.com/docs/guides/auth/auth-email-passwordless

[^2]: https://supabase.com/docs/reference/javascript/auth-signinwithotp

[^3]: https://supertokens.com/blog/a-guide-to-implementing-passwordless-login

[^4]: https://www.descope.com/learn/post/passwordless-authentication

[^5]: https://www.authsignal.com/blog/articles/the-best-passwordless-authentication-tools-a-guide-to-passwordless-authentication-flows

[^6]: https://learn.microsoft.com/en-us/entra/identity/authentication/concept-authentication-passwordless

[^7]: https://www.iansresearch.com/resources/all-blogs/post/security-blog/2022/01/11/password-less-authentication-a-step-by-step-guide

[^8]: https://dev.to/dabit3/magic-link-authentication-and-route-controls-with-supabase-and-next-js-leo

[^9]: https://drapcode.com/video-tutorial/login-and-signup-flow-in-supabase

[^10]: http://docs.pingidentity.com/solution-guides/best_practice_guides/bp_journey_to_passwordless.html

[^11]: https://github.com/orgs/supabase/discussions/5827

[^12]: https://www.reddit.com/r/Supabase/comments/16cj0ks/users_complaining_about_magic_link_issues/

[^13]: https://github.com/orgs/supabase/discussions/36334

[^14]: https://auth0.com/docs/authenticate/passwordless

[^15]: https://supabase.com/docs/guides/auth/social-login/auth-google

[^16]: https://supabase.com/docs/guides/auth/auth-identity-linking

[^17]: https://www.memcyco.com/how-does-passwordless-authentication-work/

[^18]: https://supabase.com/docs/guides/auth/phone-login?showSmsProvider=Twilio

[^19]: https://supabase.com/docs/guides/auth/passwords

[^20]: https://supabase.com/docs/guides/auth

