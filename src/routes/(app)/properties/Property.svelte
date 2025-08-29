<script>
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { formatter } from '$lib/utils/formatters.js';
	import { ago } from '$lib/utils/time.js';
	import { Button, LinkButton } from '$lib/buttons';
	import Badge from '$lib/Badge.svelte';

	/** @type {{property: any}} */
	let { property } = $props();

	let isAdmin = page.data.is_admin ?? false;
	let user_id = page.data?.user?.id;
</script>

<section class="property" class:deactivated={!property.is_active}>
	<LinkButton class="property-image" underline={false} href={`/${property.msl}`}>
		{#if property.photo}
			<img
				src={property.photo}
				alt="{property.msl} - {property.land_use}"
				loading="lazy"
				intrinsicsize="281x222" />
		{:else}
			<img
				src="/placeholder/450x360.png"
				alt="Placeholder image for {property.msl}"
				loading="lazy"
				intrinsicsize="281x222" />
		{/if}
	</LinkButton>

	<div class="property-header">
		<div class="land_use">
			{#each property.property_for as p_for}
				<span>{p_for}</span>
			{/each}
		</div>

		<div class="type_age">
			{#if property.land_use}<span>{property.land_use}</span>{/if}
			{#if property.building_style}<span>&bull; {property.building_style}</span>{/if}
			{#if property.year_built}<span>&bull; {ago(property.year_built)} old</span>{/if}
		</div>

		<div class="price_rent">
			{#if property.rent}<span>{formatter.format(property.rent)}/m</span>{/if}
			{#if property.price}<span>{formatter.format(property.price)}</span>{/if}
		</div>

		<div class="loc_address">
			<!-- {#if property.address}<span>{property.address}</span>{/if} -->
			{#if property.location}<span>{property.location.lat} / {property.location.lng}</span
				>{/if}
		</div>
	</div>

	<footer class="property-footer">
		<div class="details wrap">
			<!-- {#if property.location}<small class="loc"
					>{property.location.lat} / {property.location.lng}</small
				>{/if} -->
			<small class="features">
				{#if property.beds > 0}
					<Badge type="tiny" label="beds" value={property.beds} />
				{/if}
				{#if property.baths > 0}
					<Badge type="tiny" label="baths" value={property.baths} />
				{/if}
				{#if property.half_baths > 0}
					<Badge type="tiny" label="half baths" value={property.half_baths} />
				{/if}
				{#if property.parking_spaces > 0}
					<Badge type="tiny" label="parkings" value={property.parking_spaces} />
				{/if}
			</small>
			<span>[{property.msl}]</span>
		</div>

		<div class="dates wrap">
			<small>added {ago(property.created_at)} ago</small>
			<small>updated {ago(property.updated_at)} ago</small>
		</div>

		<div class="buttons">
			{#if user_id === property.user_id || isAdmin}
				<!-- <Button href="property/{property.id}">Edit</Button> -->
				<Button size="icon" onclick={() => goto(`/${property.id}/edit`)}>
					{#snippet icon()}
						✏️
					{/snippet}
				</Button>
			{/if}
			<!-- <Button href="/{property.id}">View</Button> -->
		</div>
	</footer>
</section>

<style>
	/* PROPERTIES LIST -> PROPERTY */
	.property {
		display: grid;
		grid-template-columns: minmax(270px, min-content) auto;
		grid-template-rows: 1fr auto;
		grid-template-areas:
			'property-header property-header'
			'property-footer property-footer';
		position: relative;
		border: 0px solid var(--surface-2);
		border-radius: var(--radius-2);
		background: var(--surface-1);
		box-shadow: var(--shadow-1);
		cursor: default;
		position: relative;

		@media (min-width: 1024px) {
			grid-template-areas:
				'property-image property-header'
				'property-image property-footer';
			margin: var(--size-3);
			&:hover {
				outline: 3px solid var(--surface-3);
			}
		}
	}
	.deactivated::after {
		content: 'Delisted';
		position: absolute;
		background: var(--warning);
		border-top-left-radius: var(--radius-2);
		color: var(--warning-content);
		padding: var(--size-1);
		opacity: 0.9;
	}

	/* PROPERTIES LIST -> PROPERTY -> HEADER */
	.property-header {
		grid-area: property-header;
		display: flex;
		flex-direction: column;
		padding: var(--size-2);
		/* box-shadow: var(--shadow-small); */
		gap: var(--size-1);

		.land_use {
			display: flex;
			justify-content: space-between;
		}

		.type_age {
			text-transform: uppercase;
			color: var(--text-2);
		}

		.price_rent {
			/* font-size: 144%; */
			display: flex;
			justify-content: space-between;
			/* margin: 0.3rem 0; */
		}

		.loc_address {
			/* font-size: 90%; */
			display: flex;
			flex-direction: column;
			color: var(--text-2);
			display: none;
		}
	}

	/* PROPERTIES LIST -> PROPERTY -> IMAGE */
	:global(a.property-image) {
		grid-area: property-image;
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 0;
		position: relative;
		background-size: cover;
		filter: brightness(var(--brightness));
		cursor: pointer;
		border-radius: inherit;
		border-bottom-left-radius: 0;
		border-bottom-right-radius: 0;

		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
			aspect-ratio: 3 / 2;
			border-radius: inherit;
		}
	}

	/* PROPERTIES LIST -> PROPERTY -> FOOTER */
	.property-footer {
		grid-area: property-footer;
		display: flex;
		flex-direction: column;
		background: var(--surface-2);
		padding: var(--size-2);
		gap: var(--size-1);
		border-bottom-left-radius: inherit;
		border-bottom-right-radius: inherit;

		.dates {
			display: flex;
			justify-content: space-between;
			color: var(--text-2);
			font-size: smaller;
			/* margin: 1rem; */
		}

		.details {
			display: flex;
			align-items: center;
			justify-content: space-between;
			/* margin: 0 1rem 1rem; */

			.features {
				color: var(--accent);
				font-size: x-small;
				display: flex;
				gap: var(--size-2);
			}

			/* .loc {
				color: var(--accent-content);
				font-size: x-small;
			} */
		}
	}
	.property-footer .buttons {
		position: absolute;
		top: 0;
		right: 0;
	}
	.property-footer .buttons :global(button) {
		border: none;
		border-radius: 0;
		padding: var(--size-1);
		border-top-right-radius: var(--radius-2);
	}
</style>
