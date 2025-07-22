
'use server';

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT || 587),
  // For port 587, 'secure' is false because the connection starts in plain text
  // and is then upgraded to TLS using STARTTLS.
  secure: process.env.EMAIL_SERVER_PORT === '465',
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASS,
  },
  tls: {
    // This is often necessary for custom or private mail servers
    // that might use self-signed certificates.
    rejectUnauthorized: false
  }
});

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: MailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `PermitFlow <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });
    console.log('Email sent: %s', info.messageId);
    return { success: true };
  } catch (error) {
    // Log the full error for better debugging on Vercel
    console.error('Nodemailer error:', error);
    if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error name:', error.name);
        if ('code' in error) {
             console.error('Error code:', (error as any).code);
        }
    }
    // In a real app, you might want to have a more robust error handling/fallback mechanism.
    return { success: false, error: 'Failed to send email. Check server logs for details.' };
  }
}
