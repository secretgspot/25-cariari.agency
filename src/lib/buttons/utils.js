const propToClass = {
	size: (pf, val) => `${pf}-${val}`,
	type: (pf, val) => `${pf}-${val}`,
	outline: (_pf, _val) => `outline`,
	right: (_pf, _val) => `right`,
	shadow: (_pf, _val) => `shadow`,
};

function omit(obj, properties) {
	return Object.fromEntries(
		Object.entries(obj)
			.filter(([key, _val]) => !properties.includes(key))
	);
}

export function computeClasses(elPrefix, props) {
	return Object.entries(props)
		.map(([prop, val]) => {
			if (propToClass[prop] && val) {
				return propToClass[prop](elPrefix, val);
			}
			return '';
		})
		.filter(Boolean)
		.join(' ');
};

export function getDomAttributes({ props, classes, toOmit = [] }) {
	return {
		...omit(props, toOmit), class: classes
	};
}