<script>
	/** @type {import('./$types').PageData} */
	import { base } from '$app/paths';
	import { goto, afterNavigate, beforeNavigate } from '$app/navigation';

	import { Button } from '$lib/buttons';
	import Badge from '$lib/Badge.svelte';
	import Icon from '$lib/Icon.svelte';
	import Ad from '$lib/Ad.svelte';
	import MapStatic from '$lib/map/MapStatic.svelte';
	import { formatter, ago } from '$lib/utils/helpers.js';
	import { Splide, SplideSlide } from '@splidejs/svelte-splide';
	import '@splidejs/svelte-splide/css';
	import JsonDump from '$lib/JSONDump.svelte';

	/** @type {{data: any}} */
	let { data } = $props();

	let previousPage = $state(base);

	afterNavigate(({ from }) => {
		if (from == null) {
			previousPage = '/';
		} else {
			previousPage = from?.url.pathname || previousPage;
		}
		console.log('🎄', from);
	});

	$effect(() => {
		console.log('previous page: ', previousPage);
	});
</script>

<!-- <JsonDump name="data" {data} /> -->

<article>
	<!-- IMAGE PANE -->
	<div class="image">
		<Splide
			options={{
				type: 'loop',
				drag: 'free',
				snap: true,
				rewind: true,
				height: '100%',
			}}
			aria-label="{data.property.msl} photos">
			{#if data.property.photos}
				{#each data.property.photos as photo}
					<SplideSlide>
						<img
							class="slide-image"
							src={photo.file_url}
							alt="{data.property.msl} property photo"
							loading="eager"
							intrinsicsize="1920x1080" />
					</SplideSlide>
				{/each}
			{:else}
				<SplideSlide>
					<img
						class="slide-image"
						src="/placeholder/1080x810.png"
						alt="property"
						loading="eager" />
				</SplideSlide>
			{/if}
		</Splide>
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
	<div class="side scroller">
		<Button size="icon" class="close" onclick={() => goto(previousPage)}>
			{#snippet icon()}
				❌
			{/snippet}
		</Button>
		<!-- {#if btn}
		<Button type="button" mode="close needy" onclick="{() => dispatch('close')}">
			<Icon type="close" size="18" />
		</Button>
		{:else}
		<Button type="button" mode="close needy" onclick="{() => goto('/properties')}">
			<Icon type="return" size="18" />
		</Button>
		{/if} -->

		{#if !data.property.is_active}
			<div class="delisted">NOT LISTED</div>
		{/if}

		<div class="badge-group">
			{#if data.property.year_built}
				<Badge
					type="text"
					label="built"
					value="{data.property.year_built.split('-')[0]} &bull; {ago(
						new Date(data.property.year_built),
					)}" />
			{/if}
			{#if data.property.building_style}
				<Badge type="text" label="style" value={data.property.building_style} />
			{/if}
		</div>

		<div class="price-group">
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
				<Badge
					type="text"
					label="condo fees"
					value={formatter.format(data.property.fees)} />
			{/if}
		</div>

		{#if data.property.location && data.property.location.lat && data.property.location.lng}
			<div class="map-group">
				<!-- <StaticMap
					lat={data.property.location.lat}
					lon={data.property.location.lng}
					zoom="15"
					marker="https://i.imgur.com/gA01omN.png"
				/> -->
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

		<div class="ad-wrapper">
			<Ad width="320" height="100" />
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
		/* position: fixed;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0; */
		width: 100vw;
		height: 100vh;
		overflow: auto;
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

	.image {
		grid-area: main;
		width: 100vw;
		overflow: hidden;
		height: min-content;
		/* height: max-content; */
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
		/* justify-content: space-around; */
		align-items: flex-start;
		/* overflow-y: auto; */
		background: lavender;
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
		margin: var(--padding-medium) 0;
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
		/* max-height: 369px; */
		/* overflow: auto; */
		padding: 0 var(--padding-medium);
		margin: var(--padding-medium) 0;
		white-space: pre-wrap;
		min-height: min-content;
		text-align: justify;
	}

	.side .ad-wrapper {
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
		/* background: linear-gradient(-45deg, #00000036, transparent); */
		width: 100%;
		/* border-radius: 50px var(--border-radius) var(--border-radius) 50px; */
		/* box-shadow: 6px 0px 6px #00000030; */
		margin: var(--padding-small) 0;
	}
	.realtor-group div {
		display: flex;
		flex-direction: column;
		margin: 1rem;
	}
	.realtor-group h3 {
		margin: 0;
	}
	.realtor-group a {
		color: var(--color-cyan);
		text-decoration: none;
		white-space: nowrap;
		vertical-align: top;
		margin-left: 0.3rem;
	}
	.realtor-group :global(svg) {
		color: var(--txt-tertiary);
	}

	/* BASE SECTION */
	.base {
		grid-area: base;
		display: grid;
		grid-template-columns: repeat(1, minmax(auto, 1fr));
		grid-gap: 1rem;
		align-items: center;
		padding: 1rem;
		background: aliceblue;
		/* background-image: url("data:image/svg+xml,%3Csvg width='32' height='64' viewBox='0 0 32 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 28h20V16h-4v8H4V4h28v28h-4V8H8v12h4v-8h12v20H0v-4zm12 8h20v4H16v24H0v-4h12V36zm16 12h-4v12h8v4H20V44h12v12h-4v-8zM0 36h8v20H0v-4h4V40H0v-4z' fill='%23130825' fill-opacity='0.01' fill-rule='evenodd'/%3E%3C/svg%3E"); */
	}

	.base .badge-group {
		display: flex;
		justify-content: space-evenly;
		flex-wrap: wrap;
	}
	.side .badge-group :global(.badge),
	.base .badge-group :global(.badge),
	.side .price-group :global(.badge) {
		margin: 0.6rem;
	}

	/* @media (orientation: landscape) {
		.image {
			height: 81vh;
		}
	}
 */
	@media (min-width: 1024px) {
		article {
			grid-template-columns: 60vw 40vw;
			grid-template-rows: 70vh 30vh;
			grid-template-areas:
				'main aside'
				'base aside';
		}
		article :global(.close) {
			top: var(--padding-small);
			position: fixed;
		}
		.side {
			overflow-y: auto;
		}
		.image {
			width: auto;
			height: 100%;
		}
		.base {
			grid-template-columns: repeat(2, minmax(min-content, auto));
			grid-gap: 3rem;
			padding: 3rem;
		}
	}
</style>
