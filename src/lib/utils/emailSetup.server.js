import nodemailer from 'nodemailer';
import { VITE_GOOGLE_EMAIL, VITE_GOOGLE_EMAIL_PASSWORD } from '$app/env/private';

let transporter = nodemailer.createTransport({
	host: 'smtp.gmail.com',
	port: 587,
	secure: false, // true for 465, false for other ports
	auth: {
		user: VITE_GOOGLE_EMAIL,
		pass: VITE_GOOGLE_EMAIL_PASSWORD,
	},
});

transporter.verify((error, success) => {
	if (error) {
		console.log('📮 Server error: ', error);
	} else {
		console.log('📮 Server is ready to take messages');
	}
});

export default transporter;
