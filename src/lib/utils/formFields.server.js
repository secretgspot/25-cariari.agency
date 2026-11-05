const htmlEntities = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;',
};

export function readTextField(formData, name, { required = true, maxLength = 5000 } = {}) {
	const value = formData.get(name);
	if (value === null && !required) return '';
	if (typeof value !== 'string') return null;

	const text = value.trim();
	if ((required && !text) || text.length > maxLength) return null;
	return text;
}

export function isValidEmail(email) {
	return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function escapeHtml(value) {
	return String(value).replace(/[&<>"']/g, (character) => htmlEntities[character]);
}
