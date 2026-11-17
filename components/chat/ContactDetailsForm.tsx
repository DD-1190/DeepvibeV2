'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { ProjectData } from '@/lib/chat/types';
import { normalizePhone, validateContact, type FieldErrors } from '@/lib/chat/validate';

type Details = Pick<ProjectData, 'name' | 'phone' | 'email' | 'additional_notes'>;

const FIELDS: { k: keyof Details; label: string; type: string; auto: string; optional?: boolean; placeholder?: string }[] = [
  { k: 'name', label: 'Your name', type: 'text', auto: 'name' },
  { k: 'phone', label: 'WhatsApp number', type: 'tel', auto: 'tel', placeholder: '+91 98765 43210' },
  { k: 'email', label: 'Email', type: 'email', auto: 'email', optional: true },
  { k: 'additional_notes', label: 'Anything Naman should know?', type: 'textarea', auto: 'off', optional: true },
];

/** The only form in the conversation: name + WhatsApp (required), email + note (optional). */
export function ContactDetailsForm({ initial, onSubmit }: { initial: Details; onSubmit: (d: Details) => void }) {
  const [d, setD] = useState<Details>(initial);
  const [errors, setErrors] = useState<FieldErrors>({});

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const errs = validateContact({ ...d, website: '' });
        setErrors(errs);
        if (Object.keys(errs).length) {
          (e.currentTarget.querySelector(`[name="${Object.keys(errs)[0]}"]`) as HTMLInputElement | null)?.focus();
          return;
        }
        onSubmit({ name: d.name.trim(), phone: normalizePhone(d.phone), email: d.email.trim(), additional_notes: d.additional_notes.trim() });
      }}
      className="chat-card ml-[36px] space-y-3 rounded-[20px] p-4"
      aria-label="Your contact details"
    >
      {FIELDS.map((f) => (
        <div key={f.k}>
          <label htmlFor={`cd-${f.k}`} className="label mb-1.5 flex justify-between text-[0.625rem] text-muted">
            {f.label}
            {f.optional && <span className="text-muted/60">Optional</span>}
          </label>
          {f.type === 'textarea' ? (
            <textarea
              id={`cd-${f.k}`}
              name={f.k}
              rows={2}
              maxLength={1000}
              value={d[f.k]}
              onChange={(e) => setD({ ...d, [f.k]: e.target.value })}
              className="chat-field resize-none"
            />
          ) : (
            <input
              id={`cd-${f.k}`}
              name={f.k}
              type={f.type}
              autoComplete={f.auto}
              placeholder={f.placeholder}
              inputMode={f.type === 'email' ? 'email' : f.type === 'tel' ? 'tel' : undefined}
              value={d[f.k]}
              aria-invalid={!!errors[f.k]}
              aria-describedby={errors[f.k] ? `cd-${f.k}-err` : undefined}
              onChange={(e) => setD({ ...d, [f.k]: e.target.value })}
              className="chat-field placeholder:text-muted/50"
            />
          )}
          {errors[f.k] && (
            <p id={`cd-${f.k}-err`} className="mt-1.5 text-[0.75rem] text-[#ff9c8a]">
              {errors[f.k]}
            </p>
          )}
        </div>
      ))}
      <p className="pt-1 text-[0.75rem] leading-relaxed text-muted">Only used to reply to you. Nothing is sent until you confirm on the next step.</p>
      <button type="submit" className="chat-primary h-11 w-full text-[0.75rem]">
        Review &amp; send <ArrowRight size={15} />
      </button>
    </form>
  );
}
