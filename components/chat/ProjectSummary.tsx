'use client';

import { useState } from 'react';
import { ArrowUpRight, Check, Loader2, Pencil, RotateCw } from 'lucide-react';
import { SERVICES } from '@/lib/chat/flow';
import { whatsappLink } from '@/lib/chat/whatsapp';
import type { ProjectData } from '@/lib/chat/types';
import type { SubmitState } from '@/lib/chat/store';
import { formatPhone, validateContact } from '@/lib/chat/validate';
import { cn } from '@/lib/cn';

type Props = {
  data: ProjectData;
  submit: SubmitState;
  onChange: (patch: Partial<ProjectData>) => void;
  onSubmit: (honeypot: string) => void;
  onHandoff: () => void;
};

type Row = { k: keyof ProjectData; label: string; multiline?: boolean; optional?: boolean };
const ROWS: Row[] = [
  { k: 'project_type', label: 'Looking to build' },
  { k: 'project_description', label: 'In your words', multiline: true, optional: true },
  { k: 'name', label: 'Name' },
  { k: 'phone', label: 'WhatsApp' },
  { k: 'email', label: 'Email', optional: true },
  { k: 'additional_notes', label: 'Note', multiline: true, optional: true },
];

/** "We've got the idea." — editable recap. Nothing is sent until the visitor presses submit. */
export function ProjectSummary({ data, submit, onChange, onSubmit, onHandoff }: Props) {
  const [editing, setEditing] = useState<keyof ProjectData | null>(null);
  const [hp, setHp] = useState('');
  const locked = submit.status === 'sending' || submit.status === 'sent' || submit.status === 'handoff';
  const contactErrors = validateContact(data);
  const handoff = submit.status === 'handoff';
  const invalid = Object.keys(contactErrors).length > 0 || (!data.project_type && !data.project_description);

  const display = (r: Row) => {
    const v = data[r.k];
    if (r.k === 'services_required') return (v as string[]).join(', ');
    if (r.k === 'phone') return formatPhone(v as string);
    if (r.k === 'budget' && v && /\d/.test(v as string) && !/[₹$]/.test(v as string)) return `${v} (${data.currency})`;
    return v as string;
  };

  return (
    <section aria-labelledby="summary-title" className="chat-card relative ml-[36px] overflow-hidden rounded-[22px]">
      <div className="relative px-5 pb-4 pt-5">
        <p className="label text-[0.625rem] text-lime">Project summary</p>
        <h3 id="summary-title" className="mt-2 font-display text-[1.5rem] font-medium leading-none tracking-[-0.03em] text-warm">
          We&apos;ve got the idea<span className="text-lime">.</span>
        </h3>
      </div>

      <dl className="divide-y divide-white/[0.06] border-y border-white/[0.06]">
        {ROWS.map((r) => {
          const value = display(r);
          if (!value && r.optional && editing !== r.k) return null;
          const isEditing = editing === r.k;
          const err = (r.k === 'name' || r.k === 'phone' || r.k === 'email') && contactErrors[r.k];
          return (
            <div key={r.k} className="group/row px-5 py-3">
              <div className="flex items-center justify-between gap-3">
                <dt className="label text-[0.625rem] text-muted">{r.label}</dt>
                {!locked && (
                  <button
                    type="button"
                    onClick={() => setEditing(isEditing ? null : r.k)}
                    aria-label={isEditing ? `Done editing ${r.label}` : `Edit ${r.label}`}
                    className="grid h-7 w-7 place-items-center rounded-full text-muted transition-colors hover:bg-white/[0.06] hover:text-lime"
                  >
                    {isEditing ? <Check size={14} /> : <Pencil size={12} />}
                  </button>
                )}
              </div>
              <dd className="mt-1">
                {!isEditing ? (
                  <p className={cn('whitespace-pre-line break-words text-[0.875rem] leading-relaxed', value ? 'text-warm/95' : 'text-muted/70')}>
                    {value || 'Not shared'}
                  </p>
                ) : r.k === 'services_required' ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {SERVICES.map((s) => {
                      const on = data.services_required.includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          aria-pressed={on}
                          onClick={() =>
                            onChange({ services_required: on ? data.services_required.filter((x) => x !== s) : [...data.services_required, s] })
                          }
                          className={cn('chat-chip !py-1.5 !text-[0.75rem]', on && 'chat-chip-on')}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                ) : r.multiline ? (
                  <textarea
                    autoFocus
                    rows={3}
                    aria-label={r.label}
                    value={data[r.k] as string}
                    onChange={(e) => onChange({ [r.k]: e.target.value })}
                    className="chat-field resize-none"
                  />
                ) : (
                  <input
                    autoFocus
                    aria-label={r.label}
                    type={r.k === 'email' ? 'email' : r.k === 'phone' ? 'tel' : 'text'}
                    value={data[r.k] as string}
                    onChange={(e) => onChange({ [r.k]: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && setEditing(null)}
                    className="chat-field"
                  />
                )}
                {err && <p className="mt-1 text-[0.75rem] text-[#ff9c8a]">{err}</p>}
              </dd>
            </div>
          );
        })}
      </dl>

      {/* honeypot — invisible to people, tempting to bots */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Leave this empty
          <input tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} name="company_url" />
        </label>
      </div>

      <div className="p-4">
        {submit.status === 'error' && (
          <p role="alert" className="mb-3 rounded-2xl border border-[#ff9c8a]/25 bg-[#ff9c8a]/[0.06] px-3.5 py-2.5 text-[0.8125rem] leading-relaxed text-[#ffc2b6]">
            {submit.message}
          </p>
        )}
        {handoff ? (
          <>
            <p className="mb-3 text-[0.8125rem] leading-relaxed text-warm/85">
              One last tap: WhatsApp opens with your message ready — just press send.
            </p>
            <a
              href={whatsappLink(data)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onHandoff}
              className="chat-primary h-12 w-full text-[0.78rem]"
            >
              Send on WhatsApp <ArrowUpRight size={16} />
            </a>
          </>
        ) : submit.status === 'sent' ? (
          <p role="status" className="flex items-center justify-center gap-2 rounded-full border border-lime/30 bg-lime/[0.08] py-3 text-[0.8125rem] text-lime">
            <Check size={15} /> Sent to Naman{submit.reference ? ` · Ref ${submit.reference}` : ''}
          </p>
        ) : (
          <button
            type="button"
            disabled={locked || invalid}
            onClick={() => onSubmit(hp)}
            className="chat-primary h-12 w-full text-[0.78rem] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submit.status === 'sending' ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Sending…
              </>
            ) : submit.status === 'error' ? (
              <>
                <RotateCw size={14} /> Try again
              </>
            ) : (
              <>
                Send to Naman <ArrowUpRight size={16} />
              </>
            )}
          </button>
        )}
        {submit.status !== 'sent' && (
          <p className="mt-2.5 text-center text-[0.6875rem] text-muted/80">Goes straight to Naman on WhatsApp. No mailing lists.</p>
        )}
      </div>
    </section>
  );
}
