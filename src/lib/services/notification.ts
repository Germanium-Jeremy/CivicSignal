import nodemailer from 'nodemailer';
import twilio from 'twilio';

// Email configuration
const emailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        // Do not fail on invalid certs
        rejectUnauthorized: false,
        // Allow self-signed certificates
        ciphers: 'SSLv3'
    },
    // Additional options for Gmail
    requireTLS: true,
    connectionTimeout: 60000, // 60 seconds
    greetingTimeout: 30000, // 30 seconds
    socketTimeout: 60000, // 60 seconds
});

// SMS configuration
const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

// Email templates
const getEmailTemplate = (type: string, data: any): { subject: string; html: string } => {
    switch (type) {
        case 'email-verification':
            return {
                subject: 'Verify Your Email - CivicSignal',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #2563eb;">Welcome to CivicSignal!</h2>
                        <p>Hello ${data.fullName},</p>
                        <p>Thank you for registering with CivicSignal. Please verify your email address by entering the verification code below:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; border: 2px solid #2563eb;">
                                <p style="margin: 0; color: #374151; font-size: 14px; font-weight: 500;">Your verification code is:</p>
                                <div style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 4px; margin: 10px 0;">
                                    ${data.verificationCode}
                                </div>
                                <p style="margin: 0; color: #6b7280; font-size: 12px;">Enter this code in the verification page</p>
                            </div>
                        </div>
                        <p style="color: #dc2626; font-size: 14px;"><strong>Important:</strong> This code will expire in 10 minutes.</p>
                        <p>If you didn't create an account with CivicSignal, please ignore this email.</p>
                        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                        <p style="color: #666; font-size: 12px;">
                            CivicSignal - Making Communities Better<br>
                            This is an automated message, please do not reply.
                        </p>
                    </div>
                `
            };
        
            case 'password-reset':
                return {
                    subject: 'Reset Your Password - CivicSignal',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #dc2626;">Password Reset Request</h2>
                            <p>Hello ${data.fullName},</p>
                            <p>We received a request to reset your password. Use the code below to reset your password:</p>
                            <div style="text-align: center; margin: 30px 0;">
                                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; font-size: 24px; font-weight: bold; letter-spacing: 2px;">
                                    ${data.resetCode}
                                </div>
                            </div>
                            <p>This code will expire in 15 minutes.</p>
                            <p>If you didn't request a password reset, please ignore this email.</p>
                            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                            <p style="color: #666; font-size: 12px;">
                                CivicSignal - Making Communities Better<br>
                                This is an automated message, please do not reply.
                            </p>
                        </div>
                    `
                };
    
        case 'new-device-login':
            return {
                subject: 'New Device Login Alert - CivicSignal',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #f59e0b;">Security Alert</h2>
                        <p>Hello ${data.fullName},</p>
                        <p>We detected a login to your CivicSignal account from a new device:</p>
                        <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
                            <strong>Device:</strong> ${data.deviceName}<br>
                            <strong>Location:</strong> ${data.location}<br>
                            <strong>IP Address:</strong> ${data.ipAddress}<br>
                            <strong>Time:</strong> ${data.loginTime}
                        </div>
                        <p>If this was you, you can ignore this email. If you don't recognize this activity, please secure your account immediately.</p>
                        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                        <p style="color: #666; font-size: 12px;">
                            CivicSignal - Making Communities Better<br>
                            This is an automated message, please do not reply.
                        </p>
                    </div>
                `
            };
    
        default:
            return { subject: '', html: '' };
    }
};

// Verify email transporter connection
export const verifyEmailConnection = async (): Promise<boolean> => {
    try {
        await emailTransporter.verify();
        console.log('Email transporter is ready');
        return true;
    } catch (error) {
        console.error('Email transporter verification failed:', error);
        return false;
    }
};

// Send email with improved error handling
export const sendEmail = async (to: string, type: string, data: any): Promise<boolean> => {
    try {
        // Verify connection first
        const isConnected = await verifyEmailConnection();
        if (!isConnected) {
            console.error('Email transporter not ready');
            return false;
        }

        const { subject, html } = getEmailTemplate(type, data);
        
        const mailOptions = {
            from: `"CivicSignal" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        };

        console.log('Sending email to:', to);
        const result = await emailTransporter.sendMail(mailOptions);
        console.log('Email sent successfully:', result.messageId);
    
        return true;
    } catch (error) {
        console.error('Email sending failed:', error);
    
        // Log specific error details
        if (error instanceof Error) {
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            if ('code' in error) {
                console.error('Error code:', (error as any).code);
            }
        }
        
        return false;
    }
};

// Send SMS
export const sendSMS = async (to: string, message: string): Promise<boolean> => {
    try {
        await twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to,
        });
    
        return true;
    } catch (error) {
        console.error('SMS sending failed:', error);
        return false;
    }
};

// Send phone verification SMS
export const sendPhoneVerification = async (phone: string, code: string, fullName: string): Promise<boolean> => {
    const message = `Hello ${fullName}! Your CivicSignal verification code is: ${code}. This code expires in 10 minutes. Do not share this code with anyone.`;
    return await sendSMS(phone, message);
};

// Send password reset SMS
export const sendPasswordResetSMS = async (phone: string, code: string): Promise<boolean> => {
    const message = `Your CivicSignal password reset code is: ${code}. This code expires in 15 minutes. Do not share this code with anyone.`;
    return await sendSMS(phone, message);
};
