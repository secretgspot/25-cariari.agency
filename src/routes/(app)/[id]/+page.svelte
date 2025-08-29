<script>
	/** @type {import('./$types').PageData} */
	import { navigating, page } from '$app/state';
	import { goto, afterNavigate } from '$app/navigation';
	import LogoSvg from '$lib/LogoSvg.svelte';
	import Badge from '$lib/Badge.svelte';
	import Icon from '$lib/Icon.svelte';
	import Ad from '$lib/Ad.svelte';
	import MapStatic from '$lib/map/MapStatic.svelte'; // MapStaticLibre
	import { formatter } from '$lib/utils/formatters.js';
	import { ago } from '$lib/utils/time.js';
	import Nav from '$lib/Nav.svelte';
	// import JsonDump from '$lib/JSONDump.svelte';

	/** @type {{data: any}} */
	let { data } = $props();
	// console.log('(app)/[id=uuid]/+page.svelte data:', data);
</script>

<svelte:head>
	<title>{data.property.msl} - Cariari Agency</title>
	<meta
		name="description"
		content={data.property.description ||
			`View details for property MSL ${data.property.msl} in Cariari, Costa Rica.${data.property.property_for ? ` This property is for ${data.property.property_for.join(', ')}.` : ''}${data.property.beds ? ` It features ${data.property.beds} bedrooms.` : ''}${data.property.baths ? ` ${data.property.baths} bathrooms.` : ''}${data.property.lot_size ? ` ${data.property.lot_size}m² lot size.` : ''}`} />
</svelte:head>

<!-- <JsonDump name="data" {data} /> -->
{#if !navigating.complete}
	<LogoSvg animate={true} invert={true} kind="gold" fixed onclick={() => goto('/')} />
	<Nav fixed />
{/if}

<article>
	<header>
		<div>
			<h1 class:delisted={!data.property.is_active}>
				{data.property.msl}
			</h1>
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
			{#if data.property.photos && data.property.photos.length > 0}
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
								alt="Placeholder image for {data.property.msl}"
								loading="eager" />
						</figure>
					</div>
				</li>
			{/if}
		</ul>
	</main>

	<aside>
		<div class="features">
			<Badge type="text" label="msl" value={data.property.msl} />

			{#if data.property.land_use}
				<Badge type="text" label="type" value={data.property.land_use} />
			{/if}

			{#if data.property.property_for}
				<Badge type="text" label="for" loop={true} value={data.property.property_for} />
			{/if}

			{#if data.property.building_size > 0}
				<Badge type="text" label="building" value="{data.property.building_size}㎡" />
			{/if}
			{#if data.property.lot_size > 0}
				<Badge type="text" label="lot" value="{data.property.lot_size}㎡" />
			{/if}

			{#if data.property.year_built}
				<Badge
					type="text"
					label="built"
					value="{data.property.year_built} &bull; {ago(data.property.year_built)}" />
			{/if}
			{#if data.property.building_style}
				<Badge type="text" label="style" value={data.property.building_style} />
			{/if}

			{#if data.property.price > 0}
				<Badge type="text" label="price" value={formatter.format(data.property.price)} />
			{/if}
			{#if data.property.rent > 0}
				<Badge type="text" label="rent" value={formatter.format(data.property.rent)} />
			{/if}
			{#if data.property.taxes > 0}
				<Badge type="text" label="taxes" value={formatter.format(data.property.taxes)} />
			{/if}
			{#if data.property.fees > 0}
				<Badge type="text" label="fees" value={formatter.format(data.property.fees)} />
			{/if}

			<div class="grouped">
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
		</div>

		<p class="description" class:nodescription={!data.property.description}>
			{data.property.description || 'No description available.'}
		</p>

		{#if data.property.features}
			<p class="amenities">
				{#each data.property.features as feature}
					<span class="amenity">{feature}</span>
				{/each}
			</p>
		{/if}

		{#if data.property.location && data.property.location.lat && data.property.location.lng}
			<div class="location">
				<MapStatic position={data.property.location} />
			</div>
		{/if}
	</aside>

	<footer>
		<div class="realtor-group">
			{#if data.property.contact_realtor}
				<h3>{data.property.contact_realtor}</h3>
			{/if}
			{#if data.property.contact_email}<span
					><Icon type="email" size="18" /><a
						href="mailto:{data.property.contact_email}"
						rel="nofollow">{data.property.contact_email}</a
					></span
				>{/if}
			{#if data.property.contact_phone}
				<span>
					<Icon type="phone" size="18" />
					<a href="tel:{data.property.contact_phone}" rel="nofollow"
						>{data.property.contact_phone}</a>
				</span>
			{/if}
		</div>
	</footer>
	<div class="commercial-wrapper">
		<Ad />
	</div>
</article>

<style>
	:root {
		/* --numcards: 9; */
		--card-height: 45vw;
		--card-margin: 1rem;
		--card-top-offset: 1px;
	}

	article {
		background: var(--surface-1);
		color: var(--text-1);
		font-size: calc(1em + 0.5vw);

		p {
			font-weight: 300;
			line-height: 1.3;
		}
	}

	header,
	main {
		width: 90vw;
		margin: 0 auto;
		text-align: center;

		/* Small tablets and larger mobile devices (481px - 768px) */
		@media (min-width: 481px) {
			width: 80vw;
		}
	}

	header {
		height: 80vh;
		display: grid;
		place-items: center;

		h1 {
			position: relative;
			font-weight: 300;
			font-size: 3.5em;

			&.delisted::after {
				content: 'DELISTED';
				font-size: 1rem;
				background: var(--warning);
				color: var(--warning-content);
				border-radius: var(--radius-2);
				position: absolute;
				top: 50%;
				left: 0;
				right: 0;
			}
		}

		p {
			max-width: 63ch;
		}

		@media (prefers-reduced-motion: no-preference) {
			@supports (animation-timeline: scroll()) {
				animation: header--leaveview linear both;
				/* when the page/root is scrolled */
				animation-timeline: scroll(root);
				/* from 0-10vh scroll amount, run the animation */
				animation-range: 0 30vh;
			}
		}
	}

	@keyframes header--leaveview {
		to {
			opacity: 0;
			translate: 0 30vh;
		}
	}

	footer {
		height: 30vh;
		display: grid;
		place-items: center;

		.realtor-group {
			display: flex;
			flex-direction: column;
			/* align-items: center; */
			gap: var(--size-1);

			h3 {
				margin: 0;
			}
			a {
				color: var(--accent-content);
				text-decoration: none;
				white-space: nowrap;
				vertical-align: top;
				margin-left: 0.3rem;
			}
			:global(svg) {
				color: var(--text-2);
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
		top: calc(var(--size-8) * 2);
		padding-top: calc(var(--index) * var(--card-top-offset));

		@media (min-width: 481px) and (max-width: 991px) and (orientation: landscape) {
			top: calc(var(--size-8) * 1);
		}

		.card__content {
			/* box-shadow: var(--shadow-large); */
			border-radius: var(--radius-2);
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
		width: 80vw;
		margin: 0 auto;
		text-align: left;
		/* Small tablets and larger mobile devices (481px - 768px) */
		@media (min-width: 481px) {
			width: 60vw;
		}

		p {
			margin-bottom: 1em;
		}

		.grouped {
			display: flex;
			gap: var(--size-3);
			flex: 0 1 100%;
			justify-content: center;
		}

		p.description {
			text-align: justify;
			justify-self: center;

			&.nodescription {
				text-align: center;
			}
		}

		.features {
			display: flex;
			justify-content: space-evenly;
			align-content: center;
			flex-wrap: wrap;
			gap: var(--size-2);
			margin-block: calc(var(--size-8) * 2);
		}

		p.amenities {
			display: flex;
			justify-content: center;
			align-content: center;
			flex-wrap: wrap;
			margin-block: var(--size-8);

			span:after {
				content: '•';
				margin-inline: 1rem;
			}

			span:last-child:after {
				content: '';
				margin: 0;
			}
		}

		.location {
			margin-block: var(--size-8) 0;
			display: flex;
			align-items: center;
			justify-content: center;
		}
	}
	.commercial-wrapper {
		margin: 0 0 var(--size-3) 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
