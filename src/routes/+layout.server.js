/** @type {import('./$types').LayoutServerLoad} */
// import { error } from '@sveltejs/kit';

export async function load(event) {
	// console.log('/+layout.server.js event: ', event);
	// const { locals } = event;

	// console.log('/+layout.server.js locals', locals)

	// TODO: 🚩 WHAT CAN BE DONE HERE?

	return {
		session: await event.locals.getSession(),
		// countries: getContries(),
		// currentAdmin: event.locals.currentAdmin,
	};
}