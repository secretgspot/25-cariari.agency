<script>
	/** @type {import('./$types').PageData} */
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import LogoSvg from '#lib/LogoSvg.svelte';
	import Nav from '#lib/Nav.svelte';
	import Badge from '#lib/Badge.svelte';
	import Icon from '#lib/Icon.svelte';
	import Ad from '#lib/Ad.svelte';
	import MapStatic from '#lib/map/MapStaticLibre.svelte';
	import PropertyGallery from '#lib/property/PropertyGallery.svelte';
	import InquiryForm from '#lib/InquiryForm.svelte';
	import { ago } from '#lib/utils/time.js';

	/** @type {{ data: any, form?: any }} */
	let { data, form } = $props();

	const property = $derived(data?.property ?? {});
	const isAdmin = $derived(Boolean(data?.is_admin));

	// Utility: format USD currency
	function formatPrice(amount) {
		if (amount === null || typeof amount === 'undefined' || amount <= 0) return null;
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			maximumFractionDigits: 0
		}).format(amount);
	}

	const displayPrice = $derived(formatPrice(property.price));
	const displayRent = $derived(formatPrice(property.rent));

	// Primary price label for mobile sticky bar & headers
	const primaryPriceFormatted = $derived.by(() => {
		if (displayPrice && displayRent) return `${displayPrice} • ${displayRent}/mo`;
		if (displayPrice) return displayPrice;
		if (displayRent) return `${displayRent}/mo`;
		return 'Contact for Price';
	});

	// Share handling with Web Share API and clipboard fallback
	let shareCopied = $state(false);
	async function handleShare() {
		const shareData = {
			title: `${property.msl || 'Property'} - Cariari Agency`,
			text: `Check out ${property.msl || 'this property'} in Cariari, Costa Rica`,
			url: page.url.href
		};

		if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
			try {
				await navigator.share(shareData);
				return;
			} catch (err) {
				if (err.name !== 'AbortError') {
					console.warn('Navigator share failed:', err);
				}
			}
		}

		if (typeof navigator !== 'undefined' && navigator.clipboard) {
			try {
				await navigator.clipboard.writeText(page.url.href);
				shareCopied = true;
				setTimeout(() => {
					shareCopied = false;
				}, 2500);
			} catch (err) {
				console.warn('Clipboard write failed:', err);
			}
		}
	}

	function scrollToInquiry() {
		const el = document.getElementById('inquiry-section');
		if (el) {
			el.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}

	// SEO & Schema metadata
	const pageTitle = $derived(`${property.msl || 'Property'} - Cariari Agency Real Estate`);
	const metaDescription = $derived.by(() => {
		if (property.description) {
			const clean = property.description.replace(/\s+/g, ' ').trim();
			return clean.length > 160 ? clean.slice(0, 157) + '...' : clean;
		}
		const parts = [];
		if (property.msl) parts.push(`Reference ${property.msl}`);
		if (property.property_for) {
			const purpose = Array.isArray(property.property_for) ? property.property_for.join(', ') : property.property_for;
			parts.push(`for ${purpose}`);
		}
		if (property.land_use) parts.push(property.land_use);
		if (property.beds) parts.push(`${property.beds} beds`);
		if (property.baths) parts.push(`${property.baths} baths`);
		return `Cariari, Costa Rica: ${parts.join(' • ')}. Verified real estate by Cariari Agency.`;
	});

	const canonicalUrl = $derived(page.url.href);
	const heroPhotoUrl = $derived(
		property.photos?.[0]?.file_url || property.photo || '/placeholder/1080x810.png'
	);

	// Schema.org RealEstateListing JSON-LD
	const jsonLdData = $derived.by(() => {
		const photos = Array.isArray(property.photos) && property.photos.length > 0
			? property.photos.map((p) => (typeof p === 'string' ? p : p.file_url))
			: [heroPhotoUrl];

		const offers = [];
		if (property.price) {
			offers.push({
				'@type': 'Offer',
				businessFunction: 'http://purl.org/goodrelations/v1#Sell',
				price: property.price,
				priceCurrency: 'USD',
				availability: property.is_active ? 'https://schema.org/InStock' : 'https://schema.org/Discontinued'
			});
		}
		if (property.rent) {
			offers.push({
				'@type': 'Offer',
				businessFunction: 'http://purl.org/goodrelations/v1#LeaseOut',
				price: property.rent,
				priceCurrency: 'USD',
				availability: property.is_active ? 'https://schema.org/InStock' : 'https://schema.org/Discontinued'
			});
		}

		/** @type {any} */
		const schema = {
			'@context': 'https://schema.org',
			'@type': 'RealEstateListing',
			name: `${property.msl || 'Property'} - Cariari Real Estate`,
			description: metaDescription,
			url: canonicalUrl,
			image: photos,
			datePosted: property.created_at,
			offers: offers.length === 1 ? offers[0] : (offers.length > 1 ? offers : {
				'@type': 'Offer',
				price: 0,
				priceCurrency: 'USD',
				availability: property.is_active ? 'https://schema.org/InStock' : 'https://schema.org/Discontinued'
			})
		};

		if (property.beds) schema.numberOfBedrooms = property.beds;
		if (property.baths) schema.numberOfBathroomsTotal = property.baths;
		if (property.building_size) {
			schema.floorSize = {
				'@type': 'QuantitativeValue',
				value: property.building_size,
				unitCode: 'MTK'
			};
		}
		if (property.location?.lat && property.location?.lng) {
			schema.geo = {
				'@type': 'GeoCoordinates',
				latitude: Number(property.location.lat),
				longitude: Number(property.location.lng)
			};
		}
		if (property.address) {
			schema.address = {
				'@type': 'PostalAddress',
				streetAddress: property.address,
				addressLocality: 'Cariari',
				addressRegion: 'Heredia',
				addressCountry: 'CR'
			};
		}

		return JSON.stringify(schema);
	});
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={metaDescription} />
	<link rel="canonical" href={canonicalUrl} />

	<!-- OpenGraph -->
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={metaDescription} />
	<meta property="og:image" content={heroPhotoUrl} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={canonicalUrl} />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={metaDescription} />
	<meta name="twitter:image" content={heroPhotoUrl} />

	<!-- Structured Data -->
	{@html `<script type="application/ld+json">${jsonLdData}</` + `script>`}
</svelte:head>

<!-- Global Nav Bar & Animated Logo (Always accessible) -->
<LogoSvg
	fixed
	kind="gold"
	animate={false}
	invert={true}
	clickable={true}
	onclick={() => goto('/')} />
<Nav fixed />

<article class="property-view-page">
	<!-- Cinematic Hero Header -->
	<section class="cinematic-hero">
		<div class="cinematic-hero-inner">
			{#if !property.is_active}
				<div class="hero-delisted-badge" role="alert">
					<Icon kind="warning" size="16" />
					<span>Delisted / Off-Market</span>
				</div>
			{/if}
			<h1 class="gold-text hero-msl">{property.msl}</h1>
			<p class="hero-summary">
				{#if property.property_for}
					{Array.isArray(property.property_for) ? `For ${property.property_for.join(' & ')}` : `For ${property.property_for}`}{property.land_use ? `: ${property.land_use}` : ''}{property.building_style ? `, ${property.building_style}` : ''}{property.year_built ? `, built ${property.year_built}` : ''}{property.lot_size > 0 ? `, on a ${property.lot_size}m² lot` : ''}{property.building_size > 0 ? `, with ${property.building_size}m² of living space` : ''}.{' '}{#if property.price}{`Priced at ${formatPrice(property.price)}.`}{:else if property.rent}{`Renting at ${formatPrice(property.rent)}/mo.`}{/if}
				{/if}
			</p>
		</div>
	</section>

	<!-- Sub-Navigation & Breadcrumb Bar (Between Hero and Gallery) -->
	<nav class="sub-nav-bar" aria-label="Property navigation">
		<a href="/" class="back-link">
			<Icon kind="icon_arrow_left" size="16" />
			<span>Explore Map</span>
		</a>

		<div class="utility-actions">
			<a href="/{property.id}/print" class="utility-btn" title="Print property brochure">
				<Icon kind="receipt" size="18" />
				<span class="btn-text">Print Brochure</span>
			</a>
			<button type="button" class="utility-btn" onclick={handleShare} title="Share property">
				<Icon kind="send" size="18" />
				<span class="btn-text">{shareCopied ? 'Link Copied!' : 'Share'}</span>
			</button>
			{#if isAdmin}
				<a href="/{property.id}/edit" class="utility-btn admin-badge-btn" title="Edit listing in Admin">
					<Icon kind="edit" size="18" />
					<span class="btn-text">Edit Listing</span>
				</a>
			{/if}
		</div>
	</nav>

	<!-- Prominent Property Media Hero -->
	<section class="gallery-hero-section">
		<PropertyGallery {property} />
	</section>

	<!-- Modern Real Estate Two-Column Split Grid -->
	<div class="property-content-layout">
		<!-- Left Column: Narrative, Specifications, Amenities, Map -->
		<section class="details-column">
			<!-- Narrative Description -->
			<div class="narrative-card">
				<h2 class="block-title">Property Description</h2>
				<div class="narrative-content" class:empty={!property.description}>
					{#if property.description}
						{#each property.description.split('\n\n') as para}
							{#if para.trim()}
								<p>{para.trim()}</p>
							{/if}
						{/each}
					{:else}
						<p class="no-description">No written narrative description has been provided for this listing.</p>
					{/if}
				</div>
			</div>

			<!-- Quick Specs Bar -->
			<div class="specs-card">
				<h2 class="block-title">Specifications</h2>
				<div class="specs-grid">
					{#if property.beds > 0}
						<Badge type="icon" label="beds" value={property.beds} />
					{/if}
					{#if property.baths > 0}
						<Badge type="icon" label="baths" value={property.baths} />
					{/if}
					{#if property.half_baths > 0}
						<Badge type="icon" label="half baths" value={property.half_baths} />
					{/if}
					{#if property.parking_spaces > 0}
						<Badge type="icon" label="parkings" value={property.parking_spaces} />
					{/if}
					{#if property.rooms > 0}
						<Badge type="icon" label="rooms" value={property.rooms} />
					{/if}
					{#if property.building_size > 0}
						<Badge type="text" label="living area" value="{property.building_size} m²" />
					{/if}
					{#if property.lot_size > 0}
						<Badge type="text" label="lot size" value="{property.lot_size} m²" />
					{/if}
					{#if property.year_built}
						<Badge
							type="text"
							label="built"
							value="{property.year_built} &bull; {ago(property.year_built)}" />
					{/if}
					{#if property.building_style}
						<Badge type="text" label="style" value={property.building_style} />
					{/if}
					{#if property.land_use}
						<Badge type="text" label="land use" value={property.land_use} />
					{/if}
					{#if property.price > 0}
						<Badge type="text" label="sale price" value={formatPrice(property.price)} />
					{/if}
					{#if property.rent > 0}
						<Badge type="text" label="rent / mo" value={formatPrice(property.rent)} />
					{/if}
					{#if property.taxes > 0}
						<Badge type="text" label="annual taxes" value={formatPrice(property.taxes)} />
					{/if}
					{#if property.fees > 0}
						<Badge type="text" label="hoa / fees" value={formatPrice(property.fees)} />
					{/if}
				</div>
			</div>

			<!-- Features & Amenities Tags / Chips -->
			{#if property.features && property.features.length > 0}
				<div class="amenities-card">
					<h2 class="block-title">Features & Amenities</h2>
					<div class="amenities-chips">
						{#each property.features as feature}
							<div class="amenity-chip">
								<span class="chip-bullet"></span>
								<span>{feature}</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Neighborhood Location Map -->
			{#if (property.location && property.location.lat && property.location.lng) || property.address}
				<div class="location-card">
					<div class="location-header">
						<h2 class="block-title">Neighborhood Location</h2>
						<p class="location-subtitle">
							{#if property.address}
								<span class="property-location-tag">
									<Icon kind="icon_pin" size="16" />
									<span>{property.address}</span>
								</span>
								<span class="location-separator">&bull;</span>
							{/if}
							<span>Real Cariari &bull; La Asunción, Heredia, Costa Rica</span>
						</p>
					</div>
					{#if property.location && property.location.lat && property.location.lng}
						<div class="map-container">
							<MapStatic position={property.location} zoom={14} />
						</div>
					{/if}
				</div>
			{/if}

			<!-- Sponsor Ad / Partner Section -->
			<div class="ad-section">
				<Ad />
			</div>
		</section>

		<!-- Right Column: Sticky Lead Conversion Sidebar -->
		<aside class="sidebar-column">
			<div class="sticky-lead-sidebar">
				<div class="lead-card">
					<!-- Prominent Pricing Header -->
					<div class="pricing-header">
						{#if displayPrice}
							<div class="price-line">
								<span class="price-amount">{displayPrice}</span>
								<span class="price-badge sale">For Sale</span>
							</div>
						{/if}
						{#if displayRent}
							<div class="price-line">
								<span class="price-amount">{displayRent}</span>
								<span class="price-badge rent">/ month</span>
							</div>
						{/if}
						{#if !displayPrice && !displayRent}
							<div class="price-line">
								<span class="price-amount">Price on Request</span>
							</div>
						{/if}
					</div>

					<!-- Status & Verified Listing Badges -->
					<div class="badges-row">
						{#if !property.is_active}
							<div class="status-indicator delisted" title="Listing is delisted">
								<Icon kind="warning" size="14" />
								<span>Delisted</span>
							</div>
						{/if}

						<div class="verified-indicator" title="Verified listing by Cariari Agency">
							<Icon kind="success" size="16" />
							<span>Verified by Cariari Agency</span>
						</div>
					</div>

					<!-- Direct Embed of InquiryForm -->
					<div id="inquiry-section" class="inquiry-form-container">
						<InquiryForm {data} {form} />
					</div>

					<!-- Contact Privacy & Admin Details Section -->
					<div class="lead-footer">
						{#if isAdmin}
							<div class="admin-lead-panel">
								<div class="admin-panel-top">
									<span class="admin-shield">🔥 Admin View</span>
									<a href="/{property.id}/edit" class="admin-edit-action">
										<Icon kind="edit" size="14" />
										<span>Edit Listing</span>
									</a>
								</div>
								<div class="admin-agent-meta">
									{#if property.contact_realtor}
										<div class="meta-row">
											<span class="meta-label">Listing Agent:</span>
											<span class="meta-value">{property.contact_realtor}</span>
										</div>
									{/if}
									{#if property.contact_email}
										<div class="meta-row">
											<Icon kind="email" size="15" />
											<a href="mailto:{property.contact_email}" class="gold-text agent-link">{property.contact_email}</a>
										</div>
									{/if}
									{#if property.contact_phone}
										<div class="meta-row">
											<Icon kind="phone" size="15" />
											<a href="tel:{property.contact_phone}" class="gold-text agent-link">{property.contact_phone}</a>
										</div>
									{/if}
								</div>
							</div>
						{:else}
							<div class="public-lead-note">
								<p>
									Need more information? Submit an inquiry and our team will get back to you promptly.
								</p>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</aside>
	</div>

	<!-- Mobile Fixed Bottom Action Bar (< 992px) -->
	<div class="mobile-sticky-action-bar" aria-label="Mobile property action bar">
		<div class="mobile-price-group">
			<span class="mobile-price-val">{primaryPriceFormatted}</span>
			<span class="mobile-msl-val">{property.msl}</span>
		</div>
		<button
			type="button"
			class="mobile-inquire-cta"
			onclick={scrollToInquiry}>
			Inquire Now
		</button>
	</div>
</article>

<style>
	/* ==========================================================================
	   PROPERTY VIEW PAGE STYLES
	   ========================================================================== */

	.property-view-page {
		background: var(--surface-1);
		color: var(--text-1);
		min-height: 100vh;
		padding-top: calc(var(--size-8) * 1.5);
		padding-bottom: calc(var(--size-8) * 3);
	}

	@media (max-width: 991px) {
		.property-view-page {
			padding-bottom: 100px; /* Space for mobile sticky bottom action bar */
		}
	}

	/* Cinematic Hero Header */
	.cinematic-hero {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 50vh;
		max-height: 68vh;
		background: var(--surface-1);
		overflow: hidden;
		padding-top: var(--size-4);
	}

	.cinematic-hero-inner {
		text-align: center;
		max-width: 740px;
		padding: var(--size-4) var(--size-4);
	}

	.hero-msl {
		font-size: clamp(3rem, 8vw, 5.5rem);
		font-weight: 300;
		letter-spacing: 2px;
		margin: 0 0 var(--size-3) 0;
		line-height: 1.1;
	}

	.hero-summary {
		font-size: clamp(0.95rem, 2vw, 1.15rem);
		color: var(--text-2);
		line-height: 1.7;
		margin: 0;
		max-width: 600px;
		margin-inline: auto;
	}

	.hero-delisted-badge {
		display: inline-flex;
		align-items: center;
		gap: var(--size-2);
		background: rgba(230, 100, 30, 0.15);
		border: 1px solid var(--warning);
		border-radius: var(--radius-round);
		padding: var(--size-1) var(--size-3);
		color: var(--warning);
		font-size: 0.85rem;
		font-weight: 600;
		margin-bottom: var(--size-4);
	}

	/* Sub-navigation bar (Between Hero and Gallery) */
	.sub-nav-bar {
		max-width: 1400px;
		margin: 0 auto var(--size-4);
		padding: var(--size-2) var(--size-4);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--size-3);
		flex-wrap: wrap;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: var(--size-2);
		color: var(--text-2);
		text-decoration: none;
		font-size: 0.95rem;
		font-weight: 500;
		transition: color var(--transition);

		&:hover {
			color: var(--accent);
		}
	}

	.utility-actions {
		display: inline-flex;
		align-items: center;
		gap: var(--size-2);
	}

	.utility-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--size-2);
		background: var(--surface-2);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-2);
		padding: var(--size-2) var(--size-3);
		color: var(--text-1);
		font-size: 0.85rem;
		font-weight: 500;
		cursor: pointer;
		text-decoration: none;
		transition: all var(--transition);

		&:hover {
			background: var(--surface-3);
			border-color: var(--accent);
			color: var(--accent);
		}
	}

	.admin-badge-btn {
		border-color: var(--warning);
		color: var(--warning-content);

		&:hover {
			border-color: var(--warning);
			background: rgba(230, 110, 0, 0.15);
		}
	}

	@media (max-width: 580px) {
		.btn-text {
			display: none;
		}
		.utility-btn {
			padding: var(--size-2);
		}
	}

	/* Media Hero Section */
	.gallery-hero-section {
		max-width: 1400px;
		margin: 0 auto var(--size-6);
		padding: 0 var(--size-4);
	}

	/* Main Split Grid Layout */
	.property-content-layout {
		max-width: 1400px;
		margin: 0 auto;
		padding: 0 var(--size-4);
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--size-6);
	}

	/* Desktop Split (≥ 992px) */
	@media (min-width: 992px) {
		.property-content-layout {
			grid-template-columns: minmax(0, 1fr) 390px;
			gap: var(--size-8);
			align-items: start;
		}
	}

	/* Large Desktop Split (≥ 1200px) */
	@media (min-width: 1200px) {
		.property-content-layout {
			grid-template-columns: minmax(0, 1fr) 420px;
		}
	}

	/* ==========================================================================
	   LEFT COLUMN CARDS & SECTIONS
	   ========================================================================== */

	.details-column {
		display: flex;
		flex-direction: column;
		gap: var(--size-5);
		min-width: 0;
	}

	.specs-card,
	.narrative-card,
	.amenities-card,
	.location-card {
		padding: var(--size-4) 0;
	}

	@media (min-width: 768px) {
		.specs-card,
		.narrative-card,
		.amenities-card,
		.location-card {
			padding: var(--size-5) 0;
		}
	}

	.property-location-tag {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		color: var(--text-1);
		font-weight: 500;
	}

	.location-separator {
		color: var(--text-2);
		margin: 0 2px;
	}

	.block-title {
		font-size: 1.15rem;
		font-weight: 600;
		letter-spacing: -0.2px;
		margin: 0 0 var(--size-3) 0;
		color: var(--text-1);
	}

	/* Quick Specs Grid (Tight & Proportional) */
	.specs-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(88px, 1fr));
		gap: 0.75rem 0.6rem;
		max-width: 560px;
	}

	@media (max-width: 600px) {
		.specs-grid {
			grid-template-columns: repeat(3, 1fr);
			gap: 0.6rem 0.4rem;
			max-width: 100%;
		}
	}

	.specs-grid :global(.badge) {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 0.25rem 0.2rem;
		box-sizing: border-box;
		text-align: center;
		transition: color var(--transition);

		&:hover {
			color: var(--accent);
		}
	}

	.specs-grid :global(.badge .value) {
		font-size: 1.05rem;
		font-weight: 600;
		line-height: 1.2;
		color: var(--text-1);
		margin-top: 2px;
	}

	.specs-grid :global(.badge .label) {
		font-size: 0.66rem;
		font-weight: 500;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--text-2);
		margin-top: 2px;
	}

	.specs-grid :global(.badge svg) {
		margin-bottom: 2px;
	}

	/* Narrative Content */
	.narrative-content {
		font-size: 1.02rem;
		line-height: 1.7;
		color: var(--text-1);

		p {
			margin: 0 0 var(--size-3) 0;
			&:last-child {
				margin-bottom: 0;
			}
		}

		.no-description {
			color: var(--text-3);
			font-style: italic;
		}
	}

	/* Amenities Chips */
	.amenities-chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--size-2);
	}

	.amenity-chip {
		display: inline-flex;
		align-items: center;
		gap: var(--size-2);
		background: var(--surface-1);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-round);
		padding: 0.4rem 0.9rem;
		font-size: 0.88rem;
		color: var(--text-1);
		transition: border-color var(--transition);

		&:hover {
			border-color: var(--accent);
		}
	}

	.chip-bullet {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--accent);
		flex-shrink: 0;
	}

	/* Neighborhood Location Map */
	.location-header {
		margin-bottom: var(--size-4);
	}

	.location-subtitle {
		margin: 0;
		font-size: 0.92rem;
		color: var(--text-2);
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--size-2);
	}

	.map-container {
		border-radius: var(--radius-2);
		overflow: hidden;
		border: 1px solid var(--surface-3);
		width: 100%;
		min-height: 320px;
	}

	.ad-section {
		display: flex;
		justify-content: center;
		padding: var(--size-3) 0;
	}

	/* ==========================================================================
	   RIGHT COLUMN (STICKY LEAD CONVERSION SIDEBAR)
	   ========================================================================== */

	.sidebar-column {
		position: relative;
	}

	@media (min-width: 992px) {
		.sticky-lead-sidebar {
			position: sticky;
			top: 5.5rem;
			z-index: 2;
		}
	}

	.lead-card {
		background: var(--surface-1);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-3);
		padding: var(--size-5);
		box-shadow: 0 12px 36px -8px rgba(0, 0, 0, 0.35);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
	}

	/* Prominent Price Display */
	.pricing-header {
		display: flex;
		flex-direction: column;
		gap: var(--size-1);
		margin-bottom: var(--size-3);
		padding-bottom: var(--size-3);
		border-bottom: 1px solid var(--surface-3);
	}

	.price-line {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--size-2);
	}

	.price-amount {
		font-size: 1.85rem;
		font-weight: 700;
		letter-spacing: -0.5px;
		color: var(--text-1);
	}

	.price-badge {
		font-size: 0.8rem;
		font-weight: 600;
		padding: 2px 8px;
		border-radius: var(--radius-1);

		&.sale {
			background: rgba(46, 160, 67, 0.18);
			color: var(--sale);
		}
		&.rent {
			background: rgba(220, 130, 20, 0.18);
			color: var(--rent);
		}
	}

	/* Status and Verified Badges */
	.badges-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--size-2);
		flex-wrap: wrap;
		margin-bottom: var(--size-4);
	}

	.status-indicator {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 0.8rem;
		font-weight: 600;
		padding: 4px 10px;
		border-radius: var(--radius-round);

		&.delisted {
			background: rgba(230, 100, 30, 0.12);
			color: var(--warning);
			border: 1px solid rgba(230, 100, 30, 0.3);
		}
	}

	.verified-indicator {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		font-size: 0.78rem;
		font-weight: 500;
		color: var(--text-2);
	}

	/* Inquiry Form overrides for sidebar embed */
	.inquiry-form-container {
		width: 100%;
	}

	.inquiry-form-container :global(.inquiry-form) {
		width: 100% !important;
		max-width: 100% !important;
		background: transparent !important;
		border: none !important;
		padding: 0 !important;
		margin: 0 !important;
	}

	.inquiry-form-container :global(.form-header) {
		display: none !important; /* Sidebar already has header & reference */
	}

	.inquiry-form-container :global(.success) {
		width: 100% !important;
		max-width: 100% !important;
		padding: var(--size-4) !important;
	}

	/* Privacy Notice & Admin Lead Panel */
	.lead-footer {
		margin-top: var(--size-4);
		padding-top: var(--size-3);
		border-top: 1px solid var(--surface-3);
	}

	.public-lead-note p {
		margin: 0;
		font-size: 0.82rem;
		line-height: 1.45;
		color: var(--text-2);
		text-align: center;
	}

	/* Admin View Panel */
	.admin-lead-panel {
		background: rgba(220, 130, 20, 0.08);
		border: 1px dashed var(--warning);
		border-radius: var(--radius-2);
		padding: var(--size-3);
	}

	.admin-panel-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--size-2);
	}

	.admin-shield {
		font-size: 0.78rem;
		font-weight: 700;
		color: var(--warning-content);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.admin-edit-action {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-size: 0.8rem;
		color: var(--accent);
		text-decoration: none;
		font-weight: 500;

		&:hover {
			text-decoration: underline;
		}
	}

	.admin-agent-meta {
		display: flex;
		flex-direction: column;
		gap: 6px;
		font-size: 0.84rem;
	}

	.meta-row {
		display: flex;
		align-items: center;
		gap: var(--size-2);
	}

	.meta-label {
		color: var(--text-2);
	}

	.meta-value {
		color: var(--text-1);
		font-weight: 500;
	}

	.agent-link {
		text-decoration: none;
		word-break: break-all;

		&:hover {
			text-decoration: underline;
		}
	}

	/* ==========================================================================
	   MOBILE STICKY BOTTOM ACTION BAR (< 992px)
	   ========================================================================== */

	.mobile-sticky-action-bar {
		display: none;
	}

	@media (max-width: 991px) {
		.mobile-sticky-action-bar {
			display: flex;
			position: fixed;
			bottom: 0;
			left: 0;
			right: 0;
			z-index: 45;
			align-items: center;
			justify-content: space-between;
			padding: var(--size-3) var(--size-4);
			background: rgba(18, 18, 20, 0.88);
			border-top: 1px solid var(--surface-3);
			backdrop-filter: blur(16px);
			-webkit-backdrop-filter: blur(16px);
			box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
		}

		.mobile-price-group {
			display: flex;
			flex-direction: column;
			gap: 2px;
		}

		.mobile-price-val {
			font-size: 1.15rem;
			font-weight: 700;
			color: var(--text-1);
		}

		.mobile-msl-val {
			font-size: 0.75rem;
			color: var(--text-2);
			text-transform: uppercase;
			letter-spacing: 0.5px;
		}

		.mobile-inquire-cta {
			background: var(--gradient-gold);
			color: #1a1a1a;
			font-weight: 600;
			font-size: 0.95rem;
			padding: 0.65rem 1.4rem;
			border: none;
			border-radius: var(--radius-round);
			cursor: pointer;
			transition: transform 0.15s ease, opacity 0.15s ease;

			&:hover {
				opacity: 0.92;
			}
			&:active {
				transform: scale(0.97);
			}
		}
	}
</style>
