<script>
	import { navigating, page } from '$app/state';
	import { goto } from '$app/navigation';
	import Logo from '$lib/Logo.svelte';
	import Nav from '$lib/Nav.svelte';
	import { LinkButton } from '$lib/buttons';
</script>

<svelte:head>
	<title>About Cariari Agency</title>
</svelte:head>

{#if !navigating.complete}
	<Logo type="regular" color="bw" fixed="fixed" onclick={() => goto('/')} />
	<Nav />
{/if}

<article>
	<svg
		id="6b66d06a-0e99-4d41-8dee-a8b7e8edeb4f"
		data-name="Layer 1"
		xmlns="http://www.w3.org/2000/svg"
		xmlns:xlink="http://www.w3.org/1999/xlink"
		viewBox="0 0 222 222"
		><defs
			><linearGradient
				id="c30d6575-5b9d-416f-aa0d-21f1cdd41e1c"
				x1="8.9"
				y1="111"
				x2="212.51"
				y2="111"
				gradientUnits="userSpaceOnUse"
				><stop offset="0" stop-color="#c49a2f" /><stop
					offset="0.12"
					stop-color="#b1872d" /><stop offset="0.31" stop-color="#faf394" /><stop
					offset="0.41"
					stop-color="#e5d06d" /><stop offset="0.56" stop-color="#c49a2f" /><stop
					offset="0.59"
					stop-color="#ceaa41" /><stop offset="0.65" stop-color="#e1ca65" /><stop
					offset="0.7"
					stop-color="#efe07f" /><stop offset="0.75" stop-color="#f7ee8f" /><stop
					offset="0.79"
					stop-color="#faf394" /><stop offset="0.88" stop-color="#b1872d" /><stop
					offset="1"
					stop-color="#c49a2f" /></linearGradient
			><linearGradient
				id="5e3e7936-ae2d-4705-8535-b52783b61bfa"
				x1="64.68"
				y1="111"
				x2="157.32"
				y2="111"
				xlink:href="#c30d6575-5b9d-416f-aa0d-21f1cdd41e1c" /><linearGradient
				id="e6eb33a4-f63b-41cf-87cc-12598e951e9d"
				x1="41.94"
				y1="62.67"
				x2="85.41"
				y2="62.67"
				xlink:href="#c30d6575-5b9d-416f-aa0d-21f1cdd41e1c" /><linearGradient
				id="19df4e30-fcc3-49a8-8d9e-97affa45bf6b"
				x1="136.21"
				y1="62.67"
				x2="179.68"
				y2="62.67"
				xlink:href="#c30d6575-5b9d-416f-aa0d-21f1cdd41e1c" /><linearGradient
				id="48a8a8b5-733e-4dde-ba48-9fd9da52eb99"
				x1="41.94"
				y1="159.48"
				x2="85.41"
				y2="159.48"
				xlink:href="#c30d6575-5b9d-416f-aa0d-21f1cdd41e1c" /><linearGradient
				id="113ae0a3-006f-4b6b-aabf-4f44714f307e"
				x1="136.21"
				y1="159.48"
				x2="179.68"
				y2="159.48"
				xlink:href="#c30d6575-5b9d-416f-aa0d-21f1cdd41e1c" /><linearGradient
				id="01b8f8e9-5fc5-4bbb-8200-e20fd3f4c123"
				x1="20.5"
				y1="111"
				x2="51.1"
				y2="111"
				xlink:href="#c30d6575-5b9d-416f-aa0d-21f1cdd41e1c" /><linearGradient
				id="2a24f39a-5a6e-4459-a0d3-c0b2b9a7b573"
				x1="171.7"
				y1="111"
				x2="202.3"
				y2="111"
				xlink:href="#c30d6575-5b9d-416f-aa0d-21f1cdd41e1c" /><linearGradient
				id="f7d27643-be75-46ab-bb08-b113560f6a6e"
				x1="82.15"
				y1="111"
				x2="139.47"
				y2="111"
				gradientUnits="userSpaceOnUse"
				><stop offset="0" stop-color="#c49a2f" /><stop
					offset="0.12"
					stop-color="#b1872d" /><stop offset="0.3" stop-color="#faf394" /><stop
					offset="0.38"
					stop-color="#e5d06d" /><stop offset="0.5" stop-color="#c49a2f" /><stop
					offset="0.52"
					stop-color="#ceaa41" /><stop offset="0.57" stop-color="#e1ca65" /><stop
					offset="0.62"
					stop-color="#efe07f" /><stop offset="0.67" stop-color="#f7ee8f" /><stop
					offset="0.7"
					stop-color="#faf394" /><stop offset="0.88" stop-color="#b1872d" /><stop
					offset="1"
					stop-color="#c49a2f" /></linearGradient
			><linearGradient
				id="661089a7-79c6-4340-ae4b-43dc203b504d"
				x1="81.17"
				y1="111"
				x2="140.45"
				y2="111"
				xlink:href="#f7d27643-be75-46ab-bb08-b113560f6a6e" /></defs
		><title>logo_full_gold</title><path
			d="M166.89,125.8,165,122.48l-.15.09a25.32,25.32,0,0,0,2.07,3.23l4.41,7.64,18.32,31.73-42.69,24.64-21-36.28a45.42,45.42,0,0,1-30.35,0L74.69,189.81,32,165.17l18.27-31.64,5.54-9.6a24.57,24.57,0,1,1,0-25.86l.79,1.37c-.25-.47-.51-.92-.79-1.37l-5.54-9.6L32,56.83l42.7-24.64L95.63,68.47a45.42,45.42,0,0,1,30.35,0l21-36.28,42.69,24.64L171.3,88.56l-4.41,7.64a25.32,25.32,0,0,0-2.07,3.23l.15.09,1.92-3.32a24.56,24.56,0,1,1,19.59,39.36,24.46,24.46,0,0,1-13.76-4.22A24.74,24.74,0,0,1,166.89,125.8Z"
			transform="translate(0.29)"
			style="fill:none;stroke-width:2.940612588677318px;stroke:url(#c30d6575-5b9d-416f-aa0d-21f1cdd41e1c)" /><circle
			cx="111"
			cy="111"
			r="44.85"
			style="fill:none;stroke-width:2.940612588677318px;stroke:url(#5e3e7936-ae2d-4705-8535-b52783b61bfa)" /><path
			d="M221.7,111A111,111,0,1,1,110.7,0,111,111,0,0,1,221.7,111Z"
			transform="translate(0.29)"
			style="fill:none" /><path
			d="M69,42.72,83.62,68l-25.3,14.6-14.6-25.3L69,42.72m.47-1.79-1.13.66L43.07,56.19l-1.13.66L42.59,58l14.6,25.29.66,1.14L59,83.75l25.29-14.6,1.14-.66-.66-1.13L70.15,42.07l-.66-1.14Z"
			transform="translate(0.29)"
			style="fill:url(#e6eb33a4-f63b-41cf-87cc-12598e951e9d)" /><path
			d="M152.6,42.72l25.29,14.6-14.6,25.3L138,68l14.61-25.3m-.48-1.79-.66,1.14-14.6,25.29-.65,1.13,1.13.66,25.29,14.6,1.14.66.65-1.14L179,58l.66-1.13-1.14-.66-25.29-14.6-1.13-.66Z"
			transform="translate(0.29)"
			style="fill:url(#19df4e30-fcc3-49a8-8d9e-97affa45bf6b)" /><path
			d="M58.32,139.53l25.3,14.61L69,179.43l-25.3-14.6,14.6-25.3m-.47-1.78-.66,1.13-14.6,25.29-.65,1.13,1.13.66,25.29,14.6,1.13.66.66-1.14,14.6-25.29.66-1.13L84.27,153,59,138.4l-1.13-.65Z"
			transform="translate(0.29)"
			style="fill:url(#48a8a8b5-733e-4dde-ba48-9fd9da52eb99)" /><path
			d="M163.29,139.53l14.6,25.3-25.29,14.6L138,154.14l25.3-14.61m.48-1.78-1.14.65L137.34,153l-1.13.66.65,1.13,14.6,25.29.66,1.14,1.13-.66L178.54,166l1.14-.66-.66-1.13-14.6-25.29-.65-1.13Z"
			transform="translate(0.29)"
			style="fill:url(#113ae0a3-006f-4b6b-aabf-4f44714f307e)" /><circle
			cx="35.8"
			cy="111"
			r="14.65"
			style="fill:none;stroke-width:1.3071200847625732px;stroke:url(#01b8f8e9-5fc5-4bbb-8200-e20fd3f4c123)" /><circle
			cx="187"
			cy="111"
			r="14.65"
			style="fill:none;stroke-width:1.3071200847625732px;stroke:url(#2a24f39a-5a6e-4459-a0d3-c0b2b9a7b573)" /><path
			d="M139.27,134.3,136,138.66a1.37,1.37,0,0,1-1.18.5c-5.25-.37-13.69-3.76-13.69-3.76L113,132.72a18.1,18.1,0,0,1-1.76-.73,1.4,1.4,0,0,0-.4-.11,1.32,1.32,0,0,0-.4.11c-.58.26-1.16.53-1.76.73l-8.17,2.68s-8.43,3.39-13.68,3.76a1.39,1.39,0,0,1-1.19-.5l-3.26-4.36a1.06,1.06,0,0,1,.87-1.66c3.21-.44,6.24-1.14,7.44-2.39l13-13.5a1,1,0,0,0,.15-1.2c0-.06-.1-.12-.15-.18L91,102.08c-1.18-1.24-4.39-2-7.52-2.36a1.07,1.07,0,0,1-.89-1.67l3.26-4.38a1.34,1.34,0,0,1,1.17-.5l21.13,7.41a2.68,2.68,0,0,1,0-.4V99.07a2.69,2.69,0,0,0-1.23-2.26L97,90.34c-1.41-.85-2.12-2.71-2.47-4.57a2.28,2.28,0,0,1,1.27-2.48l.53-.24a2.27,2.27,0,0,1,3.08,1.29,6.69,6.69,0,0,0,.35.76,2.27,2.27,0,0,0,1.58,1.11l8.76,1.58a2.7,2.7,0,0,0,.49,0h.52a2.42,2.42,0,0,0,.47,0l8.78-1.58a2.25,2.25,0,0,0,1.57-1.11,5.31,5.31,0,0,0,.35-.76,2.27,2.27,0,0,1,3.08-1.29l.53.24a2.28,2.28,0,0,1,1.27,2.48c-.34,1.86-1.06,3.72-2.46,4.57l-9.94,6.47a2.71,2.71,0,0,0-1.22,2.26v1.11a2.69,2.69,0,0,1,0,.4l21.13-7.41a1.34,1.34,0,0,1,1.17.5L139,98.05a1.07,1.07,0,0,1-.88,1.67c-3.14.39-6.34,1.12-7.52,2.36L118,115.37a1.1,1.1,0,0,0-.14.18,1,1,0,0,0,.15,1.2l13,13.5c1.19,1.25,4.22,1.95,7.43,2.39A1.07,1.07,0,0,1,139.27,134.3Z"
			transform="translate(0.29)"
			style="stroke-linecap:round;stroke-linejoin:round;stroke-width:1.9604084478468395px;fill:url(#f7d27643-be75-46ab-bb08-b113560f6a6e);stroke:url(#661089a7-79c6-4340-ae4b-43dc203b504d)" /></svg>
	<h1>Property listings for the greater Area of The Real Cariari.</h1>

	<p>Hello Visitor,</p>

	<p>
		This is a free service application for general Cariari area of La Assunction, Heredia. <br />If
		you would like to add your property on here, add it thru <LinkButton
			href="/add"
			title="Add you property">Add</LinkButton> or the link with same name at the top on the
		main page. With your confirmed email you'll be able to modify it at any time or delist
		from the app.
	</p>

	<p>
		If you have questions regarding advertising, contact at <LinkButton
			href="mailto:secretgspot@gmail.com?subject=I%20would%20like%20to%20advertise%20on%20cariari.agency"
			title="Add you property">me</LinkButton> by email.
	</p>

	<blockquote>
		<i>— Cariari.Agency</i>
	</blockquote>

	<figure>
		<!-- <figcaption>Waving hello</figcaption> -->
		<svg
			xmlns="http://www.w3.org/2000/svg"
			xml:space="preserve"
			fill-rule="evenodd"
			stroke-linejoin="round"
			stroke-miterlimit="2"
			clip-rule="evenodd"
			viewBox="0 0 909 530"
			><circle
				cx="248.2"
				cy="402.1"
				r="44.7"
				fill="var(--success)"
				transform="translate(0 -.1)" /><path
				fill-opacity=".2"
				fill-rule="nonzero"
				d="M215.2 372.2a44.7 44.7 0 0 0 74.4 47.3 44.8 44.8 0 1 1-74.4-47.3Z" /><path
				fill="var(--primary-focus)"
				fill-rule="nonzero"
				d="M248.3 402h.1l2.2 126.7H246l2.3-126.7Z" /><circle
				cx="157.8"
				cy="273.4"
				r="90.1"
				fill="var(--success)"
				transform="translate(0 -.1)" /><path
				fill-opacity=".2"
				fill-rule="nonzero"
				d="M91.3 213.2a90 90 0 0 0 150 95.3 90.2 90.2 0 0 1-83 55 90.1 90.1 0 0 1-67-150.3Z" /><path
				fill="var(--primary-focus)"
				fill-rule="nonzero"
				d="M158 273.3h.3l4.4 255.4h-9.4l4.7-255.4Z" /><path
				fill="var(--secondary-focus)"
				fill-rule="nonzero"
				d="M338.8 396.5h412.9v122.4H338.8z" /><path
				fill="var(--secondary)"
				fill-rule="nonzero"
				d="M521.2 421.8h48.1v97h-48.1z" /><path
				fill="var(--secondary-focus)"
				fill-rule="nonzero"
				d="M362.9 252h364.8v112.7H362.9z" /><path
				fill="var(--primary-focus)"
				fill-rule="nonzero"
				d="M764.7 259H326a3.7 3.7 0 0 1-2.5-6.3l119.9-115.3V87.2c0-2 1.6-3.6 3.6-3.6h23.7c2 0 3.6 1.6 3.7 3.6v20.4l9-8.7A81.7 81.7 0 0 1 594.2 97l173 155.5a3.7 3.7 0 0 1-2.5 6.4Z" /><path
				fill="var(--accent)"
				fill-rule="nonzero"
				d="M459.2 280.6a23.4 23.4 0 0 1 23.2 23.3v31.4H436v-31.4a23.4 23.4 0 0 1 23.3-23.3h-.1Zm86.1.4a23.4 23.4 0 0 1 23.2 23.3v31.4H522v-31.4a23.4 23.4 0 0 1 23.3-23.3Zm86.1.5a23.4 23.4 0 0 1 23.2 23.2V336h-46.5v-31.4a23.4 23.4 0 0 1 23.3-23.2Zm34.2 139h.1A23.4 23.4 0 0 1 689 444v31.4h-46.5V444a23.4 23.4 0 0 1 23.2-23.3h-.1Zm-230.1 0a23.4 23.4 0 0 1 23.3 23.4v31.4h-46.5v-31.4a23.4 23.4 0 0 1 23.2-23.3Z" /><path
				fill="var(--primary-focus)"
				fill-rule="nonzero"
				d="m812 398.4-77.4-34.2a3 3 0 0 0-1.3-.3H364c-.4 0-.8 0-1.2.2l-84.3 34.3a3.3 3.3 0 0 0 1.2 6.3h21.9v112.6h-2.5v11.4h492.1v-11.4h-4V404.7h23.4a3.3 3.3 0 0 0 1.4-6.3Zm-31.3 118.9H308.2V404.7h472.5v112.6ZM428.6 330.8h59.6v9.8h-59.6v-9.8Zm87.3 0h59.6v9.8h-59.6v-9.8Zm87.3 0h59.6v9.8h-59.6v-9.8Z" /><path
				fill="var(--primary-focus)"
				fill-rule="nonzero"
				d="M635.9 472h59.6v9.8h-59.6V472Zm-231 0h59.6v9.8h-59.6V472Z" /><path
				fill="var(--primary-focus)"
				fill-rule="nonzero"
				d="M908 529.2H1a1 1 0 0 1-1-1c0-.6.5-1 1-1h907c.5 0 1 .4 1 1 0 .5-.5 1-1 1Zm-240-84.3-.3-3.5c-.4-1.4-3.8 3-4.2 3-1-.3-2.2-.3-3.3-.1.1-6.3-.8-3.5-3.7-.6-9 4.6-5.7 19 4.6 19.2 9.4.5 14.1-12.3 6.9-18Z" /><path
				fill="var(--primary-focus)"
				fill-rule="nonzero"
				d="M669.3 459c3.7 0 8.5 13.3-.5 13.3-4.6 0-12.7 1-12.7 1s-6.4-9.5-3.5-15.5l16.7 1.3Z" /><path
				fill="var(--primary-focus)"
				fill-rule="nonzero"
				d="M671.9 472.5c0 1.2-5.3 1.2-5.2 0-.1-1.1 5.3-1.1 5.2 0Z" /><path
				fill="var(--primary)"
				fill-rule="nonzero"
				d="M668 471.8c-.3 0-1.4-5.1 1.8-6-3.1 1.8-1.5 5.7-1.8 6Zm4.4-1.2h-.4.4Zm13.6-4c-1.9-2.6-5.4-1.4-6.8 1-1.7 3-8.7.9-7.8 4.9 4.4-1 17.4 2.3 14.6-5.8Zm-25.4-4.7c-3 .6-8-3-8.1-4a.1.1 0 0 1 .1-.2h.1c1 1.4 2.3 2.5 3.9 3.2 2.4 1.3 6.9 1.3 12.8-1.8a15.8 15.8 0 0 1-8.8 2.9v-.1Zm.5-6.3c-.6.3-1.2-1.3-.6-.8 0 .3.3.6.6.6.6 0 .5-.5.8-.7.4.3-.3 1-.8 1v-.1Zm-1.1 16.9c-.3 0-2-6.2-2.2-6.3l.1-.1c.3-.2 2 6.2 2.2 6.3a.1.1 0 0 1-.1.1h-.1.1Zm1 .8c0 1-5.4 1-5.3 0 0-1.1 5.3-1.1 5.2 0h.1Z" /><path
				fill="var(--primary-content)"
				fill-rule="nonzero"
				d="M662.2 453.2c0 .5-2 .5-2 0s2-.5 2 0Zm-7.7 0a3 3 0 0 1 4.6 0c3.3-3-1.5-8-4.6-4.8a3.4 3.4 0 0 0 0 4.8Zm9.1 0a3 3 0 0 1 4.7 0c3.2-3-1.6-8-4.7-4.8a3.4 3.4 0 0 0 0 4.8Z" /><path
				fill="var(--primary)"
				fill-rule="nonzero"
				d="M655.3 449.9c.7 0 1.2.5 1.2 1.2 0 .6-.5 1.2-1.2 1.2a1.2 1.2 0 0 1 0-2.3v-.1Zm9.2 0c.7 0 1.2.5 1.2 1.2 0 .6-.5 1.2-1.2 1.2a1.2 1.2 0 0 1 0-2.3v-.1Z" /><path
				fill="var(--error)"
				fill-rule="nonzero"
				d="M666 453.7c.5 0 1 .4 1 1 0 .5-.5 1-1 1a1 1 0 0 1-1-1c0-.6.5-1 1-1Zm-9.2 0c.5 0 1 .4 1 1 0 .5-.5 1-1 1a1 1 0 0 1-1-1c0-.6.5-1 1-1Z" /><path
				fill="var(--accent)"
				fill-rule="nonzero"
				d="M364.7 58a1 1 0 0 1-1-1 36.1 36.1 0 0 0-35.8-33c-1.1 0-2.2 0-3.4.2a1 1 0 0 1-1-.5 42.8 42.8 0 0 0-78.2 9.3 1 1 0 0 1-1 .7h-.7c-14.1 0-26.4 10-29.4 23.8a1 1 0 0 1-1 .8H145a1 1 0 0 1-1-1c0-.6.5-1 1-1h67.4a32.3 32.3 0 0 1 31.2-24.6 44.9 44.9 0 0 1 81.3-9.6l3-.1a38.2 38.2 0 0 1 37.8 35c0 .6-.4 1-1 1v.2Zm-12.1 13.2h-167a1 1 0 0 1-1-1c0-.6.5-1 1-1h167c.5 0 1 .4 1 1 0 .5-.5 1-1 1ZM226.3 85.9h-56a1 1 0 0 1-1-1c0-.6.5-1 1-1h56c.5 0 1 .4 1 1 0 .5-.5 1-1 1ZM899.7 134a1 1 0 0 1-1-1 36.1 36.1 0 0 0-35.8-33.3c-1.1 0-2.2 0-3.4.2a1 1 0 0 1-1-.5 42.8 42.8 0 0 0-78.2 9.3 1 1 0 0 1-1 .7h-.7c-14.1 0-26.4 10-29.4 23.8a1 1 0 0 1-1 .8H680a1 1 0 0 1-1-1c0-.6.5-1 1-1h67.4a32.3 32.3 0 0 1 31.2-24.6 44.9 44.9 0 0 1 81.3-9.6l3-.1a38.2 38.2 0 0 1 37.8 35.3c0 .5-.4 1-1 1Zm-12.1 13h-167a1 1 0 0 1-1-1c0-.5.5-1 1-1h167c.5 0 1 .5 1 1 0 .6-.5 1-1 1Zm-126.3 15h-56a1 1 0 0 1-1-1c0-.6.5-1 1-1h56c.5 0 1 .4 1 1 0 .5-.5 1-1 1Z" /><path
				fill="var(--success)"
				fill-rule="nonzero"
				d="M179.5 511.3c13 3.7 13-14.6 15.1-22.8-7.3 5-19.6 12-15 22.5" /><path
				fill="var(--primary-focus)"
				fill-rule="nonzero"
				d="M180.2 525.4c-1.7-9.6-1.8-21.7 7.6-27.4.5-.3.9.4.4.7-9 5.5-8.8 17.2-7.2 26.5 0 .3-.2.5-.4.5a.4.4 0 0 1-.4-.3Z" /><path
				fill="var(--success)"
				fill-rule="nonzero"
				d="M184.4 518.6c5.9 8 14.1-2.7 19-6.6-6.5-.3-16.9-1.6-18.9 6.5" /><path
				fill="var(--primary-focus)"
				fill-rule="nonzero"
				d="M178.6 527.9c3.3-6.5 8.6-13.7 16.8-12.8.5 0 .4.9-.2.8-7.7-.8-12.7 6.2-15.9 12.3-.2.4-1 0-.7-.4Z" /><path
				fill="var(--success)"
				fill-rule="nonzero"
				d="M835.3 511.3c-13 3.7-13-14.6-15.1-22.8 7.2 5 19.5 12 15 22.5" /><path
				fill="var(--primary-focus)"
				fill-rule="nonzero"
				d="M834.6 525.4c1.6-9.6 1.8-21.7-7.7-27.4-.4-.3-.8.4-.4.7 9.1 5.5 8.8 17.2 7.3 26.5 0 .3.2.5.4.5s.4-.2.4-.3Z" /><path
				fill="var(--success)"
				fill-rule="nonzero"
				d="M830.4 518.6c-6 8-14.2-2.7-19-6.6 6.5-.3 16.8-1.6 18.8 6.5" /><path
				fill="var(--primary-focus)"
				fill-rule="nonzero"
				d="M836.2 527.9c-3.3-6.5-8.7-13.7-16.8-12.8-.5 0-.4.9.1.8 7.7-.8 12.8 6.2 16 12.3.2.4 1 0 .7-.4Z" /><path
				fill="var(--success)"
				fill-rule="nonzero"
				d="M889.5 498.5c-22.5 6.5-22.7-25.3-26.3-39.6 12.7 8.6 34.1 21 26.3 39.2" /><path
				fill="var(--primary-focus)"
				fill-rule="nonzero"
				d="M888.3 523.2c3-16.7 3.1-38-13.3-47.8-.7-.5-1.5.8-.7 1.3 15.8 9.5 15.4 30 12.6 46v.3c0 .4.3.7.7.7.3 0 .6-.2.7-.5Z" /><path
				fill="var(--success)"
				fill-rule="nonzero"
				d="M881 511.4c-10.3 13.8-24.6-4.7-33.1-11.5 11.3-.6 29.4-3 32.9 11.3" /><path
				fill="var(--primary-focus)"
				fill-rule="nonzero"
				d="M891.2 527.4c-5.9-11.1-15.2-23.7-29.3-22.1-1 0-.7 1.5.2 1.4 13.5-1.4 22.2 10.7 27.7 21.3.5.8 1.8.2 1.4-.6Z" /></svg>
	</figure>
</article>

<style>
	article {
		display: grid;
		max-width: 930px;
		margin: var(--padding-large) auto;
		row-gap: var(--gap-medium);
		grid-template-columns: 1fr 3fr 1fr;
	}
	article > * {
		grid-column: 2 / -2;
	}
	h1 {
		font-family: 'Gabriola', Times, serif;
		font-size: 2.1rem;
		text-align: justify;
	}
	p {
		font-size: 1.2rem;
		line-height: 1.8;
		font-family: cursive;
		text-align: justify;
	}

	svg {
		filter: brightness(var(--brightness));
	}

	figure {
		margin: 0;
		grid-column: 1 / -1;
	}
	/* figcaption {
		font-size: 10px;
		font-style: italic;
	} */

	blockquote {
		font-size: 1.5rem;
		text-align: center;
		font-style: italic;
		grid-column: 1 / -1;
	}
</style>
