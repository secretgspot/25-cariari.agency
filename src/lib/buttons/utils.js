const propToClass = {
	size: (pf, val) => `${pf}-${val}`,
	type: (pf, val) => `${pf}-${val}`,
	outline: () => `outline`,
	right: () => `right`,
	shadow: () => `shadow`,
};

function omit(obj, properties) {
	return Object.fromEntries(
		Object.entries(obj)
			.filter(([key, _val]) => !properties.includes(key))
	);
}

export function computeClasses(elPrefix, props) {
	return Object.entries(props)
		.filter(([_prop, val]) => val)
		.map(([prop, val]) => propToClass[prop](elPrefix, val))
		.join(' ');
};

export function getDomAttributes({ props, classes, toOmit = [] }) {
	return {
		...omit(props, toOmit), class: classes
	};
}