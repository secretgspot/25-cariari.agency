import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { escapeHtml, isValidEmail, readTextField } from './formFields.server.js';
import { createContactEmail, createInquiryEmail } from './emailTemplates.server.js';

describe('form field helpers', () => {
	it('HTML-escapes special characters in text and attribute values', () => {
		assert.equal(
			escapeHtml(`<&>"'`),
			'&lt;&amp;&gt;&quot;&#39;',
		);
	});

	it('trims text and rejects missing, non-text, and overlong values', () => {
		const formData = new FormData();
		formData.set('name', '  Ada  ');
		formData.set('long', '12345');
		formData.set('optional', '');
		formData.set('file', new Blob(['content']), 'file.txt');

		assert.equal(readTextField(formData, 'name', { maxLength: 3 }), 'Ada');
		assert.equal(readTextField(formData, 'missing'), null);
		assert.equal(readTextField(formData, 'long', { maxLength: 4 }), null);
		assert.equal(readTextField(formData, 'file'), null);
		assert.equal(readTextField(formData, 'optional', { required: false }), '');
		assert.equal(readTextField(formData, 'missing-optional', { required: false }), '');
	});

	it('accepts ordinary emails and rejects malformed or oversized values', () => {
		assert.equal(isValidEmail('agent@example.com'), true);
		assert.equal(isValidEmail('not-an-email'), false);
		assert.equal(isValidEmail(`${'a'.repeat(250)}@example.com`), false);
	});

	it('renders contact and inquiry emails from shared templates with escaped content', () => {
		const contact = createContactEmail({
			name: '<img src=x onerror=alert(1)>',
			email: 'agent@example.com',
			message: '<script>alert(1)</script>',
		});
		const inquiry = createInquiryEmail({
			msl: 'CR-001',
			agentName: 'Agent',
			name: 'Buyer',
			email: 'buyer@example.com',
			phone: '555-0100',
			message: '<script>alert(1)</script>',
		});

		assert.match(contact.html, /&lt;img src=x onerror=alert\(1\)&gt;/);
		assert.match(contact.html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
		assert.match(inquiry.html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
		assert.equal(contact.text.includes('<script>'), true);
		assert.equal(inquiry.text.includes('<script>'), true);
		assert.match(contact.subject, /agent@example\.com/);
		assert.match(inquiry.subject, /CR-001/);
	});
});
