import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

async function main() {
    try {
        console.log("Attempting to connect with:", process.env.SMTP_USER, process.env.SMTP_PASS?.substring(0, 4) + '...');
        const verify = await transporter.verify();
        console.log("SMTP Connection verified:", verify);

        const info = await transporter.sendMail({
            from: '"Aura Platform Test" <' + process.env.SMTP_USER + '>',
            to: process.env.SMTP_USER, // Send to self
            subject: "Test Email from Aura",
            text: "This is a test email.",
        });

        console.log("Message sent: %s", info.messageId);
    } catch (err) {
        console.error("Failed to send email:", err);
    }
}

main();
