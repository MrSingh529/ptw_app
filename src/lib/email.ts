
'use server';

import nodemailer from 'nodemailer';

// 1. Create a transporter object
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT || 587),
  // For port 587, 'secure' is false. For 465, it's true.
  secure: process.env.EMAIL_SERVER_PORT === '465',
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASS,
  },
  tls: {
    // This is often necessary for custom or private mail servers
    // that might use self-signed certificates or specific cipher suites.
    rejectUnauthorized: false,
    // Known workaround for specific mail server connection issues on modern platforms.
    ciphers: 'SSLv3',
  }
});

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

// 2. Define the sendEmail function
export async function sendEmail({ to, subject, html }: MailOptions) {
  const mailOptions = {
    from: `PermitFlow <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html,
  };

  try {
    // Verify connection configuration on server startup
    // This isn't a route, so we can't do it on startup, but we can log before sending.
    console.log('Attempting to send email with the following options:', {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        user: process.env.EMAIL_SERVER_USER ? 'Exists' : 'MISSING',
        pass: process.env.EMAIL_SERVER_PASS ? 'Exists' : 'MISSING',
        from: process.env.EMAIL_FROM
    });

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully. Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('Nodemailer error caught:', JSON.stringify(error, null, 2));
    
    let errorMessage = 'An unknown error occurred while sending the email.';
    if (error instanceof Error) {
        errorMessage = error.message;
        const err = error as any;
        // Log common specific nodemailer error codes
        if (err.code) {
            console.error(`Nodemailer Error Code: ${err.code}`);
            errorMessage += ` (Code: ${err.code})`;
        }
        if (err.response) {
            console.error(`Nodemailer Response: ${err.response}`);
        }
    }
    
    return { success: false, error: `Failed to send email. ${errorMessage}` };
  }
}
