import nodemailer from "nodemailer";

export type SendCheckInEmailParams = {
  toEmail: string;
  token: string;
  publicBaseUrl: string;
  smtpHost: string;
  smtpPort: number;
  smtpFrom: string;
  smtpUser?: string;
  smtpPass?: string;
};

function buildEmailContent(publicBaseUrl: string, token: string): { subject: string; text: string; html: string } {
  const linkUrl = `${publicBaseUrl.replace(/\/$/, "")}/checkin/${token}`;
  const subject = "Your Daily Check-In";
  const text = `Hi there,\n\nYour Daily Check-In is ready. Open the link below to complete it:\n${linkUrl}\n\nThank you.`;
  const html = `
    <p>Hi there,</p>
    <p>Your Daily Check-In is ready. Click the link below to complete it:</p>
    <p><a href="${linkUrl}">Complete your check-in</a></p>
    <p>If the link doesn't work, copy and paste this URL into your browser:</p>
    <p><code>${linkUrl}</code></p>
    <p>Thank you.</p>
  `;

  return { subject, text, html };
}

export async function sendCheckInEmail(params: SendCheckInEmailParams): Promise<void> {
  const { subject, text, html } = buildEmailContent(params.publicBaseUrl, params.token);

  const transporter = nodemailer.createTransport({
    host: params.smtpHost,
    port: params.smtpPort,
    secure: false,
    auth:
      params.smtpUser && params.smtpPass
        ? {
            user: params.smtpUser,
            pass: params.smtpPass,
          }
        : undefined,
  });

  await transporter.sendMail({
    from: params.smtpFrom,
    to: params.toEmail,
    subject,
    text,
    html,
  });
}

