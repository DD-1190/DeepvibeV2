/**
 * Conversation design for the project assistant.
 *
 * This scripted engine always works (static hosting, no API key, API outage). When the AI endpoint
 * is available it supplies the wording and extracts details from free text; the step order,
 * widgets and guard-rails below still apply.
 */
import type { Currency, ProjectData, Step } from './types';

export const OPENING =
  "Hey, welcome to DeepVibe.\n\nI'm here to help you explore your project idea and understand how our team can help bring it to life.\n\nWhat are you looking to build?";

export const PROJECT_TYPES = [
  'A new digital product',
  'Redesign an existing product',
  'An AI-powered experience',
  'Improve an existing user experience',
  'Something else',
];

export const SERVICES = [
  'Product strategy',
  'UX/UI design',
  'Design systems',
  'Brand and digital experiences',
  'End-to-end product design',
  'Not sure yet',
];

export const BUDGETS: Record<Currency, string[]> = {
  INR: ['Under ₹2 lakh', '₹2–5 lakh', '₹5–10 lakh', '₹10–25 lakh', '₹25 lakh+'],
  USD: ['Under $2.5k', '$2.5k–6k', '$6k–12k', '$12k–30k', '$30k+'],
};
export const BUDGET_EXTRA = ['Prefer to discuss', 'Custom budget'];

export const TIMELINES = ['Immediately', 'Within a month', 'Within 3 months', 'Just exploring'];

/** Type-specific follow-up — asked once, only when it adds something. */
export const FOLLOWUPS: Record<string, { q: string; chips: string[]; label: string }> = {
  'An AI-powered experience': {
    q: 'Interesting. Are you building a completely new AI product or adding AI capabilities to an existing product?',
    chips: ['A brand-new AI product', 'Adding AI to an existing product'],
    label: 'AI scope',
  },
  'Redesign an existing product': {
    q: "What's the biggest challenge with your current experience?",
    chips: ['Low conversion', 'Hard to use', 'Looks dated', "Doesn't scale"],
    label: 'Current challenge',
  },
  'Improve an existing user experience': {
    q: 'Where do people struggle the most today?',
    chips: ['Onboarding', 'Key workflows', 'Navigation', 'Not sure — needs research'],
    label: 'Where users struggle',
  },
  'A new digital product': {
    q: 'Nice. Where are you with it right now?',
    chips: ['Just an idea', 'Validated, ready to design', 'Have an MVP'],
    label: 'Stage',
  },
};

const ACKS = ['Got it.', 'Nice.', 'Helpful, thanks.', 'Perfect.', 'Love that.'];
let ackI = 0;
const ack = () => ACKS[ackI++ % ACKS.length];

/** Map free text to one of the project types. */
export function matchProjectType(text: string): string | null {
  const t = text.toLowerCase();
  if (/\b(ai|gpt|llm|machine learning|ml|agent|chatbot)\b/.test(t)) return 'An AI-powered experience';
  if (/re-?design|revamp|refresh|overhaul/.test(t)) return 'Redesign an existing product';
  if (/improve|ux|usability|conversion|onboarding/.test(t)) return 'Improve an existing user experience';
  if (/\b(new|launch|build|mvp|startup|app|platform|saas)\b/.test(t)) return 'A new digital product';
  return null;
}

export function matchServices(text: string): string[] {
  const t = text.toLowerCase();
  const out: string[] = [];
  if (/strateg|discovery|research/.test(t)) out.push('Product strategy');
  if (/ux|ui|interface|design the|screens|prototype/.test(t)) out.push('UX/UI design');
  if (/design system|component/.test(t)) out.push('Design systems');
  if (/brand|website|identity|landing/.test(t)) out.push('Brand and digital experiences');
  if (/end[- ]to[- ]end|everything|full/.test(t)) out.push('End-to-end product design');
  return out;
}

export const followupFor = (d: ProjectData) => FOLLOWUPS[d.project_type];

/** Apply a visitor answer to the project data for the current step (scripted parsing). */
export function applyAnswer(step: Step, text: string, d: ProjectData): ProjectData {
  const v = text.trim();
  const next = { ...d, services_required: [...d.services_required] };
  const note = (label: string) =>
    (next.additional_notes = [next.additional_notes, `${label}: ${v}`].filter(Boolean).join('\n'));
  switch (step) {
    case 'project_type': {
      const exact = PROJECT_TYPES.find((p) => p.toLowerCase() === v.toLowerCase());
      next.project_type = exact ?? matchProjectType(v) ?? 'Something else';
      // a detailed free-text answer doubles as the description
      if (!exact && v.length >= 40) next.project_description = v;
      break;
    }
    case 'followup': {
      const f = followupFor(d);
      note(f?.label ?? 'Detail');
      break;
    }
    case 'description':
      next.project_description = [next.project_description, v].filter(Boolean).join('\n');
      break;
    case 'services': {
      const picked = v.split(/\s*,\s*|\s+and\s+/).filter((s) => SERVICES.includes(s));
      next.services_required = picked.length ? picked : matchServices(v).length ? matchServices(v) : [v];
      break;
    }
    case 'budget':
    case 'budget_custom':
      next.budget = /^(skip|no|none|n\/a|rather not)/i.test(v) ? 'Not shared' : v;
      break;
    case 'timeline':
      next.timeline = v;
      break;
  }
  return next;
}

/** Decide the next step from what we already know (skips anything already answered). */
export function nextStep(from: Step, d: ProjectData, followupDone: boolean): Step {
  const order: Step[] = ['project_type', 'followup', 'description', 'services', 'budget', 'timeline', 'contact', 'summary'];
  const start = from === 'budget_custom' ? order.indexOf('budget') + 1 : order.indexOf(from) + 1;
  for (const s of order.slice(Math.max(0, start))) {
    if (s === 'followup' && (followupDone || !followupFor(d))) continue;
    if (s === 'description' && d.project_description.trim().length >= 40) continue;
    if (s === 'services' && d.services_required.length) continue;
    if (s === 'budget' && d.budget) continue;
    if (s === 'timeline' && d.timeline) continue;
    if (s === 'contact' && d.name && d.email) continue;
    return s;
  }
  return 'summary';
}

/** Scripted wording for a step (used when the AI endpoint is unavailable). */
export function questionFor(step: Step, d: ProjectData, isFirstAck = true): { text: string; chips: string[] } {
  const a = isFirstAck ? ack() + ' ' : '';
  switch (step) {
    case 'followup': {
      const f = followupFor(d)!;
      return { text: f.q, chips: f.chips };
    }
    case 'description':
      return {
        text: `${a}${d.project_type === 'Something else' ? 'Tell me a little about what you have in mind.' : 'Tell me a little about your business or idea.'}`,
        chips: [],
      };
    case 'services':
      return { text: `${a}What kind of support are you looking for? Pick as many as you like.`, chips: SERVICES };
    case 'budget':
      return { text: `${a}Do you have an approximate budget in mind? Totally optional.`, chips: [] };
    case 'budget_custom':
      return { text: 'Sure — what budget do you have in mind?', chips: [] };
    case 'timeline':
      return { text: `${a}When are you looking to start?`, chips: TIMELINES };
    case 'contact':
      return { text: `${a}Where can Naman reach you?`, chips: [] };
    case 'summary':
      return { text: "Here's what I've captured. Have a quick look, edit anything, then send it over.", chips: [] };
    default:
      return { text: 'What are you looking to build?', chips: PROJECT_TYPES };
  }
}

export function defaultCurrency(): Currency {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta' ? 'INR' : 'USD';
  } catch {
    return 'USD';
  }
}
