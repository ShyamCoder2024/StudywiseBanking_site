import nodemailer from 'nodemailer';

/**
 * Email Service for StudyWiseBanking
 * Uses Nodemailer with fallback to console logging for development
 */

// Create transporter based on environment
const createTransporter = () => {
    // Check if email credentials are configured
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.EMAIL_PORT) || 587,
            secure: false, // Use TLS
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }
    return null;
};

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} resetUrl - Full URL for password reset
 * @param {string} firstName - User's first name for personalization
 * @returns {Promise<boolean>} - True if sent successfully
 */
export const sendPasswordResetEmail = async (email, resetUrl, firstName = 'Student') => {
    const transporter = createTransporter();

    const emailHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f8;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <tr>
            <td style="background: linear-gradient(135deg, #8A75BA 0%, #6B5A96 100%); border-radius: 16px 16px 0 0; padding: 40px 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">StudyWise Banking</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px;">Your Exam Preparation Partner</p>
            </td>
        </tr>
        <tr>
            <td style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                <h2 style="color: #1a1625; margin: 0 0 20px; font-size: 22px;">Hi ${firstName}! 👋</h2>
                <p style="color: #4a5568; line-height: 1.6; margin: 0 0 20px;">
                    We received a request to reset your password for your StudyWise Banking account. Click the button below to create a new password:
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #8A75BA 0%, #6B5A96 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(138, 117, 186, 0.4);">
                        Reset Password
                    </a>
                </div>
                
                <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0;">
                    <p style="color: #92400e; margin: 0; font-size: 14px;">
                        ⏰ <strong>This link expires in 15 minutes</strong> for security reasons.
                    </p>
                </div>
                
                <p style="color: #4a5568; line-height: 1.6; margin: 20px 0 0;">
                    If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
                </p>
                
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
                
                <p style="color: #718096; font-size: 12px; margin: 0;">
                    If the button doesn't work, copy and paste this link into your browser:
                    <br>
                    <a href="${resetUrl}" style="color: #8A75BA; word-break: break-all;">${resetUrl}</a>
                </p>
            </td>
        </tr>
        <tr>
            <td style="padding: 20px 30px; text-align: center;">
                <p style="color: #a0aec0; font-size: 12px; margin: 0;">
                    © ${new Date().getFullYear()} StudyWise Banking. All rights reserved.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
    `;

    const mailOptions = {
        from: `"StudyWise Banking" <${process.env.EMAIL_USER || 'noreply@studywisebanking.com'}>`,
        to: email,
        subject: 'Reset Your Password - StudyWise Banking',
        html: emailHTML,
        text: `Hi ${firstName}!\n\nWe received a request to reset your password. Click this link to reset it:\n\n${resetUrl}\n\nThis link expires in 15 minutes.\n\nIf you didn't request this, please ignore this email.\n\n- StudyWise Banking Team`,
    };

    // If transporter is configured, try to send email
    if (transporter) {
        try {
            await transporter.sendMail(mailOptions);
            console.log(`✅ Password reset email sent to ${email}`);
            return true;
        } catch (error) {
            console.error('❌ Email sending failed:', error.message);
            // Log the reset URL for manual recovery in case email fails
            console.log(`📧 [FALLBACK] Reset URL for ${email}: ${resetUrl}`);
            return false;
        }
    } else {
        // No email configuration - log to console (development mode)
        console.log('━'.repeat(60));
        console.log('📧 EMAIL NOT CONFIGURED - Development Mode');
        console.log(`📭 To: ${email}`);
        console.log(`🔗 Reset URL: ${resetUrl}`);
        console.log('━'.repeat(60));
        return true; // Return true so the flow continues
    }
};

export default { sendPasswordResetEmail };
