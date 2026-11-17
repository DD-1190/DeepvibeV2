import { site } from '@/data/site';
import type { ProjectData } from './types';

/** Plain-text enquiry, as it reads in WhatsApp (used for the server notification and the click-to-chat fallback). */
export function enquiryText(d: ProjectData, ref?: string): string {
  const head = `New project enquiry${ref ? ` · ${ref}` : ''}`;
  const rows: [string, string][] = [
    ['Name', d.name],
    ['WhatsApp', d.phone],
    ['Email', d.email],
    ['Company', d.company],
    ['Looking to build', d.project_type],
    ['In their words', d.project_description],
    ['Notes', d.additional_notes],
  ];
  return [head, '', ...rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`)].join('\n');
}

/** wa.me link that opens WhatsApp with the visitor's message to Naman pre-typed. */
export function whatsappLink(d: ProjectData): string {
  const first = d.name.split(' ')[0];
  const intro = `Hi Naman, I'm ${first}. I found DeepVibe and would like to talk about a project.\n\n`;
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(intro + enquiryText(d).split('\n').slice(2).join('\n'))}`;
}
