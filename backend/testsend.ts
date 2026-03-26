import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_PORT === '465',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

async function test() {
    try {
        console.log("Sending email to:", process.env.SMTP_USER);
        const info = await transporter.sendMail({
            from: `"Aura Test" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER,
            subject: "Aura Test Email",
            text: "Does this actually arrive in the inbox?",
        });
        console.log("Success! Message ID:", info.messageId);
        console.log("Response:", info.response);
    } catch (e) {
        console.error("FAIL:", e);
    }
}
test();
