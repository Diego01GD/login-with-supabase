import { createAdminClient } from "@/lib/supabase/admin";
import { isSmtpConfigured, sendEmail } from "@/lib/email/mailer";

type Contact = {
  id: string;
  name: string;
  email: string;
};

function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderTemplate(params: {
  title: string;
  greeting: string;
  message: string;
  ctaLabel: string;
  ctaUrl: string;
  footer?: string;
}) {
  return `
    <div style="margin:0;padding:24px;background:#f7f3e7;font-family:Segoe UI,Arial,sans-serif;color:#114c5f;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #9cd2d3;border-radius:18px;overflow:hidden;">
        <div style="padding:20px 24px;background:linear-gradient(135deg,#114c5f,#0057cc);color:white;">
          <h1 style="margin:0;font-size:24px;line-height:1.3;">SkillSwap</h1>
          <p style="margin:6px 0 0 0;font-size:13px;opacity:.9;">Conecta. Aprende. Enseña.</p>
        </div>
        <div style="padding:24px;">
          <h2 style="margin:0 0 12px 0;font-size:22px;color:#114c5f;">${escapeHtml(params.title)}</h2>
          <p style="margin:0 0 8px 0;font-size:15px;color:#114c5f;">${escapeHtml(params.greeting)}</p>
          <p style="margin:0 0 20px 0;font-size:15px;color:#325e80;line-height:1.6;">${escapeHtml(params.message)}</p>
          <a href="${params.ctaUrl}" style="display:inline-block;background:#0057cc;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700;">${escapeHtml(params.ctaLabel)}</a>
          <p style="margin:24px 0 0 0;font-size:12px;color:#6b7280;">${escapeHtml(params.footer || "Este correo fue generado automáticamente por SkillSwap.")}</p>
        </div>
      </div>
    </div>
  `;
}

async function getContactById(userId: string): Promise<Contact | null> {
  const admin = createAdminClient();

  const [profileResult, authResult] = await Promise.all([
    admin.from("profiles").select("full_name").eq("id", userId).maybeSingle(),
    admin.auth.admin.getUserById(userId),
  ]);

  const email = authResult.data.user?.email;
  if (!email) {
    return null;
  }

  return {
    id: userId,
    name: profileResult.data?.full_name || "Usuario",
    email,
  };
}

async function safeSend(params: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  if (!isSmtpConfigured()) {
    console.warn("SMTP no configurado. Se omite envío de correo.");
    return;
  }

  try {
    await sendEmail(params);
  } catch (error) {
    console.error("Error enviando correo:", error);
  }
}

export async function notifyExchangeRequested(params: {
  senderId: string;
  receiverId: string;
  skillName?: string;
}) {
  const [sender, receiver] = await Promise.all([
    getContactById(params.senderId),
    getContactById(params.receiverId),
  ]);

  if (!sender || !receiver) return;

  const html = renderTemplate({
    title: "Nueva solicitud de intercambio",
    greeting: `Hola ${receiver.name},`,
    message: params.skillName
      ? `${sender.name} te ha enviado una solicitud de intercambio por la habilidad de ${params.skillName}.`
      : `${sender.name} te ha enviado una solicitud de intercambio de habilidades.`,
    ctaLabel: "Ver solicitud",
    ctaUrl: `${getSiteUrl()}/protected/swap`,
  });

  await safeSend({
    to: receiver.email,
    subject: "SkillSwap: Recibiste una solicitud de intercambio",
    html,
  });
}

export async function notifyExchangeDecision(params: {
  senderId: string;
  receiverId: string;
  status: "accepted" | "rejected";
  skillName?: string;
}) {
  const [sender, receiver] = await Promise.all([
    getContactById(params.senderId),
    getContactById(params.receiverId),
  ]);

  if (!sender || !receiver) return;

  const accepted = params.status === "accepted";
  const html = renderTemplate({
    title: accepted ? "Solicitud aceptada" : "Solicitud rechazada",
    greeting: `Hola ${sender.name},`,
    message: accepted
      ? params.skillName
        ? `${receiver.name} aceptó tu solicitud de intercambio por ${params.skillName}. ¡Ya pueden comenzar a colaborar!`
        : `${receiver.name} aceptó tu solicitud de intercambio. ¡Ya pueden comenzar a colaborar!`
      : params.skillName
        ? `${receiver.name} rechazó tu solicitud de intercambio por ${params.skillName}. Puedes explorar nuevos perfiles en SkillSwap.`
        : `${receiver.name} rechazó tu solicitud de intercambio. Puedes explorar nuevos perfiles en SkillSwap.`,
    ctaLabel: accepted ? "Ir a mis intercambios" : "Buscar nuevos intercambios",
    ctaUrl: `${getSiteUrl()}/protected/swap`,
  });

  await safeSend({
    to: sender.email,
    subject: accepted
      ? "SkillSwap: Aceptaron tu solicitud"
      : "SkillSwap: Rechazaron tu solicitud",
    html,
  });
}

export async function notifyExchangeCompleted(params: {
  senderId: string;
  receiverId: string;
}) {
  const [sender, receiver] = await Promise.all([
    getContactById(params.senderId),
    getContactById(params.receiverId),
  ]);

  if (!sender || !receiver) return;

  const htmlForSender = renderTemplate({
    title: "Intercambio finalizado",
    greeting: `Hola ${sender.name},`,
    message: `Tu intercambio con ${receiver.name} se marcó como completado.`,
    ctaLabel: "Ver historial",
    ctaUrl: `${getSiteUrl()}/protected/swap`,
  });

  const htmlForReceiver = renderTemplate({
    title: "Intercambio finalizado",
    greeting: `Hola ${receiver.name},`,
    message: `Tu intercambio con ${sender.name} se marcó como completado.`,
    ctaLabel: "Ver historial",
    ctaUrl: `${getSiteUrl()}/protected/swap`,
  });

  await Promise.all([
    safeSend({
      to: sender.email,
      subject: "SkillSwap: Intercambio completado",
      html: htmlForSender,
    }),
    safeSend({
      to: receiver.email,
      subject: "SkillSwap: Intercambio completado",
      html: htmlForReceiver,
    }),
  ]);
}

export async function notifyPendingMessages(params: {
  senderId: string;
  receiverId: string;
}) {
  const [sender, receiver] = await Promise.all([
    getContactById(params.senderId),
    getContactById(params.receiverId),
  ]);

  if (!sender || !receiver) return;

  const html = renderTemplate({
    title: "Tienes mensajes pendientes",
    greeting: `Hola ${receiver.name},`,
    message: `${sender.name} te envió nuevos mensajes en SkillSwap.`,
    ctaLabel: "Ir a mensajería",
    ctaUrl: `${getSiteUrl()}/protected/messages`,
  });

  await safeSend({
    to: receiver.email,
    subject: "SkillSwap: Tienes mensajes pendientes",
    html,
  });
}
