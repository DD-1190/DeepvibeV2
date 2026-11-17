'use client';

import { useSyncExternalStore } from 'react';
import { BUDGET_EXTRA, OPENING, PROJECT_TYPES, applyAnswer, defaultCurrency, followupFor, nextStep, questionFor } from './flow';
import { formatPhone } from './validate';
import { EMPTY_PROJECT, STEPS, type ChatApiResponse, type ChatMessage, type Currency, type ProjectData, type Step } from './types';

/**
 * Project-assistant state. A tiny external store (no context, no re-render storms):
 * components subscribe with useChat(selector). The conversation is kept in sessionStorage so it
 * survives closing/reopening and page reloads in the same tab, and is gone when the tab closes.
 */

export type SubmitState = { status: 'idle' | 'sending' | 'sent' | 'handoff' | 'error'; message?: string; reference?: string };

export type ChatState = {
  open: boolean;
  started: boolean;
  messages: ChatMessage[];
  data: ProjectData;
  step: Step;
  chips: string[]; // AI/follow-up quick replies for free-text steps
  followupDone: boolean;
  typing: boolean;
  ai: 'unknown' | 'on' | 'off';
  submit: SubmitState;
  sessionId: string;
  error: string | null;
};

const KEY = 'dv-project-chat-v1';
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

const initial = (): ChatState => ({
  open: false,
  started: false,
  messages: [],
  data: { ...EMPTY_PROJECT },
  step: 'project_type',
  chips: [],
  followupDone: false,
  typing: false,
  ai: 'unknown',
  submit: { status: 'idle' },
  sessionId: uid(),
  error: null,
});

let state: ChatState = initial();
let hydrated = false;
const subs = new Set<() => void>();

function hydrate() {
  if (hydrated || typeof window === 'undefined') return;
  hydrated = true;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Partial<ChatState>;
      state = { ...state, ...saved, open: false, typing: false, error: null };
      if (state.submit.status === 'sending') state.submit = { status: 'idle' };
    }
  } catch {
    /* ignore */
  }
  if (!state.started) state.data.currency = defaultCurrency();
}

function persist() {
  try {
    const { open: _o, typing: _t, error: _e, ...rest } = state;
    sessionStorage.setItem(KEY, JSON.stringify(rest));
  } catch {
    /* storage unavailable — conversation still works in memory */
  }
}

function set(patch: Partial<ChatState>) {
  state = { ...state, ...patch };
  persist();
  subs.forEach((f) => f());
}

export function useChat<T>(selector: (s: ChatState) => T): T {
  return useSyncExternalStore(
    (cb) => {
      hydrate();
      subs.add(cb);
      return () => subs.delete(cb);
    },
    () => selector(state),
    () => selector(initial()),
  );
}

export const getChat = () => state;

const msg = (role: ChatMessage['role'], text: string): ChatMessage => ({ id: uid(), role, text });
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

async function say(text: string, step: Step, chips: string[] = [], delay = 650) {
  set({ typing: true });
  await wait(reduced() ? 150 : delay + Math.min(900, text.length * 6));
  set({ typing: false, messages: [...state.messages, msg('assistant', text)], step, chips });
}

/* ───────────────────────── actions ───────────────────────── */

export async function openChat(opts: { answer?: string; note?: string } = {}) {
  hydrate();
  set({ open: true });
  if (opts.note && !state.data.additional_notes.includes(opts.note)) {
    set({ data: { ...state.data, additional_notes: [state.data.additional_notes, opts.note].filter(Boolean).join('\n') } });
  }
  if (!state.started) {
    set({ started: true });
    await say(OPENING, 'project_type', PROJECT_TYPES, 500);
  }
  if (opts.answer && state.step === 'project_type') await send(opts.answer);
}

export const closeChat = () => set({ open: false });

export function restartChat() {
  const keepCurrency = state.data.currency;
  state = { ...initial(), open: true, ai: state.ai };
  state.data.currency = keepCurrency;
  persist();
  subs.forEach((f) => f());
  void openChat();
}

export const setCurrency = (currency: Currency) => set({ data: { ...state.data, currency } });
export const updateData = (patch: Partial<ProjectData>) => set({ data: { ...state.data, ...patch } });

async function askAI(answeredStep: Step, data: ProjectData): Promise<ChatApiResponse | null> {
  if (state.ai === 'off') return null;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 12000);
    const res = await fetch('/api/contact/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: answeredStep, data, messages: state.messages.slice(-16), followupDone: state.followupDone }),
      signal: ctrl.signal,
    });
    clearTimeout(t);
    if (!(res.headers.get('content-type') ?? '').includes('application/json')) {
      set({ ai: 'off' }); // static hosting: no API here
      return null;
    }
    if (!res.ok) {
      // 404 (static hosting) or 503 (no key) → switch to the scripted assistant for this session
      if (res.status === 404 || res.status === 503 || res.status === 405) set({ ai: 'off' });
      return null;
    }
    const json = (await res.json()) as ChatApiResponse & { unavailable?: boolean };
    if (json.unavailable) {
      set({ ai: 'off' });
      return null;
    }
    if (typeof json.reply !== 'string' || !STEPS.includes(json.next)) return null;
    set({ ai: 'on' });
    return json;
  } catch {
    return null;
  }
}

/** Visitor sends an answer (typed or chip). */
export async function send(raw: string) {
  const text = raw.trim();
  if (!text || state.typing) return;
  const step = state.step;
  if (step === 'contact' || step === 'summary' || step === 'done') return;

  set({ messages: [...state.messages, msg('user', text)], chips: [], error: null });

  if (step === 'budget' && text === BUDGET_EXTRA[1]) {
    await say(questionFor('budget_custom', state.data).text, 'budget_custom', [], 350);
    return;
  }

  let data = applyAnswer(step, text, state.data);
  let followupDone = state.followupDone || step === 'followup';
  // project type changed → the old follow-up no longer applies
  if (step === 'project_type' && !followupFor(data)) followupDone = true;

  set({ typing: true });
  const ai = await askAI(step, data);
  if (ai) {
    const clean: Partial<ProjectData> = {};
    for (const [k, v] of Object.entries(ai.updates ?? {}) as [keyof ProjectData, unknown][]) {
      if (v === null || v === undefined || v === '') continue;
      if (k === 'services_required' && Array.isArray(v) && v.length) clean.services_required = v.map(String).slice(0, 8);
      else if (k === 'currency' && (v === 'INR' || v === 'USD')) clean.currency = v;
      else if (typeof v === 'string' && k in EMPTY_PROJECT && k !== 'services_required') (clean as Record<string, string>)[k] = v.slice(0, 2000);
    }
    // AI extraction only fills gaps — it never overwrites what the visitor actually said
    for (const [k, v] of Object.entries(clean) as [keyof ProjectData, never][]) {
      const cur = data[k];
      const empty = Array.isArray(cur) ? !cur.length : !cur || (k === 'project_type' && cur === 'Something else');
      if (empty || k === 'currency') data = { ...data, [k]: v };
    }
  }

  const computed = nextStep(step === 'budget_custom' ? 'budget' : step, data, followupDone);
  if (computed !== 'followup' && step === 'project_type') followupDone = true;
  set({ data, followupDone });

  if (ai && ai.next === computed && ai.reply.trim()) {
    const chips = computed === 'followup' || computed === 'description' ? (ai.quick_replies ?? []).slice(0, 4) : questionFor(computed, data, false).chips;
    await say(ai.reply.trim(), computed, computed === 'followup' && !chips.length ? followupFor(data)?.chips ?? [] : chips, 250);
  } else {
    const q = questionFor(computed, data);
    await say(q.text, computed, q.chips);
  }
  if (computed === 'followup') set({ followupDone: true });
}

/** Contact form completed. */
export async function submitContactDetails(details: Pick<ProjectData, 'name' | 'phone' | 'email' | 'additional_notes'>) {
  const data = { ...state.data, ...details };
  set({ data, messages: [...state.messages, msg('user', `${details.name} · ${formatPhone(details.phone)}`)] });
  await say(questionFor('summary', data).text, 'summary', [], 400);
}

/** Final, explicit submission from the summary card. */
export async function submitEnquiry(honeypot = '') {
  if (state.submit.status === 'sending' || state.submit.status === 'sent') return;
  set({ submit: { status: 'sending' } });
  const payload = { data: state.data, sessionId: state.sessionId, hp: honeypot };
  try {
    const res = await fetch('/api/contact/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const isJson = (res.headers.get('content-type') ?? '').includes('application/json');
    const json = (isJson ? await res.json().catch(() => ({})) : {}) as { ok?: boolean; reference?: string; error?: string; errors?: Record<string, string> };
    if (res.ok && json.ok) return succeed(json.reference);
    if (!isJson || res.status === 404 || res.status === 405 || (res.status === 503 && json.error === 'not_configured')) {
      if (await viaWeb3Forms()) return succeed();
      // no automatic delivery configured → hand over to WhatsApp click-to-chat (the visitor presses send)
      return set({ submit: { status: 'handoff' } });
    }
    if (res.status === 429) return fail('Too many attempts — please wait a few minutes and try again.');
    if (res.status === 400 && json.errors) return fail(Object.values(json.errors)[0] ?? 'Please check your details.');
    return fail('Something went wrong sending your enquiry. Please try again.');
  } catch {
    if (await viaWeb3Forms()) return succeed();
    return set({ submit: { status: 'handoff' } });
  }
}

async function viaWeb3Forms(): Promise<boolean> {
  const key = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;
  if (!key) return false;
  const d = state.data;
  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: key,
        subject: `New project enquiry — ${d.name} · WhatsApp ${d.phone}`,
        from_name: 'DeepVibe project assistant',
        ...(d.email ? { replyto: d.email } : {}),
        ...d,
        services_required: d.services_required.join(', '),
        budget: d.budget ? `${d.budget}${/[₹$]/.test(d.budget) ? '' : ` (${d.currency})`}` : 'Not shared',
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function succeed(reference?: string) {
  set({ submit: { status: 'sent', reference } });
  const first = state.data.name.split(' ')[0];
  await say(`Thank you${first ? `, ${first}` : ''}. Naman has your details and will message you on WhatsApp at ${formatPhone(state.data.phone)}.`, 'done', [], 300);
}

/** Visitor opened WhatsApp with the pre-typed message. We can't see whether they pressed send, so we say so. */
export async function confirmHandoff() {
  const first = state.data.name.split(' ')[0];
  await say(
    `WhatsApp should be open with your message ready${first ? `, ${first}` : ''} — just press send and Naman will reply there. If it didn't open, use the button again.`,
    'done',
    [],
    300,
  );
}

function fail(message: string) {
  set({ submit: { status: 'error', message } });
}
