// E-mail via Resend. Zonder RESEND_API_KEY worden mails niet verstuurd maar
// gelogd naar de console (handig lokaal en vóór de domeinverificatie).
const API_KEY = process.env.RESEND_API_KEY || '';
const FROM = process.env.MAIL_FROM || 'HerbaForms <no-reply@hblwellnessform.com>';

async function sendMail({ to, subject, html }) {
  if (!API_KEY) {
    console.log(`[mail] RESEND_API_KEY ontbreekt — mail NIET verstuurd.\n  Aan: ${to}\n  Onderwerp: ${subject}`);
    return { ok: false, dev: true };
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to: [to], subject, html }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.error(`[mail] Resend-fout ${res.status}: ${body}`);
    return { ok: false };
  }
  return { ok: true };
}

const RESET_COPY = {
  nl: {
    subject: 'Wachtwoord opnieuw instellen — HerbaForms',
    title: 'Wachtwoord opnieuw instellen',
    hi: (name) => `Hoi ${name},`,
    body: 'Er is gevraagd om het wachtwoord van je HerbaForms-account opnieuw in te stellen. Klik op de knop hieronder om een nieuw wachtwoord te kiezen. Deze link is 1 uur geldig.',
    button: 'Nieuw wachtwoord instellen',
    ignore: 'Heb jij dit niet aangevraagd? Dan kun je deze e-mail veilig negeren; je wachtwoord blijft ongewijzigd.',
  },
  en: {
    subject: 'Reset your password — HerbaForms',
    title: 'Reset your password',
    hi: (name) => `Hi ${name},`,
    body: 'A password reset was requested for your HerbaForms account. Click the button below to choose a new password. This link is valid for 1 hour.',
    button: 'Set a new password',
    ignore: "Didn't request this? You can safely ignore this email; your password stays unchanged.",
  },
};

function resetEmailHTML(lang, name, link) {
  const c = RESET_COPY[lang] || RESET_COPY.nl;
  return { subject: c.subject, html: `
  <div style="background:#f3f4ee;padding:32px 16px;font-family:system-ui,-apple-system,'Segoe UI',sans-serif">
    <div style="max-width:440px;margin:0 auto;background:#fcfcf9;border-radius:18px;padding:32px;border:1px solid rgba(20,24,18,.08)">
      <img src="https://hblwellnessform.com/img/icon-192.png" width="46" height="46" alt="HerbaForms" style="border-radius:12px;border:1px solid #e3e5db">
      <h1 style="font-size:20px;color:#191c18;margin:18px 0 6px">${c.title}</h1>
      <p style="color:#565b53;font-size:14.5px;line-height:1.6;margin:0 0 6px">${c.hi(name)}</p>
      <p style="color:#565b53;font-size:14.5px;line-height:1.6;margin:0 0 22px">${c.body}</p>
      <a href="${link}" style="display:block;background:#166534;color:#ffffff;text-decoration:none;text-align:center;padding:13px 20px;border-radius:12px;font-weight:600;font-size:15px">${c.button}</a>
      <p style="color:#8a8f85;font-size:12.5px;line-height:1.6;margin:22px 0 0">${c.ignore}</p>
    </div>
    <p style="text-align:center;color:#8a8f85;font-size:12px;margin-top:18px">HerbaForms · hblwellnessform.com</p>
  </div>` };
}

module.exports = { sendMail, resetEmailHTML, hasApiKey: () => !!API_KEY };
