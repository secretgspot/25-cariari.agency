import { VITE_GOOGLE_EMAIL } from '$env/static/private';
import transporter from "$lib/utils/emailSetup.server.js";

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	return {};
};

export const actions = {
	// default: async ({ request }) => {
	// 	const formData = await request.formData();
	// 	const data = Object.fromEntries(formData);
	// 	// return { data };
	// 	console.log('Form data:', data);
	// }
	default: async ({ request }) => {
		try {
			const formData = await request.formData();
			const email = formData.get("email");
			const name = formData.get("name");
			const body = formData.get("message");

			let html = `
				<div style="font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #333333;">
						<h3 style="color: #000000; font-size: 20px; margin-bottom: 15px;">New message from Cariari.Agency Contact Form</h3>

						<p style="margin-bottom: 8px;"><strong>From:</strong> <span style="color: #000000;">${name}</span></p>
						<p style="margin-bottom: 20px;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #C49A2F; text-decoration: none;">${email}</a></p>

						<div style="background-color: #f8f8f8; border: 1px solid #e0e0e0; padding: 15px; border-radius: 5px; margin-top: 15px; word-wrap: break-word;">
								${body}
						</div>

						<p style="margin-top: 20px; font-size: 14px; color: #777777;">This message was sent via the contact form on your website.</p>
				</div>
			`;

			const message = {
				from: VITE_GOOGLE_EMAIL,
				to: "secretgspot@gmail.com",
				subject: `Cariari.Agency message from ${name}, ${email}`,
				text: body,
				html: html,
			};

			const sendEmail = async (message) => {
				await new Promise((resolve, reject) => {
					transporter.sendMail(message, (error, info) => {
						if (error) {
							console.error("Error sending email:", error);
							reject(error);
						} else {
							console.log("Email sent:", info.response);
							resolve(info);
						}
					});
				});
			}

			await sendEmail(message);

			return { success: true };
		} catch (error) {
			console.error("Error:", error);
			return { error: true, success: false };
		}
	}
};