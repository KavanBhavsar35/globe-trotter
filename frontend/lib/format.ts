// Display helpers. Dates are YYYY-MM-DD strings from the API / native inputs.

// Parse as local date (avoid TZ shift from `new Date("2026-08-22")` being UTC).
function parse(d: string): Date {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, day ?? 1);
}

export function fmtDate(d: string): string {
  if (!d) return "";
  return parse(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// Day-wise label, e.g. "Fri, Aug 1".
export function fmtDateLong(d: string): string {
  if (!d) return "";
  return parse(d).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// Shift a YYYY-MM-DD string by n days, returning YYYY-MM-DD (local, no TZ drift).
export function addDays(d: string, n: number): string {
  const dt = parse(d);
  dt.setDate(dt.getDate() + n);
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${dt.getFullYear()}-${m}-${day}`;
}

export function fmtRange(start: string, end: string): string {
  const s = parse(start);
  const e = parse(end);
  const sameYear = s.getFullYear() === e.getFullYear();
  const y = sameYear ? "" : `, ${s.getFullYear()}`;
  return `${fmtDate(start)}${y} – ${fmtDate(end)}, ${e.getFullYear()}`;
}

export function money(n: number): string {
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

// Searchable placeholder photo from LoremFlickr, using search keywords.
export function loremflickr(search: number | string, w = 640, h = 360): string {
  if (typeof search === "number") {
    return `https://loremflickr.com/${w}/${h}/travel`;
  }
  const tags = search
    .toLowerCase()
    .replace(/[^a-z0-9,\s]/g, "")
    .trim()
    .split(/[\s,]+/)
    .filter(Boolean)
    .join(",");

  return `https://loremflickr.com/${w}/${h}/${tags || "travel"}`;
}

export function picsum(seed: number | string, w = 640, h = 360): string {
  return loremflickr(seed, w, h);
}

// Prefer a stored image; fall back to a searchable loremflickr placeholder.
export function imageOr(url: string | undefined | null, search: number | string, w = 640, h = 360): string {
  return url ? url : loremflickr(search, w, h);
}
