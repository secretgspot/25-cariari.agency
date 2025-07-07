/** @type {import('./$types').PageServerLoad} */
export async function load({ url }) {
	const redirectTo = url.searchParams.get('redirectTo');
	return { redirectTo };
}
