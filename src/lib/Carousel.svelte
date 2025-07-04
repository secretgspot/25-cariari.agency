<script>
	/**
	 * Carousel component for Svelte 5
	 *
	 * Example usage:
	 * <Carousel slides={[{ file_url: 'image1.jpg' }, { file_url: 'image2.jpg' }]} />
	 * <Carousel slides={data.property.photos} />
	 *
	 * Props:
	 * @param {{ file_url: string }[]} slides - An array of objects, each with a `file_url` property.
	 */
	let { slides = [] } = $props();
	let slidesRef;

	function goto(index) {
		if (slidesRef) {
			const slideWidth = slidesRef.querySelector('div').clientWidth;
			slidesRef.scrollTo({
				left: slideWidth * index,
				behavior: 'smooth',
			});
		}
	}
</script>

<div class="slider">
	<div class="slides" bind:this={slidesRef}>
		{#each slides as slide, i}
			<div id="slide-{i}">
				<img src={slide.file_url} alt="slide {i + 1}" />
			</div>
		{/each}
	</div>

	<div class="navigation">
		{#each slides as _, i}
			<button onclick={() => goto(i)}>{i + 1}</button>
		{/each}
	</div>
</div>

<style>
	.slider {
		width: 100%;
		text-align: center;
		overflow: hidden;
	}

	.slides {
		display: flex;
		overflow-x: auto;
		scroll-snap-type: x mandatory;
		scroll-behavior: smooth;
		-webkit-overflow-scrolling: touch;
	}

	.slides::-webkit-scrollbar {
		width: 10px;
		height: 10px;
	}

	.slides::-webkit-scrollbar-thumb {
		background: black;
		border-radius: 10px;
	}

	.slides::-webkit-scrollbar-track {
		background: transparent;
	}

	.slides > div {
		scroll-snap-align: start;
		flex-shrink: 0;
		width: 100%;
		height: 450px;
		border-radius: 10px;
		background: #eee;
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	img {
		object-fit: cover;
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

	.navigation {
		margin-top: 0.5rem;
	}

	.navigation button {
		display: inline-flex;
		width: 1.5rem;
		height: 1.5rem;
		background: white;
		text-decoration: none;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		margin: 0 0.25rem;
		border: none;
		cursor: pointer;
	}

	.navigation button:active {
		position: relative;
		top: 1px;
	}

	.navigation button:focus {
		background: #000;
		color: white;
	}
</style>
