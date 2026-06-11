/**
 * Serviço de e-mail com Nodemailer.
 * Em desenvolvimento, usa Ethereal (fake SMTP) — nenhum e-mail real é enviado.
 * Em produção, configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS no .env.
 */
import nodemailer from "nodemailer";
import logger from "./logger.js";

let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST) {
    // Produção: SMTP real
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    logger.info("[email] Transporter SMTP configurado:", process.env.SMTP_HOST);
  } else {
    // Desenvolvimento: Ethereal (fake)
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    logger.info("[email] Usando Ethereal (fake SMTP) para desenvolvimento");
    logger.info("[email] Preview em: https://ethereal.email/login");
    logger.info("[email] User:", testAccount.user, "| Pass:", testAccount.pass);
  }

  return transporter;
}

/**
 * Envia um e-mail.
 * @param {Object} opts - { to, subject, html }
 * @returns {Object} info do envio (inclui preview URL em dev)
 */
export async function enviarEmail({ to, subject, html }) {
  try {
    const t = await getTransporter();
    const info = await t.sendMail({
      from: process.env.EMAIL_FROM || '"E&Y Turismo" <noreply@eyturismo.com>',
      to,
      subject,
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      logger.info("[email] Preview:", previewUrl);
    }
    logger.info("[email] Enviado para:", to, "| Subject:", subject);
    return { messageId: info.messageId, previewUrl: previewUrl || null };
  } catch (err) {
    logger.error("[email] Falha ao enviar:", err.message);
    throw err;
  }
}

// ======================== TEMPLATES ========================

export function emailBoasVindas(nome, email) {
  return {
    to: email,
    subject: "Bem-vindo à E&Y Turismo! 🌎",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:2rem;border-radius:12px;">
        <h1 style="color:#37d4af;">Bem-vindo, ${nome}! 🎉</h1>
        <p>Sua conta na <strong>E&Y Turismo</strong> foi criada com sucesso.</p>
        <p>Agora você pode explorar nossos destinos e pacotes incríveis!</p>
        <a href="${process.env.CORS_ORIGIN || 'http://localhost:5173'}/pacotes"
           style="display:inline-block;background:#37d4af;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:1rem;">
          Ver Pacotes
        </a>
        <p style="color:#888;font-size:0.85rem;margin-top:2rem;">E&Y Turismo — Viaje com a garantia de voltar com vida... talvez 😄</p>
      </div>
    `,
  };
}

export function emailPagamentoConfirmado(nome, email, pacoteNome, codigoReserva, valor) {
  return {
    to: email,
    subject: `Pagamento Confirmado — ${pacoteNome} ✅`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:2rem;border-radius:12px;">
        <h1 style="color:#4caf50;">Pagamento Confirmado! ✅</h1>
        <p>Olá, <strong>${nome}</strong>!</p>
        <p>Seu pagamento foi processado com sucesso.</p>
        <div style="background:#1a1a1a;padding:1rem;border-radius:8px;border:1px solid #333;margin:1rem 0;">
          <p><strong>Pacote:</strong> ${pacoteNome}</p>
          <p><strong>Valor:</strong> R$ ${Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <p><strong>Código da Reserva:</strong> <span style="color:#37d4af;font-family:monospace;">${codigoReserva}</span></p>
        </div>
        <p style="color:#aaa;">Guarde este código para referência futura.</p>
        <p style="color:#888;font-size:0.85rem;margin-top:2rem;">E&Y Turismo — Boas viagens! 🌎</p>
      </div>
    `,
  };
}
