
'use server';

import nodemailer from 'nodemailer';

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: MailOptions) {
  const {
    EMAIL_SERVER_HOST,
    EMAIL_SERVER_PORT,
    EMAIL_SERVER_USER,
    EMAIL_SERVER_PASS,
    EMAIL_FROM,
  } = process.env;

  if (
    !EMAIL_SERVER_HOST ||
    !EMAIL_SERVER_PORT ||
    !EMAIL_SERVER_USER ||
    !EMAIL_SERVER_PASS ||
    !EMAIL_FROM
  ) {
    const errorMsg = 'Email server configuration is incomplete. Please check environment variables.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
  
  console.log(`Attempting to send email with the following options:`, {
    host: EMAIL_SERVER_HOST,
    port: EMAIL_SERVER_PORT,
    user: EMAIL_SERVER_USER ? 'Exists' : 'Not Found',
    pass: EMAIL_SERVER_PASS ? 'Exists' : 'Not Found',
    from: EMAIL_FROM,
  });

  const transport = nodemailer.createTransport({
    host: EMAIL_SERVER_HOST,
    port: parseInt(EMAIL_SERVER_PORT, 10),
    secure: parseInt(EMAIL_SERVER_PORT, 10) === 465, // true for 465, false for other ports
    auth: {
      user: EMAIL_SERVER_USER,
      pass: EMAIL_SERVER_PASS,
    },
  });

  const mailOptions = {
    from: `PermitFlow <${EMAIL_FROM}>`,
    to: to,
    subject: subject,
    html: html,
  };

  try {
    const info = await transport.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Nodemailer error caught:', error);
    const err = error as Error & { code?: string };
     console.error(`Nodemailer Error Code: ${err.code || 'N/A'}`);
    throw new Error(`Failed to send email. Reason: ${err.message} (Code: ${err.code || 'N/A'})`);
  }
}
