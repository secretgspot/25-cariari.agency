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
	// import { Splide, SplideSlide } from "@splidejs/svelte-splide";
	// import "@splidejs/svelte-splide/css";
	// import JsonDump from "$lib/JSONDump.svelte";
	// import { dragable } from "$lib/utils/dragable.js";

	/** @type {{data: any}} */
	let { data } = $props();

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
		on:click={() => goto('/')} />
{/if}

<article>
	<!-- IMAGE PANE -->
	<div class="photos scroller">
		<!-- <Splide
			options={{
				type: "loop",
				drag: "free",
				snap: true,
				rewind: true,
				height: "100%",
			}}
			aria-label="{data.property.msl} photos"
		> -->
		<div class="wrap">
			{#if data.property.photos}
				{#each data.property.photos as photo}
					<!-- <SplideSlide> -->
					<div class="slide" style="background-image: url({photo.file_url});"></div>
					<!-- <img
					class="slide-image"
					src={photo.file_url}
					alt="{data.property.msl} property photo"
					loading="eager"
					intrinsicsize="1920x1080"
				/> -->
					<!-- </SplideSlide> -->
				{/each}
			{:else}
				<!-- <SplideSlide> -->
				<img
					class="slide-image"
					src="/placeholder/1080x810.png"
					alt="property"
					loading="eager" />
				<!-- </SplideSlide> -->
			{/if}
		</div>
		<!-- </Splide> -->
		<!-- <Carousel>
			{#if data.property.photos}
				{#each data.property.photos as photo}
				<img class="slide-content" src="{photo}" alt="property" loading="lazy" />
				{/each}
			{:else}
				<img class="slide-content" src="/images/placeholder/1080x810.png" alt="property" loading="eager" />
			{/if}
		</Carousel> -->
	</div>

	<!-- SIDE PANE -->
	<div class="side">
		<div class="side-wrapper scroller">
			<Button size="icon" class="close" on:click={() => goto(previousPage)}>
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

			<div class="badge-group">
				{#if data.property.year_built}
					<Badge
						type="text"
						label="built"
						value="{new Date(data.property.year_built).getFullYear()} &bull; {ago(
							new Date(data.property.year_built),
						)}" />
				{/if}
				{#if data.property.building_style}
					<Badge type="text" label="style" value={data.property.building_style} />
				{/if}
			</div>

			<div class="price-group">
				{#if data.property.price > 0}
					<Badge
						type="text"
						label="price"
						value={formatter.format(data.property.price)} />
				{/if}
				{#if data.property.rent > 0}
					<Badge type="text" label="rent" value={formatter.format(data.property.rent)} />
				{/if}
				{#if data.property.taxes > 0}
					<Badge
						type="text"
						label="taxes"
						value={formatter.format(data.property.taxes)} />
				{/if}
				{#if data.property.fees > 0}
					<Badge
						type="text"
						label="condo fees"
						value={formatter.format(data.property.fees)} />
				{/if}
			</div>

			{#if data.property.location && data.property.location.lat && data.property.location.lng}
				<div class="map-group">
					<MapStatic position={data.property.location} />
				</div>
			{/if}

			<div class="badge-group">
				{#if data.property.rooms > 0}
					<Badge type="icon" label="rooms" value={data.property.rooms} />
				{/if}
				{#if data.property.beds > 0}
					<Badge type="icon" label="beds" value={data.property.beds} />
				{/if}
				{#if data.property.baths > 0}
					<Badge type="icon" label="baths" value={data.property.baths} />
				{/if}
				{#if data.property.half_baths > 0}
					<Badge type="icon" label="half baths" value={data.property.half_baths} />
				{/if}
				{#if data.property.parking_spaces > 0}
					<Badge type="icon" label="parkings" value={data.property.parking_spaces} />
				{/if}
			</div>

			<div class="badge-group">
				{#if data.property.building_size > 0}
					<Badge type="text" label="building" value="{data.property.building_size}㎡" />
				{/if}
				{#if data.property.lot_size > 0}
					<Badge type="text" label="lot" value="{data.property.lot_size}㎡" />
				{/if}
			</div>

			<div class="commercial-wrapper">
				<Ad width="320" height="100">
					<a href="//25-cariaripintor.vercel.app" target="_blank" rel="noreferrer">
						<img src="/ads/pintarcariari-300x100.jpg" alt="Pintar Cariari" />
					</a>
				</Ad>
			</div>

			{#if data.property.description}
				<div class="description scroller">
					{data.property.description}
				</div>
			{/if}

			{#if data.property.features}
				<div class="features">
					{#each data.property.features as feature}
						<div class="feature">{feature}</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<!-- BASE PANE -->
	<div class="base">
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

		<div class="badge-group">
			{#if data.property.land_use}
				<Badge type="text" label="type" value={data.property.land_use} />
			{/if}
			{#if data.property.property_for}
				<Badge type="text" label="for" loop={true} value={data.property.property_for} />
			{/if}

			<Badge type="text" label="msl" value={data.property.msl} />
		</div>
	</div>
</article>

<style>
	article {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 300px 1fr 1fr;
		grid-template-areas:
			'main'
			'aside'
			'base';
		width: 100vw;
		height: 100vh;
		background: var(--primary);
		color: var(--primary-content);
	}
	article :global(.close) {
		top: var(--padding-small);
		right: var(--padding-small);
		position: sticky;
		align-self: flex-end;
	}

	.delisted {
		background: var(--warning);
		opacity: 0.6;
		pointer-events: none;
		width: 100%;
		padding: var(--padding-small);
		text-align: center;
		position: sticky;
		top: 50%;
		z-index: 3;
	}

	.photos {
		grid-area: main;
		display: grid;
		grid-template-columns: inherit;
		padding-block: var(--padding-extra-small);
		overflow-x: scroll;
		overscroll-behavior-x: contain;
		scroll-snap-type: x proximity;
		scrollbar-width: none;
	}
	/* .photos:before {
		content: "Loading..";
		display: flex;
		align-items: center;
		justify-content: center;
	} */
	.photos .wrap {
		grid-column: 1;
		display: flex;
		gap: var(--gap-extra-small);
	}
	.photos .wrap::after {
		content: '';
		padding-inline-end: calc(var(--gap-small) / 2);
	}
	.slide {
		flex: 1 0 auto;
		display: flex;
		align-items: center;
		justify-content: center;
		scroll-snap-align: center;
		inline-size: 100%;
		/* aspect-ratio: 16 / 1; */
		/* border-radius: var(--border-radius); */
		background-size: cover;
		background-position: center center;
	}

	.slide-image {
		flex: 1;
		background-size: cover;
		background-repeat: no-repeat;
		background-position: center;
		height: 100%;
		width: 100%;
		object-fit: scale-down;
	}

	.side {
		grid-area: aside;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-evenly;
	}
	.side .side-wrapper {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: flex-start;
		padding: var(--padding-small);
	}
	.side .map-group,
	.side .badge-group,
	.side .price-group {
		display: flex;
		justify-content: space-evenly;
		flex-wrap: wrap;
		margin: var(--padding-small) 0;
		width: 100%;
	}

	.side .features {
		padding: var(--padding-medium);
		text-align: center;
		width: 100%;
	}
	.side .feature {
		border: 1px dashed var(--border);
		padding: 0 0.2rem;
		margin: 0.1rem;
		border-radius: 6px;
		display: inline-block;
		color: var(--txt-secondary);
	}

	.side .description {
		padding: 0 var(--padding-medium);
		margin: var(--padding-medium) 0;
		white-space: pre-wrap;
		min-height: min-content;
		text-align: justify;
	}

	.side .commercial-wrapper {
		display: flex;
		justify-content: center;
		flex: 1;
		align-items: center;
		width: 100%;
	}

	.realtor-group {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		margin: var(--padding-small) 0;
	}
	.realtor-group div {
		display: flex;
		flex-direction: column;
		margin: 1rem;
		gap: var(--padding-extra-small);
	}
	.realtor-group h3 {
		margin: 0;
	}
	.realtor-group a {
		color: var(--accent);
		text-decoration: none;
		white-space: nowrap;
		vertical-align: top;
		margin-left: 0.3rem;
	}
	.realtor-group :global(svg) {
		color: var(--secondary-content);
	}

	/* BASE SECTION */
	.base {
		grid-area: base;
		display: grid;
		grid-template-columns: repeat(1, minmax(auto, 1fr));
		grid-gap: 1rem;
		align-items: center;
		padding: 1rem;
	}

	.base .badge-group {
		display: flex;
		justify-content: space-evenly;
		flex-wrap: wrap;
	}

	@media (min-width: 1024px) {
		article {
			grid-template-columns: 60vw 40vw;
			grid-template-rows: minmax(min-content, 60vh) minmax(min-content, auto);
			/* grid-template-rows: minmax(min-content, 30vh) minmax(max-content, 70vh); */
			grid-template-areas:
				'main aside'
				'base aside';
		}
		article :global(.close) {
			top: var(--padding-small);
			position: fixed;
		}
		.side {
			max-height: 100vh;
		}
		.side-wrapper {
			overflow-y: auto;
		}
		.base {
			grid-template-columns: repeat(2, minmax(min-content, auto));
			grid-gap: 3rem;
			padding: 3rem;
		}
	}
	@media (prefers-color-scheme: dark) {
		.photos {
			filter: brightness(var(--brightness));
		}
	}
</style>
