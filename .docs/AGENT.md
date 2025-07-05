Restructure app as required/needed.

must have access to:

- session,
- is_logged_in (gets it from session.user.role ) boolean,
- is_admin (gets it from session.user.app_metadata.claims_admin) boolean
on all pages. they should propagate throughout whole app and easily accessable if and when needed.

only these pages have OTP login component show up if user is not logged in and require user to be logged in to edit or add or access page. otherwise they see Login.svelte component.

- (app)/[id=uuid]/edit
- (app)/properties/add

When user is verified using OTP/Magic Link  and "Verified" message has been shown, session should be refreshed globaly so user has access to either edit or add pages and signout button appears on Nav.svelte.

when site first loads there should be notification in console.log if user is_logged_in or not, if user isAdmin or not.  when user logs in there should be notification in console that user has logged and and session is now available.  when session is detected it should be 👍. when not detected it should be 👎. when singin was successfull and session is now available it should display 🔥 in console.log and when user has signed out it should display 💥

# VERY IMPORTANT

we are using svelte5, sveltekit2, vanilla css with recent nesting features, and  supabase for database. that's it!
