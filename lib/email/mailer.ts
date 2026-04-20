import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

function getTransporter() {
  if (!transporter) {
    transporter = createTransporter();
  }

  return transporter;
}

export function isSmtpConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.SMTP_FROM,
  );
}

export async function sendEmail(params: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  const activeTransporter = getTransporter();
  const from = process.env.SMTP_FROM;

  if (!activeTransporter || !from) {
    throw new Error("SMTP no está configurado correctamente.");
  }

  await activeTransporter.sendMail({
    from,
    to: params.to,
    subject: params.subject,
    html: params.html,
  });
}
