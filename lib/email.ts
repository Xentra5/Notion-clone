/**
 * lib/email.ts
 *
 * Lightweight Nodemailer wrapper for transactional emails.
 * In development (NODE_ENV !== "production") the email is NOT sent —
 * instead the invite URL is printed to the server console so you can
 * test the full invite flow without real SMTP credentials.
 *
 * Required environment variables (production):
 *   EMAIL_FROM   — display address, e.g. "Notion Clone <no-reply@yourapp.com>"
 *   EMAIL_HOST   — SMTP host, e.g. "smtp.gmail.com"
 *   EMAIL_PORT   — SMTP port, e.g. "587"
 *   EMAIL_USER   — SMTP username / Gmail address
 *   EMAIL_PASS   — SMTP password / Gmail App Password
 *
 * Gmail quick-start:
 *   1. Enable 2FA on your Google account
 *   2. Go to myaccount.google.com → Security → App Passwords
 *   3. Create an app password for "Mail"
 *   4. Use that 16-char password as EMAIL_PASS
 */

import nodemailer from "nodemailer";

interface InviteEmailParams {
  /** Invitee's email address */
  to: string;
  /** Display name of the person who sent the invite */
  inviterName: string;
  /** Title of the page being shared */
  pageTitle: string;
  /** Full accept URL including token query param */
  inviteUrl: string;
  /** Role granted to the invitee */
  role: "full" | "edit" | "comment" | "view";
}

const ROLE_LABELS: Record<string, string> = {
  full: "full access",
  edit: "edit access",
  comment: "comment access",
  view: "view access",
};

/**
 * Build an HTML email body for the invite.
 * Kept inline to avoid extra file dependencies.
 */
function buildInviteHtml(params: InviteEmailParams): string {
  const { inviterName, pageTitle, inviteUrl, role } = params;
  const roleLabel = ROLE_LABELS[role] ?? role;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You've been invited to collaborate</title>
  <style>
    body { margin: 0; padding: 0; background: #0f0f0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .wrapper { max-width: 520px; margin: 40px auto; background: #1a1a1a; border-radius: 16px; border: 1px solid #2a2a2a; overflow: hidden; }
    .header { padding: 28px 32px 20px; border-bottom: 1px solid #2a2a2a; }
    .logo { font-size: 18px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px; }
    .body { padding: 28px 32px; }
    .headline { font-size: 20px; font-weight: 600; color: #ffffff; margin: 0 0 8px; line-height: 1.3; }
    .sub { font-size: 14px; color: #a1a1aa; line-height: 1.6; margin: 0 0 24px; }
    .page-card { background: #252525; border: 1px solid #333; border-radius: 10px; padding: 14px 16px; display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
    .page-icon { font-size: 22px; }
    .page-info { flex: 1; }
    .page-title { font-size: 14px; font-weight: 600; color: #ffffff; }
    .page-role { font-size: 12px; color: #71717a; margin-top: 2px; }
    .cta { display: inline-block; background: #2563eb; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 8px; }
    .footer { padding: 20px 32px; border-top: 1px solid #2a2a2a; }
    .footer-text { font-size: 12px; color: #52525b; line-height: 1.5; }
    .footer-url { color: #3f3f46; word-break: break-all; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo">✦ Notion Clone</div>
    </div>
    <div class="body">
      <p class="headline">${escapeHtml(inviterName)} invited you to collaborate</p>
      <p class="sub">You've been granted <strong style="color:#ffffff">${roleLabel}</strong> to the following workspace page.</p>
      <div class="page-card">
        <div class="page-icon">📄</div>
        <div class="page-info">
          <div class="page-title">${escapeHtml(pageTitle)}</div>
          <div class="page-role">You can ${roleLabel}</div>
        </div>
      </div>
      <a href="${inviteUrl}" class="cta">Accept invitation</a>
    </div>
    <div class="footer">
      <p class="footer-text">
        If the button above doesn't work, paste this URL into your browser:<br/>
        <span class="footer-url">${inviteUrl}</span>
      </p>
      <p class="footer-text" style="margin-top:12px">
        If you weren't expecting this invitation you can safely ignore this email.
      </p>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Send a page-share invitation email.
 *
 * In non-production environments the invite URL is logged to console
 * rather than actually sent, so you don't need real SMTP credentials
 * to test the full invite → accept flow.
 */
export async function sendInviteEmail(params: InviteEmailParams): Promise<void> {
  const { to, inviterName, pageTitle, inviteUrl } = params;

  // ── Dev / test shortcut ────────────────────────────────────────────────────
  const isDev = process.env.NODE_ENV !== "production";
  const hasSmtp =
    process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS;

  if (isDev && !hasSmtp) {
    console.log("\n📧 [DEV] Invite email would have been sent:");
    console.log(`   To:       ${to}`);
    console.log(`   From:     ${inviterName}`);
    console.log(`   Page:     ${pageTitle}`);
    console.log(`   Role:     ${params.role}`);
    console.log(`   ✅ Accept: ${inviteUrl}\n`);
    return;
  }

  // ── Production SMTP ────────────────────────────────────────────────────────
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST!,
    port: parseInt(process.env.EMAIL_PORT ?? "587", 10),
    secure: process.env.EMAIL_PORT === "465",
    auth: {
      user: process.env.EMAIL_USER!,
      pass: process.env.EMAIL_PASS!,
    },
  });

  await transport.sendMail({
    from: process.env.EMAIL_FROM ?? `"Notion Clone" <${process.env.EMAIL_USER}>`,
    to,
    subject: `${inviterName} invited you to "${pageTitle}"`,
    html: buildInviteHtml(params),
    text: `${inviterName} invited you to collaborate on "${pageTitle}".\n\nAccept the invitation: ${inviteUrl}`,
  });
}
