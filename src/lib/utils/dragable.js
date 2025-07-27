// dragable.js
/*
 * playground: https://svelte.dev/playground/9df3d1798d434d3cb6c19cfc0cf67e7c?version=latest
 * Dragable utility for Svelte components
 * Allows elements to be dragged horizontally or vertically with customizable options.
 * Supports touch and mouse events, responsive behavior, and customizable thresholds.
 * Usage:
 * import { dragable } from 'path/to/dragable.js';
 * <div class="scroll-container" use:dragable></div>
*/

export function dragable(node, options = {}) {
	const {
		axis = 'x', // 'x', 'y', or 'both'
		threshold = 5,
		disabled = false,
		cursor = 'grab',
		activeCursor = 'grabbing',
		activeClass = 'dragging',
		onDragStart = () => { },
		onDragMove = () => { },
		onDragEnd = () => { },
		minWidth = 767 // minimum screen width to enable dragging
	} = options;

	let state = {
		isDragging: false,
		startX: 0,
		startY: 0,
		initialScrollLeft: 0,
		initialScrollTop: 0,
		hasMoved: false
	};

	let isEnabled = false;

	// Check if dragging should be enabled based on screen size
	const checkScreenSize = () => {
		isEnabled = !disabled && window.matchMedia(`(min-width: ${minWidth}px)`).matches;
		updateCursor();
	};

	const updateCursor = () => {
		if (isEnabled) {
			node.style.cursor = state.isDragging ? activeCursor : cursor;
		} else {
			node.style.cursor = '';
		}
	};

	const getEventCoords = (e) => {
		if (e.touches && e.touches[0]) {
			return { x: e.touches[0].clientX, y: e.touches[0].clientY };
		}
		return { x: e.clientX, y: e.clientY };
	};

	const handleStart = (e) => {
		if (!isEnabled) return;

		const coords = getEventCoords(e);

		state.isDragging = true;
		state.hasMoved = false;
		state.startX = coords.x;
		state.startY = coords.y;
		state.initialScrollLeft = node.scrollLeft;
		state.initialScrollTop = node.scrollTop;

		node.classList.add(activeClass);
		updateCursor();

		// Prevent text selection during drag
		e.preventDefault();

		onDragStart(e, state);
	};

	const handleMove = (e) => {
		if (!isEnabled || !state.isDragging) return;

		const coords = getEventCoords(e);
		const deltaX = coords.x - state.startX;
		const deltaY = coords.y - state.startY;

		// Check if we've moved beyond the threshold
		if (!state.hasMoved && (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold)) {
			state.hasMoved = true;
		}

		if (state.hasMoved) {
			e.preventDefault();

			// Apply scrolling based on axis setting
			if (axis === 'x' || axis === 'both') {
				node.scrollLeft = state.initialScrollLeft - deltaX;
			}
			if (axis === 'y' || axis === 'both') {
				node.scrollTop = state.initialScrollTop - deltaY;
			}

			onDragMove(e, { ...state, deltaX, deltaY });
		}
	};

	const handleEnd = (e) => {
		if (!isEnabled) return;

		const wasDragging = state.isDragging;
		state.isDragging = false;

		node.classList.remove(activeClass);
		updateCursor();

		if (wasDragging) {
			onDragEnd(e, state);
		}
	};

	// Media query listener for responsive behavior
	const mediaQuery = window.matchMedia(`(min-width: ${minWidth}px)`);
	const handleMediaChange = () => checkScreenSize();

	// Event listeners
	const addEventListeners = () => {
		// Mouse events
		node.addEventListener('mousedown', handleStart, { passive: false });
		document.addEventListener('mousemove', handleMove, { passive: false });
		document.addEventListener('mouseup', handleEnd);

		// Touch events
		node.addEventListener('touchstart', handleStart, { passive: false });
		document.addEventListener('touchmove', handleMove, { passive: false });
		document.addEventListener('touchend', handleEnd);

		// Prevent context menu on long press
		node.addEventListener('contextmenu', (e) => {
			if (state.hasMoved) e.preventDefault();
		});

		// Media query listener
		mediaQuery.addEventListener('change', handleMediaChange);
	};

	const removeEventListeners = () => {
		node.removeEventListener('mousedown', handleStart);
		document.removeEventListener('mousemove', handleMove);
		document.removeEventListener('mouseup', handleEnd);

		node.removeEventListener('touchstart', handleStart);
		document.removeEventListener('touchmove', handleMove);
		document.removeEventListener('touchend', handleEnd);

		node.removeEventListener('contextmenu', (e) => {
			if (state.hasMoved) e.preventDefault();
		});

		mediaQuery.removeEventListener('change', handleMediaChange);
	};

	// Initialize
	checkScreenSize();
	addEventListeners();

	return {
		update(newOptions = {}) {
			// Merge new options
			Object.assign(options, newOptions);
			checkScreenSize();
		},
		destroy() {
			removeEventListeners();
			// Reset styles
			node.style.cursor = '';
			node.classList.remove(activeClass);
		}
	};
}