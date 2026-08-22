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

export function fmtRange(start: string, end: string): string {
  const s = parse(start);
  const e = parse(end);
  const sameYear = s.getFullYear() === e.getFullYear();
  const y = sameYear ? "" : `, ${s.getFullYear()}`;
  return `${fmtDate(start)}${y} – ${fmtDate(end)}, ${e.getFullYear()}`;
}

export function money(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}

// Placeholder place photo: random mountain image, stable per seed via ?lock.
// ponytail: external stand-in for real per-city photos; swap the URL when we have real ones.
export function placeImage(seed: number | string, w = 640, h = 360): string {
  return `https://loremflickr.com/${w}/${h}/mountain?lock=${seed}`;
}
