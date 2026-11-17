/** Validation shared by the browser and the API routes. */
import type { ProjectData } from './types';

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type FieldErrors = Partial<Record<keyof ProjectData, string>>;

/** "98734 70074" → "+919873470074"; keeps an explicit country code. Returns '' if it can't be a phone number. */
export function normalizePhone(raw: string): string {
  const t = raw.trim();
  let digits = t.replace(/\D/g, '');
  if (!t.startsWith('+') && digits.startsWith('00')) digits = digits.slice(2);
  else if (!t.startsWith('+') && digits.length === 11 && digits.startsWith('0')) digits = '91' + digits.slice(1);
  else if (!t.startsWith('+') && digits.length === 10) digits = '91' + digits; // Indian mobile without code
  return digits.length >= 8 && digits.length <= 15 ? '+' + digits : '';
}

/** "+919876543210" → "+91 98765 43210" for display. */
export function formatPhone(p: string): string {
  const m = /^\+91(\d{5})(\d{5})$/.exec(p);
  return m ? `+91 ${m[1]} ${m[2]}` : p;
}

export function validateContact(d: Pick<ProjectData, 'name' | 'phone' | 'email' | 'website'>): FieldErrors {
  const e: FieldErrors = {};
  if (d.name.trim().length < 2) e.name = 'Please share your name.';
  if (!normalizePhone(d.phone)) e.phone = 'Please enter a valid WhatsApp number (with country code if outside India).';
  if (d.email.trim() && !EMAIL_RE.test(d.email.trim())) e.email = 'That email doesn’t look right.';
  if (d.website.trim() && !/^(https?:\/\/)?[\w-]+(\.[\w-]+)+(\S*)$/i.test(d.website.trim())) e.website = 'That doesn’t look like a web address.';
  return e;
}

const LIMITS: Partial<Record<keyof ProjectData, number>> = {
  name: 100,
  phone: 24,
  email: 160,
  company: 120,
  website: 200,
  project_type: 120,
  project_description: 4000,
  budget: 120,
  timeline: 120,
  additional_notes: 4000,
};

/** Full server-side validation + normalisation of a submitted enquiry. */
export function validateEnquiry(input: unknown): { ok: true; data: ProjectData } | { ok: false; errors: FieldErrors } {
  if (!input || typeof input !== 'object') return { ok: false, errors: { name: 'Invalid request.' } };
  const r = input as Record<string, unknown>;
  const str = (k: keyof ProjectData) => (typeof r[k] === 'string' ? (r[k] as string).trim() : '');
  const data: ProjectData = {
    name: str('name'),
    phone: normalizePhone(str('phone')) || str('phone'),
    email: str('email'),
    company: str('company'),
    website: str('website'),
    project_type: str('project_type'),
    project_description: str('project_description'),
    services_required: Array.isArray(r.services_required)
      ? (r.services_required as unknown[]).filter((s): s is string => typeof s === 'string').map((s) => s.trim()).filter(Boolean).slice(0, 10)
      : [],
    budget: str('budget'),
    currency: r.currency === 'INR' ? 'INR' : 'USD',
    timeline: str('timeline'),
    additional_notes: str('additional_notes'),
  };
  const errors = validateContact(data);
  if (!data.project_type && !data.project_description) errors.project_description = 'Please tell us a little about the project.';
  for (const [k, max] of Object.entries(LIMITS) as [keyof ProjectData, number][]) {
    const v = data[k];
    if (typeof v === 'string' && v.length > max) errors[k] = `Please keep this under ${max} characters.`;
  }
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data };
}
