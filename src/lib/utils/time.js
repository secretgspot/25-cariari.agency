export function ago(val) {
	val = 0 | (Date.now() - val) / 1000;
	var unit, length = {
		sec: 60, min: 60, horas: 24, días: 7, semanas: 4.35,
		meses: 12, años: 10000
	}, result;

	for (unit in length) {
		result = val % length[unit];
		if (!(val = 0 | val / length[unit]))
			return `${result} ${unit}`;
	}
}
// ago(new Date('2010-10-11T01:46:25.251Z')); // '8 years'