<script>
	/** @type {import('./$types').PageData} */
	import { navigating, page } from '$app/state';
	import { base } from '$app/paths';
	import { goto, afterNavigate } from '$app/navigation';
	import LogoSvg from '$lib/LogoSvg.svelte';
	import { Button } from '$lib/buttons';
	import Badge from '$lib/Badge.svelte';
	import Icon from '$lib/Icon.svelte';
	import Ad from '$lib/Ad.svelte';
	import MapStatic from '$lib/map/MapStatic.svelte';
	import { formatter, ago } from '$lib/utils/helpers.js';
	// import JsonDump from '$lib/JSONDump.svelte';

	/** @type {{data: any, supabase: any}} */
	let { data, supabase } = $props();

	let previousPage = $state(base);

	afterNavigate(({ from }) => {
		previousPage = from?.url.pathname == undefined ? '/' : from?.url.pathname;
		// console.log("pathname page: ", from?.url.pathname);
	});

	// $: console.log("previous page: ", previousPage);
</script>

<svelte:head>
	<title>{data.property.msl} - Cariari Agency</title>
</svelte:head>

<!-- <JsonDump name="data" {data} /> -->
{#if !navigating.complete}
	<LogoSvg
		animate={true}
		invert={true}
		kind="gold"
		fixed="fixed"
		onclick={() => goto('/')} />
{/if}

<article>
	<Button size="icon" class="close" onclick={() => goto(previousPage)}>
		{#snippet icon()}
			<svg
				width="24px"
				height="24px"
				stroke-width="1.5"
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				color="currentColor"
				><path
					d="M10.25 4.75l-3.5 3.5 3.5 3.5"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
					stroke-linejoin="round" /><path
					d="M6.75 8.25h6a4 4 0 014 4v7"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
					stroke-linejoin="round" /></svg>
		{/snippet}
	</Button>

	{#if !data.property.is_active}
		<div class="delisted">NOT LISTED</div>
	{/if}

	<header>
		<div>
			<h1>{data.property.msl}</h1>
			<p>
				For {data.property.property_for}: {data.property
					.land_use}{#if data.property.building_style}, {data.property
						.building_style}{/if}{#if data.property.year_built}, built in {data.property
						.year_built}{/if}{#if data.property.lot_size}, on a {data.property.lot_size}m²
					lot{/if}{#if data.property.building_size}, with {data.property.building_size}m²
					of living space{/if}.
				{#if data.property.price}
					Priced at ${data.property.price}.{/if}
			</p>
		</div>
	</header>

	<main>
		<ul
			id="cards"
			style="--numcards:{data.property.photos ? data.property.photos.length : 1}">
			{#if data.property.photos}
				{#each data.property.photos as photo, index}
					<li class="card" id="card_{index + 1}" style="--index: {index + 1}">
						<div class="card__content">
							<figure>
								<img
									src={photo.file_url}
									alt="{data.property.msl} property photo"
									srcset={photo.file_url} />
							</figure>
						</div>
					</li>
				{/each}
			{:else}
				<li class="card" id="card_1">
					<div class="card__content">
						<figure>
							<img
								class="slide-image"
								src="/placeholder/1080x810.png"
								srcset="/placeholder/1080x810.png"
								alt="property"
								loading="eager" />
						</figure>
					</div>
				</li>
			{/if}
		</ul>
	</main>

	<aside class="preview-wrapper">
						<Preview data={data.property} supabase={data.supabase} />
		</aside>

	<footer>
		{#if data.property.contact_realtor}
			<div class="realtor-group">
				<!-- {#if data.property.contact_email}
					<Gravatar
						email={data.property.contact_email}
						type="round"
						size="90"
						base="mp"
					/>
				{/if} -->
				<div>
					<h3>{data.property.contact_realtor}</h3>
					{#if data.property.contact_email}<span
							><Icon type="email" size="18" /><a
								href="mailto:{data.property.contact_email}"
								rel="nofollow">{data.property.contact_email}</a
							></span
						>{/if}
					{#if data.property.contact_phone}<span
							><Icon type="phone" size="18" /><a
								href="tel:{data.property.contact_phone}"
								rel="nofollow">{data.property.contact_phone}</a
							></span
						>{/if}
				</div>
			</div>
		{:else}
			<div class="badge-group">
				{#if data.property.contact_email}<Badge
						type="text"
						label="email"
						value={data.property.contact_email} />{/if}
				{#if data.property.contact_phone}<Badge
						type="text"
						label="call"
						value={data.property.contact_phone} />{/if}
			</div>
		{/if}
	</footer>
</article>

<style>
	:root {
		/* --numcards: 9; */
		--card-height: 45vw;
		--card-margin: 1rem;
		--card-top-offset: 1px;
	}

	.delisted {
		background: var(--warning);
		opacity: 0.6;
		position: fixed;
		left: var(--padding-small);
		top: 100px;
		width: 300px;
		transform: rotate(325deg);
		text-align: center;
		padding: var(--padding-small);
		pointer-events: none;
		z-index: 3;
	}

	h1 {
		font-weight: 300;
		font-size: 3.5em;
	}

	p {
		font-weight: 300;
		line-height: 1.3;
	}

	article {
		background: var(--primary);
		color: var(--primary-content);
		font-size: calc(1em + 0.5vw);
	}
	article :global(.close) {
		top: var(--padding-small);
		right: var(--padding-small);
		position: fixed;
		top: var(--padding-small);
		right: var(--padding-small);
	}

	header,
	main {
		width: 80vw;
		margin: 0 auto;
		text-align: center;
	}

	header {
		height: 90vh;
		display: grid;
		place-items: center;

		p {
			max-width: 63ch;
		}
	}

	footer {
		height: 30vh;
		display: grid;
		place-items: center;

		.realtor-group {
			div {
				display: flex;
				flex-direction: column;
				/* align-items: center; */
				gap: var(--padding-extra-small);
			}

			h3 {
				margin: 0;
			}
			a {
				color: var(--accent);
				text-decoration: none;
				white-space: nowrap;
				vertical-align: top;
				margin-left: 0.3rem;
			}
			:global(svg) {
				color: var(--secondary-content);
			}
		}
	}

	#cards {
		/* Make place at bottom, as items will slide to that position*/
		/* padding-bottom: calc(var(--numcards) * var(--card-top-offset)); */
		/* Don't include the --card-margin in padding, as that will affect the scroll-timeline*/
		/* margin-bottom: var(--card-margin); */

		list-style: none;

		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: repeat(var(--numcards), var(--card-height));
		gap: var(--card-margin);
		margin: 0;
		padding: 0;
	}

	.card {
		position: sticky;
		top: calc(var(--padding-large) * 2);
		/* padding-top: calc(var(--index) * var(--card-top-offset)); */

		.card__content {
			box-shadow: var(--shadow-large);
			border-radius: var(--border-radius);
			overflow: hidden;
			aspect-ratio: 2 / 1;

			display: grid;
			grid-template-areas: 'img';
			grid-template-columns: 1fr;
			grid-template-rows: auto;

			align-items: stretch;

			transform-origin: 50% 0%;
			will-change: transform;

			> figure {
				grid-area: img;
				overflow: hidden;
				margin: 0;
				padding: 0;

				> img {
					width: 100%;
					height: 100%;
					object-fit: cover;
				}
			}
		}
	}

	aside {
		width: 60vw;
		margin: 0 auto;
		text-align: left;

		p {
			margin-bottom: 1em;
		}

		p.description {
			text-align: justify;

			&.nodescription {
				text-align: center;
			}
		}

		.features {
			display: flex;
			justify-content: space-evenly;
			align-content: center;
			flex-wrap: wrap;
			gap: var(--gap-small);
			margin-block: calc(var(--padding-large) * 2);
		}

		p.amenities {
			display: flex;
			justify-content: center;
			align-content: center;
			flex-wrap: wrap;
			margin-block: var(--padding-large);

			span:after {
				content: '•';
				margin-inline: 1rem;
			}

			span:last-child:after {
				content: '';
				margin: 0;
			}
		}

		.commercial-wrapper {
			margin: 0 0 var(--padding-medium) 0;
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.location {
			margin-block: var(--padding-large) 0;
			display: flex;
			align-items: center;
			justify-content: center;
		}
	}
</style>
