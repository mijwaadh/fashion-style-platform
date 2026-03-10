import nodemailer from 'nodemailer';

// Create a generic transporter
// In development, we use Ethereal (a fake SMTP service for testing) or simply log to console.
// Ensure you have SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in your .env for real emails!

export const sendOTP = async (email: string, otp: string) => {
    try {
        // Fallback to a testing ethereal account if no real env vars exist
        let transporter;

        if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
            transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT) || 587,
                secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
        } else {
            console.warn("⚠️ No SMTP credentials found in .env. Using fallback Ethereal test account.");
            // Generate test SMTP service account from ethereal.email
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: testAccount.user, // generated ethereal user
                    pass: testAccount.pass, // generated ethereal password
                },
            });
        }

        const info = await transporter.sendMail({
            from: '"Aura Platform" <no-reply@aurastyle.com>',
            to: email,
            subject: "Your Aura Verification Code",
            text: `Welcome to Aura! Your 6-digit verification code is: ${otp}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Welcome to Aura! ✨</h2>
                    <p>To complete your registration, please use the following 6-digit verification code:</p>
                    <h1 style="letter-spacing: 5px; color: #333; background: #f4f4f4; padding: 15px; text-align: center; border-radius: 8px;">${otp}</h1>
                    <p>This code will expire in 10 minutes.</p>
                    <p>If you didn't request this code, you can safely ignore this email.</p>
                </div>
            `,
        });

        console.log("Message sent: %s", info.messageId);

        if (info.messageId && !process.env.SMTP_HOST) {
            // If using ethereal, nodemailer gives us a preview URL
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }

        return true;
    } catch (error) {
        console.error("Error sending OTP email: ", error);
        return false;
    }
};
