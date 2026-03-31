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
            from: `"Aura Platform" <${process.env.SMTP_USER || 'no-reply@aurastyle.com'}>`,
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

export const sendPasswordResetEmail = async (email: string, resetToken: string) => {
    try {
        let transporter;

        if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
            transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT) || 587,
                secure: process.env.SMTP_PORT === '465',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
        } else {
            console.warn("⚠️ No SMTP credentials found. Using Ethereal fallback.");
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
        }

        const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/reset-password/${resetToken}`;

        const info = await transporter.sendMail({
            from: `"Aura Platform" <${process.env.SMTP_USER || 'no-reply@aurastyle.com'}>`,
            to: email,
            subject: "Password Reset Request - Aura",
            text: `You requested a password reset. Please click the following link: ${resetUrl}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #333; text-align: center;">Password Reset Request ✨</h2>
                    <p>Hello,</p>
                    <p>We received a request to reset your password for your Aura account. Click the button below to choose a new password:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
                    </div>
                    <p>If you didn't request this, you can safely ignore this email. The link will expire in 1 hour.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #999; text-align: center;">Aura Platform - Modern Style & Aesthetic</p>
                </div>
            `,
        });

        console.log("Password reset email sent: %s", info.messageId);
        if (info.messageId && !process.env.SMTP_HOST) {
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }
        return true;
    } catch (error) {
        console.error("Error sending password reset email: ", error);
        return false;
    }
};
