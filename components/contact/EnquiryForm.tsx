'use client';

import { FormEvent, useEffect, useId, useRef, useState } from 'react';
import { AlertCircle, ArrowUpRight, Check, Loader2 } from 'lucide-react';
import { contact, site } from '@/data/site';
import { cn } from '@/lib/cn';

/**
 * Project enquiry form.
 *
 * Submission: POSTs JSON to NEXT_PUBLIC_FORM_ENDPOINT (e.g. a Formspree / Web3Forms / Basin endpoint,
 * or your own API). It works with the static export, so no server is required.
 * Success is ONLY shown when that endpoint returns 2xx. If no endpoint is configured, the form says so
 * instead of pretending to send.
 */
const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? '';
const ENDPOINT = process.env.NEXT_PUBLIC_FORM_ENDPOINT || (WEB3FORMS_KEY ? 'https://api.web3forms.com/submit' : '');

type Currency = 'USD' | 'INR';

type Fields = { name: string; email: string; company: string; projectType: string; budget: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;
type Status = 'idle' | 'submitting' | 'success' | 'error' | 'unconfigured';

const EMPTY: Fields = { name: '', email: '', company: '', projectType: '', budget: '', message: '' };

function validate(f: Fields): Errors {
  const e: Errors = {};
  if (f.name.trim().length < 2) e.name = 'Please tell us your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = 'Please enter a valid email address.';
  if (!f.projectType) e.projectType = 'Pick the closest project type.';
  if (f.message.trim().length < 20) e.message = 'A couple of sentences helps — at least 20 characters.';
  return e;
}

export function EnquiryForm() {
  const uid = useId();
  const [f, setF] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [currency, setCurrency] = useState<Currency>('USD');

  // Default to rupees for visitors in India.
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta') setCurrency('INR');
    } catch {
      /* keep USD */
    }
  }, []);
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  const set = (k: keyof Fields) => (e: { target: { value: string } }) => {
    const next = { ...f, [k]: e.target.value };
    setF(next);
    if (touched[k]) setErrors(validate(next));
  };
  const blur = (k: keyof Fields) => () => {
    setTouched((t) => ({ ...t, [k]: true }));
    setErrors(validate(f));
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validate(f);
    setErrors(errs);
    setTouched({ name: true, email: true, projectType: true, message: true });
    if (Object.keys(errs).length) {
      const first = Object.keys(errs)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    // honeypot
    const hp = (formRef.current?.elements.namedItem('website') as HTMLInputElement | null)?.value;
    if (hp) return;

    if (!ENDPOINT) {
      setStatus('unconfigured');
      requestAnimationFrame(() => statusRef.current?.focus());
      return;
    }

    setStatus('submitting');
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          ...f,
          budget: f.budget ? `${f.budget} (${currency})` : 'Not specified',
          currency,
          replyto: f.email,
          // Formspree reads _subject; Web3Forms reads subject + access_key.
          _subject: `New project enquiry — ${f.name}${f.company ? ` (${f.company})` : ''}`,
          subject: `New project enquiry — ${f.name}${f.company ? ` (${f.company})` : ''}`,
          from_name: 'DeepVibe website',
          ...(WEB3FORMS_KEY ? { access_key: WEB3FORMS_KEY } : {}),
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus('success');
      setF(EMPTY);
      setTouched({});
    } catch {
      setStatus('error');
    }
    requestAnimationFrame(() => statusRef.current?.focus());
  }

  const fieldId = (k: string) => `${uid}-${k}`;
  const errId = (k: string) => `${uid}-${k}-err`;
  const show = (k: keyof Fields) => touched[k] && errors[k];

  const base =
    'peer w-full rounded-none border-0 border-b bg-transparent px-0 pb-3 pt-2 text-lg text-warm placeholder:text-muted/50 outline-none transition-colors duration-300 focus:border-lime focus-visible:outline-none';
  const border = (k: keyof Fields) => (show(k) ? 'border-[#ff8a7a]' : 'border-white/15 hover:border-white/30');

  if (status === 'success') {
    return (
      <div ref={statusRef} tabIndex={-1} role="status" className="flex flex-col items-start gap-6 py-10 outline-none">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-lime text-void">
          <Check size={24} />
        </span>
        <p className="font-display text-3xl font-medium tracking-[-0.03em] text-warm md:text-4xl">Thank you — your message is in.</p>
        <p className="max-w-[42ch] text-muted">We’ve received your enquiry and will reply to the email you gave us.</p>
        <button type="button" onClick={() => setStatus('idle')} className="label text-lime underline-offset-4 hover:underline">
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} aria-describedby={`${uid}-req`} className="relative">
      <p id={`${uid}-req`} className="label mb-10 text-muted">
        Fields marked <span className="text-lime">*</span> are required
      </p>

      {/* honeypot — hidden from people and assistive tech */}
      <div aria-hidden className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
        <label htmlFor={fieldId('website')}>Website</label>
        <input id={fieldId('website')} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2">
        {(
          [
            ['name', 'Name', true, 'text', 'name', 'Your full name'],
            ['email', 'Email', true, 'email', 'email', 'you@company.com'],
            ['company', 'Company', false, 'text', 'organization', 'Company or project'],
          ] as const
        ).map(([k, label, req, type, ac, ph]) => (
          <div key={k} className={k === 'company' ? 'md:col-span-2' : ''}>
            <label htmlFor={fieldId(k)} className="label block text-muted">
              {label} {req ? <span className="text-lime">*</span> : <span className="normal-case tracking-normal text-muted/60">(optional)</span>}
            </label>
            <input
              id={fieldId(k)}
              name={k}
              type={type}
              autoComplete={ac}
              placeholder={ph}
              required={req}
              aria-required={req}
              aria-invalid={!!show(k)}
              aria-describedby={show(k) ? errId(k) : undefined}
              value={f[k]}
              onChange={set(k)}
              onBlur={blur(k)}
              className={cn(base, border(k))}
            />
            {show(k) && (
              <p id={errId(k)} className="mt-2 flex items-center gap-1.5 text-sm text-[#ff8a7a]">
                <AlertCircle size={14} /> {errors[k]}
              </p>
            )}
          </div>
        ))}

        {/* project type */}
        <fieldset className="md:col-span-2" aria-describedby={show('projectType') ? errId('projectType') : undefined}>
          <legend className="label mb-4 text-muted">
            Project type <span className="text-lime">*</span>
          </legend>
          <div className="flex flex-wrap gap-2.5">
            {contact.projectTypes.map((t) => {
              const active = f.projectType === t;
              return (
                <label
                  key={t}
                  className={cn(
                    'cursor-pointer rounded-full border px-4 py-2.5 text-sm transition-colors duration-300 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-lime',
                    active ? 'border-lime bg-lime text-void' : 'border-white/15 text-warm hover:border-white/40',
                  )}
                >
                  <input
                    type="radio"
                    name="projectType"
                    value={t}
                    checked={active}
                    onChange={(e) => {
                      const next = { ...f, projectType: e.target.value };
                      setF(next);
                      setTouched((x) => ({ ...x, projectType: true }));
                      setErrors(validate(next));
                    }}
                    className="sr-only"
                  />
                  {t}
                </label>
              );
            })}
          </div>
          {show('projectType') && (
            <p id={errId('projectType')} className="mt-3 flex items-center gap-1.5 text-sm text-[#ff8a7a]">
              <AlertCircle size={14} /> {errors.projectType}
            </p>
          )}
        </fieldset>

        {/* budget */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <label htmlFor={fieldId('budget')} className="label block text-muted">
              Project budget <span className="normal-case tracking-normal text-muted/60">(optional)</span>
            </label>
            <div role="radiogroup" aria-label="Currency" className="relative flex gap-0.5 rounded-full border border-white/15 p-1">
              {(['USD', 'INR'] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={currency === c}
                  onClick={() => {
                    if (c === currency) return;
                    setCurrency(c);
                    setF((x) => ({ ...x, budget: '' }));
                  }}
                  className={cn(
                    'relative inline-flex h-8 min-w-[3.75rem] items-center justify-center rounded-full px-3.5 font-mono text-[0.6875rem] tracking-[0.08em] transition-colors duration-300',
                    currency === c ? 'bg-lime text-void' : 'text-muted hover:text-warm',
                  )}
                >
                  {c === 'USD' ? '$ USD' : '₹ INR'}
                </button>
              ))}
            </div>
          </div>
          <select
            id={fieldId('budget')}
            name="budget"
            value={f.budget}
            onChange={set('budget')}
            className={cn(base, 'mt-1 border-white/15 hover:border-white/30 [&>option]:bg-graphite', !f.budget && 'text-muted/60')}
          >
            <option value="">Select a range ({currency === 'USD' ? 'US dollars' : 'Indian rupees'})</option>
            {contact.budgets[currency].map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* message */}
        <div className="md:col-span-2">
          <label htmlFor={fieldId('message')} className="label block text-muted">
            Message <span className="text-lime">*</span>
          </label>
          <textarea
            id={fieldId('message')}
            name="message"
            rows={4}
            placeholder="What are you building, and where could we help?"
            required
            aria-required
            aria-invalid={!!show('message')}
            aria-describedby={show('message') ? errId('message') : undefined}
            value={f.message}
            onChange={set('message')}
            onBlur={blur('message')}
            className={cn(base, border('message'), 'resize-y')}
          />
          {show('message') && (
            <p id={errId('message')} className="mt-2 flex items-center gap-1.5 text-sm text-[#ff8a7a]">
              <AlertCircle size={14} /> {errors.message}
            </p>
          )}
        </div>
      </div>

      {/* status */}
      <div ref={statusRef} tabIndex={-1} aria-live="polite" className="outline-none">
        {status === 'error' && (
          <p className="mt-8 flex items-start gap-2 rounded-2xl border border-[#ff8a7a]/30 bg-[#ff8a7a]/5 p-4 text-sm text-warm">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-[#ff8a7a]" />
            Sorry — your message couldn’t be sent. Please try again in a moment
            {site.email ? (
              <>
                , or email <a className="text-lime underline" href={`mailto:${site.email}`}>{site.email}</a>
              </>
            ) : null}
            .
          </p>
        )}
        {status === 'unconfigured' && (
          <p className="mt-8 flex items-start gap-2 rounded-2xl border border-white/15 bg-white/[0.03] p-4 text-sm text-warm">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-lime" />
            {process.env.NODE_ENV === 'development'
              ? 'Form not connected: set NEXT_PUBLIC_WEB3FORMS_KEY or NEXT_PUBLIC_FORM_ENDPOINT in .env.local (see README). Nothing was sent.'
              : 'Our enquiry form isn’t live yet, so this message was not sent. Please check back soon.'}
            {site.email ? (
              <>
                {' '}You can email <a className="text-lime underline" href={`mailto:${site.email}`}>{site.email}</a> directly.
              </>
            ) : null}
          </p>
        )}
      </div>

      <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="group inline-flex h-14 items-center justify-between gap-4 rounded-full bg-lime pl-7 pr-2 font-display text-[0.8125rem] font-medium uppercase tracking-[0.08em] text-void transition-shadow duration-500 hover:shadow-[0_10px_40px_-8px_rgba(185,245,107,0.45)] disabled:opacity-70"
        >
          {status === 'submitting' ? 'Sending…' : 'Send enquiry'}
          <span className="grid h-10 w-10 place-items-center rounded-full bg-void text-lime">
            {status === 'submitting' ? <Loader2 size={16} className="animate-spin" /> : <ArrowUpRight size={16} />}
          </span>
        </button>
        <p className="label max-w-[34ch] leading-relaxed text-muted/80">We only use your details to reply to this enquiry.</p>
      </div>
    </form>
  );
}
