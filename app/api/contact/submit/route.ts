import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import type { ProjectData } from '@/lib/chat/types';
import { validateEnquiry } from '@/lib/chat/validate';
import { enquiryText } from '@/lib/chat/whatsapp';
import { site } from '@/data/site';
import { clientIp, rateLimit, sameOrigin } from '@/lib/server/rateLimit';

/**
 * POST /api/contact/submit — delivers a confirmed enquiry. Never fakes success and stores nothing.
 * Destinations — every configured one is tried; success if at least one accepts it:
 *   CALLMEBOT_API_KEY (+ WHATSAPP_NOTIFY_NUMBER)              → WhatsApp message to Naman via CallMeBot
 *   RESEND_API_KEY + CONTACT_TO_EMAIL (+ CONTACT_FROM_EMAIL)  → email via Resend
 *   FORMSPREE_ENDPOINT                                          → Formspree form
 *   CONTACT_WEBHOOK_URL                                         → JSON POST (CRM, Zapier, Make, Slack…)
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const recent = new Map<string, number>(); // dedupe: hash → time

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function rows(d: ProjectData): [string, string][] {
  const budget = d.budget ? (/\d/.test(d.budget) && !/[₹$]/.test(d.budget) ? `${d.budget} (${d.currency})` : d.budget) : 'Not shared';
  return [
    ['Name', d.name],
    ['WhatsApp', d.phone],
    ['Email', d.email || '—'],
    ['Project type', d.project_type || '—'],
    ['Project', d.project_description || '—'],
    ['Support needed', d.services_required.join(', ') || '—'],
    ['Budget', budget],
    ['Timeline', d.timeline || '—'],
    ['Notes', d.additional_notes || '—'],
  ];
}

async function deliver(d: ProjectData, ref: string): Promise<'sent' | 'failed' | 'none'> {
  const subject = `New project enquiry — ${d.name} · ${d.phone} · ${ref}`;
  const table = rows(d);
  const text = table.map(([k, v]) => `${k}: ${v}`).join('\n');
  let attempted = false;
  let ok = false;

  // WhatsApp → Naman (CallMeBot: free, for notifying your own number — see README)
  if (process.env.CALLMEBOT_API_KEY) {
    attempted = true;
    const to = '+' + (process.env.WHATSAPP_NOTIFY_NUMBER || site.whatsapp).replace(/\D/g, '');
    const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(to)}&text=${encodeURIComponent(enquiryText(d, ref))}&apikey=${encodeURIComponent(process.env.CALLMEBOT_API_KEY)}`;
    const res = await fetch(url, { cache: 'no-store' }).catch(() => null);
    const body = res ? await res.text().catch(() => '') : '';
    if (res?.ok && !/error|invalid|not (allowed|activated)/i.test(body)) ok = true;
    else console.error('[contact/submit] CallMeBot failed', res?.status, body.replace(/<[^>]+>/g, ' ').slice(0, 200));
  }

  if (process.env.RESEND_API_KEY && process.env.CONTACT_TO_EMAIL) {
    attempted = true;
    const html = `<div style="font-family:Inter,Arial,sans-serif;color:#111"><h2 style="margin:0 0 16px">New project enquiry</h2><table cellpadding="8" style="border-collapse:collapse">${table
      .map(([k, v]) => `<tr><td style="color:#666;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="white-space:pre-line">${esc(v)}</td></tr>`)
      .join('')}</table><p style="color:#888;font-size:12px">Ref ${ref} · via the deepvibe.in project assistant</p></div>`;
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL || 'DeepVibe <onboarding@resend.dev>',
        to: process.env.CONTACT_TO_EMAIL.split(',').map((s) => s.trim()),
        ...(d.email ? { reply_to: d.email } : {}),
        subject,
        text,
        html,
      }),
    }).catch(() => null);
    if (res?.ok) ok = true;
    else console.error('[contact/submit] Resend failed', res?.status, res ? (await res.text()).slice(0, 300) : '');
  }

  if (process.env.FORMSPREE_ENDPOINT) {
    attempted = true;
    const res = await fetch(process.env.FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ _subject: subject, ...(d.email ? { _replyto: d.email } : {}), ...Object.fromEntries(table), reference: ref }),
    }).catch(() => null);
    if (res?.ok) ok = true;
    else console.error('[contact/submit] Formspree failed', res?.status);
  }

  if (process.env.CONTACT_WEBHOOK_URL) {
    attempted = true;
    const res = await fetch(process.env.CONTACT_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference: ref, source: 'deepvibe.in project assistant', submitted_at: new Date().toISOString(), ...d }),
    }).catch(() => null);
    if (res?.ok) ok = true;
    else console.error('[contact/submit] webhook failed', res?.status);
  }

  return ok ? 'sent' : attempted ? 'failed' : 'none';
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const ip = clientIp(req);

  let body: { data?: unknown; sessionId?: unknown; hp?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  const v = validateEnquiry(body.data);
  if (!v.ok) return NextResponse.json({ error: 'invalid', errors: v.errors }, { status: 400 });
  const d = v.data;

  // honeypot / link-spam: pretend nothing happened, deliver nothing
  const links = (`${d.project_description} ${d.additional_notes}`.match(/https?:\/\//g) ?? []).length;
  if ((typeof body.hp === 'string' && body.hp.trim()) || links > 4) return NextResponse.json({ error: 'rejected' }, { status: 400 });

  if (!rateLimit(`submit:${ip}`, 5, 10 * 60_000)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const hash = createHash('sha256')
    .update(JSON.stringify([String(body.sessionId ?? ''), d.phone, d.project_description, d.project_type]))
    .digest('hex');
  const ref = 'DV-' + hash.slice(0, 6).toUpperCase();
  const seen = recent.get(hash);
  if (seen && Date.now() - seen < 30 * 60_000) return NextResponse.json({ ok: true, reference: ref, duplicate: true });

  const result = await deliver(d, ref);
  if (result === 'none') return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  if (result === 'failed') return NextResponse.json({ error: 'delivery_failed' }, { status: 502 });

  recent.set(hash, Date.now());
  for (const [k, t] of recent) if (Date.now() - t > 60 * 60_000) recent.delete(k);
  return NextResponse.json({ ok: true, reference: ref });
}
