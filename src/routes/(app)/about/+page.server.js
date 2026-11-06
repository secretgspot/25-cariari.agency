import { VITE_GOOGLE_EMAIL } from "$app/env/private";
import transporter from "#lib/utils/emailSetup.server.js";
import { createContactEmail } from '#lib/utils/emailTemplates.server.js';
import { applyRateLimit } from '#lib/utils/rateLimit.js';
import { isValidEmail, readTextField } from '#lib/utils/formFields.server.js';
import { fail } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	return {};
};

export const actions = {
	default: async ({ request }) => {
		let senderName = 'unknown';
		let senderEmail = 'unknown';

		try {
			// Rate limiting check (max 3 contact submissions per hour per client)
			const rateLimit = applyRateLimit(request, 'contact');
			if (!rateLimit.allowed) {
				console.warn('🚦 Contact form rate limit reached');
				const minutes = Math.ceil(rateLimit.retryAfter / 60);
				return fail(429, {
					rateLimited: true,
					message: `Too many messages sent. Please wait ${minutes} minute${minutes === 1 ? '' : 's'} before trying again.`
				});
			}

			const formData = await request.formData();
			const name = readTextField(formData, 'name', { maxLength: 200 });
			const email = readTextField(formData, 'email', { maxLength: 254 });
			const body = readTextField(formData, 'message', { required: false });
			senderName = name || senderName;
			senderEmail = email || senderEmail;

			if (
				!name ||
				/[\u0000-\u001f\u007f]/.test(name) ||
				!email ||
				!isValidEmail(email) ||
				body === null
			) {
				console.warn('❌ Contact form rejected: invalid contact details');
				return fail(400, { error: true, message: 'Please provide a valid name and email address.' });
			}

			const message = {
				from: VITE_GOOGLE_EMAIL,
				to: VITE_GOOGLE_EMAIL,
				...createContactEmail({ name, email, message: body }),
			};

			const sendEmail = async (message) => {
				await new Promise((resolve, reject) => {
					transporter.sendMail(message, (error, info) => {
						if (error) {
							reject(error);
						} else {
							resolve(info);
						}
					});
				});
			}

			await sendEmail(message);
			console.log(`✉️ Contact form email sent from ${senderName} <${senderEmail}>`);

			return { success: true };
		} catch (error) {
			console.error(`❌ Contact form email failed from ${senderName} <${senderEmail}>:`, error.message);
			return fail(500, { error: true, message: 'Unable to send your message. Please try again.' });
		}
	}
};
