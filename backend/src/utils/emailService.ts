import nodemailer from 'nodemailer';

// Create a generic transporter
// In development, we use Ethereal (a fake SMTP service for testing) or simply log to console.
// Ensure you have SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in your .env for real emails!

export const sendOTP = async (email: string, otp: string, verificationToken?: string) => {
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

        const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/verify-link/${verificationToken}`;

        const info = await transporter.sendMail({
            from: `"Aura Platform" <${process.env.SMTP_USER || 'no-reply@aurastyle.com'}>`,
            to: email,
            subject: "Verify Your Aura Account",
            text: `Welcome to Aura! Use code ${otp} or click here to verify: ${verifyUrl}`,
            html: `
                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="font-size: 28px; font-weight: 800; letter-spacing: -1px; margin: 0;">AURA.</h1>
                    </div>
                    <div style="background: #ffffff; border: 1px solid #e5e5e5; border-radius: 24px; padding: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
                        <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 20px;">Welcome to the studio! ✨</h2>
                        <p style="font-size: 16px; line-height: 1.6; color: #666; margin-bottom: 30px;">We're excited to have you join our creative community. Please verify your account using one of the methods below:</p>
                        
                        <div style="margin-bottom: 35px;">
                            <p style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #a1a1a1; margin-bottom: 12px;">Method 1: Click to verify</p>
                            <a href="${verifyUrl}" style="display: block; width: 100%; box-sizing: border-box; background: #000; color: #fff; text-align: center; padding: 16px; border-radius: 14px; font-weight: 700; text-decoration: none; font-size: 16px;">Verify Account Now</a>
                        </div>

                        <div style="border-top: 1px solid #f0f0f0; padding-top: 30px;">
                            <p style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #a1a1a1; margin-bottom: 12px;">Method 2: Use code</p>
                            <div style="background: #f9f9f9; padding: 20px; border-radius: 14px; text-align: center;">
                                <span style="font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 10px; color: #1a1a1a;">${otp}</span>
                            </div>
                        </div>
                    </div>
                    <p style="font-size: 13px; color: #a1a1a1; text-align: center; margin-top: 30px;">
                        This code and link will expire in 10 minutes.<br>
                        If you didn't create an account, you can safely ignore this email.
                    </p>
                </div>
            `,
        });

        console.log("Verification email sent: %s", info.messageId);
        if (info.messageId && !process.env.SMTP_HOST) {
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }

        return true;
    } catch (error) {
        console.error("Error sending verification email: ", error);
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
