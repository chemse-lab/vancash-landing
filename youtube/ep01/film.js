// VanCash ERP · الحلقة 1: جهّز محلّك واختر النسخة المناسبة. A pure function of time.
// The voice-over drives the cut: audio/score.py lands each script section's take on the 88 bpm grid
// and writes vo_timeline.json; every element enters on the beat of the word that names it
// (Scribe word timings, section-relative seconds, docs/script.md). docs/shotlist.md is the plan.
// Arabic is set right-to-left one whole word at a time, never per letter, so letters stay joined.
import * as M from './lib/motion.js';

const { W, H, E, prog, lerp, clamp, springU, springKeys, SPRING, wobble, rrect, U, TS } = M;

// Brand tokens from the landing page (index.html :root). One accent: the brand blue. Lime is the
// site's own headline highlighter; green is reserved for "done" and for WhatsApp, as on the site.
const C = {
  paper: '#f6f9ff', white: '#ffffff', ink: '#0c234a', muted: '#50617e', faint: '#8a9ab3', line: '#dce5f5',
  accent: '#2457f5', accentDeep: '#163bc4', wash: '#eaf1ff', lime: '#c5f85c', green: '#067b52', mint: '#e7f8f0',
  wa: '#087c57',
};
const DISPLAY = 'Display', UI = 'UI';
const F = (size, weight = 800, fam = DISPLAY) => `${weight} ${size}px ${fam}`;
const R = 1824, L0 = 96;          // safe edges; RTL lines hang from R

let SEC = {}, START = [], IMG = {}, BG = {}, TRANS = [];
const w = (id, t) => U(SEC[id].shift + t);          // a word's onset (section-relative s) in beats
const ws = (id, ts, lead = 0.15) => ts.map((t) => w(id, t) - lead);
const HITS = [];

// ================================================================ type
const LAYOUT = new Map();
// Word boxes for one RTL line: x = distance from the line's right edge to the word's right edge.
// Keep an LTR phrase in one word with a no-break space ("VanCash ERP") so it reads left-to-right.
function lineLayout(ctx, str, f) {
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
const sizeOf = (f) => Number(/(\d+)px/.exec(f)[1]);

// Static text (the browser's bidi handles mixed Arabic/Latin in one string).
function text(ctx, str, x, y, f, color, align = 'right', alpha = 1) {
  if (alpha <= 0) return;
  ctx.save(); ctx.font = f; ctx.direction = 'rtl'; ctx.textAlign = align; ctx.fillStyle = color;
  ctx.globalAlpha *= alpha; ctx.fillText(str, x, y); ctx.restore();
}

// A line that arrives word by word: each word rises through its own mask on its beat.
function reveal(ctx, u, str, xR, y, f, color, at, o = {}) {
  const L = lineLayout(ctx, str, f), size = sizeOf(f);
  const starts = Array.isArray(at) ? at : L.words.map((_, i) => at + i * (o.stagger ?? 0.14));
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
const lineRight = (L, xR, i) => xR - L.words[i].x;
const lineLeft = (L, xR, i) => xR - L.words[i].x - L.words[i].w;

// The site's lime highlighter under words i0..i1, swept right-to-left from beat ub.
// box: a full-height block, for dark text on a dark page.
function marker(ctx, u, L, xR, y, size, i0, i1, ub, color = C.lime, alpha = 1, box = false) {
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

// ================================================================ shapes
const SHADOW = new Map();
function shadow(ctx, x, y, w_, h_, r, a = 0.2) {
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
function card(ctx, x, y, w_, h_, r = 26, fillc = C.white, o = {}) {
  if (o.shadow !== false) shadow(ctx, x, y, w_, h_, r, o.shade ?? 0.2);
  rrect(ctx, x, y, w_, h_, r); ctx.fillStyle = fillc; ctx.fill();
  if (o.stroke) { ctx.strokeStyle = o.stroke; ctx.lineWidth = o.lw || 2; ctx.stroke(); }
}
// Scale an element about a point by a spring value k (0 -> 1, overshoots).
function pop(ctx, k, cx, cy, fn, { from = 0.6, rise = 0 } = {}) {
  if (k <= 0.002) return;
  ctx.save(); ctx.globalAlpha *= clamp(k * 1.6);
  const s = lerp(from, 1, k);
  ctx.translate(cx, cy + (1 - k) * rise); ctx.scale(s, s); ctx.translate(-cx, -cy);
  fn(); ctx.restore();
}

// A pill's width, so callers can centre it before drawing.
function pillW(ctx, str, f, h_, ico = null, pad = 26) {
  ctx.save(); ctx.font = f; const tw = ctx.measureText(str).width; ctx.restore();
  return tw + (ico ? h_ * 0.5 + 14 : 0) + pad * 2;
}
// A pill hanging from its right edge (RTL); returns its width.
function pill(ctx, xR, y, h_, str, f, { bg = C.white, fg = C.ink, ico = null, stroke = null, pad = 26 } = {}) {
  ctx.save(); ctx.font = f;
  const tw = ctx.measureText(str).width, iw = ico ? h_ * 0.5 + 14 : 0;
  const wd = tw + iw + pad * 2;
  rrect(ctx, xR - wd, y, wd, h_, h_ / 2); ctx.fillStyle = bg; ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
  if (ico) icon(ctx, ico, xR - pad - h_ * 0.25, y + h_ / 2, h_ * 0.5, fg);
  ctx.restore();
  text(ctx, str, xR - pad - iw, y + h_ * 0.5 + sizeOf(f) * 0.36, f, fg);
  return wd;
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
  // drawn for this film in the same 24px line style
  mail: 'M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm-1 1 9 7 9-7',
  globe: 'M12 3a9 9 0 1 1 0 18 9 9 0 1 1 0-18ZM3 12h18M12 3c3.5 3.5 3.5 14.5 0 18M12 3c-3.5 3.5-3.5 14.5 0 18',
  lock: 'M7 11h10a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Zm1 0V7a4 4 0 0 1 8 0v4m-4 4v2',
  bell: 'M6 16v-5a6 6 0 0 1 12 0v5l2 2H4l2-2Zm4 5h4',
  file: 'M6 2h9l5 5v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Zm9 0v5h5M9 13h7m-7 4h5',
};
const ICON = Object.fromEntries(Object.entries(PATHS).map(([k, d]) => [k, new Path2D(d)]));
function icon(ctx, name, cx, cy, size, color, { lw = 1.9, p = 1 } = {}) {
  if (p <= 0) return;
  ctx.save();
  ctx.translate(cx - size / 2, cy - size / 2); ctx.scale(size / 24, size / 24);
  ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = color;
  if (p < 1) ctx.setLineDash([p * 90, 90]);
  ctx.stroke(ICON[name]);
  ctx.restore();
}
// A round "done" stamp.
function stamp(ctx, k, cx, cy, r, bg = C.green) {
  pop(ctx, k, cx, cy, () => {
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = bg; ctx.fill();
    icon(ctx, 'check', cx, cy, r * 1.25, C.white, { lw: 3, p: clamp(k * 1.4) });
  }, { from: 0.3 });
}
// The VanCash mark (the site's favicon): rounded square, a V stroke, a mint dot. Top-left at x, y.
const LOGO_V = new Path2D('m14 19 17 29 19-33');
function logo(ctx, x, y, s, { bg = C.accent, fg = C.white, dot = '#3fe0ab', p = 1 } = {}) {
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
function arrowLeft(ctx, x0, x1, y, color, p, lw = 5) {
  if (p <= 0) return;
  const xe = lerp(x0, x1, p);
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(xe, y);
  ctx.moveTo(xe + 18, y - 16); ctx.lineTo(xe, y); ctx.lineTo(xe + 18, y + 16);
  ctx.stroke(); ctx.restore();
}

// ================================================================ real screens
// A screenshot in a card, fit by width; zoom pushes in on the source point (cx, cy) (0..1).
function screen(ctx, img, x, y, w_, h_, { zoom = 1, cx = 0.5, cy = 0.5, r = 18, shade = 0.2 } = {}) {
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
function cropCover(ctx, img, [sx, sy, sw, sh], x, y, w_, h_, r = 14) {
  const a = w_ / h_;
  let cw = sw, ch = sw / a;
  if (ch > sh) { ch = sh; cw = sh * a; }
  ctx.save(); rrect(ctx, x, y, w_, h_, r); ctx.clip();
  ctx.drawImage(img, sx + (sw - cw) / 2, sy + (sh - ch) / 2, cw, ch, x, y, w_, h_);
  ctx.restore();
  rrect(ctx, x, y, w_, h_, r); ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.stroke();
}
// A callout ring around a region of a screen, settling in from a little larger.
function ring(ctx, x, y, w_, h_, k, color = C.accent, alpha = 1) {
  if (k <= 0.002 || alpha <= 0) return;
  const g = (1 - k) * 22;
  ctx.save(); ctx.globalAlpha *= clamp(k * 1.5) * alpha;
  rrect(ctx, x - g - 8, y - g - 8, w_ + 2 * g + 16, h_ + 2 * g + 16, 16);
  ctx.strokeStyle = color; ctx.lineWidth = 5; ctx.stroke(); ctx.restore();
}

// A price card in the site's plan-card layout (pure type and shape).
function planCard(ctx, u, x, y, { mode, ico, title, price, sub, featured = false, tag = null }, uIn, uPrice) {
  const k = springU(u, uIn, SPRING.snappy);
  const w_ = 420, h_ = 320;
  pop(ctx, k, x + w_ / 2, y + h_, () => {
    const fg = featured ? C.white : C.ink, mu = featured ? 'rgba(255,255,255,.78)' : C.muted;
    if (featured) {
      shadow(ctx, x, y, w_, h_, 24, 0.3);
      const g = ctx.createLinearGradient(x, y, x + w_, y + h_);
      g.addColorStop(0, '#2359f0'); g.addColorStop(1, '#172f93');
      rrect(ctx, x, y, w_, h_, 24); ctx.fillStyle = g; ctx.fill();
    } else card(ctx, x, y, w_, h_, 24, C.white, { stroke: C.line });
    if (tag) pill(ctx, x + w_ - 24, y - 22, 44, tag, F(24, 700, UI), { bg: C.lime, fg: C.ink, pad: 18 });
    pill(ctx, x + w_ - 26, y + 30, 46, mode, F(24, 700, UI), { bg: featured ? 'rgba(255,255,255,.16)' : C.wash, fg: featured ? C.white : C.accent, pad: 18 });
    icon(ctx, ico, x + 56, y + 53, 44, featured ? C.lime : C.accent);
    text(ctx, title, x + w_ - 28, y + 138, F(46, 800), fg);
    const pk = E.outCubic(prog(u, uPrice, uPrice + 0.8));
    const n = Math.round(price * pk / 100) * 100;
    if (pk > 0) {
      const ps = n.toLocaleString('en-US');
      text(ctx, ps, x + w_ - 28, y + 236, F(76, 900), featured ? C.white : C.accent);
      ctx.save(); ctx.font = F(76, 900); const nw = ctx.measureText(ps).width; ctx.restore();
      text(ctx, 'دج', x + w_ - 28 - nw - 14, y + 232, F(36, 700), mu);
    }
    text(ctx, sub, x + w_ - 28, y + 288, F(26, 500, UI), mu);
  }, { from: 0.85, rise: 60 });
}
const PRICE_NOTE = 'الأسعار بالدينار الجزائري كما في الصفحة الحالية · لتأكيد مدة الترخيص أو الاشتراك تواصل معنا';

// ================================================================ scenes
// Each scene paints the whole frame from u; START[k] is its first beat (its VO section onset).

// 01 · Hook: the question, beside the real dashboard.
function hook(ctx, u) {
  ctx.drawImage(BG.paper, 0, 0);
  const s = 's01';
  const ke = springU(u, -0.6, SPRING.snappy);
  ctx.save(); ctx.globalAlpha = clamp(ke * 1.4); ctx.translate((1 - ke) * 80, 0);
  logo(ctx, R - 58, 110, 58);
  text(ctx, 'VanCash ERP · الحلقة 1 من 6', R - 80, 151, F(32, 600, UI), C.accent);
  ctx.restore();

  const dim = 1 - 0.6 * E.inOutCubic(prog(u, w(s, 6.2), w(s, 6.9)));
  const fA = F(60, 700);
  reveal(ctx, u, 'قبل أن تسجّل أول هاتف في محلّك،', R, 320, fA, C.ink, [-0.3, ...ws(s, [0.48, 0.72, 1.2, 1.6, 2.08, 2.24])], { alpha: dim });
  reveal(ctx, u, 'هناك قرار واحد يسهّل كل ما بعده:', R, 420, fA, C.ink, ws(s, [3.04, 3.52, 4.0, 4.64, 5.32, 5.52, 5.68]),
    { alpha: dim, colors: { 1: C.accent, 2: C.accent } });
  const fQ = F(100, 900);
  const LQ = lineLayout(ctx, 'أين ستُحفظ بياناتك؟', fQ);
  marker(ctx, u, LQ, R, 640, 100, 2, 2, w(s, 7.5));
  reveal(ctx, u, 'أين ستُحفظ بياناتك؟', R, 640, fQ, C.ink, ws(s, [6.48, 6.8, 7.36]), { spring: SPRING.bouncy });
  reveal(ctx, u, 'ومن أي جهاز ستعمل؟', R, 790, fQ, C.ink, ws(s, [8.4, 8.8, 9.04, 9.52]), { colors: { 2: C.accent }, spring: SPRING.bouncy });

  // the real dashboard, tilted; the camera inside it finds the sync badges on "بياناتك"
  const kc = springU(u, -0.5, SPRING.gentle);
  const [cx, cy, z] = springKeys(u, [[-1, [0.5, 0.5, 1]], [w(s, 7.1), [0.2, 0.07, 2.1]], [w(s, 9.0), [0.5, 0.5, 1.04]]], SPRING.gentle);
  const cw = 700, ch = Math.round(700 * 536 / 1008), x = L0, y = 340;
  ctx.save();
  const grow = 1 + 0.35 * (1 - springU(u, 0.6, SPRING.gentle));
  ctx.translate(x + cw / 2 - (1 - kc) * 1000, y + ch / 2); ctx.rotate(-0.035 + 0.01 * wobble(u + 0.5, 1.2, 3));
  ctx.scale(grow, grow);
  ctx.translate(-(x + cw / 2), -(y + ch / 2));
  const map = screen(ctx, IMG.dash, x, y, cw, ch, { zoom: z, cx, cy });
  const [bx, by, sc] = map(150, 30);
  const kr = springU(u, w(s, 7.6), SPRING.snappy) * (1 - prog(u, w(s, 8.8), w(s, 9.2)));
  ctx.save(); rrect(ctx, x, y, cw, ch, 18); ctx.clip();
  ring(ctx, bx, by, 114 * sc, 28 * sc, kr, C.accent);
  ctx.restore();
  ctx.restore();
  // device chips under the card, on "جهاز"
  [['monitor', 'حاسوب'], ['phone', 'هاتف'], ['users', 'فريق']].forEach(([ic, lab], i) => {
    const k = springU(u, w(s, 9.04) + i * 0.33, SPRING.bouncy);
    pop(ctx, k, 716 - i * 190, 840, () => pill(ctx, 800 - i * 190, 810, 64, lab, F(30, 600, UI), { ico: ic, bg: C.white, fg: C.ink, stroke: C.line }), { rise: 30 });
  });
}

// 02 · The series: what VanCash is, the six stages, and this episode's place in them.
const STAGES = ['جهّز محلّك', 'أدخل المخزون', 'رتّب الحسابات', 'نفّذ أول بيع', 'تابع الحركات', 'راجع وراقب'];
function series(ctx, u) {
  ctx.drawImage(BG.blue, 0, 0);
  const s = 's02', wh = 'rgba(255,255,255,.84)';
  reveal(ctx, u, 'مرحبًا بك في سلسلة تشغيل', R, 190, F(52, 700), wh, ws(s, [0, 0.84, 1.04, 1.2, 1.84]));
  const kL = springU(u, w(s, 2.8) - 0.3, SPRING.bouncy);
  pop(ctx, kL, R - 66, 320, () => logo(ctx, R - 132, 254, 132, { bg: C.white, fg: C.accent, p: clamp(kL * 1.2) }), { from: 0.4 });
  reveal(ctx, u, 'VanCash ERP', R - 165, 372, F(150, 900), C.white, [w(s, 2.8) - 0.15], { spring: SPRING.bouncy });
  reveal(ctx, u, 'برنامج تسيير محلات الهواتف والإكسسوارات في الجزائر', R, 470, F(44, 500, UI), wh,
    ws(s, [3.92, 4.56, 5.12, 5.76, 6.4, 7.4, 7.84]));

  const focus = E.inOutCubic(prog(u, w(s, 13.84), w(s, 13.84) + 0.9));
  const cw = 268, gap = 24, cy0 = 545, chh = 128;
  STAGES.forEach((lab, i) => {
    const k = springU(u, w(s, 8.72) - 0.1 + i * 0.45, SPRING.bouncy);
    const xr = R - i * (cw + gap);
    const lift = i === 0 ? focus * 18 : 0;
    ctx.save(); ctx.globalAlpha = clamp(k * 1.6) * (i === 0 ? 1 : 1 - 0.55 * focus);
    ctx.translate(0, -(1 - k) * 90 - lift);
    rrect(ctx, xr - cw, cy0, cw, chh, 20);
    ctx.fillStyle = i === 0 ? M.mix('#3b6cf7', '#ffffff', focus) : 'rgba(255,255,255,.12)'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.28)'; ctx.lineWidth = 2; ctx.stroke();
    text(ctx, `0${i + 1}`, xr - 24, cy0 + 50, F(34, 900), i === 0 ? M.mix('#c5f85c', '#2457f5', focus) : C.lime);
    text(ctx, lab, xr - 24, cy0 + 103, F(32, 700, UI), i === 0 ? M.mix('#ffffff', '#0c234a', focus) : C.white);
    ctx.restore();
  });
  // the journey line: from the first step to an organised day
  const pl = E.inOutCubic(prog(u, w(s, 10.0), w(s, 12.9)));
  if (pl > 0) {
    const x0 = R - 20, x1 = L0 + 20, xe = lerp(x0, x1, pl), yl = cy0 + chh + 40;
    ctx.save(); ctx.globalAlpha = 1 - 0.5 * focus;
    ctx.strokeStyle = C.lime; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x0, yl); ctx.lineTo(xe, yl); ctx.stroke();
    ctx.beginPath(); ctx.arc(xe, yl, 12, 0, Math.PI * 2); ctx.fillStyle = C.lime; ctx.fill();
    ctx.restore();
    text(ctx, 'أول خطوة', x0, yl + 52, F(28, 600, UI), wh, 'right', clamp(prog(u, w(s, 10.96), w(s, 10.96) + 0.4)) * (1 - 0.5 * focus));
    text(ctx, 'يوم عمل منظّم', x1, yl + 52, F(28, 600, UI), wh, 'left', clamp(prog(u, w(s, 12.16), w(s, 12.16) + 0.4)) * (1 - 0.5 * focus));
  }
  // this episode
  const ke = springU(u, w(s, 13.84) - 0.1, SPRING.snappy);
  pop(ctx, ke, R - 90, 850, () => pill(ctx, R, 822, 58, 'الحلقة 1', F(30, 800), { bg: C.lime, fg: C.ink }), { rise: 30 });
  reveal(ctx, u, 'جهّز محلّك واختر النسخة المناسبة', R, 975, F(80, 900), C.white, ws(s, [15.92, 16.32, 17.28, 17.76, 18.28]),
    { colors: { 0: C.lime, 1: C.lime } });
}

// 03 · A tour of the real screens, each landing on the word that names it.
const TOUR = [
  { img: 'dash', name: 'لوحة التحكم', ico: 'grid', t: 4.08 },
  { img: 'products', name: 'المنتجات والمخزون', ico: 'box', t: 7.84 },
  { img: 'imei', name: 'الهواتف وIMEI', ico: 'phone', t: 9.52 },
  { img: 'pos', name: 'نقطة البيع', ico: 'scan', t: 12.32 },
  { img: 'debts', name: 'دفتر الديون', ico: 'wallet', t: 13.44 },
  { img: 'reports', name: 'التقارير', ico: 'chart', t: 14.56 },
];
function tour(ctx, u) {
  ctx.drawImage(BG.paper, 0, 0);
  const s = 's03';
  text(ctx, 'داخل البرنامج', R, 132, F(32, 700, UI), C.accent);
  const fT = F(72, 900);
  const LT = lineLayout(ctx, 'كل شيء في مكان واحد', fT);
  marker(ctx, u, LT, R, 222, 72, 3, 4, w(s, 3.0));
  reveal(ctx, u, 'كل شيء في مكان واحد', R, 222, fT, C.ink, ws(s, [1.84, 2.24, 2.56, 2.88, 3.28]));

  const keys = [[START[2] - 2, 0], ...TOUR.slice(1).map((c, i) => [w(s, c.t) - 0.5, i + 1])];
  const cam = springKeys(u, keys, SPRING.snappy);
  const cw = 980;
  TOUR.forEach((c, i) => {
    const d = i - cam;
    if (Math.abs(d) > 1.7) return;
    const img = IMG[c.img], ch = Math.round(cw * img.height / img.width);
    const cxp = 960 - d * 1120, sc = lerp(1, 0.84, Math.min(Math.abs(d), 1));
    ctx.save();
    ctx.translate(cxp, 600); ctx.scale(sc, sc);
    ctx.globalAlpha = lerp(1, 0.5, Math.min(Math.abs(d), 1));
    const map = screen(ctx, img, -cw / 2, -ch / 2, cw, ch, {});
    if (i === 0) {
      const callouts = [[770, 100, 236, 118, 5.52], [15, 100, 238, 118, 6.96]];
      callouts.forEach(([sx, sy, sw, sh, t]) => {
        const [rx, ry, rs] = map(sx, sy);
        const k = springU(u, w(s, t) - 0.1, SPRING.snappy) * (1 - prog(u, w(s, t) + 2.2, w(s, t) + 2.7));
        ring(ctx, rx, ry, sw * rs, sh * rs, k);
      });
    }
    ctx.restore();
  });
  // the name of the screen in focus
  const idx = Math.round(clamp(cam, 0, TOUR.length - 1));
  const near = 1 - Math.min(1, Math.abs(cam - idx) * 2.5);
  const kn = springU(u, w(s, TOUR[0].t) - 0.2, SPRING.snappy);
  if (kn > 0) {
    const tw = pillW(ctx, TOUR[idx].name, F(36, 700, UI), 66, TOUR[idx].ico);
    ctx.save(); ctx.globalAlpha = clamp(kn * 1.5) * near;
    ctx.translate(0, (1 - near) * 24);
    pill(ctx, 960 + tw / 2, 950, 66, TOUR[idx].name, F(36, 700, UI), { bg: C.ink, fg: C.white, ico: TOUR[idx].ico });
    ctx.restore();
  }
  // progress dots
  TOUR.forEach((_, i) => {
    const on = 1 - Math.min(1, Math.abs(cam - i));
    ctx.beginPath(); ctx.arc(R - 16 - i * 30, 1010, 6 + on * 3, 0, Math.PI * 2);
    ctx.fillStyle = M.mix(C.line, C.accent, on); ctx.fill();
  });
}

// 04 · The question that decides the version.
function question(ctx, u) {
  ctx.drawImage(BG.navy, 0, 0);
  const s = 's04';
  const out = E.inCubic(prog(u, w(s, 6.55), w(s, 7.15)));
  if (out < 1) {
    ctx.save(); ctx.globalAlpha = 1 - out; ctx.translate(0, -out * 80);
    reveal(ctx, u, 'الفرق بين النسخ', R, 230, F(64, 800), C.lime, [START[3] - 0.7, w(s, 0.48) - 0.15, w(s, 0.8) - 0.15]);
    reveal(ctx, u, 'ليس في المزايا فقط،', R, 330, F(48, 600, UI), 'rgba(255,255,255,.72)', ws(s, [1.36, 1.64, 1.8, 2.24]));
    const fB = F(104, 900);
    const LB = lineLayout(ctx, 'بل في مكان حفظ البيانات', fB);
    marker(ctx, u, LB, R, 500, 104, 3, 4, w(s, 3.68), C.lime, 1, true);
    const kInk = prog(u, w(s, 3.68) + 0.15, w(s, 3.68) + 0.5);
    reveal(ctx, u, 'بل في مكان حفظ البيانات', R, 500, fB, C.white, ws(s, [2.96, 3.12, 3.28, 3.68, 3.96]),
      { colors: kInk > 0 ? { 3: C.ink, 4: C.ink } : {} });
    reveal(ctx, u, 'وطريقة الوصول إليها.', R, 660, fB, C.white, ws(s, [4.8, 5.4, 5.92]));
    ctx.restore();
  }
  reveal(ctx, u, 'اسأل نفسك أولًا:', R, 250, F(84, 900), C.white, ws(s, [7.28, 7.76, 8.08]));
  const Q = [
    { t: 8.8, words: [8.8, 9.04, 9.56], str: 'كم جهازًا ستستخدم؟', hint: 'حاسوب · هاتف · هاتف العامل', x: 1004, ic: ['monitor', 'phone'] },
    { t: 10.48, words: [10.48, 10.8, 11.52, 12.16], str: 'هل الإنترنت متوفر دائمًا؟', hint: 'في المحل، طوال اليوم', x: L0, ic: ['wifi'] },
  ];
  Q.forEach((q) => {
    const k = springU(u, w(s, q.t) - 0.3, SPRING.snappy);
    if (k <= 0.002) return;
    ctx.save(); ctx.globalAlpha = clamp(k * 1.6); ctx.translate(0, (1 - k) * 90);
    card(ctx, q.x, 340, 820, 440, 30, 'rgba(255,255,255,.07)', { shadow: false, stroke: 'rgba(255,255,255,.2)' });
    q.ic.forEach((ic, j) => icon(ctx, ic, q.x + 820 - 100 - j * 120, 450, 110, C.lime, { lw: 1.6, p: clamp(k * 1.3) }));
    ctx.restore();
    reveal(ctx, u, q.str, q.x + 820 - 52, 640, F(58, 900), C.white, ws(s, q.words));
    text(ctx, q.hint, q.x + 820 - 52, 720, F(32, 500, UI), 'rgba(255,255,255,.6)', 'right', clamp(prog(u, w(s, q.words.at(-1)), w(s, q.words.at(-1)) + 0.6)));
  });
}

// A plan-and-promise layout shared by Offline and Online: the title and its checks at the right.
function checks(ctx, u, rows) {
  rows.forEach(({ str, y, at, mark }) => {
    const f = F(46, 800);
    const k = springU(u, at[0] - 0.2, SPRING.bouncy);
    pop(ctx, k, R - 28, y - 16, () => {
      ctx.beginPath(); ctx.arc(R - 28, y - 16, 26, 0, Math.PI * 2); ctx.fillStyle = C.mint; ctx.fill();
      icon(ctx, 'check', R - 28, y - 16, 34, C.green, { lw: 3 });
    }, { from: 0.3 });
    if (mark) marker(ctx, u, lineLayout(ctx, str, f), R - 76, y, 46, mark[0], mark[1], mark[2]);
    reveal(ctx, u, str, R - 76, y, f, C.ink, at);
  });
}
function chipsRow(ctx, u, items, y, xR = R) {
  let x = xR;
  items.forEach(([lab, at]) => {
    const wd = pillW(ctx, lab, F(30, 600, UI), 60, 'check');
    const k = springU(u, at, SPRING.bouncy);
    const xr = x;
    pop(ctx, k, xr - wd / 2, y + 30, () => pill(ctx, xr, y, 60, lab, F(30, 600, UI), { bg: C.white, fg: C.ink, ico: 'check', stroke: C.line }), { rise: 20 });
    x -= wd + 14;
  });
}

// 05 · Offline: on the device itself.
function offline(ctx, u) {
  ctx.drawImage(BG.paper, 0, 0);
  const s = 's05';
  text(ctx, 'النسخة الأولى · على جهازك', R, 120, F(32, 700, UI), C.accent);
  reveal(ctx, u, 'Offline', R, 258, F(150, 900), C.ink, [w(s, 0.56) - 0.3], { spring: SPRING.bouncy });
  checks(ctx, u, [
    { str: 'بدون إنترنت 100%', y: 372, at: ws(s, [1.76, 2.24, 2.88]) },
    { str: 'البيانات على نفس الجهاز', y: 458, at: ws(s, [4.56, 5.2, 5.44, 5.68]), mark: [2, 3, w(s, 5.44)] },
  ]);
  // the diagram: one machine, the data stays inside it
  const kd = springU(u, START[4] - 1.2, SPRING.gentle);
  ctx.save(); ctx.globalAlpha = clamp(kd * 1.5); ctx.translate(-(1 - kd) * 200, 0);
  const mx = 470, my = 330;
  icon(ctx, 'monitor', mx, my, 400, C.ink, { lw: 1.25 });
  // data cylinder in the screen
  const kdb = springU(u, w(s, 4.56) - 0.2, SPRING.bouncy);
  pop(ctx, kdb, mx, my - 40, () => {
    ctx.fillStyle = C.accent;
    for (let i = 2; i >= 0; i--) {
      ctx.beginPath(); ctx.ellipse(mx, my - 80 + i * 44, 70, 22, 0, 0, Math.PI * 2);
      ctx.fillStyle = i === 0 ? '#5a83ff' : C.accent; ctx.fill();
      if (i > 0) ctx.fillRect(mx - 70, my - 80 + (i - 1) * 44, 140, 44);
    }
    ctx.beginPath(); ctx.ellipse(mx, my - 80, 70, 22, 0, 0, Math.PI * 2); ctx.fillStyle = '#7d9dff'; ctx.fill();
  }, { from: 0.4 });
  // no-internet badge
  const kw = springU(u, w(s, 1.76) - 0.2, SPRING.bouncy);
  pop(ctx, kw, mx + 170, my - 150, () => {
    shadow(ctx, mx + 120, my - 200, 100, 100, 50, 0.25);
    ctx.beginPath(); ctx.arc(mx + 170, my - 150, 50, 0, Math.PI * 2); ctx.fillStyle = C.white; ctx.fill();
    icon(ctx, 'wifiOff', mx + 170, my - 150, 56, '#c0392b', { lw: 2.2 });
  }, { from: 0.3 });
  // the phone joins on "وللهاتف"
  const kp = springU(u, w(s, 9.92) - 0.2, SPRING.bouncy);
  pop(ctx, kp, 740, 520, () => {
    rrect(ctx, 664, 400, 152, 250, 26); ctx.fillStyle = C.paper; ctx.fill();
    icon(ctx, 'phone', 740, 525, 260, C.ink, { lw: 1.4 });
  }, { from: 0.5, rise: 40 });
  ctx.restore();

  planCard(ctx, u, 1404, 545, { mode: 'Offline', ico: 'monitor', title: 'للحاسوب', price: 15000, sub: 'حاسوب ثابت داخل المحل' }, w(s, 7.2) - 0.3, w(s, 7.92));
  planCard(ctx, u, 960, 545, { mode: 'Offline', ico: 'phone', title: 'للهاتف', price: 4900, sub: 'إدارة من هاتف واحد' }, w(s, 9.92) - 0.3, w(s, 10.64));
  chipsRow(ctx, u, [['البيع', w(s, 13.6)], ['المخزون', w(s, 13.92)], ['الزبائن', w(s, 14.64)], ['الديون', w(s, 15.36)], ['الفواتير', w(s, 15.92)]].map(([a, b]) => [a, b - 0.2]), 900);
  const fE = F(44, 800);
  const LE = lineLayout(ctx, 'تناسبك إذا كنت تعتمد على جهاز واحد', fE);
  marker(ctx, u, LE, 900, 810, 44, 5, 6, w(s, 19.12));
  reveal(ctx, u, 'تناسبك إذا كنت تعتمد على جهاز واحد', 900, 810, fE, C.ink, ws(s, [16.96, 17.72, 18.0, 18.32, 18.88, 19.12, 19.6]));
  text(ctx, PRICE_NOTE, R, 1008, F(22, 500, UI), C.faint, 'right', clamp(prog(u, w(s, 7.92), w(s, 7.92) + 1)));
}

// 06 · Online: the cloud, the plans, and three devices kept in sync.
function online(ctx, u) {
  ctx.drawImage(BG.paper, 0, 0);
  const s = 's06';
  text(ctx, 'النسخة الثانية · بين أجهزتك', R, 120, F(32, 700, UI), C.accent);
  reveal(ctx, u, 'Online', R, 258, F(150, 900), C.ink, [w(s, 0.96) - 0.3], { spring: SPRING.bouncy });
  checks(ctx, u, [
    { str: 'حفظ بياناتك سحابيًا', y: 372, at: ws(s, [1.64, 2.4, 3.12]) },
    { str: 'الدخول بالإيميل واسترجاع الحساب', y: 458, at: ws(s, [4.24, 5.2, 6.96, 7.52]), mark: [2, 3, w(s, 6.96)] },
  ]);
  planCard(ctx, u, 1404, 545, { mode: 'Online', ico: 'cloud', title: 'جهاز واحد', price: 4900, sub: 'حفظ سحابي لجهاز واحد' }, w(s, 8.56) - 0.3, w(s, 9.92));
  planCard(ctx, u, 960, 545, { mode: 'Online', ico: 'users', title: '3 أجهزة', price: 9900, sub: 'حاسوب المحل وهاتفك وهاتف العامل', featured: true, tag: 'لصاحب المحل والفريق' },
    w(s, 12.64) - 0.3, w(s, 14.4));
  text(ctx, PRICE_NOTE, R, 1008, F(22, 500, UI), C.faint, 'right', clamp(prog(u, w(s, 9.92), w(s, 9.92) + 1)));

  // the cloud: big while it is the subject, then up and smaller when the devices arrive
  const dev = w(s, 16.88);
  const [cX, cY, cS] = springKeys(u, [[START[5] - 2, [480, 330, 330]], [dev - 0.4, [480, 215, 210]]], SPRING.gentle);
  const kc = springU(u, START[5] - 1.2, SPRING.gentle);
  ctx.save(); ctx.globalAlpha = clamp(kc * 1.5); ctx.translate(-(1 - kc) * 200, 0);
  icon(ctx, 'cloud', cX, cY, cS, C.accent, { lw: 1.3, p: 0.35 + 0.65 * prog(u, w(s, 1.4), w(s, 3.2)) });
  ctx.restore();
  // e-mail login, until the devices take the space
  const km = springU(u, w(s, 5.2) - 0.2, SPRING.bouncy) * (1 - prog(u, dev - 0.8, dev - 0.2));
  pop(ctx, km, 480, 600, () => pill(ctx, 480 + 150, 568, 66, 'الدخول بالإيميل', F(32, 700, UI), { bg: C.white, fg: C.ink, ico: 'mail', stroke: C.line }), { rise: 30 });

  const DEV = [
    { x: 760, ic: 'monitor', lab: 'حاسوب المحل', t: 17.36, role: 'كل الصلاحيات', size: 150 },
    { x: 480, ic: 'phone', lab: 'هاتفك', t: 18.56, role: 'صاحب المحل', size: 140 },
    { x: 200, ic: 'phone', lab: 'هاتف العامل', t: 19.28, role: 'صلاحيات محدودة', size: 140, lock: true },
  ];
  const sync = w(s, 20.72);
  DEV.forEach((d, i) => {
    const k = springU(u, w(s, d.t) - 0.25, SPRING.bouncy);
    if (k <= 0.002) return;
    // the line to the cloud, drawn on as the device lands
    const p = E.outCubic(prog(u, w(s, d.t), w(s, d.t) + 0.9));
    const x0 = d.x, y0 = 560, x1 = 480 + (d.x - 480) * 0.25, y1 = 300;
    ctx.save(); ctx.strokeStyle = '#b9cdf6'; ctx.lineWidth = 4; ctx.setLineDash([12, 10]);
    ctx.globalAlpha = clamp(p * 2);
    ctx.beginPath(); ctx.moveTo(x0, y0);
    ctx.bezierCurveTo(x0, lerp(y0, y1, 0.55), x1, lerp(y0, y1, 0.45), lerp(x0, x1, p), lerp(y0, y1, p));
    ctx.stroke(); ctx.restore();
    // sync pulses travel both ways once "مزامنة" is said
    if (u > sync) {
      for (let j = 0; j < 2; j++) {
        let f = ((u - sync) / 1.6 + i * 0.33 + j * 0.5) % 1;
        if (j === 1) f = 1 - f;
        const bx = bez(x0, x0, x1, x1, f), by = bez(y0, lerp(y0, y1, 0.55), lerp(y0, y1, 0.45), y1, f);
        const a = clamp(prog(u, sync, sync + 0.6)) * Math.sin(Math.PI * f);
        ctx.beginPath(); ctx.arc(bx, by, 9, 0, Math.PI * 2);
        ctx.fillStyle = j ? C.green : C.accent; ctx.globalAlpha = a; ctx.fill(); ctx.globalAlpha = 1;
      }
    }
    pop(ctx, k, d.x, 640, () => {
      rrect(ctx, d.x - 90, 560, 180, 170, 26); ctx.fillStyle = C.paper; ctx.fill();
      icon(ctx, d.ic, d.x, 645, d.size, C.ink, { lw: 1.4 });
      text(ctx, d.lab, d.x, 780, F(30, 700, UI), C.ink, 'center');
    }, { rise: 50 });
    // more users, then permissions
    const ku = springU(u, w(s, 22.8) + i * 0.3, SPRING.bouncy);
    pop(ctx, ku, d.x + 72, 575, () => {
      ctx.beginPath(); ctx.arc(d.x + 72, 575, 30, 0, Math.PI * 2); ctx.fillStyle = C.wash; ctx.fill();
      icon(ctx, 'users', d.x + 72, 575, 36, C.accent, { lw: 2.2 });
    }, { from: 0.3 });
    const kr = springU(u, w(s, 24.72) + i * 0.3, SPRING.bouncy);
    const rw = pillW(ctx, d.role, F(24, 700, UI), 46, d.lock ? 'lock' : null, 18);
    pop(ctx, kr, d.x, 830, () => pill(ctx, d.x + rw / 2, 808, 46, d.role, F(24, 700, UI),
      { bg: d.lock ? C.ink : C.wash, fg: d.lock ? C.white : C.accent, ico: d.lock ? 'lock' : null, pad: 18 }), { rise: 16 });
  });
  // the app's own sync badge, from the real dashboard
  const kb = springU(u, sync - 0.1, SPRING.bouncy);
  pop(ctx, kb, 480, 404, () => {
    card(ctx, 480 - 330, 362, 660, 84, 18, C.white, { stroke: C.line });
    cropCover(ctx, IMG.dash, [28, 24, 354, 42], 480 - 316, 370, 632, 68, 12);
  }, { rise: 20 });
}
const bez = (a, b, c, d, t) => (1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t * t * c + t ** 3 * d;

// 07 · The rule, as a three-row table.
function rule(ctx, u) {
  ctx.drawImage(BG.paper, 0, 0);
  const s = 's07';
  text(ctx, 'خلاصة الاختيار', R, 120, F(32, 700, UI), C.accent);
  const fT = F(84, 900);
  marker(ctx, u, lineLayout(ctx, 'القاعدة بسيطة', fT), R, 222, 84, 1, 1, w(s, 0.88));
  reveal(ctx, u, 'القاعدة بسيطة', R, 222, fT, C.ink, ws(s, [0, 0.88]));
  const ROWS = [
    { ic: 'wifiOff', str: 'جهاز واحد دون إنترنت', at: [1.84, 2.32, 2.8, 3.12], ans: 'Offline', t: 4.44, bg: C.ink },
    { ic: 'cloud', str: 'تريد حفظًا سحابيًا', at: [5.28, 5.68, 6.08], ans: 'Online', t: 7.36, bg: C.accent },
    { ic: 'users', str: 'الحاسوب والهاتف معًا', at: [8.24, 8.96, 9.6], ans: '3 أجهزة · Online', t: 10.64, bg: C.accent, lime: true },
  ];
  ROWS.forEach((r, i) => {
    const y = 290 + i * 172, h_ = 148;
    const k0 = springU(u, START[6] - 1 + i * 0.2, SPRING.snappy);
    ctx.save(); ctx.globalAlpha = clamp(k0 * 1.6); ctx.translate(-(1 - k0) * 120, 0);
    card(ctx, L0, y, R - L0, h_, 26, C.white, { stroke: C.line });
    ctx.beginPath(); ctx.arc(R - 74, y + h_ / 2, 44, 0, Math.PI * 2); ctx.fillStyle = C.wash; ctx.fill();
    ctx.restore();
    const k = springU(u, w(s, r.at[0]) - 0.35, SPRING.bouncy);
    pop(ctx, k, R - 74, y + h_ / 2, () => icon(ctx, r.ic, R - 74, y + h_ / 2, 50, C.accent, { lw: 2 }), { from: 0.3 });
    reveal(ctx, u, r.str, R - 148, y + h_ / 2 + 22, F(56, 800), C.ink, ws(s, r.at));
    const ka = springU(u, w(s, r.t) - 0.2, SPRING.bouncy);
    arrowLeft(ctx, 900, 640, y + h_ / 2, C.faint, E.outCubic(prog(u, w(s, r.t) - 0.5, w(s, r.t) - 0.05)));
    pop(ctx, ka, 380, y + h_ / 2, () => {
      ctx.save(); ctx.font = F(50, 900); const tw = ctx.measureText(r.ans).width; ctx.restore();
      const pw = tw + 80;
      rrect(ctx, 600 - pw, y + 30, pw, h_ - 60, (h_ - 60) / 2); ctx.fillStyle = r.bg; ctx.fill();
      if (r.lime) { ctx.strokeStyle = C.lime; ctx.lineWidth = 5; ctx.stroke(); }
      text(ctx, r.ans, 600 - pw / 2, y + h_ / 2 + 17, F(50, 900), C.white, 'center');
    }, { from: 0.4 });
  });
  // the footnote: what sync needs
  const kf_ = springU(u, w(s, 12.56) - 0.3, SPRING.snappy);
  if (kf_ > 0.002) {
    ctx.save(); ctx.globalAlpha = clamp(kf_ * 1.6); ctx.translate(0, (1 - kf_) * 80);
    card(ctx, L0, 828, R - L0, 150, 28, C.ink);
    icon(ctx, 'sync', R - 74, 903, 56, C.lime, { lw: 2 });
    ctx.restore();
    reveal(ctx, u, 'المزامنة بين الأجهزة تحتاج:', R - 140, 922, F(48, 800), C.white, ws(s, [13.48, 14.2, 14.44, 15.04]));
    const L = lineLayout(ctx, 'المزامنة بين الأجهزة تحتاج:', F(48, 800));
    const x0 = R - 140 - L.width - 30;
    const k1 = springU(u, w(s, 15.52) - 0.15, SPRING.bouncy), k2 = springU(u, w(s, 16.48) - 0.15, SPRING.bouncy);
    const w1 = pillW(ctx, 'إنترنت', F(40, 800), 70);
    pop(ctx, k1, x0 - w1 / 2, 903, () => pill(ctx, x0, 868, 70, 'إنترنت', F(40, 800), { bg: C.lime, fg: C.ink }), { from: 0.4 });
    text(ctx, '+', x0 - w1 - 34, 920, F(54, 900), C.lime, 'center', clamp(k2 * 2));
    pop(ctx, k2, x0 - w1 - 260, 903, () => pill(ctx, x0 - w1 - 68, 868, 70, 'خطة تدعم عدة أجهزة', F(40, 800), { bg: C.lime, fg: C.ink }), { from: 0.4 });
  }
}

// 08 · Start the trial, through the right channel.
function trial(ctx, u) {
  ctx.drawImage(BG.paper, 0, 0);
  const s = 's08';
  text(ctx, 'الخطوة التالية', R, 120, F(32, 700, UI), C.accent);
  const fT = F(96, 900);
  marker(ctx, u, lineLayout(ctx, 'ابدأ تجربتك المجانية', fT), R, 250, 96, 2, 2, w(s, 2.92));
  reveal(ctx, u, 'ابدأ تجربتك المجانية', R, 250, fT, C.ink, START[7] - 0.5, { stagger: 0.18 });
  // the gift, then three days filling one by one
  const kg = springU(u, START[7] - 1, SPRING.gentle);
  pop(ctx, kg, 300, 300, () => {
    ctx.beginPath(); ctx.arc(300, 300, 150, 0, Math.PI * 2); ctx.fillStyle = C.wash; ctx.fill();
    icon(ctx, 'gift', 300, 300, 150, C.accent, { lw: 1.5 });
  });
  const k3 = springU(u, w(s, 4.4) - 0.2, SPRING.bouncy);
  pop(ctx, k3, 640, 330, () => {
    text(ctx, '3', 640, 420, F(240, 900), C.accent, 'center');
    text(ctx, 'أيام', 830, 300, F(64, 900), C.ink, 'center');
    text(ctx, 'مجانًا', 830, 380, F(52, 800), C.green, 'center');
  }, { from: 0.5 });
  [0, 1, 2].forEach((i) => {
    const k = springU(u, w(s, 4.4) + 0.3 + i * 0.35, SPRING.bouncy);
    const x = 700 - i * 70;
    ctx.beginPath(); ctx.arc(x, 480, 18, 0, Math.PI * 2); ctx.strokeStyle = C.line; ctx.lineWidth = 3; ctx.stroke();
    pop(ctx, k, x, 480, () => { ctx.beginPath(); ctx.arc(x, 480, 18, 0, Math.PI * 2); ctx.fillStyle = C.accent; ctx.fill(); }, { from: 0.2 });
  });
  text(ctx, 'من القناة المناسبة:', R, 360, F(46, 700), C.muted, 'right', clamp(prog(u, w(s, 5.4), w(s, 5.4) + 0.5)));
  // the two channels
  const ko = springU(u, w(s, 7.04) - 0.3, SPRING.snappy);
  pop(ctx, ko, 1404, 760, () => {
    card(ctx, 984, 590, 840, 300, 30, C.white, { stroke: C.line });
    ctx.beginPath(); ctx.arc(R - 80, 670, 46, 0, Math.PI * 2); ctx.fillStyle = C.wash; ctx.fill();
    icon(ctx, 'globe', R - 80, 670, 52, C.accent, { lw: 2 });
    text(ctx, 'لمسار Online', R - 150, 668, F(46, 800), C.ink);
    text(ctx, 'افتح الموقع الرسمي', R - 150, 718, F(30, 500, UI), C.muted);
    const url = 'mobileposdz.com', tp = prog(u, w(s, 8.4), w(s, 9.9));
    const n = Math.round(url.length * tp);
    if (n > 0) {
      ctx.save(); ctx.font = F(62, 900); ctx.direction = 'ltr'; ctx.textAlign = 'right'; ctx.fillStyle = C.accent;
      const full = ctx.measureText(url).width; ctx.textAlign = 'left';
      const x0 = R - 64 - full;
      ctx.fillText(url.slice(0, n), x0, 836);
      if (tp < 1 && Math.floor(u * 3) % 2 === 0) ctx.fillRect(x0 + ctx.measureText(url.slice(0, n)).width + 4, 788, 5, 56);
      ctx.restore();
    }
  }, { from: 0.85, rise: 60 });
  const kf_ = springU(u, w(s, 10.16) - 0.3, SPRING.snappy);
  pop(ctx, kf_, 516, 760, () => {
    shadow(ctx, L0, 590, 840, 300, 30, 0.25);
    rrect(ctx, L0, 590, 840, 300, 30); ctx.fillStyle = C.wa; ctx.fill();
    ctx.beginPath(); ctx.arc(936 - 80, 670, 46, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,.16)'; ctx.fill();
    icon(ctx, 'chat', 936 - 80, 670, 52, C.white, { lw: 2 });
    text(ctx, 'لطلب نسخة Offline', 936 - 150, 668, F(46, 800), C.white);
    text(ctx, 'تواصل معنا عبر واتساب', 936 - 150, 718, F(30, 500, UI), 'rgba(255,255,255,.8)');
    const kn = springU(u, w(s, 13.28) - 0.2, SPRING.bouncy);
    pop(ctx, kn, 516, 820, () => text(ctx, '0655970064', 936 - 64, 840, F(64, 900), C.white), { from: 0.6 });
  }, { from: 0.85, rise: 60 });
  // on the device you will really use
  const fB = F(40, 700);
  const LB = lineLayout(ctx, 'وتأكّد أن التجربة تعمل على الجهاز الذي ستستخدمه فعلًا', fB);
  marker(ctx, u, LB, R - 70, 975, 40, 8, 8, w(s, 18.16));
  pop(ctx, springU(u, w(s, 14.24) - 0.3, SPRING.bouncy), R - 24, 962, () => icon(ctx, 'monitor', R - 24, 962, 46, C.accent, { lw: 2 }), { from: 0.3 });
  reveal(ctx, u, 'وتأكّد أن التجربة تعمل على الجهاز الذي ستستخدمه فعلًا', R - 70, 975, fB, C.ink,
    ws(s, [14.24, 14.88, 15.12, 15.76, 16.24, 16.4, 16.88, 17.2, 18.16]));
}

// 09 · Prepare the shop's data before entering anything.
function data(ctx, u) {
  ctx.drawImage(BG.paper, 0, 0);
  const s = 's09';
  text(ctx, 'قبل إدخال أي منتج', R, 120, F(32, 700, UI), C.accent);
  reveal(ctx, u, 'جهّز بيانات محلّك', R, 238, F(90, 900), C.ink, ws(s, [2.0, 2.4, 2.96]));
  const LT = lineLayout(ctx, 'جهّز بيانات محلّك', F(90, 900));
  let xc = R - LT.width - 40;
  [['على ورقة', 3.84], ['أو في ملف', 4.88]].forEach(([lab, t], i) => {
    const wd = pillW(ctx, lab, F(30, 600, UI), 60, 'file');
    const k = springU(u, w(s, t) - 0.2, SPRING.bouncy), xr = xc;
    pop(ctx, k, xr - wd / 2, 210, () => pill(ctx, xr, 180, 60, lab, F(30, 600, UI), { bg: C.wash, fg: C.accent, ico: 'file' }), { rise: 20 });
    xc -= wd + 14;
  });
  const ITEMS = [
    { n: 1, str: 'اسم المحل ورقم الهاتف', at: [5.52, 5.76, 6.24, 6.68], done: 7.1, ico: 'shop' },
    { n: 2, str: 'المنتجات وأسعارها', at: [7.92, 8.56], done: 9.1, thumb: ['addp', [520, 60, 488, 290]] },
    { n: 3, str: 'الزبائن والموردون', at: [9.52, 10.24], done: 11.1, thumb: ['customer', [0, 0, 680, 300]] },
    { n: 4, str: 'الأرصدة والديون القائمة', at: [11.44, 12.24, 12.8], done: 13.3, thumb: ['debts', [560, 220, 448, 260]] },
  ];
  ITEMS.forEach((it, i) => {
    const x = i % 2 === 0 ? 984 : L0, y = i < 2 ? 320 : 600, cw = 840, ch = 250, xr = x + cw;
    const k0 = springU(u, START[8] - 1 + i * 0.2, SPRING.snappy);
    ctx.save(); ctx.globalAlpha = clamp(k0 * 1.6); ctx.translate(0, (1 - k0) * 70);
    card(ctx, x, y, cw, ch, 26, C.white, { stroke: C.line });
    ctx.beginPath(); ctx.arc(xr - 58, y + 62, 30, 0, Math.PI * 2); ctx.fillStyle = C.accent; ctx.fill();
    text(ctx, String(it.n), xr - 58, y + 75, F(34, 900), C.white, 'center');
    rrect(ctx, x + 24, y + 24, 250, ch - 48, 14); ctx.fillStyle = C.wash; ctx.fill();
    ctx.restore();
    const k = springU(u, w(s, it.at[0]) - 0.4, SPRING.snappy);
    pop(ctx, k, x + 149, y + ch / 2, () => {
      if (it.thumb) cropCover(ctx, IMG[it.thumb[0]], it.thumb[1], x + 24, y + 24, 250, ch - 48, 14);
      else icon(ctx, it.ico, x + 149, y + ch / 2, 100, C.accent, { lw: 1.5 });
    }, { from: 0.85 });
    reveal(ctx, u, it.str, xr - 104, y + 78, F(40, 800), C.ink, ws(s, it.at));
    stamp(ctx, springU(u, w(s, it.done), SPRING.bouncy), xr - 64, y + 182, 34);
  });
  const fB = F(46, 800);
  const LB = lineLayout(ctx, 'دقّة البداية تجعل المبيعات والتقارير أوضح لاحقًا', fB);
  marker(ctx, u, LB, R, 965, 46, 5, 5, w(s, 16.72));
  reveal(ctx, u, 'دقّة البداية تجعل المبيعات والتقارير أوضح لاحقًا', R, 965, fB, C.ink, ws(s, [13.76, 14.16, 14.88, 15.32, 15.92, 16.72, 17.2]));
}

// 10 · Keep the trial apart from real work.
function separate(ctx, u) {
  ctx.drawImage(BG.paper, 0, 0);
  const s = 's10';
  icon(ctx, 'shield', R - 18, 108, 40, C.accent, { lw: 2 });
  text(ctx, 'نصيحة مهمة', R - 52, 120, F(32, 700, UI), C.accent);
  reveal(ctx, u, 'افصل التجربة عن العمل الفعلي', R, 238, F(84, 900), C.ink, ws(s, [1.84, 2.24, 3.04, 3.2, 3.6]), { colors: { 1: C.accent } });
  // two panels: learning (right), real work (left)
  const kp = springU(u, START[9] - 1, SPRING.gentle);
  const split = E.inOutCubic(prog(u, w(s, 1.84), w(s, 1.84) + 1));
  const gapX = lerp(0, 40, split);
  ctx.save(); ctx.globalAlpha = clamp(kp * 1.5);
  card(ctx, 960 + gapX, 320, R - 960 - gapX, 600, 30, C.white, { stroke: C.line });
  card(ctx, L0, 320, 960 - gapX - L0, 600, 30, C.ink);
  ctx.restore();
  reveal(ctx, u, 'خلال التعلّم', R - 44, 400, F(48, 800), C.ink, ws(s, [4.8, 5.12]));
  const kd = springU(u, w(s, 6.0) - 0.4, SPRING.snappy);
  pop(ctx, kd, 1392, 620, () => {
    const map = screen(ctx, IMG.dash, 1040, 440, 744, Math.round(744 * 536 / 1008), { zoom: 1 });
    const [rx, ry, rs] = map(770, 100);
    ring(ctx, rx, ry, 236 * rs, 118 * rs, springU(u, w(s, 6.56), SPRING.snappy));
  }, { from: 0.9, rise: 40 });
  const kx = springU(u, w(s, 6.56) - 0.1, SPRING.bouncy);
  pop(ctx, kx, 1400, 870, () => pill(ctx, 1560, 840, 64, 'أمثلة واضحة للتعلّم', F(32, 700, UI), { bg: C.accent, fg: C.white, ico: 'check' }), { rise: 20 });

  reveal(ctx, u, 'العمل الفعلي', 960 - 40 - 44, 400, F(48, 800), C.white, ws(s, [3.2, 3.6]));
  const kl = springU(u, w(s, 11.12) - 0.3, SPRING.bouncy);
  pop(ctx, kl, 510, 560, () => {
    ctx.beginPath(); ctx.arc(510, 560, 90, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fill();
    icon(ctx, 'lock', 510, 560, 110, C.lime, { lw: 1.6 });
  }, { from: 0.4 });
  reveal(ctx, u, 'العمليات الحقيقية', 820, 730, F(54, 800), C.white, ws(s, [12.48, 13.2]));
  text(ctx, 'تبدأ بعد الاتفاق مع الدعم', 820, 790, F(32, 500, UI), 'rgba(255,255,255,.7)', 'right', clamp(prog(u, w(s, 13.2), w(s, 13.2) + 0.6)));
  // the bridge between them: agree with support first
  const kb = springU(u, w(s, 8.0) - 0.2, SPRING.bouncy);
  pop(ctx, kb, 960, 620, () => {
    const tw = pillW(ctx, 'اتفق مع الدعم', F(34, 800), 72, 'chat');
    shadow(ctx, 960 - tw / 2, 584, tw, 72, 36, 0.3);
    pill(ctx, 960 + tw / 2, 584, 72, 'اتفق مع الدعم', F(34, 800), { bg: C.lime, fg: C.ink, ico: 'chat' });
  }, { from: 0.4 });
}

// 11 · The checkpoint before episode 2 (the site's green "before you move on" box).
function check(ctx, u) {
  ctx.drawImage(BG.mint, 0, 0);
  const s = 's11';
  text(ctx, 'قبل الانتقال إلى الحلقة 2', R, 150, F(34, 700, UI), C.green);
  reveal(ctx, u, 'تأكّد من أمرين', R, 300, F(110, 900), C.ink, ws(s, [2.64, 3.2, 3.44]));
  const ROWS = [
    { str: 'النسخة المناسبة معروفة', at: [4.24, 4.8, 5.52], done: 6.0 },
    { str: 'يمكنك الدخول أو تشغيل البرنامج على الجهاز المقصود', at: [6.4, 7.04, 7.52, 7.68, 8.16, 8.88, 9.08, 9.52], done: 10.0 },
  ];
  ROWS.forEach((r, i) => {
    const y = 400 + i * 200;
    const k = springU(u, START[10] - 1 + i * 0.25, SPRING.snappy);
    ctx.save(); ctx.globalAlpha = clamp(k * 1.6); ctx.translate(-(1 - k) * 100, 0);
    card(ctx, L0, y, R - L0, 168, 28, C.white, { stroke: '#cfe9dc', shade: 0.12 });
    ctx.beginPath(); ctx.arc(R - 84, y + 84, 46, 0, Math.PI * 2); ctx.strokeStyle = '#cfe9dc'; ctx.lineWidth = 4; ctx.stroke();
    ctx.restore();
    stamp(ctx, springU(u, w(s, r.done) - 0.2, SPRING.bouncy), R - 84, y + 84, 46);
    reveal(ctx, u, r.str, R - 170, y + 106, F(56, 800), C.ink, ws(s, r.at));
  });
  // the series so far: stage 1 of 6 done
  STAGES.forEach((lab, i) => {
    const xr = R - i * 288, done = i === 0 ? springU(u, w(s, 10.0), SPRING.bouncy) : 0;
    rrect(ctx, xr - 272, 880, 272, 70, 35);
    ctx.fillStyle = done > 0 ? M.mix('#ffffff', C.green, clamp(done)) : 'rgba(255,255,255,.6)'; ctx.fill();
    text(ctx, `0${i + 1} · ${lab}`, xr - 136, 926, F(26, 700, UI), done > 0.5 ? C.white : C.muted, 'center');
  });
}

// 12 · Next episode, and the two asks.
function next(ctx, u) {
  ctx.drawImage(BG.blue, 0, 0);
  const s = 's12', wh = 'rgba(255,255,255,.84)';
  text(ctx, 'في الحلقة القادمة', R, 150, F(34, 700, UI), wh);
  reveal(ctx, u, '02 أدخل المخزون', R, 290, F(116, 900), C.white, START[11] - 0.5, { stagger: 0.18, colors: { 0: C.lime } });
  reveal(ctx, u, 'جرد حقيقي، ثم المنتجات والهواتف بأرقام IMEI', R, 385, F(42, 500, UI), wh, ws(s, [2.08, 2.56, 3.44, 3.92, 4.64, 5.36, 6.32]));
  const kP = springU(u, w(s, 3.92) - 0.3, SPRING.snappy), kI = springU(u, w(s, 4.64) - 0.3, SPRING.snappy);
  pop(ctx, kP, 420, 640, () => {
    ctx.save(); ctx.translate(420, 640); ctx.rotate(-0.05); ctx.translate(-420, -640);
    screen(ctx, IMG.products, 110, 500, 640, Math.round(640 * 420 / 1008), { shade: 0.35 }); ctx.restore();
  }, { from: 0.8, rise: 80 });
  pop(ctx, kI, 620, 760, () => {
    ctx.save(); ctx.translate(620, 760); ctx.rotate(0.04); ctx.translate(-620, -760);
    screen(ctx, IMG.imei, 340, 600, 560, Math.round(560 * 648 / 1008), { shade: 0.35 }); ctx.restore();
  }, { from: 0.8, rise: 80 });
  // ask 1: the trial on WhatsApp
  const ka = springU(u, w(s, 7.76) - 0.3, SPRING.bouncy);
  pop(ctx, ka, 1420, 600, () => {
    shadow(ctx, 1040, 520, 784, 160, 34, 0.35);
    rrect(ctx, 1040, 520, 784, 160, 34); ctx.fillStyle = C.wa; ctx.fill();
    icon(ctx, 'chat', R - 70, 600, 64, C.white, { lw: 2 });
    text(ctx, 'اطلب تجربتك المجانية', R - 130, 590, F(52, 900), C.white);
    text(ctx, 'واتساب · 0655970064', R - 130, 645, F(34, 700, UI), 'rgba(255,255,255,.88)');
  }, { from: 0.6 });
  // ask 2: subscribe
  const kb = springU(u, w(s, 11.2) - 0.3, SPRING.bouncy);
  pop(ctx, kb, 1500, 780, () => {
    shadow(ctx, 1240, 725, 584, 110, 55, 0.3);
    rrect(ctx, 1240, 725, 584, 110, 55); ctx.fillStyle = C.white; ctx.fill();
    ctx.save(); ctx.translate(R - 62, 780); ctx.rotate(0.35 * wobble(u - w(s, 11.84), 2.4, 4)); ctx.translate(-(R - 62), -780);
    icon(ctx, 'bell', R - 62, 780, 56, C.accent, { lw: 2.2 }); ctx.restore();
    text(ctx, 'اشترك في القناة', R - 118, 798, F(48, 900), C.ink);
  }, { from: 0.6 });
  text(ctx, 'حتى لا تفوتك بقية الحلقات', R - 40, 900, F(34, 600, UI), wh, 'right', clamp(prog(u, w(s, 12.64), w(s, 12.64) + 0.6)));
}

// 13 · End card (holds for YouTube's end screen; the left panel teases episode 2).
function endCard(ctx, u) {
  ctx.drawImage(BG.paper, 0, 0);
  const u0 = START[12];
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
    text(ctx, 'الحلقة 2 · أدخل المخزون', L0 + 820 - 50, 290, F(44, 900), C.ink);
    text(ctx, 'قريبًا على القناة', L0 + 820 - 50, 345, F(30, 600, UI), C.muted);
    screen(ctx, IMG.products, L0 + 50, 400, 720, Math.round(720 * 420 / 1008), { shade: 0.18 });
  }, { from: 0.9, rise: 40 });
}

const SCENES = [hook, series, tour, question, offline, online, rule, trial, data, separate, check, next, endCard];

// ================================================================ the cut
const PUSH = 0.85;                      // beats a whip takes; it lands ON the section's first beat
const whip = (p) => (p < 0.5 ? 16 * p ** 5 : 1 - (-2 * p + 2) ** 5 / 2);
function draw(ctx, u) {
  let k = 0;
  while (k + 1 < START.length && u >= START[k + 1]) k++;
  const nb = START[k + 1];
  if (TRANS[k + 1] === 'panel' && u >= nb - 1.3) {
    // the hook's dashboard card opens into the series' blue frame
    const p = E.inOutCubic(prog(u, nb - 1.3, nb));
    SCENES[k](ctx, u);
    // grows out of the tilted card: same centre, same tilt, then square to the frame
    const r0 = [L0, 340, 700, 372];
    const wd = r0[2] * (W / r0[2]) ** p, ht = r0[3] * (H / r0[3]) ** p;
    const cx = lerp(r0[0] + r0[2] / 2, W / 2, p), cy = lerp(r0[1] + r0[3] / 2, H / 2, p);
    ctx.save(); ctx.globalAlpha = clamp(p / 0.25);
    ctx.translate(cx, cy); ctx.rotate(-0.035 * (1 - p)); ctx.translate(-cx, -cy);
    rrect(ctx, cx - wd / 2, cy - ht / 2, wd, ht, 18 * (1 - p)); ctx.clip();
    ctx.translate(cx, cy); ctx.rotate(0.035 * (1 - p)); ctx.translate(-cx, -cy);
    SCENES[k + 1](ctx, u);
    ctx.restore();
    return;
  }
  if (nb !== undefined && u >= nb - PUSH) {
    // RTL whip: the page leaves to the right, the next one arrives from the left; both on screen
    const e = whip(prog(u, nb - PUSH, nb));
    ctx.save(); ctx.translate(e * W, 0); SCENES[k](ctx, u); ctx.restore();
    ctx.save(); ctx.translate((e - 1) * W, 0); SCENES[k + 1](ctx, u); ctx.restore();
    return;
  }
  SCENES[k](ctx, u);
}

// ================================================================ setup
function makeBg(kind) {
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

M.film({
  fonts: [F(100, 900), F(100, 700), F(40, 500, UI), F(40, 600, UI), F(40, 700, UI)],
  images: {
    dash: 'assets/shots/01_dashboard.png', products: 'assets/shots/02_products.png', addp: 'assets/shots/03_add_product.png',
    imei: 'assets/shots/04_phone_imei.png', pos: 'assets/shots/05_pos.png', customer: 'assets/shots/06_customer.png',
    debts: 'assets/shots/07_debts.png', reports: 'assets/shots/10_reports.png',
  },
  hits: HITS,
  // motion blur where things move fast (the whips), a light shutter elsewhere
  samples: (t) => (TRANS.some((_, k) => k && t >= TS(START[k] - 1.3) && t <= TS(START[k]) + 0.05) ? 12 : 4),
  async init(ctx, images) {
    IMG = images;
    // the Arabic subsets load only when Arabic text asks for them
    await Promise.all([F(100, 900), F(100, 800), F(100, 700), F(40, 500, UI), F(40, 600, UI), F(40, 700, UI)]
      .map((f) => document.fonts.load(f, 'جهّز محلّك الآن')));
    const tl = await fetch('vo_timeline.json').then((r) => r.json());
    tl.sections.forEach((x) => { SEC[x.id] = x; });
    START = [0, ...tl.sections.slice(1).map((x) => x.beat), tl.end_beat];
    TRANS = START.map((_, k) => (k === 1 ? 'panel' : 'push'));
    BG = { paper: makeBg('paper'), blue: makeBg('blue'), navy: makeBg('navy'), mint: makeBg('mint') };
    buildHits();
  },
  draw(ctx, u) { draw(ctx, u); },
});

// Every visual accent gets its sound (scripts/sfx.mjs). Quiet under the voice: ticks and pops,
// whooshes on the whips, the big hits only for the series title and the end card.
function buildHits() {
  const H_ = (b, label, sfx, o) => HITS.push([+b.toFixed(3), label, sfx, o || {}]);
  START.slice(2).forEach((b, i) => H_(b, `whip lands, scene ${i + 3}`, 'whoosh', { len: 0.6, gain: 0.5 }));
  H_(START[1], 'series frame opens', 'impact', { gain: 0.45 });
  H_(0, 'hook card lands', 'thud', { gain: 0.4 });
  H_(w('s01', 7.6), 'sync badge ring', 'blip', { pitch: 'A5', gain: 0.5 });
  [0, 1, 2].forEach((i) => H_(w('s01', 9.04) + i * 0.33, 'device chip', 'pop', { pitch: ['D5', 'F#5', 'A5'][i], gain: 0.45 }));
  H_(w('s02', 2.8) - 0.3, 'logo', 'bell', { pitch: 'D6', gain: 0.5 });
  STAGES.forEach((_, i) => H_(w('s02', 8.72) - 0.1 + i * 0.45, `stage chip ${i + 1}`, 'pop', { pitch: ['D5', 'E5', 'F#5', 'A5', 'B5', 'D6'][i], gain: 0.4 }));
  H_(w('s02', 13.84), 'episode 1 chip', 'bell', { pitch: 'A5', gain: 0.5 });
  TOUR.slice(1).forEach((c) => H_(w('s03', c.t) - 0.5, `tour: ${c.img}`, 'click', { gain: 0.5 }));
  H_(w('s04', 8.8) - 0.3, 'question 1', 'tick', { gain: 0.6 });
  H_(w('s04', 10.48) - 0.3, 'question 2', 'tick', { gain: 0.6 });
  H_(w('s05', 7.92), 'price 15,000', 'coins', { gain: 0.45 });
  H_(w('s05', 10.64), 'price 4,900', 'coins', { gain: 0.45 });
  [13.6, 15.92].forEach((t, i) => H_(w('s05', t) - 0.2, 'feature chips', 'blip', { pitch: ['D6', 'A6'][i], gain: 0.45 }));
  H_(w('s06', 9.92), 'price 4,900', 'coins', { gain: 0.45 });
  H_(w('s06', 14.4), 'price 9,900', 'coins', { gain: 0.5 });
  [17.36, 18.56, 19.28].forEach((t) => H_(w('s06', t) - 0.25, 'device lands', 'pop', { gain: 0.45 }));
  H_(w('s06', 20.72) - 0.1, 'sync badge', 'bell', { pitch: 'E6', gain: 0.4 });
  [4.44, 7.36, 10.64].forEach((t) => H_(w('s07', t) - 0.2, 'answer chip', 'pop', { pitch: 'A5', gain: 0.5 }));
  H_(w('s08', 4.4) - 0.2, 'three days', 'bell', { pitch: 'D6', gain: 0.45 });
  H_(w('s08', 8.4), 'url types', 'type', { len: 1.0, gain: 0.5 });
  H_(w('s08', 13.28) - 0.2, 'whatsapp number', 'pop', { gain: 0.45 });
  [7.1, 9.1, 11.1, 13.3].forEach((t) => H_(w('s09', t), 'data checked', 'tick', { gain: 0.6 }));
  H_(w('s10', 8.0) - 0.2, 'support bridge', 'pop', { pitch: 'F#5', gain: 0.45 });
  H_(w('s11', 6.0) - 0.2, 'check 1', 'bell', { pitch: 'A5', gain: 0.65 });
  H_(w('s11', 10.0) - 0.2, 'check 2', 'bell', { pitch: 'D6', gain: 0.65 });
  H_(w('s12', 7.76) - 0.3, 'cta trial', 'pop', { gain: 0.45 });
  H_(w('s12', 11.2) - 0.3, 'cta subscribe', 'bell', { pitch: 'D6', gain: 0.45 });
  H_(START[12] + 0.6, 'end card', 'thud', { gain: 0.4 });
  HITS.sort((a, b) => a[0] - b[0]);
}
