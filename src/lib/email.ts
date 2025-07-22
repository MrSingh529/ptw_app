
'use server';

import nodemailer from 'nodemailer';

// NOTE: This file is no longer actively used for sending emails from the server
// due to firewall restrictions on Vercel. Email notifications are now handled
// on the client-side using 'mailto:' links.
// This code is kept for reference or future use if the infrastructure changes.

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
  }
});

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

// 2. Define the sendEmail function
export async function sendEmail({ to, subject, html }: MailOptions) {
  console.warn("sendEmail function was called, but it is deprecated due to server firewall issues. Emails are now handled client-side.");
  return { success: false, error: "Server-side email sending is disabled." };

  // The original code is below for reference.
  /*
  const mailOptions = {
    from: `"PermitFlow" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html,
  };

  try {
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
  */
}
