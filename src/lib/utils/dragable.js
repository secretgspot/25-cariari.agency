export function dragable(node) {

	let isDown = false;
	let startX;
	let scrollLeft;

	const end = () => {
		// 		console.log('END TRIGGERED');
		isDown = false;
		node.classList.remove('active');
	}

	const start = (e) => {
		// 		console.log('START TRIGGERED');
		isDown = true;
		node.classList.add('active');
		startX = e.pageX || e.touches[0].pageX - node.offsetLeft;
		scrollLeft = node.scrollLeft;
	}

	const move = (e) => {
		// 		console.log('MOVE TRIGGERED');
		if (!isDown) return;

		e.preventDefault();
		const x = e.pageX || e.touches[0].pageX - node.offsetLeft;
		const dist = (x - startX);
		node.scrollLeft = scrollLeft - dist;
	}

	// the node has been mounted in the DOM
	if (window.matchMedia("(min-width: 767px)").matches) {
		node.addEventListener('mousedown', start);
		node.addEventListener('touchstart', start);

		node.addEventListener('mousemove', move);
		node.addEventListener('touchmove', move);

		node.addEventListener('mouseleave', end);
		node.addEventListener('mouseup', end);
		node.addEventListener('touchend', end);
	}

	return {
		destroy() {
			// the node has been removed from the DOM
			if (window.matchMedia("(min-width: 767px)").matches) {
				node.removeEventListener('mousedown', start);
				node.removeEventListener('touchstart', start);
				node.removeEventListener('mousemove', move);
				node.removeEventListener('touchmove', move);
				node.removeEventListener('mouseleave', end);
				node.removeEventListener('mouseup', end);
				node.removeEventListener('touchend', end);
			}
		}
	};
}


