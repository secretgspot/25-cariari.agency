// should match all numbers or empty
export function isNumber(val) {
	// return typeof val === 'number' && val.length !== 0;
	return new RegExp("^[0-9]*$").test(val);
}

// should match 1234-5678, 12345678, 1234 5678 or empty
export function isValidPhone(val) {
	return new RegExp("^(([0-9]{4})[- ]*([0-9]{4})?)*$").test(val);
}

export function isValidEmail(val) {
	return new RegExp("[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?").test(val);
}

export function emailValidator() {
	return function email(value) {
		return (value && !!value.match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) || 'Please enter a valid email'
	}
}

export function requiredValidator() {
	return function required(value) {
		return (value !== undefined && value !== null && value !== '') || '✱'
	}
}