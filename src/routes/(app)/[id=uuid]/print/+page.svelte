<script>
	/** @type {import('./$types').PageData} */
	import { navigating, page } from '$app/state';
	import { goto } from '$app/navigation';
	import Logo from '$lib/Logo.svelte';
	import Nav from '$lib/Nav.svelte';
	import Badge from '$lib/Badge.svelte';
	import QR from '$lib/QR.svelte';
	import { Button, LinkButton } from '$lib/buttons';

	let { data } = $props();
	// console.log('(app)/[id=uuid]/print/+page.svelte page:', page);
</script>

<svelte:head>
	<title>{data.property.msl} - Cariari Agency</title>
</svelte:head>

{#if !navigating.complete}
	<Logo type="regular" color="bw" fixed onclick={() => goto('/')} />
	<Nav fixed />
{/if}

<article class="print-property">
	<!-- <h1>Print {slug} {JSON.stringify(query, null, 2)}</h1> -->

	<div class="grid-container">
		<div class="qr">
			<QR size={180} message="{page.url.hostname}/{data.property.id}/edit" />
			<small>{page.url.hostname}/{data.property.id}/edit</small>
		</div>

		<div class="address">
			<Badge label="address" direction="row" value={data.property.address} />
		</div>

		<div class="location">
			<Badge label="lat" direction="row" value={data.property.location.lat} />
			<Badge label="lng" direction="row" value={data.property.location.lng} />
		</div>

		<div class="header">
			<strong>Great news!</strong> Your property is now live on our online listings.<br />
			<br />
			To manage your property (update details, add missing information, or unlist it), please
			use one of the following options to access your editing page:

			<ul>
				<li>Scan the QR code provided.</li>
				<li>
					Visit this direct link: <LinkButton
						href="/{data.property.id}/edit"
						title="Add you property"
						>{page.url.hostname}/{data.property.id}/edit</LinkButton>
				</li>
			</ul>

			There is no charge for this service.
		</div>

		<div class="features">
			<Badge label="features" direction="row" value={data.property.features.join(', ')} />
		</div>

		<div class="description">
			<Badge label="description" direction="row" value={data.property.description} />
		</div>

		<div class="intro">
			<Badge label="msl" direction="row" value={data.property.msl} />
			<Badge label="land use" direction="row" value={data.property.land_use} />
			<Badge label="for" direction="row" value={data.property.property_for} />
			<!-- <Badge label="active" direction="row" value="{data.property.is_active}" /> -->
		</div>

		<div class="contact">
			<Badge label="phone" direction="row" value={data.property.contact_phone} />
			<Badge label="email" direction="row" value={data.property.contact_email} />
		</div>

		<div class="parcel flexit">
			<Badge label="built" value={data.property.year_built} />
			<Badge label="style" value={data.property.building_style} />
			<Badge label="lot" value={data.property.lot_size} />
			<Badge label="building" value={data.property.building_size} />
		</div>

		<div class="interior flexit">
			<Badge label="rooms" value={data.property.rooms} />
			<Badge label="beds" value={data.property.beds} />
			<Badge label="baths" value={data.property.baths} />
			<Badge label="half baths" value={data.property.half_baths} />
			<Badge label="parkings" value={data.property.parking_spaces} />
		</div>

		<div class="prices flexit">
			<Badge label="price" value={data.property.price} />
			<Badge label="rent" value={data.property.rent} />
			<Badge label="taxes" value={data.property.taxes} />
			<Badge label="fees" value={data.property.fees} />
		</div>
	</div>

	<div class="property-listing">
		<h2>Scan this QR to view details of this {data.property.msl} listing.</h2>

		<div class="qr-wrapper">
			<QR size={360} message="{page.url.hostname}/{data.property.id}" />
		</div>

		<h3>{page.url.hostname}/{data.property.id}</h3>
	</div>

	<!--
	<pre>
	{JSON.stringify(property, null, 2)}
	</pre> -->
</article>

<style>
	.print-property {
		display: grid;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		margin: var(--padding-large) 0;
		gap: var(--gap-small);
	}

	.grid-container {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-areas:
			'header'
			'intro'
			'contact'
			'qr'
			'address'
			'location'
			'parcel'
			'interior'
			'prices'
			'features'
			'description';
		width: 90vw;
		margin: var(--padding-large) auto;

		@media (min-width: 768px) {
			grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
			grid-template-areas:
				'header header header header header header'
				'intro intro contact contact qr qr'
				'address address address location qr qr'
				'parcel parcel interior interior prices prices'
				'features features features features features features'
				'description description description description description description';
		}

		:global(.badge) {
			margin: 1rem;
		}

		> div {
			border: var(--border);
		}
	}

	.qr {
		grid-area: qr;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 1rem;
	}
	.qr small {
		margin: 1rem 0 0;
		text-align: center;
	}
	.address {
		grid-area: address;
	}
	.location {
		grid-area: location;
	}
	.header {
		grid-area: header;
		padding: 2rem;
		li :global(a) {
			white-space: break-spaces;
		}
	}
	.features {
		grid-area: features;
	}
	.description {
		grid-area: description;
	}
	.description :global(.value) {
		line-height: 1.4;
	}
	.intro {
		grid-area: intro;
	}
	.contact {
		grid-area: contact;
	}
	.parcel {
		grid-area: parcel;
	}
	.interior {
		grid-area: interior;
	}
	.prices {
		grid-area: prices;
	}
	.flexit {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-wrap: wrap;
	}

	.property-listing {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		width: 90vw;
		margin: 3rem auto;
		text-align: center;
	}
</style>
