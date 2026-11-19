<script>
	import { Button } from '#lib/buttons/index.js';

	/**
	 * PropertyGallery.svelte
	 * Modern, high-performance real-estate photo gallery component.
	 *
	 * - Desktop (>= 768px): 5-photo mosaic split grid (1 hero + 4 secondary) with "View all photos" button.
	 * - Mobile (< 768px): Native CSS scroll-snap horizontal carousel with reactive count badge and dots.
	 * - Lightbox: Accessible fullscreen modal with ESC/Arrow key navigation, backdrop dismiss, and body scroll lock.
	 * - Core Web Vitals (CWV): Zero CLS via explicit aspect ratios, eager high-priority LCP hero, lazy remainder.
	 */

	/** @type {{ property?: any }} */
	let { property = {} } = $props();

	const PLACEHOLDER_URL = '/placeholder/1080x810.png';

	// Normalize photos array
	let photos = $derived.by(() => {
		const rawPhotos = property?.photos;
		const msl = property?.msl || 'Property';

		if (Array.isArray(rawPhotos) && rawPhotos.length > 0) {
			return rawPhotos.map((p, idx) => {
				const url = typeof p === 'string' ? p : (p?.file_url || p?.url || PLACEHOLDER_URL);
				const alt = (typeof p === 'object' && p?.alt) ? p.alt : `${msl} - Photo ${idx + 1}`;
				return { file_url: url, alt };
			});
		}

		if (property?.photo) {
			return [{ file_url: property.photo, alt: `${msl} - Photo 1` }];
		}

		return [{ file_url: PLACEHOLDER_URL, alt: `${msl} - Photo placeholder` }];
	});

	// Mobile carousel state
	let activeMobileIndex = $state(0);
	let carouselTrack = $state(null);

	function handleCarouselScroll() {
		if (!carouselTrack) return;
		const scrollLeft = carouselTrack.scrollLeft;
		const slideWidth = carouselTrack.offsetWidth;
		if (slideWidth > 0) {
			const index = Math.round(scrollLeft / slideWidth);
			if (index >= 0 && index < photos.length) {
				activeMobileIndex = index;
			}
		}
	}

	function scrollToSlide(index) {
		if (!carouselTrack) return;
		const slideWidth = carouselTrack.offsetWidth;
		carouselTrack.scrollTo({
			left: slideWidth * index,
			behavior: 'smooth'
		});
		activeMobileIndex = index;
	}

	// Lightbox modal state
	let isLightboxOpen = $state(false);
	let activeLightboxIndex = $state(0);
	let touchStartX = 0;
	let touchStartY = 0;

	function openLightbox(index = 0) {
		activeLightboxIndex = Math.max(0, Math.min(index, photos.length - 1));
		isLightboxOpen = true;
	}

	function closeLightbox() {
		isLightboxOpen = false;
	}

	function nextPhoto() {
		if (photos.length <= 1) return;
		activeLightboxIndex = (activeLightboxIndex + 1) % photos.length;
	}

	function prevPhoto() {
		if (photos.length <= 1) return;
		activeLightboxIndex = (activeLightboxIndex - 1 + photos.length) % photos.length;
	}

	// Lock body scroll and register keyboard listeners when lightbox is open
	$effect(() => {
		if (!isLightboxOpen) return;

		const originalOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		const handleKeyDown = (e) => {
			if (e.key === 'Escape') {
				e.preventDefault();
				closeLightbox();
			} else if (e.key === 'ArrowRight') {
				e.preventDefault();
				nextPhoto();
			} else if (e.key === 'ArrowLeft') {
				e.preventDefault();
				prevPhoto();
			}
		};

		window.addEventListener('keydown', handleKeyDown);

		return () => {
			document.body.style.overflow = originalOverflow;
			window.removeEventListener('keydown', handleKeyDown);
		};
	});

	// Touch handlers for mobile lightbox swipe
	function handleTouchStart(e) {
		touchStartX = e.changedTouches[0].clientX;
		touchStartY = e.changedTouches[0].clientY;
	}

	function handleTouchEnd(e) {
		const diffX = e.changedTouches[0].clientX - touchStartX;
		const diffY = e.changedTouches[0].clientY - touchStartY;

		// Horizontal swipe detected if deltaX dominates deltaY
		if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
			if (diffX < 0) {
				nextPhoto();
			} else {
				prevPhoto();
			}
		}
	}
</script>

<div class="property-gallery-root">
	<!-- ============================================================== -->
	<!-- DESKTOP MOSAIC GRID (>= 768px)                                 -->
	<!-- ============================================================== -->
	<section
		class="gallery-desktop"
		class:count-1={photos.length === 1}
		class:count-2={photos.length === 2}
		class:count-3={photos.length === 3}
		class:count-4={photos.length === 4}
		class:count-5={photos.length >= 5}
		aria-label="Desktop Property Photo Gallery"
	>
		{#if photos.length === 1}
			<!-- Single photo full width -->
			<button
				type="button"
				class="mosaic-item hero-only"
				onclick={() => openLightbox(0)}
				aria-label="View photo in fullscreen"
			>
				<img
					src={photos[0].file_url}
					alt={photos[0].alt}
					loading="eager"
					fetchpriority="high"
					decoding="sync"
				/>
			</button>
		{:else if photos.length === 2}
			<!-- 2 photos split 50 / 50 -->
			<button
				type="button"
				class="mosaic-item cell-hero"
				onclick={() => openLightbox(0)}
				aria-label="View primary photo in fullscreen"
			>
				<img
					src={photos[0].file_url}
					alt={photos[0].alt}
					loading="eager"
					fetchpriority="high"
					decoding="sync"
				/>
			</button>
			<button
				type="button"
				class="mosaic-item cell-secondary"
				onclick={() => openLightbox(1)}
				aria-label="View photo 2 in fullscreen"
			>
				<img
					src={photos[1].file_url}
					alt={photos[1].alt}
					loading="lazy"
					decoding="async"
				/>
			</button>
		{:else if photos.length === 3}
			<!-- 3 photos: 1 large hero left, 2 stacked right -->
			<button
				type="button"
				class="mosaic-item cell-hero"
				onclick={() => openLightbox(0)}
				aria-label="View primary photo in fullscreen"
			>
				<img
					src={photos[0].file_url}
					alt={photos[0].alt}
					loading="eager"
					fetchpriority="high"
					decoding="sync"
				/>
			</button>
			<div class="mosaic-side-stack-2">
				{#each photos.slice(1, 3) as photo, idx}
					<button
						type="button"
						class="mosaic-item"
						onclick={() => openLightbox(idx + 1)}
						aria-label="View photo {idx + 2} in fullscreen"
					>
						<img
							src={photo.file_url}
							alt={photo.alt}
							loading="lazy"
							decoding="async"
						/>
					</button>
				{/each}
			</div>
		{:else if photos.length === 4}
			<!-- 4 photos: 1 large hero left, 3 right (1 top, 2 bottom) -->
			<button
				type="button"
				class="mosaic-item cell-hero"
				onclick={() => openLightbox(0)}
				aria-label="View primary photo in fullscreen"
			>
				<img
					src={photos[0].file_url}
					alt={photos[0].alt}
					loading="eager"
					fetchpriority="high"
					decoding="sync"
				/>
			</button>
			<div class="mosaic-side-stack-3">
				<button
					type="button"
					class="mosaic-item cell-top-wide"
					onclick={() => openLightbox(1)}
					aria-label="View photo 2 in fullscreen"
				>
					<img
						src={photos[1].file_url}
						alt={photos[1].alt}
						loading="lazy"
						decoding="async"
					/>
				</button>
				<div class="side-bottom-row">
					{#each photos.slice(2, 4) as photo, idx}
						<button
							type="button"
							class="mosaic-item"
							onclick={() => openLightbox(idx + 2)}
							aria-label="View photo {idx + 3} in fullscreen"
						>
							<img
								src={photo.file_url}
								alt={photo.alt}
								loading="lazy"
								decoding="async"
							/>
						</button>
					{/each}
				</div>
			</div>
		{:else}
			<!-- 5+ photos: 1 large hero left + 4 secondary in 2x2 grid -->
			<button
				type="button"
				class="mosaic-item cell-hero"
				onclick={() => openLightbox(0)}
				aria-label="View primary photo in fullscreen"
			>
				<img
					src={photos[0].file_url}
					alt={photos[0].alt}
					loading="eager"
					fetchpriority="high"
					decoding="sync"
				/>
			</button>

			<div class="mosaic-grid-2x2">
				{#each photos.slice(1, 5) as photo, idx}
					<button
						type="button"
						class="mosaic-item secondary-photo"
						onclick={() => openLightbox(idx + 1)}
						aria-label="View photo {idx + 2} in fullscreen"
					>
						<img
							src={photo.file_url}
							alt={photo.alt}
							loading="lazy"
							decoding="async"
						/>
						{#if idx === 3 && photos.length > 5}
							<!-- "View all photos" button overlay on the 5th photo -->
							<div
								class="view-all-overlay"
								onclick={(e) => {
									e.stopPropagation();
									openLightbox(0);
								}}
								role="button"
								tabindex="0"
								onkeydown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault();
										e.stopPropagation();
										openLightbox(0);
									}
								}}
							>
								<span class="view-all-glass-btn">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="17"
										height="17"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									>
										<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
										<circle cx="12" cy="13" r="4"></circle>
									</svg>
									<span>View all {photos.length} photos</span>
								</span>
							</div>
						{/if}
					</button>
				{/each}
			</div>
		{/if}
	</section>

	<!-- ============================================================== -->
	<!-- MOBILE CAROUSEL (< 768px)                                      -->
	<!-- ============================================================== -->
	<section class="gallery-mobile" aria-label="Mobile Property Photo Carousel">
		<div class="carousel-container">
			{#if photos.length > 1}
				<!-- Floating badge counter -->
				<div class="mobile-counter-badge" aria-live="polite">
					{activeMobileIndex + 1} / {photos.length}
				</div>
			{/if}

			<!-- Native CSS scroll-snap track -->
			<div
				class="carousel-track"
				bind:this={carouselTrack}
				onscroll={handleCarouselScroll}
			>
				{#each photos as photo, index}
					<div
						class="carousel-slide"
						onclick={() => openLightbox(index)}
						role="button"
						tabindex="0"
						onkeydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								openLightbox(index);
							}
						}}
						aria-label="View photo {index + 1} in fullscreen"
					>
						<img
							src={photo.file_url}
							alt={photo.alt}
							loading={index === 0 ? 'eager' : 'lazy'}
							fetchpriority={index === 0 ? 'high' : 'low'}
							decoding={index === 0 ? 'sync' : 'async'}
						/>
					</div>
				{/each}
			</div>
		</div>

		<!-- Subtle dot indicators below image -->
		{#if photos.length > 1}
			<div class="carousel-dots-wrapper" role="tablist" aria-label="Photo dots">
				{#each photos.slice(0, Math.min(photos.length, 8)) as _, dotIdx}
					<button
						type="button"
						class="carousel-dot"
						class:active={activeMobileIndex === dotIdx}
						onclick={() => scrollToSlide(dotIdx)}
						aria-label="Go to photo {dotIdx + 1}"
					></button>
				{/each}
				{#if photos.length > 8}
					<span class="carousel-dots-overflow" title="{photos.length} total photos">• • •</span>
				{/if}
			</div>
		{/if}
	</section>

	<!-- ============================================================== -->
	<!-- ACCESSIBLE LIGHTBOX MODAL                                      -->
	<!-- ============================================================== -->
	{#if isLightboxOpen}
		<!-- svelte-ignore a11y_interactive_supports_focus -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div
			class="lightbox-backdrop"
			role="dialog"
			aria-modal="true"
			aria-label="Full-screen photo viewer"
			tabindex="-1"
			onclick={closeLightbox}
			ontouchstart={handleTouchStart}
			ontouchend={handleTouchEnd}
		>
			<!-- Top header bar -->
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="lightbox-header" role="toolbar" onclick={(e) => e.stopPropagation()}>
				<div class="lightbox-counter">
					Photo {activeLightboxIndex + 1} of {photos.length}
				</div>

				<Button
					type="button"
					size="icon"
					outline
					class="lightbox-close-btn"
					aria-label="Close photo viewer (Press Escape)"
					onclick={closeLightbox}
				>
					{#snippet icon()}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<line x1="18" y1="6" x2="6" y2="18"></line>
							<line x1="6" y1="6" x2="18" y2="18"></line>
						</svg>
					{/snippet}
				</Button>
			</div>

			<!-- Main content area -->
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="lightbox-body" role="presentation" onclick={(e) => e.stopPropagation()}>
				{#if photos.length > 1}
					<Button
						type="button"
						size="icon"
						outline
						class="lightbox-nav-btn prev"
						onclick={prevPhoto}
						aria-label="Previous photo (Left arrow)"
					>
						{#snippet icon()}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<polyline points="15 18 9 12 15 6"></polyline>
							</svg>
						{/snippet}
					</Button>
				{/if}

				<figure class="lightbox-stage">
					<img
						src={photos[activeLightboxIndex].file_url}
						alt={photos[activeLightboxIndex].alt}
						class="lightbox-image"
						decoding="sync"
					/>
					<figcaption class="lightbox-caption">
						{photos[activeLightboxIndex].alt}
					</figcaption>
				</figure>

				{#if photos.length > 1}
					<Button
						type="button"
						size="icon"
						outline
						class="lightbox-nav-btn next"
						onclick={nextPhoto}
						aria-label="Next photo (Right arrow)"
					>
						{#snippet icon()}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<polyline points="9 18 15 12 9 6"></polyline>
							</svg>
						{/snippet}
					</Button>
				{/if}
			</div>

			<!-- Bottom thumbnail preview bar (optional quick navigation) -->
			{#if photos.length > 1}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div class="lightbox-filmstrip" role="toolbar" onclick={(e) => e.stopPropagation()}>
					{#each photos as thumb, tIdx}
						<button
							type="button"
							class="filmstrip-thumb"
							class:active={tIdx === activeLightboxIndex}
							onclick={() => (activeLightboxIndex = tIdx)}
							aria-label="Jump to photo {tIdx + 1}"
						>
							<img src={thumb.file_url} alt="" loading="lazy" />
						</button>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	/* Root wrapper */
	.property-gallery-root {
		width: 100%;
		position: relative;
	}

	/* Reset button styles used as image tiles */
	button.mosaic-item {
		display: block;
		padding: 0;
		margin: 0;
		border: none;
		background: none;
		font: inherit;
		cursor: pointer;
		position: relative;
		overflow: hidden;
		width: 100%;
		height: 100%;
	}

	/* ============================================================== */
	/* DESKTOP MOSAIC GRID STYLING (>= 768px)                         */
	/* ============================================================== */
	.gallery-desktop {
		display: none;
	}

	@media (min-width: 768px) {
		.gallery-desktop {
			display: grid;
			gap: var(--size-2, 8px);
			height: 500px;
			max-height: 70vh;
			width: 100%;
			border-radius: var(--radius-3, 12px);
			overflow: hidden;
			background: var(--surface-2);
		}

		/* 1 photo */
		.gallery-desktop.count-1 {
			grid-template-columns: 1fr;
			height: 520px;
		}

		/* 2 photos */
		.gallery-desktop.count-2 {
			grid-template-columns: 1fr 1fr;
		}

		/* 3 photos */
		.gallery-desktop.count-3 {
			grid-template-columns: 1.25fr 1fr;
		}

		/* 4 photos */
		.gallery-desktop.count-4 {
			grid-template-columns: 1.25fr 1fr;
		}

		/* 5+ photos */
		.gallery-desktop.count-5 {
			grid-template-columns: 1.2fr 1fr;
		}

		.mosaic-item {
			position: relative;
			background: var(--surface-3);
			overflow: hidden;
		}

		.mosaic-item img {
			width: 100%;
			height: 100%;
			object-fit: cover;
			display: block;
			transition: transform var(--transition) cubic-bezier(0.16, 1, 0.3, 1), filter var(--transition) ease;
		}

		.mosaic-item:hover img {
			transform: scale(1.035);
			filter: brightness(1.04);
		}

		.mosaic-item:focus-visible {
			outline: 2px solid var(--accent);
			outline-offset: -2px;
			z-index: 2;
		}

		/* 3 Photos side stack */
		.mosaic-side-stack-2 {
			display: grid;
			grid-template-rows: 1fr 1fr;
			gap: var(--size-2, 8px);
			height: 100%;
		}

		/* 4 Photos side stack */
		.mosaic-side-stack-3 {
			display: grid;
			grid-template-rows: 1fr 1fr;
			gap: var(--size-2, 8px);
			height: 100%;
		}

		.side-bottom-row {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: var(--size-2, 8px);
			height: 100%;
		}

		/* 5+ Photos 2x2 grid */
		.mosaic-grid-2x2 {
			display: grid;
			grid-template-columns: 1fr 1fr;
			grid-template-rows: 1fr 1fr;
			gap: var(--size-2, 8px);
			height: 100%;
		}

		/* "View all photos" overlay button */
		.view-all-overlay {
			position: absolute;
			inset: 0;
			display: flex;
			align-items: flex-end;
			justify-content: flex-end;
			padding: var(--size-3, 16px);
			background: linear-gradient(
				to top,
				rgba(0, 0, 0, 0.5) 0%,
				rgba(0, 0, 0, 0.05) 50%,
				transparent 100%
			);
			pointer-events: auto;
		}

		.view-all-glass-btn {
			display: inline-flex;
			align-items: center;
			gap: 8px;
			padding: 8px 14px;
			font-size: 0.85rem;
			font-weight: 600;
			color: var(--text-1);
			background: transparent;
			backdrop-filter: blur(10px);
			-webkit-backdrop-filter: blur(10px);
			border: 1px solid var(--surface-3);
			border-radius: var(--radius-round, 9999px);
			box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
			transition: all var(--transition) ease;
		}

		.view-all-overlay:hover .view-all-glass-btn {
			background: var(--surface-2);
			border-color: var(--accent);
			color: var(--accent);
			transform: translateY(-2px);
			box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
		}
	}

	/* ============================================================== */
	/* MOBILE CAROUSEL STYLING (< 768px)                              */
	/* ============================================================== */
	.gallery-mobile {
		display: block;
		width: 100%;
	}

	@media (min-width: 768px) {
		.gallery-mobile {
			display: none;
		}
	}

	.carousel-container {
		position: relative;
		width: 100%;
		border-radius: var(--radius-2, 8px);
		overflow: hidden;
		background: var(--surface-2);
	}

	.mobile-counter-badge {
		position: absolute;
		top: var(--size-2, 10px);
		right: var(--size-2, 10px);
		background: var(--surface-2);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		color: var(--text-1);
		font-size: 0.78rem;
		font-weight: 600;
		padding: 4px 10px;
		border-radius: var(--radius-round, 9999px);
		z-index: 2;
		pointer-events: none;
		border: 1px solid var(--surface-3);
		letter-spacing: 0.5px;
	}

	.carousel-track {
		display: flex;
		overflow-x: auto;
		scroll-snap-type: x mandatory;
		overscroll-behavior-x: contain;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
		width: 100%;
	}

	.carousel-track::-webkit-scrollbar {
		display: none;
	}

	.carousel-slide {
		flex: 0 0 100%;
		width: 100%;
		aspect-ratio: 4 / 3;
		scroll-snap-align: start;
		scroll-snap-stop: always;
		position: relative;
		cursor: pointer;
		overflow: hidden;
	}

	.carousel-slide img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.carousel-dots-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		margin-top: var(--size-2, 10px);
		padding: 4px 0;
	}

	.carousel-dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--surface-4);
		border: none;
		padding: 0;
		cursor: pointer;
		transition: all var(--transition) ease;
	}

	.carousel-dot.active {
		background: var(--accent);
		width: 18px;
		border-radius: var(--radius-round, 9999px);
	}

	.carousel-dots-overflow {
		font-size: 0.7rem;
		color: var(--text-2);
		letter-spacing: 1px;
		margin-left: 2px;
	}

	/* ============================================================== */
	/* ACCESSIBLE LIGHTBOX MODAL STYLING                              */
	/* ============================================================== */
	.lightbox-backdrop {
		position: fixed;
		inset: 0;
		z-index: 10000;
		background: color-mix(in srgb, var(--surface-1) 94%, transparent);
		backdrop-filter: blur(14px);
		-webkit-backdrop-filter: blur(14px);
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		animation: lightboxFadeIn var(--transition) cubic-bezier(0.16, 1, 0.3, 1);
		user-select: none;
	}

	@keyframes lightboxFadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.lightbox-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--size-3) var(--size-4);
		color: var(--text-1);
		z-index: 2;
	}

	.lightbox-counter {
		font-size: 0.92rem;
		font-weight: 500;
		color: var(--text-2);
		letter-spacing: 0.3px;
	}

	:global(.lightbox-close-btn.button) {
		color: var(--text-1);
		background: transparent;
		transition: all var(--transition) ease;
	}

	:global(.lightbox-close-btn.button:hover) {
		border-color: var(--accent);
		color: var(--accent);
		background: var(--surface-2);
	}

	.lightbox-body {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: space-between;
		position: relative;
		padding: 0 var(--size-2, 12px);
		max-height: calc(100vh - 160px);
		overflow: hidden;
	}

	.lightbox-stage {
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		max-width: 90vw;
		max-height: 100%;
	}

	.lightbox-image {
		max-width: 86vw;
		max-height: calc(100vh - 200px);
		width: auto;
		height: auto;
		object-fit: contain;
		border-radius: var(--radius-2, 8px);
		border: 1px solid var(--surface-3);
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
		animation: photoZoom var(--transition) cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes photoZoom {
		from {
			opacity: 0.6;
			transform: scale(0.97);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	.lightbox-caption {
		margin-top: 10px;
		color: var(--text-2);
		font-size: 0.85rem;
		text-align: center;
		max-width: 70ch;
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
	}

	:global(.lightbox-nav-btn.button) {
		color: var(--text-1);
		background: transparent;
		transition: all var(--transition) ease;
		z-index: 2;
	}

	:global(.lightbox-nav-btn.button:hover) {
		border-color: var(--accent);
		color: var(--accent);
		background: var(--surface-2);
	}

	@media (max-width: 640px) {
		:global(.lightbox-nav-btn.button) {
			position: absolute !important;
			top: 50% !important;
			transform: translateY(-50%) !important;
			z-index: 10 !important;
		}
		:global(.lightbox-nav-btn.button.prev) {
			left: 8px !important;
		}
		:global(.lightbox-nav-btn.button.next) {
			right: 8px !important;
		}
		.lightbox-image {
			max-width: 95vw;
		}
	}

	/* Bottom filmstrip thumbnail scroller */
	.lightbox-filmstrip {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: var(--size-2, 10px) var(--size-4, 20px) var(--size-3, 14px);
		overflow-x: auto;
		scrollbar-width: thin;
		scrollbar-color: var(--surface-3) transparent;
		justify-content: center;
		z-index: 2;
	}

	.lightbox-filmstrip::-webkit-scrollbar {
		height: 4px;
	}
	.lightbox-filmstrip::-webkit-scrollbar-thumb {
		background: var(--surface-3);
		border-radius: 4px;
	}

	.filmstrip-thumb {
		flex: 0 0 54px;
		width: 54px;
		height: 40px;
		border-radius: var(--radius-1, 4px);
		overflow: hidden;
		border: 1px solid var(--surface-3);
		padding: 0;
		background: transparent;
		cursor: pointer;
		opacity: 0.55;
		transition: all var(--transition) ease;
	}

	.filmstrip-thumb:hover {
		opacity: 0.9;
		border-color: var(--accent);
	}

	.filmstrip-thumb.active {
		opacity: 1;
		border-color: var(--accent);
		transform: scale(1.06);
	}

	.filmstrip-thumb img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
</style>
