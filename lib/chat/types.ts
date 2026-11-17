/** Shared types for the DeepVibe project assistant (client + server). */

export type Currency = 'INR' | 'USD';

export type ProjectData = {
  name: string;
  phone: string;
  email: string;
  company: string;
  website: string;
  project_type: string;
  project_description: string;
  services_required: string[];
  budget: string;
  currency: Currency;
  timeline: string;
  additional_notes: string;
};

export const EMPTY_PROJECT: ProjectData = {
  name: '',
  phone: '',
  email: '',
  company: '',
  website: '',
  project_type: '',
  project_description: '',
  services_required: [],
  budget: '',
  currency: 'USD',
  timeline: '',
  additional_notes: '',
};

/** Conversation steps, in their natural order. */
export const STEPS = [
  'project_type',
  'followup',
  'description',
  'services',
  'budget',
  'budget_custom',
  'timeline',
  'contact',
  'summary',
  'done',
] as const;
export type Step = (typeof STEPS)[number];

export type ChatMessage = { id: string; role: 'assistant' | 'user'; text: string };

/** What /api/contact/chat returns. */
export type ChatApiResponse = {
  reply: string;
  next: Step;
  quick_replies: string[];
  updates: Partial<ProjectData>;
};
