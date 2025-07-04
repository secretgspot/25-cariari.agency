export function isEmpty(val) {
	let valType = typeof val;

	if (valType === 'object') return Object.keys(val || {}).length === 0;
	if (valType === 'string') return val.trim().length === 0;
	if (valType === 'number') return val.length === 0;
	if (val instanceof Array) return val.length === 0;
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
	val = 0 | (Date.now() - val) / 1000;
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