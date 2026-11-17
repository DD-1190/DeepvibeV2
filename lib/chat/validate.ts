/** Validation shared by the browser and the API routes. */
import type { ProjectData } from './types';

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type FieldErrors = Partial<Record<keyof ProjectData, string>>;

export function validateContact(d: Pick<ProjectData, 'name' | 'email' | 'website'>): FieldErrors {
  const e: FieldErrors = {};
  if (d.name.trim().length < 2) e.name = 'Please share your name.';
  if (!EMAIL_RE.test(d.email.trim())) e.email = 'Please enter a valid email address.';
  if (d.website.trim() && !/^(https?:\/\/)?[\w-]+(\.[\w-]+)+(\S*)$/i.test(d.website.trim())) e.website = 'That doesn’t look like a web address.';
  return e;
}

const LIMITS: Partial<Record<keyof ProjectData, number>> = {
  name: 100,
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
