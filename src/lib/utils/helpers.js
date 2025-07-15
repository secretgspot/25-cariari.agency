export function isEmpty(val) {
	if (val === null || typeof val === 'undefined') {
		return true; // null or undefined are considered empty
	}
	if (typeof val === 'object') {
		return Object.keys(val).length === 0;
	}
	if (typeof val === 'string') {
		return val.trim().length === 0;
	}
	if (typeof val === 'number') {
		return false; // A number is not empty in this context
	}
	if (val instanceof Array) {
		return val.length === 0;
	}
	return false; // Default for other types
}

export const pickFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const ranNumberBetween = (min, max) => min + Math.random() * (max - min);

export const randomString = (() => {
	const gen = (min, max) => max++ && [...Array(max - min)].map((s, i) => String.fromCharCode(min + i));
	const sets = {
		num: gen(48, 57),
		alphaLower: gen(97, 122),
		alphaUpper: gen(65, 90),
	};
	function* iter(len, set) {
		if (set.length < 1) set = Object.values(sets).flat();
		for (let i = 0; i < len; i++) yield set[Math.random() * set.length | 0]
	}
	return Object.assign(((len, ...set) => [...iter(len, set.flat())].join('')), sets);
	// console.log(randomString(20)); // hcy4ln2FX91R7UMLBNao
	// console.log(randomString(20, randomString.alphaLower)); // cpjbkwvslxsofzvkekcw
})();



export const animationsComplete = (element) =>
	Promise.allSettled(element.getAnimations().map((animation) => animation.finished));

// from https://davidwalsh.name/javascript-debounce-function
// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
export const debounce = (func, wait, immediate) => {
	var timeout;
	return function () {
		var context = this,
			args = arguments;
		var later = function () {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

// Abreviate string
export const abreviate = (text) => {
	if (typeof text != 'string' || !text) {
		return '';
	}
	const acronym = text
		.match(/[\p{Alpha}\p{Nd}]+/gu)
		.reduce((previous, next) => previous + ((+next === 0 || parseInt(next)) ? parseInt(next) : next[0] || ''), '')
		.toUpperCase();
	return acronym;
}

// formatter.format(number); // $2345
export let formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumSignificantDigits: 3
});


export function ago(val) {
	val = 0 | (new Date() - new Date(val + 'Z')) / 1000;
	var unit, length = {
		sec: 60, min: 60, h: 24, d: 7, w: 4.35,
		m: 12, y: 10000
	}, result;

	for (unit in length) {
		result = val % length[unit];
		if (!(val = 0 | val / length[unit]))
			return result + unit;
	}
}
// ago(new Date('2010-10-11T01:46:25.251Z')); // '8 years'


// PAD NUMBER
export function pad(n, width, z) {
	z = z || '0';
	n = n + '';
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}
// pad(10, 4);      // 0010
// pad(9, 4);       // 0009
// pad(123, 4);     // 0123

// pad(10, 4, '-'); // --10

// Get GPS
export const getPosition = async (property, gps) => {
	if (navigator.geolocation) {
		const optionsHighAccuracy = {
			enableHighAccuracy: true,
			timeout: 5000,
			maximumAge: 0,
		};
		const optionsLowAccuracy = {
			enableHighAccuracy: false,
			timeout: 5000,
			maximumAge: 0,
		};

		// Try with high accuracy first
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				console.log('📍 High Accuracy:', pos);
				property.location.lat = pos.coords.latitude;
				property.location.lng = pos.coords.longitude;
			},
			(err) => {
				console.warn('💩 High Accuracy Error:', err);
				if (err.code === err.POSITION_UNAVAILABLE || err.code === err.TIMEOUT) {
					console.log('Retrying with low accuracy...');
					// If high accuracy fails, try with low accuracy
					navigator.geolocation.getCurrentPosition(
						(pos) => {
							console.log('📍 Low Accuracy:', pos);
							property.location.lat = pos.coords.latitude;
							property.location.lng = pos.coords.longitude;
							gps(pos.coords);
						},
						(errLow) => console.warn('💩 Low Accuracy Error:', errLow),
						optionsLowAccuracy,
					);
				} else {
					// Handle other errors like PERMISSION_DENIED
					console.log('📍 Geolocation Error:', err.message);
				}
			},
			optionsHighAccuracy,
		);
	} else {
		console.log('YOUR BROWSER DOESN"T SUPPORT GEOLOCATION'); // Corrected typo
	}
}

// Functions for FEATURES input component on add and edit pages
export function addFeature(input, form) {
	if (input.value == '') return;
	const newFeatures = input.value.split(',').map((feature) => feature.trim()).filter((feature) => feature !== '');
	form.features = [...(form?.features ?? []), ...newFeatures];
	input.value = '';
}
export function removeFeature(index, form) {
	form.features = [...form.features.slice(0, index), ...form.features.slice(index + 1)];
}

export function enter(node, callback) {
	function onkeydown(event) {
		if (event.which === 13) callback(node);
	}
	node.addEventListener('keydown', onkeydown);
	return {
		destroy() {
			node.removeEventListener('keydown', onkeydown);
		},
	};
}
