import { escapeHtml } from './formFields.server.js';

function renderEmail({ title, content, footer }) {
	return `
		<div style="font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #333333;">
			<h3 style="color: #000000; font-size: 20px; margin-bottom: 15px;">${escapeHtml(title)}</h3>
			${content}
			<p style="margin-top: 20px; font-size: 14px; color: #777777;">${escapeHtml(footer)}</p>
		</div>
	`;
}

function renderMessage(message) {
	return `<div style="background-color: #f8f8f8; border: 1px solid #e0e0e0; padding: 15px; border-radius: 5px; margin-top: 15px; word-wrap: break-word; white-space: pre-wrap;">${escapeHtml(message || 'No message provided')}</div>`;
}

export function createContactEmail({ name, email, message }) {
	const safeName = escapeHtml(name);
	const safeEmail = escapeHtml(email);

	return {
		subject: `Cariari.Agency message from ${name}, ${email}`,
		text: `New message from Cariari.Agency Contact Form\nFrom: ${name}\nEmail: ${email}\n\n${message || 'No message provided'}`,
		html: renderEmail({
			title: 'New message from Cariari.Agency Contact Form',
			content: `
				<p style="margin-bottom: 8px;"><strong>From:</strong> <span style="color: #000000;">${safeName}</span></p>
				<p style="margin-bottom: 20px;"><strong>Email:</strong> <a href="mailto:${safeEmail}" style="color: #C49A2F; text-decoration: none;">${safeEmail}</a></p>
				${renderMessage(message)}
			`,
			footer: 'This message was sent via the contact form on your website.',
		}),
	};
}

export function createInquiryEmail({ msl, agentName, name, email, phone, message }) {
	const safeMsl = escapeHtml(msl);
	const safeAgentName = escapeHtml(agentName);
	const safeName = escapeHtml(name);
	const safeEmail = escapeHtml(email);
	const safePhone = escapeHtml(phone);

	return {
		subject: `New Inquiry for Property ${msl}`,
		text: [
			'New Property Inquiry',
			`Property: ${msl}`,
			`Listing Agent: ${agentName}`,
			`From: ${name} (${email})`,
			`Phone: ${phone}`,
			'Message:',
			message || 'No message provided',
		].join('\n'),
		html: renderEmail({
			title: 'New Property Inquiry',
			content: `
				<p style="margin-bottom: 8px;"><strong>Property:</strong> <span style="color: #000000;">${safeMsl}</span></p>
				<p style="margin-bottom: 8px;"><strong>Listing Agent:</strong> <span style="color: #000000;">${safeAgentName}</span></p>
				<p style="margin-bottom: 20px;"><strong>From:</strong> <span style="color: #000000;">${safeName}</span> (${safeEmail})</p>
				<p style="margin-bottom: 8px;"><strong>Phone:</strong> <span style="color: #000000;">${safePhone}</span></p>
				<p style="margin-bottom: 8px;"><strong>Message:</strong></p>
				${renderMessage(message)}
			`,
			footer: 'This message was sent via the inquiry form on your website.',
		}),
	};
}
