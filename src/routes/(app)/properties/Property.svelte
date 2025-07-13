<script>
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { formatter, ago } from '$lib/utils/helpers.js';
	import { Button, LinkButton } from '$lib/buttons';

	/** @type {{property: any}} */
	let { property } = $props();

	let isAdmin = page.data.is_admin ?? false;
	let user_id = page.data?.user?.id;
</script>

<section class="property" class:deactivated={!property.is_active}>
	<LinkButton class="property-image" href={`/${property.id}`}>
		{#if property.photo}
			<img
				src={property.photo}
				alt="{property.id} photo"
				loading="lazy"
				intrinsicsize="281x222" />
		{:else}
			<img
				src="/placeholder/450x360.png"
				alt="placeholder"
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
			{#if property.year_built}<span>&bull; {ago(new Date(property.year_built))} old</span
				>{/if}
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
		<div class="dates wrap">
			<small>added {ago(new Date(property.created_at))} ago</small>
			<small>updated {ago(new Date(property.updated_at))} ago</small>
		</div>

		<div class="details wrap">
			{#if property.location}<small class="loc"
					>{property.location.lat} / {property.location.lng}</small
				>{/if}
			<span>[{property.msl}]</span>
		</div>

		<div class="buttons">
			{#if user_id === property.user_id || isAdmin}
				<!-- <Button href="property/{property.id}">Edit</Button> -->
				<Button size="block" onclick={() => goto(`/${property.id}/edit`)}>Edit</Button>
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
		/* grid-template-columns: 1fr 1fr; */
		/* grid-template-rows: auto 1fr auto; */
		grid-template-rows: 1fr auto;
		grid-template-areas:
			'property-header property-header'
			'property-footer property-footer';
		position: relative;
		border: 0px solid var(--border-color);
		/* margin: 1rem; */
		background: var(--primary);
		box-shadow: var(--shadow-small);
		cursor: default;
		position: relative;

		@media (min-width: 1024px) {
			grid-template-areas:
				'property-image property-header'
				'property-image property-footer';
			margin: 1rem;
			&:hover {
				outline: 6px solid hsl(var(--a) / 0.1);
			}
		}
	}
	.deactivated::after {
		content: 'Delisted';
		position: absolute;
		background: var(--warning);
		color: var(--warning-content);
		padding: var(--padding-extra-small);
		opacity: 0.6;
	}

	/* PROPERTIES LIST -> PROPERTY -> HEADER */
	.property-header {
		grid-area: property-header;
		display: flex;
		flex-direction: column;
		padding: var(--padding-small);
		/* box-shadow: var(--shadow-small); */
		gap: var(--gap-extra-small);

		.land_use {
			display: flex;
			justify-content: space-between;
		}

		.type_age {
			text-transform: uppercase;
			color: var(--secondary-content);
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
			color: var(--secondary-content);
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

		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
			aspect-ratio: 3 / 2;
		}
	}

	/* PROPERTIES LIST -> PROPERTY -> FOOTER */
	.property-footer {
		grid-area: property-footer;
		display: flex;
		flex-direction: column;
		background: var(--primary-focus);
		padding: var(--padding-small);
		gap: var(--gap-extra-small);

		.dates {
			display: flex;
			justify-content: space-between;
			color: var(--accent-content);
			font-size: smaller;
			/* margin: 1rem; */
		}

		.details {
			display: flex;
			align-items: center;
			justify-content: space-between;
			/* margin: 0 1rem 1rem; */

			.loc {
				color: var(--accent-content);
				font-size: x-small;
			}
		}
	}

	.property:hover .property-footer .buttons {
		display: block;
	}
	.property-footer .buttons {
		display: none;
		position: absolute;
		top: 0;
		right: 0;
	}
	.property-footer .buttons :global(button) {
		border-radius: 0;
		padding: var(--padding-extra-small);
	}
</style>
