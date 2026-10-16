// VanCash ERP series kit (episodes 2-6): the type, shapes, icons, screens, backgrounds, the cut,
// and the scenes every episode shares (series opener, checkpoint, next episode, end card).
// Built from episode 1's film.js so the whole series looks like one show.
//
// Timing: shared/score.py writes <ep>/vo_timeline.json (where each section's take sits in the film)
// and <ep>/vo_words.json (Scribe word timings, section-relative). Scenes ask for words by their
// spoken text, so a cue never drifts from the voice:  cue('s04', 'هواتف جديدة')  -> beats per word.
// Arabic is set right-to-left one whole word at a time, never per letter, so letters stay joined.
import * as M from './motion.js';

export { M };
export const { W, H, E, prog, lerp, clamp, springU, springKeys, SPRING, wobble, rrect, U, TS } = M;

// Brand tokens from the landing page (index.html :root).
export const C = {
  paper: '#f6f9ff', white: '#ffffff', ink: '#0c234a', muted: '#50617e', faint: '#8a9ab3', line: '#dce5f5',
  accent: '#2457f5', accentDeep: '#163bc4', wash: '#eaf1ff', lime: '#c5f85c', green: '#067b52', mint: '#e7f8f0',
  wa: '#087c57', red: '#c0392b', redWash: '#fdecea', amber: '#c77700',
};
export const DISPLAY = 'Display', UI = 'UI';
export const F = (size, weight = 800, fam = DISPLAY) => `${weight} ${size}px ${fam}`;
export const R = 1824, L0 = 96;          // safe edges; RTL lines hang from R

export const S = { SEC: {}, START: [], IMG: {}, BG: {}, TRANS: [], WORDS: {}, N: 0 };
export const w = (id, t) => U(S.SEC[id].shift + t);          // section-relative seconds -> beats
export const ws = (id, ts, lead = 0.15) => ts.map((t) => w(id, t) - lead);

// ================================================================ words
const norm = (s) => s.replace(/[ً-ْٰـ]/g, '').replace(/[،,.:؛؟?!«»"()]/g, '').trim();
const CUES = new Map();
// Split a cue phrase into tokens; [a b c] is one display word spoken as several.
function tokens(phrase) {
  const out = [];
  const re = /\[([^\]]+)\]|(\S+)/g;
  let m;
  while ((m = re.exec(phrase))) out.push((m[1] || m[2]).split(/\s+/).map(norm).filter(Boolean));
  return out;
}
function find(sid, phrase, occ) {
  const key = `${sid}|${phrase}|${occ}`;
  if (CUES.has(key)) return CUES.get(key);
  const words = S.WORDS[sid];
  if (!words) throw new Error(`no words for ${sid}`);
  const toks = tokens(phrase), flat = toks.flat();
  const nw = words.map((x) => norm(x[0]));
  let seen = 0;
  for (let i = 0; i + flat.length <= nw.length; i++) {
    if (flat.every((t, j) => nw[i + j] === t)) {
      if (seen++ < occ) continue;
      let k = i;
      const res = toks.map((g) => { const r = { on: words[k][1], off: words[k + g.length - 1][2] }; k += g.length; return r; });
      CUES.set(key, res);
      return res;
    }
  }
  throw new Error(`cue not found in ${sid}: "${phrase}" (words: ${nw.join(' ')})`);
}
// Beats at which each display word should start (lead beats before its spoken onset).
export const cue = (sid, phrase, { lead = 0.15, occ = 0 } = {}) => find(sid, phrase, occ).map((x) => w(sid, x.on) - lead);
// One word's onset / end, in beats.
export const at = (sid, phrase, occ = 0) => w(sid, find(sid, phrase, occ)[0].on);
export const atEnd = (sid, phrase, occ = 0) => w(sid, find(sid, phrase, occ).at(-1).off);

// ================================================================ type
const LAYOUT = new Map();
// Word boxes for one RTL line: x = distance from the line's right edge to the word's right edge.
// Keep an LTR phrase in one word with a no-break space ("VanCash ERP") so it reads left-to-right.
export function lineLayout(ctx, str, f) {
  const key = `${f}|${str}`;
  let L = LAYOUT.get(key);
  if (L) return L;
  ctx.save(); ctx.font = f; ctx.direction = 'rtl';
  const sp = ctx.measureText(' ').width;
  let x = 0;
  const words = str.split(' ').map((s) => { const wd = { s, x, w: ctx.measureText(s).width }; x += wd.w + sp; return wd; });
  const m = ctx.measureText(str);
  ctx.restore();
  L = { words, width: x - sp, asc: m.actualBoundingBoxAscent, desc: m.actualBoundingBoxDescent };
  LAYOUT.set(key, L);
  return L;
}
export const sizeOf = (f) => Number(/(\d+)px/.exec(f)[1]);
export const textW = (ctx, str, f) => { ctx.save(); ctx.font = f; const v = ctx.measureText(str).width; ctx.restore(); return v; };

// Static text (the browser's bidi handles mixed Arabic/Latin in one string).
export function text(ctx, str, x, y, f, color, align = 'right', alpha = 1) {
  if (alpha <= 0) return;
  ctx.save(); ctx.font = f; ctx.direction = 'rtl'; ctx.textAlign = align; ctx.fillStyle = color;
  ctx.globalAlpha *= alpha; ctx.fillText(str, x, y); ctx.restore();
}
// Left-to-right text (numbers, IMEI, URLs), anchored at its left edge unless align says otherwise.
export function ltr(ctx, str, x, y, f, color, align = 'left', alpha = 1) {
  if (alpha <= 0) return;
  ctx.save(); ctx.font = f; ctx.direction = 'ltr'; ctx.textAlign = align; ctx.fillStyle = color;
  ctx.globalAlpha *= alpha; ctx.fillText(str, x, y); ctx.restore();
}

// A line that arrives word by word: each word rises through its own mask on its beat.
export function reveal(ctx, u, str, xR, y, f, color, at_, o = {}) {
  const L = lineLayout(ctx, str, f), size = sizeOf(f);
  const starts = Array.isArray(at_) ? at_ : L.words.map((_, i) => at_ + i * (o.stagger ?? 0.14));
  ctx.save(); ctx.font = f; ctx.direction = 'rtl'; ctx.textAlign = 'right';
  L.words.forEach((wd, i) => {
    const k = springU(u, starts[Math.min(i, starts.length - 1)], o.spring || SPRING.snappy);
    if (k <= 0.002) return;
    const xr = xR - wd.x;
    ctx.save();
    ctx.beginPath(); ctx.rect(xr - wd.w - 12, y - size * 1.45, wd.w + 24, size * 2.25); ctx.clip();
    ctx.globalAlpha = (o.alpha ?? 1) * clamp(k * 1.7);
    ctx.fillStyle = (o.colors && o.colors[i]) || color;
    ctx.fillText(wd.s, xr, y + (1 - k) * size * 1.2);
    ctx.restore();
  });
  ctx.restore();
  return L;
}
export const lineRight = (L, xR, i) => xR - L.words[i].x;
export const lineLeft = (L, xR, i) => xR - L.words[i].x - L.words[i].w;

// The site's lime highlighter under words i0..i1, swept right-to-left from beat ub.
// box: a full-height block, for dark text on a dark page.
export function marker(ctx, u, L, xR, y, size, i0, i1, ub, color = C.lime, alpha = 1, box = false) {
  const p = E.outCubic(prog(u, ub, ub + 0.55));
  if (p <= 0 || alpha <= 0) return;
  const r = lineRight(L, xR, i0) + size * 0.1, l = lineLeft(L, xR, i1) - size * 0.1;
  ctx.save(); ctx.globalAlpha *= alpha;
  ctx.translate(r, y); ctx.rotate(0.012);
  ctx.fillStyle = color;
  if (box) { rrect(ctx, -(r - l) * p, -size * 0.98, (r - l) * p, size * 1.38, size * 0.12); ctx.fill(); }
  else ctx.fillRect(-(r - l) * p, -size * 0.2, (r - l) * p, size * 0.36);
  ctx.restore();
}
// reveal + marker in one call: mark = [i0, i1, beat].
export function headline(ctx, u, str, xR, y, f, color, at_, mark = null, o = {}) {
  if (mark) marker(ctx, u, lineLayout(ctx, str, f), xR, y, sizeOf(f), mark[0], mark[1], mark[2], o.markColor || C.lime, 1, !!o.box);
  return reveal(ctx, u, str, xR, y, f, color, at_, o);
}

// ================================================================ shapes
const SHADOW = new Map();
export function shadow(ctx, x, y, w_, h_, r, a = 0.2) {
  const key = `${Math.round(w_)}x${Math.round(h_)}x${r}x${a}`;
  let c = SHADOW.get(key);
  if (!c) {
    const pad = 80;
    c = document.createElement('canvas');
    c.width = Math.round(w_) + pad * 2; c.height = Math.round(h_) + pad * 2;
    const g = c.getContext('2d');
    g.filter = 'blur(26px)'; g.fillStyle = `rgba(18,61,139,${a})`;
    g.beginPath(); g.roundRect(pad, pad + 22, w_, h_, r); g.fill();
    c.pad = pad; SHADOW.set(key, c);
  }
  ctx.drawImage(c, x - c.pad, y - c.pad);
}
export function card(ctx, x, y, w_, h_, r = 26, fillc = C.white, o = {}) {
  if (o.shadow !== false) shadow(ctx, x, y, w_, h_, r, o.shade ?? 0.2);
  rrect(ctx, x, y, w_, h_, r); ctx.fillStyle = fillc; ctx.fill();
  if (o.stroke) { ctx.strokeStyle = o.stroke; ctx.lineWidth = o.lw || 2; ctx.stroke(); }
}
// Scale an element about a point by a spring value k (0 -> 1, overshoots).
export function pop(ctx, k, cx, cy, fn, { from = 0.6, rise = 0 } = {}) {
  if (k <= 0.002) return;
  ctx.save(); ctx.globalAlpha *= clamp(k * 1.6);
  const s = lerp(from, 1, k);
  ctx.translate(cx, cy + (1 - k) * rise); ctx.scale(s, s); ctx.translate(-cx, -cy);
  fn(); ctx.restore();
}
// Slide-and-fade an element in by k (from dx, dy).
export function enter(ctx, k, fn, { dx = 0, dy = 70 } = {}) {
  if (k <= 0.002) return;
  ctx.save(); ctx.globalAlpha *= clamp(k * 1.6); ctx.translate((1 - k) * dx, (1 - k) * dy);
  fn(); ctx.restore();
}

// A pill's width, so callers can centre it before drawing.
export function pillW(ctx, str, f, h_, ico = null, pad = 26) {
  ctx.save(); ctx.font = f; const tw = ctx.measureText(str).width; ctx.restore();
  return tw + (ico ? h_ * 0.5 + 14 : 0) + pad * 2;
}
// A pill hanging from its right edge (RTL); returns its width.
export function pill(ctx, xR, y, h_, str, f, { bg = C.white, fg = C.ink, ico = null, stroke = null, pad = 26, icoColor = null } = {}) {
  ctx.save(); ctx.font = f;
  const tw = ctx.measureText(str).width, iw = ico ? h_ * 0.5 + 14 : 0;
  const wd = tw + iw + pad * 2;
  rrect(ctx, xR - wd, y, wd, h_, h_ / 2); ctx.fillStyle = bg; ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
  if (ico) icon(ctx, ico, xR - pad - h_ * 0.25, y + h_ / 2, h_ * 0.5, icoColor || fg);
  ctx.restore();
  text(ctx, str, xR - pad - iw, y + h_ * 0.5 + sizeOf(f) * 0.36, f, fg);
  return wd;
}
// A pill centred on cx.
export function pillC(ctx, cx, y, h_, str, f, o = {}) {
  const wd = pillW(ctx, str, f, h_, o.ico, o.pad ?? 26);
  return pill(ctx, cx + wd / 2, y, h_, str, f, o);
}

// ================================================================ icons (the site's own 24px line set)
const PATHS = {
  check: 'm5 12 4 4L19 6',
  arrow: 'M19 12H5m6 6-6-6 6-6',
  shop: 'm3 9 2-6h14l2 6M3 9c0 4 5 4 6 0 1 4 5 4 6 0 1 4 6 4 6 0M5 13v8h14v-8M9 21v-6h6v6',
  grid: 'M4.5 3h4A1.5 1.5 0 0 1 10 4.5v4A1.5 1.5 0 0 1 8.5 10h-4A1.5 1.5 0 0 1 3 8.5v-4A1.5 1.5 0 0 1 4.5 3ZM15.5 3h4A1.5 1.5 0 0 1 21 4.5v4a1.5 1.5 0 0 1-1.5 1.5h-4A1.5 1.5 0 0 1 14 8.5v-4A1.5 1.5 0 0 1 15.5 3ZM4.5 14h4a1.5 1.5 0 0 1 1.5 1.5v4A1.5 1.5 0 0 1 8.5 21h-4A1.5 1.5 0 0 1 3 19.5v-4A1.5 1.5 0 0 1 4.5 14ZM15.5 14h4a1.5 1.5 0 0 1 1.5 1.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a1.5 1.5 0 0 1-1.5-1.5v-4a1.5 1.5 0 0 1 1.5-1.5Z',
  phone: 'M8.5 2h7A2.5 2.5 0 0 1 18 4.5v15a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 6 19.5v-15A2.5 2.5 0 0 1 8.5 2ZM10 5h4m-3 14h2',
  monitor: 'M4 3h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2ZM8 21h8m-4-4v4',
  box: 'm12 2 9 5v10l-9 5-9-5V7l9-5ZM3 7l9 5 9-5M12 12v10M7.5 4.5l9 5v4',
  chart: 'M3 3v18h18M7 16v-4m5 4V8m5 8V5',
  sync: 'M20 7a9 9 0 0 0-15-2L2 8m0-5v5h5M4 17a9 9 0 0 0 15 2l3-3m0 5v-5h-5',
  wifiOff: 'm2 2 20 20M8 16a7 7 0 0 1 4-1m-7-3a12 12 0 0 1 3-2m6 0a12 12 0 0 1 5 2M2 7a18 18 0 0 1 2-1m5-2a18 18 0 0 1 13 3m-10 12h.01',
  wifi: 'M2 8.5a15 15 0 0 1 20 0M5 12a10 10 0 0 1 14 0M8.5 15.5a5 5 0 0 1 7 0M12 19h.01',
  gift: 'M4 8h16a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1ZM5 12v9h14v-9M12 8v13M12 8H8a3 3 0 1 1 3-3l1 3Zm0 0h4a3 3 0 1 0-3-3l-1 3Z',
  users: 'M12 8a3 3 0 1 1-6 0 3 3 0 1 1 6 0ZM3 21v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 4v2',
  shield: 'm12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6l9-4Zm-4 10 3 3 5-6',
  wallet: 'M20 7V4H6a3 3 0 0 0 0 6h15v10H6a3 3 0 0 1-3-3V7m18 7h-5v3h5',
  cloud: 'M6 19a5 5 0 0 1-1-10 7 7 0 0 1 13-2 6 6 0 0 1 0 12H6Zm3-6 3 3 4-5',
  scan: 'M3 8V3h5m8 0h5v5M3 16v5h5m8 0h5v-5M7 8v8m3-8v8m4-8v8m3-8v8M2 12h20',
  chat: 'M21 11.5a9 9 0 0 1-13.6 7.8L3 21l1.7-4.4A9 9 0 1 1 21 11.5ZM8 8c0 4 4 8 8 8l1-3-3-1-1 1-2-2 1-1-1-3-3 1Z',
  receipt: 'm5 2 3 2 4-2 4 2 3-2v20l-3-2-4 2-4-2-3 2V2ZM9 8h6m-6 4h6m-6 4h3',
  mail: 'M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm-1 1 9 7 9-7',
  globe: 'M12 3a9 9 0 1 1 0 18 9 9 0 1 1 0-18ZM3 12h18M12 3c3.5 3.5 3.5 14.5 0 18M12 3c-3.5 3.5-3.5 14.5 0 18',
  lock: 'M7 11h10a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Zm1 0V7a4 4 0 0 1 8 0v4m-4 4v2',
  bell: 'M6 16v-5a6 6 0 0 1 12 0v5l2 2H4l2-2Zm4 5h4',
  file: 'M6 2h9l5 5v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Zm9 0v5h5M9 13h7m-7 4h5',
  // drawn for the series in the same 24px line style
  search: 'M11 4a7 7 0 1 1 0 14 7 7 0 1 1 0-14Zm9 16-4.3-4.3',
  camera: 'M4 7h3l2-3h6l2 3h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Zm8 3a4 4 0 1 1 0 8 4 4 0 1 1 0-8Z',
  tag: 'M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9ZM8 8h.01',
  barcode: 'M3 5v14M6 5v14M10 5v14M13 5v14M17 5v14M21 5v14',
  cash: 'M3 6h18v12H3V6Zm9 3a3 3 0 1 1 0 6 3 3 0 1 1 0-6ZM6 9v.01M18 15v.01',
  truck: 'M2 6h12v10H2V6Zm12 4h4l3 3v3h-7v-6ZM6 20a2 2 0 1 1 0-4 2 2 0 1 1 0 4Zm11 0a2 2 0 1 1 0-4 2 2 0 1 1 0 4Z',
  user: 'M12 12a4 4 0 1 1 0-8 4 4 0 1 1 0 8Zm-7 9a7 7 0 0 1 14 0',
  printer: 'M7 9V3h10v6M7 17H4a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-3M7 14h10v7H7v-7Z',
  qr: 'M3 3h7v7H3V3Zm11 0h7v7h-7V3ZM3 14h7v7H3v-7Zm11 0h3v3h-3v-3Zm4 4h3v3h-3v-3ZM6 6h1v1H6V6Zm11 0h1v1h-1V6ZM6 17h1v1H6v-1Z',
  calendar: 'M4 5h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm-1 5h18M8 3v4m8-4v4',
  alert: 'M12 3 2 20h20L12 3Zm0 6v5m0 3h.01',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  inbox: 'M12 3v12m-5-5 5 5 5-5M4 21h16',
  plus: 'M12 5v14M5 12h14',
  x: 'M6 6l12 12M18 6 6 18',
  clock: 'M12 3a9 9 0 1 1 0 18 9 9 0 1 1 0-18Zm0 4v5l3 2',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm10-3a3 3 0 1 1 0 6 3 3 0 1 1 0-6Z',
  cart: 'M3 4h2l2.5 11h11L21 7H6.5M9 20a1 1 0 1 1 0-.01M18 20a1 1 0 1 1 0-.01',
  backup: 'M7 18a5 5 0 0 1-1-9.9A7 7 0 0 1 19 9a4.5 4.5 0 0 1-1 9M12 12v8m-3-5 3-3 3 3',
  key: 'M8 14a4 4 0 1 1 0-8 4 4 0 1 1 0 8Zm3-4h10m-3 0v3m-3-3v2',
  trend: 'M3 17l6-6 4 4 8-8m-5 0h5v5',
  repeat: 'M17 2l4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4m14-1v2a3 3 0 0 1-3 3H3',
};
const ICON = Object.fromEntries(Object.entries(PATHS).map(([k, d]) => [k, new Path2D(d)]));
export function icon(ctx, name, cx, cy, size, color, { lw = 1.9, p = 1 } = {}) {
  if (p <= 0) return;
  ctx.save();
  ctx.translate(cx - size / 2, cy - size / 2); ctx.scale(size / 24, size / 24);
  ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = color;
  if (p < 1) ctx.setLineDash([p * 90, 90]);
  ctx.stroke(ICON[name]);
  ctx.restore();
}
// An icon in a filled disc.
export function badge(ctx, name, cx, cy, r, bg, fg, lw = 2) {
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = bg; ctx.fill();
  icon(ctx, name, cx, cy, r * 1.1, fg, { lw });
}
// A round "done" stamp.
export function stamp(ctx, k, cx, cy, r, bg = C.green) {
  pop(ctx, k, cx, cy, () => {
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = bg; ctx.fill();
    icon(ctx, 'check', cx, cy, r * 1.25, C.white, { lw: 3, p: clamp(k * 1.4) });
  }, { from: 0.3 });
}
// A numbered step disc ("أولًا" -> 1).
export function stepNo(ctx, k, cx, cy, n, r = 40) {
  pop(ctx, k, cx, cy, () => {
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = C.accent; ctx.fill();
    text(ctx, String(n), cx, cy + r * 0.38, F(Math.round(r * 1.05), 900), C.white, 'center');
  }, { from: 0.3 });
}
// The VanCash mark (the site's favicon): rounded square, a V stroke, a mint dot. Top-left at x, y.
const LOGO_V = new Path2D('m14 19 17 29 19-33');
export function logo(ctx, x, y, s, { bg = C.accent, fg = C.white, dot = '#3fe0ab', p = 1 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 64, s / 64);
  rrect(ctx, 0, 0, 64, 64, 16); ctx.fillStyle = bg; ctx.fill();
  ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = fg;
  if (p < 1) ctx.setLineDash([p * 70, 70]);
  ctx.stroke(LOGO_V); ctx.setLineDash([]);
  const d = clamp((p - 0.6) / 0.4);
  if (d > 0) { ctx.beginPath(); ctx.arc(49, 17, 6 * d, 0, Math.PI * 2); ctx.fillStyle = dot; ctx.fill(); }
  ctx.restore();
}
// An arrow pointing left (the reading direction), drawn on with p.
export function arrowLeft(ctx, x0, x1, y, color, p, lw = 5) {
  if (p <= 0) return;
  const xe = lerp(x0, x1, p);
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(xe, y);
  ctx.moveTo(xe + 18, y - 16); ctx.lineTo(xe, y); ctx.lineTo(xe + 18, y + 16);
  ctx.stroke(); ctx.restore();
}
export function arrowDown(ctx, x, y0, y1, color, p, lw = 5) {
  if (p <= 0) return;
  const ye = lerp(y0, y1, p);
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, ye);
  ctx.moveTo(x - 16, ye - 18); ctx.lineTo(x, ye); ctx.lineTo(x + 16, ye - 18);
  ctx.stroke(); ctx.restore();
}
export const bez = (a, b, c, d, t) => (1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t * t * c + t ** 3 * d;

// ================================================================ real screens
// A screenshot in a card, fit by width; zoom pushes in on the source point (cx, cy) (0..1).
export function screen(ctx, img, x, y, w_, h_, { zoom = 1, cx = 0.5, cy = 0.5, r = 18, shade = 0.2 } = {}) {
  card(ctx, x, y, w_, h_, r, '#f3f6fb', { shade });
  const s = (w_ / img.width) * zoom, dw = img.width * s, dh = img.height * s;
  const dx = clamp(x + w_ / 2 - cx * dw, x + w_ - dw, x), dy = clamp(y + h_ / 2 - cy * dh, y + h_ - dh, y);
  ctx.save(); rrect(ctx, x, y, w_, h_, r); ctx.clip();
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
  rrect(ctx, x, y, w_, h_, r); ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.stroke();
  return (sx, sy) => [dx + sx * s, dy + sy * s, s];        // source px -> frame px
}
// A source rect of a screenshot, cover-fit into a box.
export function cropCover(ctx, img, [sx, sy, sw, sh], x, y, w_, h_, r = 14, stroke = true) {
  const a = w_ / h_;
  let cw = sw, ch = sw / a;
  if (ch > sh) { ch = sh; cw = sh * a; }
  ctx.save(); rrect(ctx, x, y, w_, h_, r); ctx.clip();
  ctx.drawImage(img, sx + (sw - cw) / 2, sy + (sh - ch) / 2, cw, ch, x, y, w_, h_);
  ctx.restore();
  if (stroke) { rrect(ctx, x, y, w_, h_, r); ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.stroke(); }
}
// A source rect drawn at a scale (no crop), top-left at x, y; returns its size.
export function cutout(ctx, img, [sx, sy, sw, sh], x, y, s, { r = 12, card: withCard = true, shade = 0.22 } = {}) {
  const dw = sw * s, dh = sh * s;
  if (withCard) card(ctx, x - 6, y - 6, dw + 12, dh + 12, r + 4, C.white, { shade, stroke: C.line });
  ctx.save(); rrect(ctx, x, y, dw, dh, r); ctx.clip();
  ctx.drawImage(img, sx, sy, sw, sh, x, y, dw, dh);
  ctx.restore();
  return [dw, dh];
}
// A callout ring around a region of a screen, settling in from a little larger.
export function ring(ctx, x, y, w_, h_, k, color = C.accent, alpha = 1) {
  if (k <= 0.002 || alpha <= 0) return;
  const g = (1 - k) * 22;
  ctx.save(); ctx.globalAlpha *= clamp(k * 1.5) * alpha;
  rrect(ctx, x - g - 8, y - g - 8, w_ + 2 * g + 16, h_ + 2 * g + 16, 16);
  ctx.strokeStyle = color; ctx.lineWidth = 5; ctx.stroke(); ctx.restore();
}
// Rings that come and go on cue over a mapped screen: list of [sx, sy, sw, sh, onBeat, offBeat].
export function rings(ctx, u, map, list, color = C.accent) {
  list.forEach(([sx, sy, sw, sh, on, off]) => {
    const [rx, ry, rs] = map(sx, sy);
    const k = springU(u, on, SPRING.snappy) * (off === undefined ? 1 : 1 - prog(u, off, off + 0.4));
    ring(ctx, rx, ry, sw * rs, sh * rs, k, color);
  });
}
// A camera that eases between source-space framings of one screenshot: keys = [[beat, [cx, cy, zoom]], ...].
export const camera = (u, keys) => springKeys(u, keys, SPRING.gentle);

// A label pinned to a screen region, arriving on its beat (dark pill with an icon).
export function tagAt(ctx, u, x, y, str, ub, { ico = null, bg = C.ink, fg = C.white, size = 30, h_ = 58, align = 'center', off } = {}) {
  const k = springU(u, ub, SPRING.bouncy) * (off === undefined ? 1 : 1 - prog(u, off, off + 0.4));
  const f = F(size, 700, UI), wd = pillW(ctx, str, f, h_, ico);
  const xr = align === 'center' ? x + wd / 2 : align === 'left' ? x + wd : x;
  pop(ctx, k, xr - wd / 2, y + h_ / 2, () => {
    shadow(ctx, xr - wd, y, wd, h_, h_ / 2, 0.22);
    pill(ctx, xr, y, h_, str, f, { bg, fg, ico, icoColor: bg === C.ink ? C.lime : null });
  }, { from: 0.5, rise: 16 });
}

// ================================================================ layout pieces
// The small blue kicker above a title, with an optional icon.
export function kicker(ctx, str, ico = null, y = 120, color = C.accent) {
  if (ico) { icon(ctx, ico, R - 18, y - 12, 40, color, { lw: 2 }); text(ctx, str, R - 52, y, F(32, 700, UI), color); }
  else text(ctx, str, R, y, F(32, 700, UI), color);
}
// A row of check rows (the plan-and-promise list from episode 1).
export function checks(ctx, u, rows, xR = R) {
  rows.forEach(({ str, y, at: at_, mark, size = 46 }) => {
    const f = F(size, 800);
    const k = springU(u, at_[0] - 0.2, SPRING.bouncy);
    pop(ctx, k, xR - 28, y - 16, () => {
      ctx.beginPath(); ctx.arc(xR - 28, y - 16, 26, 0, Math.PI * 2); ctx.fillStyle = C.mint; ctx.fill();
      icon(ctx, 'check', xR - 28, y - 16, 34, C.green, { lw: 3 });
    }, { from: 0.3 });
    if (mark) marker(ctx, u, lineLayout(ctx, str, f), xR - 76, y, size, mark[0], mark[1], mark[2]);
    reveal(ctx, u, str, xR - 76, y, f, C.ink, at_);
  });
}
// Chips in a right-to-left row, each popping on its beat: items = [[label, beat, ico?], ...].
export function chipsRow(ctx, u, items, y, xR = R, { h_ = 60, size = 30, bg = C.white, fg = C.ink, stroke = C.line, ico = 'check', gap = 14 } = {}) {
  let x = xR;
  const f = F(size, 600, UI);
  items.forEach(([lab, at_, ic]) => {
    const i_ = ic === undefined ? ico : ic;
    const wd = pillW(ctx, lab, f, h_, i_);
    const k = springU(u, at_, SPRING.bouncy);
    const xr = x;
    pop(ctx, k, xr - wd / 2, y + h_ / 2, () => pill(ctx, xr, y, h_, lab, f, { bg, fg, ico: i_, stroke }), { rise: 20 });
    x -= wd + gap;
  });
  return xR - x - gap;
}
// A text field in the app's style: label above, box below, value typed in by p (0..1).
export function field(ctx, x, y, w_, label, value, p, { h_ = 74, size = 34, ltrValue = false, focus = 0, done = 0, color = C.ink } = {}) {
  text(ctx, label, x + w_, y - 14, F(26, 600, UI), C.muted);
  rrect(ctx, x, y, w_, h_, 14); ctx.fillStyle = C.white; ctx.fill();
  ctx.strokeStyle = M.mix(C.line, C.accent, clamp(focus)); ctx.lineWidth = 2 + 1.5 * clamp(focus); ctx.stroke();
  const n = Math.round(value.length * clamp(p));
  if (n > 0) {
    const v = value.slice(0, n), f = F(size, 700, UI);
    if (ltrValue) ltr(ctx, v, x + 24, y + h_ / 2 + size * 0.36, f, color);
    else text(ctx, v, x + w_ - 24, y + h_ / 2 + size * 0.36, f, color);
  }
  if (done > 0.002) stamp(ctx, done, x + 34, y + h_ / 2, 18);
}

// An amount in dinars: the number at the right, دج to its left (as on the site's plan cards).
// k counts it up (0..1); sign is drawn before the number.
export function money(ctx, n, xR, y, size, color, { k = 1, sign = '', unit = C.muted } = {}) {
  const v = Math.round(n * k / 100) * 100;
  const s = sign + v.toLocaleString('en-US');
  const f = F(size, 900);
  ltr(ctx, s, xR, y, f, color, 'right');
  text(ctx, 'دج', xR - textW(ctx, s, f) - size * 0.2, y - size * 0.05, F(Math.round(size * 0.48), 700), unit);
}
// The small "مثال" tag on drawn example cards.
export const mini = (ctx, str, xR, y, bgc = C.wash, fg = C.accent) => pill(ctx, xR, y, 40, str, F(22, 700, UI), { bg: bgc, fg, pad: 14 });
export const exampleTag = (ctx, xL, y) => mini(ctx, 'مثال', xL + pillW(ctx, 'مثال', F(22, 700, UI), 40, null, 14), y);

// ================================================================ backgrounds
export function makeBg(kind) {
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d');
  const dots = (color, mask) => {
    const d = document.createElement('canvas'); d.width = W; d.height = H;
    const dg = d.getContext('2d'); dg.fillStyle = color;
    for (let y = 12; y < H; y += 24) for (let x = 12; x < W; x += 24) { dg.beginPath(); dg.arc(x, y, 1.3, 0, Math.PI * 2); dg.fill(); }
    dg.globalCompositeOperation = 'destination-in';
    const m = dg.createLinearGradient(0, 0, W, 0);
    m.addColorStop(0, `rgba(0,0,0,${mask})`); m.addColorStop(0.6, 'rgba(0,0,0,0)');
    dg.fillStyle = m; dg.fillRect(0, 0, W, H);
    g.drawImage(d, 0, 0);
  };
  if (kind === 'paper' || kind === 'mint') {
    g.fillStyle = kind === 'paper' ? '#fbfdff' : '#eef9f3'; g.fillRect(0, 0, W, H);
    const blob = (x, y, r, col) => { const rg = g.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, col); rg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = rg; g.fillRect(0, 0, W, H); };
    if (kind === 'paper') { blob(80, 130, 900, 'rgba(219,232,255,.9)'); blob(1880, 1050, 800, 'rgba(232,255,225,.7)'); }
    else { blob(1700, 120, 900, 'rgba(216,251,234,.9)'); }
    dots(kind === 'paper' ? 'rgba(84,115,168,.16)' : 'rgba(6,123,82,.14)', 1);
  } else if (kind === 'blue') {
    const lg = g.createLinearGradient(0, 0, W, H); lg.addColorStop(0, '#2359f0'); lg.addColorStop(1, '#172f93');
    g.fillStyle = lg; g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(255,255,255,.09)'; g.lineWidth = 2;
    [[-120, -260, 700], [-180, -200, 900], [-240, -140, 1120]].forEach(([x, y, r]) => { g.beginPath(); g.arc(x + r / 2, y + r / 2, r / 2, 0, Math.PI * 2); g.stroke(); });
  } else if (kind === 'navy') {
    g.fillStyle = C.ink; g.fillRect(0, 0, W, H);
    dots('rgba(255,255,255,.08)', 1);
  }
  return c;
}
export const bg = (ctx, kind) => ctx.drawImage(S.BG[kind], 0, 0);

// ================================================================ shared scenes
export const STAGES = ['جهّز محلّك', 'أدخل المخزون', 'رتّب الحسابات', 'نفّذ أول بيع', 'تابع الحركات', 'راجع وراقب'];
const ORD = ['', 'الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة', 'السادسة'];

// The episode badge at the top right of the hook.
export function hookHeader(ctx, u) {
  const ke = springU(u, -0.6, SPRING.snappy);
  ctx.save(); ctx.globalAlpha = clamp(ke * 1.4); ctx.translate((1 - ke) * 80, 0);
  logo(ctx, R - 58, 110, 58);
  text(ctx, `VanCash ERP · الحلقة ${S.N} من 6`, R - 80, 151, F(32, 600, UI), C.accent);
  ctx.restore();
}

// 02 · The series opener: this episode's place among the six, what came before, what's today.
//   cfg: { sid, lead: cue for "هذه الحلقة ...", brand: cue for "فان كاش", done: cue for the recap,
//          today: cue for "اليوم", recap: str, goal: str, goalCue, title }
export function seriesScene(cfg) {
  return function series(ctx, u) {
    bg(ctx, 'blue');
    const s = cfg.sid, wh = 'rgba(255,255,255,.84)', n = S.N;
    reveal(ctx, u, cfg.leadText || `الحلقة ${ORD[n]} من سلسلة تشغيل`, R, 170, F(48, 700), wh, cue(s, cfg.lead));
    const tB = cue(s, cfg.brand)[0];
    const kL = springU(u, tB - 0.15, SPRING.bouncy);
    pop(ctx, kL, R - 56, 270, () => logo(ctx, R - 112, 214, 112, { bg: C.white, fg: C.accent, p: clamp(kL * 1.2) }), { from: 0.4 });
    reveal(ctx, u, 'VanCash ERP', R - 140, 310, F(124, 900), C.white, [tB], { spring: SPRING.bouncy });

    // the six stages: the ones behind us turn green on the recap, this one lights on "today"
    const tDone = cue(s, cfg.done)[0], tToday = at(s, cfg.today);
    const focus = E.inOutCubic(prog(u, tToday - 0.2, tToday + 0.7));
    const cw = 268, gap = 24, cy0 = 420, chh = 128;
    STAGES.forEach((lab, i) => {
      const k = springU(u, S.START[1] - 0.8 + i * 0.22, SPRING.snappy);
      const xr = R - i * (cw + gap);
      const past = i < n - 1, cur = i === n - 1;
      const dk = past ? springU(u, tDone + i * 0.25, SPRING.bouncy) : 0;
      ctx.save(); ctx.globalAlpha = clamp(k * 1.6) * (cur || past ? 1 : 1 - 0.5 * focus);
      ctx.translate(0, -(1 - k) * 90 - (cur ? focus * 18 : 0));
      rrect(ctx, xr - cw, cy0, cw, chh, 20);
      ctx.fillStyle = cur ? M.mix('#3b6cf7', '#ffffff', focus) : past && dk > 0.001 ? M.mix('#3a64e6', '#0a8a5c', clamp(dk)) : 'rgba(255,255,255,.12)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.28)'; ctx.lineWidth = 2; ctx.stroke();
      text(ctx, `0${i + 1}`, xr - 24, cy0 + 50, F(34, 900), cur ? M.mix('#c5f85c', '#2457f5', focus) : C.lime);
      text(ctx, lab, xr - 24, cy0 + 103, F(32, 700, UI), cur ? M.mix('#ffffff', '#0c234a', focus) : C.white);
      if (past && dk > 0.01) icon(ctx, 'check', xr - cw + 40, cy0 + 42, 34, C.lime, { lw: 3.4, p: clamp(dk * 1.3) });
      ctx.restore();
    });
    // the recap and today's goal
    reveal(ctx, u, cfg.recap, R, 650, F(40, 600, UI), wh, cue(s, cfg.doneLine || cfg.done));
    const ke = springU(u, tToday - 0.2, SPRING.snappy);
    pop(ctx, ke, R - 90, 780, () => pill(ctx, R, 752, 58, `الحلقة ${n}`, F(30, 800), { bg: C.lime, fg: C.ink }), { rise: 30 });
    const tT = cfg.titleCue ? cue(s, cfg.titleCue) : tToday + 0.2;
    reveal(ctx, u, STAGES[n - 1], R, 905, F(104, 900), C.white, tT, { colors: { 0: C.lime } });
    reveal(ctx, u, cfg.goal, R, 990, F(40, 600, UI), wh, cue(s, cfg.goalCue));
  };
}

// 11 · Checkpoint before the next episode (the site's green "before you move on" box).
//   cfg: { sid, head, headCue, rows: [{ str, cue, done }], tiles?: fn(ctx,u) drawn in the free space }
export function checkScene(cfg) {
  return function check(ctx, u) {
    bg(ctx, 'mint');
    const s = cfg.sid, n = S.N;
    text(ctx, n < 6 ? `قبل الانتقال إلى الحلقة ${n + 1}` : 'قبل أن تختم السلسلة', R, 140, F(34, 700, UI), C.green);
    reveal(ctx, u, cfg.head, R, 260, F(cfg.headSize || 84, 900), C.ink, cue(s, cfg.headCue));
    if (cfg.body) cfg.body(ctx, u);
    const y0 = cfg.rowsY ?? 340, gap = cfg.rowGap ?? 150;
    cfg.rows.forEach((r, i) => {
      const y = y0 + i * gap, hh = gap - 26;
      const k = springU(u, S.START[10] - 1 + i * 0.25, SPRING.snappy);
      ctx.save(); ctx.globalAlpha = clamp(k * 1.6); ctx.translate(-(1 - k) * 100, 0);
      card(ctx, cfg.rowsL ?? L0, y, R - (cfg.rowsL ?? L0), hh, 26, C.white, { stroke: '#cfe9dc', shade: 0.12 });
      ctx.beginPath(); ctx.arc(R - 70, y + hh / 2, 36, 0, Math.PI * 2); ctx.strokeStyle = '#cfe9dc'; ctx.lineWidth = 4; ctx.stroke();
      ctx.restore();
      const tc = cue(s, r.cue);
      stamp(ctx, springU(u, (r.done !== undefined ? r.done : tc.at(-1) + 0.6) - 0.2, SPRING.bouncy), R - 70, y + hh / 2, 36);
      reveal(ctx, u, r.str, R - 140, y + hh / 2 + 17, F(r.size || 48, 800), C.ink, tc);
    });
    // the series so far: this stage turns green when the last row is ticked
    const lastR = cfg.rows.at(-1), tEnd = lastR.done !== undefined ? lastR.done : cue(s, lastR.cue).at(-1) + 0.6;
    STAGES.forEach((lab, i) => {
      const xr = R - i * 288;
      const done = i < n - 1 ? 1 : i === n - 1 ? springU(u, tEnd + 0.4, SPRING.bouncy) : 0;
      rrect(ctx, xr - 272, 925, 272, 66, 33);
      ctx.fillStyle = done > 0 ? M.mix('#ffffff', C.green, clamp(done)) : 'rgba(255,255,255,.6)'; ctx.fill();
      text(ctx, `0${i + 1} · ${lab}`, xr - 136, 968, F(26, 700, UI), done > 0.5 ? C.white : C.muted, 'center');
    });
  };
}

// 12 · The next episode and the two asks.
//   cfg: { sid, nextCue, sub, subCue, shots: [imgKey, imgKey], trialCue, subscribeCue, tailCue, tail }
export function nextScene(cfg) {
  return function next(ctx, u) {
    bg(ctx, 'blue');
    const s = cfg.sid, n = S.N, wh = 'rgba(255,255,255,.84)';
    text(ctx, cfg.kicker || 'في الحلقة القادمة', R, 150, F(34, 700, UI), wh);
    const title = cfg.title || `0${n + 1} ${STAGES[n]}`;
    reveal(ctx, u, title, R, 285, F(cfg.titleSize || 110, 900), C.white, S.START[11] - 0.5, { stagger: 0.18, colors: { 0: C.lime } });
    reveal(ctx, u, cfg.sub, R, 380, F(42, 500, UI), wh, cue(s, cfg.subCue));
    const [a, b] = cfg.shots;
    const tA = cfg.shotCues ? at(s, cfg.shotCues[0]) : cue(s, cfg.subCue)[0];
    const tB = cfg.shotCues ? at(s, cfg.shotCues[1]) : cue(s, cfg.subCue).at(-1);
    const kP = springU(u, tA - 0.3, SPRING.snappy), kI = springU(u, tB - 0.3, SPRING.snappy);
    const ia = S.IMG[a], ib = S.IMG[b];
    pop(ctx, kP, 420, 640, () => {
      ctx.save(); ctx.translate(420, 640); ctx.rotate(-0.05); ctx.translate(-420, -640);
      const ww = 640, hh = Math.min(440, Math.round(ww * ia.height / ia.width));
      screen(ctx, ia, 110, 480, ww, hh, { shade: 0.35, cy: 0 }); ctx.restore();
    }, { from: 0.8, rise: 80 });
    pop(ctx, kI, 620, 760, () => {
      ctx.save(); ctx.translate(620, 760); ctx.rotate(0.04); ctx.translate(-620, -760);
      const ww = 560, hh = Math.min(400, Math.round(ww * ib.height / ib.width));
      screen(ctx, ib, 340, 600, ww, hh, { shade: 0.35, cy: 0 }); ctx.restore();
    }, { from: 0.8, rise: 80 });
    // ask 1: the trial on WhatsApp
    const ka = springU(u, cue(s, cfg.trialCue)[0] - 0.15, SPRING.bouncy);
    pop(ctx, ka, 1420, 600, () => {
      shadow(ctx, 1040, 520, 784, 160, 34, 0.35);
      rrect(ctx, 1040, 520, 784, 160, 34); ctx.fillStyle = C.wa; ctx.fill();
      icon(ctx, 'chat', R - 70, 600, 64, C.white, { lw: 2 });
      text(ctx, 'اطلب تجربتك المجانية', R - 130, 590, F(52, 900), C.white);
      text(ctx, 'واتساب · 0655970064', R - 130, 645, F(34, 700, UI), 'rgba(255,255,255,.88)');
    }, { from: 0.6 });
    // ask 2: subscribe
    const tS = cue(s, cfg.subscribeCue)[0];
    const kb = springU(u, tS - 0.15, SPRING.bouncy);
    pop(ctx, kb, 1500, 780, () => {
      shadow(ctx, 1240, 725, 584, 110, 55, 0.3);
      rrect(ctx, 1240, 725, 584, 110, 55); ctx.fillStyle = C.white; ctx.fill();
      ctx.save(); ctx.translate(R - 62, 780); ctx.rotate(0.35 * wobble(u - tS - 0.6, 2.4, 4)); ctx.translate(-(R - 62), -780);
      icon(ctx, 'bell', R - 62, 780, 56, C.accent, { lw: 2.2 }); ctx.restore();
      text(ctx, 'اشترك في القناة', R - 118, 798, F(48, 900), C.ink);
    }, { from: 0.6 });
    if (cfg.tail) reveal(ctx, u, cfg.tail, R - 40, 900, F(34, 600, UI), wh, cue(s, cfg.tailCue));
  };
}

// 13 · End card (holds for YouTube's end screen; the left panel teases the next episode).
//   cfg: { shot, panelTitle, panelSub }
export function endScene(cfg) {
  return function endCard(ctx, u) {
    bg(ctx, 'paper');
    const u0 = S.START.at(-1);
    const kl = springU(u, u0 - 0.7, SPRING.bouncy);
    pop(ctx, kl, R - 75, 300, () => logo(ctx, R - 150, 225, 150, { p: clamp(prog(u, u0 - 0.7, u0 + 0.6)) }), { from: 0.4 });
    reveal(ctx, u, 'VanCash ERP', R - 180, 340, F(120, 900), C.ink, [u0 - 0.45], { spring: SPRING.bouncy });
    reveal(ctx, u, 'من أول عملية بيع، إلى صورة أوضح عن محلّك.', R, 480, F(44, 700), C.ink, u0 + 0.8, { stagger: 0.12 });
    const k1 = springU(u, u0 + 1.8, SPRING.snappy), k2 = springU(u, u0 + 2.2, SPRING.snappy);
    pop(ctx, k1, R - 200, 600, () => pill(ctx, R, 565, 76, 'mobileposdz.com', F(40, 800), { bg: C.white, fg: C.accent, ico: 'globe', stroke: C.line }), { rise: 20 });
    pop(ctx, k2, R - 200, 700, () => pill(ctx, R, 665, 76, '0655970064', F(40, 800), { bg: C.wa, fg: C.white, ico: 'chat' }), { rise: 20 });
    const kp = springU(u, u0 - 0.5, SPRING.gentle);
    pop(ctx, kp, 500, 560, () => {
      card(ctx, L0, 200, 820, 720, 34, C.wash, { shadow: false });
      text(ctx, cfg.panelTitle, L0 + 820 - 50, 290, F(44, 900), C.ink);
      text(ctx, cfg.panelSub || 'قريبًا على القناة', L0 + 820 - 50, 345, F(30, 600, UI), C.muted);
      const img = S.IMG[cfg.shot];
      screen(ctx, img, L0 + 50, 400, 720, Math.min(470, Math.round(720 * img.height / img.width)), { shade: 0.18, cy: 0 });
    }, { from: 0.9, rise: 40 });
  };
}

// ================================================================ the cut and the runner
const PUSH = 0.85;                      // beats a whip takes; it lands ON the section's first beat
const whip = (p) => (p < 0.5 ? 16 * p ** 5 : 1 - (-2 * p + 2) ** 5 / 2);

export const SHOTS = {
  dash: '01_dashboard.png', products: '02_products.png', addp: '03_add_product.png', imei: '04_phone_imei.png',
  pos: '05_pos.png', customer: '06_customer.png', debts: '07_debts.png', supplier: '08_supplier.png',
  finance: '09_finance.png', reports: '10_reports.png',
};

// Run an episode. scenes: 13 functions (12 VO sections + the end card).
// hits(H_): add the episode's own sound accents (whooshes, the opener and the end card are shared).
export function episode({ n, scenes, hits = () => {} }) {
  S.N = n;
  const HITS = [];
  const draw = (ctx, u) => {
    const { START } = S;
    let k = 0;
    while (k + 1 < START.length && u >= START[k + 1]) k++;
    const nb = START[k + 1];
    if (nb !== undefined && u >= nb - PUSH) {
      // RTL whip: the page leaves to the right, the next one arrives from the left; both on screen
      const e = whip(prog(u, nb - PUSH, nb));
      ctx.save(); ctx.translate(e * W, 0); scenes[k](ctx, u); ctx.restore();
      ctx.save(); ctx.translate((e - 1) * W, 0); scenes[k + 1](ctx, u); ctx.restore();
      return;
    }
    scenes[k](ctx, u);
  };
  M.film({
    fonts: [F(100, 900), F(100, 700), F(40, 500, UI), F(40, 600, UI), F(40, 700, UI)],
    images: Object.fromEntries(Object.entries(SHOTS).map(([k, f]) => [k, `../shared/shots/${f}`])),
    hits: HITS,
    // motion blur where things move fast (the whips), a light shutter elsewhere
    samples: (t) => (S.START.some((b, k) => k && t >= TS(b - 1.3) && t <= TS(b) + 0.05) ? 12 : 4),
    async init(ctx, images) {
      S.IMG = images;
      // the Arabic subsets load only when Arabic text asks for them
      await Promise.all([F(100, 900), F(100, 800), F(100, 700), F(100, 600), F(40, 500, UI), F(40, 600, UI), F(40, 700, UI)]
        .map((f) => document.fonts.load(f, 'جهّز محلّك الآن')));
      const tl = await fetch('vo_timeline.json').then((r) => r.json());
      tl.sections.forEach((x) => { S.SEC[x.id] = x; });
      S.WORDS = await fetch('vo_words.json').then((r) => r.json());
      S.START = [0, ...tl.sections.slice(1).map((x) => x.beat), tl.end_beat];
      S.BG = { paper: makeBg('paper'), blue: makeBg('blue'), navy: makeBg('navy'), mint: makeBg('mint') };
      const H_ = (b, label, sfx, o) => HITS.push([+b.toFixed(3), label, sfx, o || {}]);
      S.START.slice(1).forEach((b, i) => H_(b, `whip lands, scene ${i + 2}`, 'whoosh', { len: 0.6, gain: 0.5 }));
      H_(0, 'hook lands', 'thud', { gain: 0.4 });
      H_(S.START.at(-1) + 0.6, 'end card', 'thud', { gain: 0.4 });
      hits(H_);
      HITS.sort((a, b) => a[0] - b[0]);
    },
    draw,
  });
}
