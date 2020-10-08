// import { transporter } from './emailTransporter';
import nodemailer from 'nodemailer';

type EmailInput = {
	to: string;
	subject: string;
	html: string;
};

// export const sendEmail = ({ to, subject, html }: EmailInput) => {
// 	transporter.sendMail(
// 		{
// 			to,
// 			subject,
// 			from: 'no-reply@mydomain.com',
// 			html
// 		},
// 		(err, _) => {
// 			if (err) {
// 				console.log(err);
// 			}
// 		}
// 	);
// };

// async..await is not allowed in global scope, must use a wrapper
export const sendEmail = async ({ html, subject, to }: EmailInput) => {
	// Generate test SMTP service account from ethereal.email
	// Only needed if you don't have a real mail account for testing
	let testAccount = await nodemailer.createTestAccount();
	// console.log(testAccount);

	// create reusable transporter object using the default SMTP transport
	let transporter = nodemailer.createTransport({
		host: 'smtp.ethereal.email',
		port: 587,
		secure: false, // true for 465, false for other ports
		auth:
			{
				user: 'hfhz3goc5r4fyyuy@ethereal.email', // generated ethereal user
				pass: 'SMaVRq3cGV7NUVBpDZ' // generated ethereal password
			},
		tls:
			{
				rejectUnauthorized: false
			}
	});

	// send mail with defined transport object
	let info = await transporter.sendMail({
		from: '"Fred Foo 👻" <foo@example.com>', // sender address
		to, // list of receivers
		subject, // Subject line
		html // html body
	});

	console.log('Message sent: %s', info.messageId);
	// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

	// Preview only available when sending through an Ethereal account
	console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
	// Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
};
