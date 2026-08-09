/**
 * Date/time formatting helpers. All dates come from the DB as ISO strings.
 */

export const fmtDate = (iso: string | Date): string => {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-NZ', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
};

export const fmtDateShort = (iso: string | Date): string => {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-NZ', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(d);
};

export const fmtTime = (iso: string | Date): string => {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-NZ', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(d);
};

export const fmtTimeRange = (startIso: string, endIso: string): string =>
  `${fmtTime(startIso)} - ${fmtTime(endIso)}`;

/** "(6 hrs)" style duration between two ISO timestamps */
export const fmtDuration = (startIso: string, endIso: string): string => {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (isNaN(start) || isNaN(end)) return '';
  const ms = end - start;
  const hours = ms / (1000 * 60 * 60);
  if (hours < 1) {
    const mins = Math.round(ms / (1000 * 60));
    return `(${mins} min)`;
  }
  if (hours % 1 === 0) return `(${hours} hr${hours === 1 ? '' : 's'})`;
  return `(${hours.toFixed(1)} hrs)`;
};

/** Relative time like "in 2h" / "3h ago" */
export const fmtRelative = (iso: string): string => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return ''; // invalid date - return empty rather than crash
  const ms = d.getTime() - Date.now();
  const abs = Math.abs(ms);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  if (abs < 60_000) return ms > 0 ? 'now' : 'just now';
  if (abs < 3600_000) return rtf.format(Math.round(ms / 60_000), 'minute');
  if (abs < 86400_000) return rtf.format(Math.round(ms / 3600_000), 'hour');
  return rtf.format(Math.round(ms / 86400_000), 'day');
};

/** Get {dow: 'MON', day: '10', mon: 'AUG'} blocks for the booking card date */
export const dateBlockParts = (iso: string): { dow: string; day: string; mon: string } => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return { dow: '-', day: '-', mon: '-' };
  return {
    dow: new Intl.DateTimeFormat('en-NZ', { weekday: 'short' }).format(d).toUpperCase(),
    day: String(d.getDate()),
    mon: new Intl.DateTimeFormat('en-NZ', { month: 'short' }).format(d).toUpperCase(),
  };
};
