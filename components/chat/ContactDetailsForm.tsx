'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { ProjectData } from '@/lib/chat/types';
import { validateContact, type FieldErrors } from '@/lib/chat/validate';

type Details = Pick<ProjectData, 'name' | 'email' | 'company' | 'website'>;

const FIELDS: { k: keyof Details; label: string; type: string; auto: string; optional?: boolean }[] = [
  { k: 'name', label: 'Your name', type: 'text', auto: 'name' },
  { k: 'email', label: 'Work email', type: 'email', auto: 'email' },
  { k: 'company', label: 'Company', type: 'text', auto: 'organization', optional: true },
  { k: 'website', label: 'Website', type: 'url', auto: 'url', optional: true },
];

/** Q6 — the only structured form in the conversation. */
export function ContactDetailsForm({ initial, onSubmit }: { initial: Details; onSubmit: (d: Details) => void }) {
  const [d, setD] = useState<Details>(initial);
  const [errors, setErrors] = useState<FieldErrors>({});

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const errs = validateContact(d);
        setErrors(errs);
        if (Object.keys(errs).length) {
          (e.currentTarget.querySelector(`[name="${Object.keys(errs)[0]}"]`) as HTMLInputElement | null)?.focus();
          return;
        }
        onSubmit({ name: d.name.trim(), email: d.email.trim(), company: d.company.trim(), website: d.website.trim() });
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
          <input
            id={`cd-${f.k}`}
            name={f.k}
            type={f.type}
            autoComplete={f.auto}
            inputMode={f.type === 'email' ? 'email' : f.type === 'url' ? 'url' : undefined}
            value={d[f.k]}
            aria-invalid={!!errors[f.k]}
            aria-describedby={errors[f.k] ? `cd-${f.k}-err` : undefined}
            onChange={(e) => setD({ ...d, [f.k]: e.target.value })}
            className="chat-field"
          />
          {errors[f.k] && (
            <p id={`cd-${f.k}-err`} className="mt-1.5 text-[0.75rem] text-[#ff9c8a]">
              {errors[f.k]}
            </p>
          )}
        </div>
      ))}
      <p className="pt-1 text-[0.75rem] leading-relaxed text-muted">Only used to reply to this enquiry. Nothing is sent until you confirm on the next step.</p>
      <button type="submit" className="chat-primary h-11 w-full text-[0.75rem]">
        Review my enquiry <ArrowRight size={15} />
      </button>
    </form>
  );
}
