// Shared motion-graphics kit for the VanCash ERP TikTok films. Everything here is a pure function of
// its arguments: the films call it from draw(ctx, u, t) and never keep state between frames.
// RTL rule: Arabic is drawn one whole word at a time (never per glyph) so the shaping stays intact.
import * as M from './motion.js';

const { W, H, E, clamp, lerp, prog, spring, springU, SPRING, rrect, noise1, hexRgb } = M;

// Brand tokens, from the landing page (index.html :root, .brand-mark, .announcement).
export const C = {
  ink: '#060D20', navy: '#0B1A3A', navy2: '#102444', panel: '#13284F',
  blue: '#2457F5', blueL: '#6F95FF', mint: '#3FE0AB', lime: '#C5F85C', red: '#FF4D5E',
  white: '#FFFFFF', muted: '#93A6CC', paper: '#F4F7FD', line: '#E2E9F2',
  mark: ['#E4428B', '#8544D9', '#2777EE'], wa: '#25D366',
};
export const DISPLAY = 'Display', UI = 'UI';
export const font = (size, weight, family = DISPLAY) => `${Math.round(weight)} ${Math.round(size)}px ${family}`;

// ------------------------------------------------------------------ icons (the landing page's own set)
const ICON = {
  check: 'm5 12 4 4L19 6',
  phone: 'M8.5 2h7A2.5 2.5 0 0 1 18 4.5v15a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 6 19.5v-15A2.5 2.5 0 0 1 8.5 2ZM10 5h4m-3 14h2',
  box: 'm12 2 9 5v10l-9 5-9-5V7l9-5ZM3 7l9 5 9-5M12 12v10M7.5 4.5l9 5v4',
  receipt: 'm5 2 3 2 4-2 4 2 3-2v20l-3-2-4 2-4-2-3 2V2ZM9 8h6m-6 4h6m-6 4h3',
  chart: 'M3 3v18h18M7 16v-4m5 4V8m5 8V5',
  sync: 'M20 7a9 9 0 0 0-15-2L2 8m0-5v5h5M4 17a9 9 0 0 0 15 2l3-3m0 5v-5h-5',
  wifiOff: 'm2 2 20 20M8 16a7 7 0 0 1 4-1m-7-3a12 12 0 0 1 3-2m6 0a12 12 0 0 1 5 2M2 7a18 18 0 0 1 2-1m5-2a18 18 0 0 1 13 3m-10 12h.01',
  users: 'M12 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM3 21v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 4v2',
  shield: 'm12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6l9-4Zm-4 10 3 3 5-6',
  wallet: 'M20 7V4H6a3 3 0 0 0 0 6h15v10H6a3 3 0 0 1-3-3V7m18 7h-5v3h5',
  cloud: 'M6 19a5 5 0 0 1-1-10 7 7 0 0 1 13-2 6 6 0 0 1 0 12H6Zm3-6 3 3 4-5',
  qr: 'M3 3h6v6H3zm12 0h6v6h-6zM3 15h6v6H3zm12 0h3v3h3v3h-6v-6Zm6-3v3m-9-3h3M3 12h3m6-9v3m0 12v3',
  scan: 'M3 8V3h5m8 0h5v5M3 16v5h5m8 0h5v-5M7 8v8m3-8v8m4-8v8m3-8v8M2 12h20',
  chat: 'M21 11.5a9 9 0 0 1-13.6 7.8L3 21l1.7-4.4A9 9 0 1 1 21 11.5Z',
  call: 'M8 8c0 4 4 8 8 8l1-3-3-1-1 1-2-2 1-1-1-3-3 1Z',
  shop: 'm3 9 2-6h14l2 6M3 9c0 4 5 4 6 0 1 4 5 4 6 0 1 4 6 4 6 0M5 13v8h14v-8M9 21v-6h6v6',
  arrow: 'M19 12H5m6 6-6-6 6-6',
  plus: 'M12 5v14M5 12h14',
  monitor: 'M4 3h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm4 18h8m-4-4v4',
};
const PATHS = {};
const path2d = (k) => (PATHS[k] ||= new Path2D(ICON[k]));
// Stroke icon from the 24-unit set, centred on x,y, `size` px wide. p (0..1) draws the stroke on.
export function icon(ctx, name, x, y, size, color, { width = 2.2, p = 1, fill = null } = {}) {
  if (p <= 0) return;
  ctx.save();
  ctx.translate(x - size / 2, y - size / 2);
  ctx.scale(size / 24, size / 24);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = width;
  if (fill) { ctx.fillStyle = fill; ctx.fill(path2d(name)); }
  if (p < 1) { ctx.setLineDash([80 * p, 200]); }
  ctx.strokeStyle = color; ctx.stroke(path2d(name));
  ctx.restore();
}

// ------------------------------------------------------------------ background
// mood 0 = the problem (warm red light), 1 = the product (brand blue + violet). camX parallax.
export function background(ctx, u, mood = 1, camX = 0) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, C.ink); g.addColorStop(1, C.navy);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const blob = (x, y, r, col, a) => {
    const [R, G, B] = hexRgb(col);
    const rg = ctx.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, `rgba(${R},${G},${B},${a})`); rg.addColorStop(1, `rgba(${R},${G},${B},0)`);
    ctx.fillStyle = rg; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  };
  const m = clamp(mood);
  const x1 = 220 + 160 * noise1(u * 0.06, 3) - camX * 0.15, y1 = 520 + 200 * noise1(u * 0.05, 7);
  const x2 = 860 + 140 * noise1(u * 0.05, 11) - camX * 0.1, y2 = 1380 + 220 * noise1(u * 0.04, 5);
  blob(x1, y1, 760, M.mix(C.red, C.blue, m), 0.42);
  blob(x2, y2, 820, M.mix('#FF8A3D', C.mark[1], m), 0.34);
  // dot grid: a quiet sense of space that moves with the camera
  ctx.fillStyle = 'rgba(160,190,255,0.07)';
  const s = 54, ox = ((-camX * 0.35) % s + s) % s;
  for (let y = 27; y < H; y += s) for (let x = ox; x < W; x += s) ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
}

// ------------------------------------------------------------------ RTL word layout
export const isLatin = (w) => /[A-Za-z0-9]/.test(w) && !/[؀-ۿ]/.test(w);
export const clean = (w) => w.replace(/[،,.:…]+$/u, '').replace(/^ـ/u, '');
// Lay a list of words out right-to-left, keeping consecutive Latin words in one left-to-right run.
// Returns [{w, x, width, latin}] with x the word's left edge, for a line centred on cx.
export function layoutWords(ctx, words, f, cx, space = 0.28) {
  ctx.font = f;
  const size = parseFloat(/(\d+)px/.exec(f)[1]);
  const gap = size * space;
  const items = words.map((w) => ({ w, latin: isLatin(w), width: ctx.measureText(w).width }));
  const runs = [];
  for (const it of items) {
    const last = runs[runs.length - 1];
    if (last && last.latin === it.latin && it.latin) last.items.push(it);
    else runs.push({ latin: it.latin, items: [it] });
  }
  const total = items.reduce((s, it) => s + it.width, 0) + gap * (items.length - 1);
  let xr = cx + total / 2;
  for (const r of runs) {
    if (r.latin) {
      const rw = r.items.reduce((s, it) => s + it.width, 0) + gap * (r.items.length - 1);
      let xl = xr - rw;
      for (const it of r.items) { it.x = xl; xl += it.width + gap; }
      xr -= rw + gap;
    } else {
      for (const it of r.items) { it.x = xr - it.width; xr -= it.width + gap; }
    }
  }
  return { items, total, size };
}
export function drawWord(ctx, it, y, f, color, { sx = 1, sy = 1, rot = 0, stroke = null, sw = 0, alpha = 1 } = {}) {
  if (alpha <= 0 || sx < 1e-3 || sy < 1e-3) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(it.x + it.width / 2, y);
  ctx.rotate(rot); ctx.scale(sx, sy);
  ctx.font = f; ctx.textAlign = 'center'; ctx.direction = it.latin ? 'ltr' : 'rtl';
  if (stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = sw; ctx.strokeStyle = stroke; ctx.strokeText(it.w, 0, 0); }
  ctx.fillStyle = color; ctx.fillText(it.w, 0, 0);
  ctx.restore();
}
// Single string, any script, centred (or aligned) at x.
export function say(ctx, str, x, y, f, color, { align = 'center', alpha = 1, stroke = null, sw = 0, track = 0 } = {}) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.font = f; ctx.textAlign = align; ctx.direction = isLatin(str) ? 'ltr' : 'rtl';
  ctx.letterSpacing = `${track}px`;
  if (stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = sw; ctx.strokeStyle = stroke; ctx.strokeText(str, x, y); }
  ctx.fillStyle = color; ctx.fillText(str, x, y);
  ctx.restore();
}
export function measure(ctx, str, f) { ctx.font = f; return ctx.measureText(str).width; }

// ------------------------------------------------------------------ kinetic headline
// lines: [[{w, u}], ...] words with the beat they land on. Each word springs up with a little
// overshoot; colors per word via opts.color(word, i). Returns nothing; pure.
export function headline(ctx, u, lines, cy, size, { weight = 1000, lineH = 1.12, color = () => C.white, exitU = 1e9, exitDir = -1, stroke = null } = {}) {
  const f = font(size, weight);
  const n = lines.length;
  lines.forEach((ln, li) => {
    const L = layoutWords(ctx, ln.map((x) => x.w), f, W / 2 - 40);
    const y = cy + (li - (n - 1) / 2) * size * lineH + size * 0.35;
    L.items.forEach((it, i) => {
      const k = springU(u, ln[i].u, SPRING.bouncy);
      if (k <= 0.001) return;
      const ex = E.inBack(prog(u, exitU + i * 0.04, exitU + 0.45 + i * 0.04), 1.6);
      drawWord(ctx, it, y + (1 - k) * size * 0.6 + ex * exitDir * 900, f, color(ln[i].w, i, li),
        { sx: lerp(0.6, 1, Math.min(1, k)), sy: k, stroke, sw: stroke ? size * 0.12 : 0, alpha: 1 - ex });
    });
  });
}

// ------------------------------------------------------------------ captions (TikTok style)
// words: [{w, t0, t1, p}] on the film clock (vo_words.json). Chunks of <= maxWords that fit maxW,
// broken after punctuation. The spoken word sits on a blue pill; Latin words are lime.
export function buildCaptions(ctx, words, { size = 72, maxW = 820, maxWords = 4, hide = [] } = {}) {
  const f = font(size, 900);
  ctx.font = f;
  const chunks = [];
  let cur = null;
  words.forEach((wd, i) => {
    if (hide.includes(wd.p)) return;
    const w = clean(wd.w);
    const brk = cur && (cur.p !== wd.p || cur.words.length >= maxWords ||
      measure(ctx, [...cur.words.map((x) => x.w), w].join(' '), f) > maxW || /[،,.؟?!…:]$/u.test(cur.words[cur.words.length - 1].raw));
    if (!cur || brk) { cur = { p: wd.p, words: [] }; chunks.push(cur); }
    cur.words.push({ w, raw: wd.w, t0: wd.t0, t1: wd.t1 });
  });
  chunks.forEach((c) => { c.t0 = c.words[0].t0 - 0.06; });
  chunks.forEach((c, i) => {
    const next = chunks[i + 1];
    const end = c.words[c.words.length - 1].t1 + 0.45;
    c.t1 = next && next.p === c.p ? next.t0 : (next ? Math.min(end, next.t0) : end);
  });
  return { chunks, f, size };
}
export function captions(ctx, t, CAP, { y = 1405, cx = 500 } = {}) {
  const c = CAP.chunks.find((k) => t >= k.t0 && t < k.t1);
  if (!c) return;
  const L = layoutWords(ctx, c.words.map((w) => w.w), CAP.f, cx);
  const s = CAP.size;
  // pill under the spoken word, sliding word to word
  let ai = -1;
  c.words.forEach((w, i) => { if (t >= w.t0 - 0.03) ai = i; });
  const out = E.inCubic(prog(t, c.t1 - 0.12, c.t1));
  if (ai >= 0) {
    const it = L.items[ai];
    const k = spring(t - c.words[ai].t0 + 0.03, SPRING.snappy);
    const prev = ai > 0 ? L.items[ai - 1] : it;
    const px = lerp(prev.x, it.x, ai > 0 ? Math.min(1, k) : 1), pw = lerp(prev.width, it.width, ai > 0 ? Math.min(1, k) : 1);
    const padX = s * 0.22, padY = s * 0.2;
    ctx.save();
    ctx.globalAlpha = 1 - out;
    rrect(ctx, px - padX, y - s * 0.95 - padY * 0.2, pw + 2 * padX, s * 1.3 + padY, s * 0.28);
    ctx.fillStyle = C.blue; ctx.fill();
    ctx.restore();
  }
  c.words.forEach((w, i) => {
    const k = spring(t - w.t0 + 0.05, SPRING.bouncy);
    if (k <= 0.001) return;
    const it = L.items[i];
    const color = i === ai ? C.white : it.latin ? C.lime : C.white;
    drawWord(ctx, it, y + (1 - Math.min(1, k)) * 22, CAP.f, color,
      { sx: 0.7 + 0.3 * k, sy: 0.7 + 0.3 * k, stroke: C.ink, sw: s * 0.16, alpha: (1 - out) * Math.min(1, k * 2) });
  });
}

// ------------------------------------------------------------------ cards, chips, rings
export function shadow(ctx, blur = 50, y = 22, a = 0.5) {
  ctx.shadowColor = `rgba(2,6,20,${a})`; ctx.shadowBlur = blur; ctx.shadowOffsetY = y;
}
export function noShadow(ctx) { ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; }
// A crop of a REAL screenshot on a white card. src = [sx, sy, sw, sh]; drawn centred at cx,cy at `scale`.
// Returns the screen rect + a mapper from source pixels to screen, for rings and labels.
export function uiCard(ctx, img, src, cx, cy, scale, { radius = 22, pad = 0, rot = 0, alpha = 1, sx = 1, sy = 1, shadowA = 0.55 } = {}) {
  const [x0, y0, w0, h0] = src;
  const w = w0 * scale, h = h0 * scale;
  const map = (px, py) => {
    const lx = (px - x0) * scale - w / 2, ly = (py - y0) * scale - h / 2;
    const c = Math.cos(rot), s = Math.sin(rot);
    return [cx + (lx * c - ly * s) * sx, cy + (lx * s + ly * c) * sy];
  };
  if (alpha <= 0 || sx < 0.002 || sy < 0.002 || !img) return { x: cx - w / 2, y: cy - h / 2, w, h, map, scale };
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(sx, sy);
  shadow(ctx, 60, 26, shadowA);
  rrect(ctx, -w / 2 - pad, -h / 2 - pad, w + 2 * pad, h + 2 * pad, radius);
  ctx.fillStyle = '#fff'; ctx.fill();
  noShadow(ctx);
  ctx.save();
  rrect(ctx, -w / 2 - pad, -h / 2 - pad, w + 2 * pad, h + 2 * pad, radius); ctx.clip();
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, x0, y0, w0, h0, -w / 2, -h / 2, w, h);
  ctx.restore();
  ctx.restore();
  return { x: cx - w / 2, y: cy - h / 2, w, h, map, scale };
}
// Rounded highlight ring that draws itself on (p 0..1), source rect mapped through a uiCard's map.
export function ring(ctx, x, y, w, h, p, { color = C.lime, width = 7, radius = 16, grow = 10 } = {}) {
  if (p <= 0) return;
  ctx.save();
  const g = grow * (1 - Math.min(1, p));
  rrect(ctx, x - g - 6, y - g - 6, w + 2 * g + 12, h + 2 * g + 12, radius + 6);
  const per = 2 * (w + h) + 120;
  ctx.setLineDash([per * clamp(p), per]);
  ctx.lineWidth = width; ctx.strokeStyle = color; ctx.lineCap = 'round';
  ctx.stroke();
  ctx.restore();
}
// Pill label. k = entry spring (0..1+). Latin or Arabic text.
export function chip(ctx, str, x, y, k, { size = 46, bg = C.lime, fg = C.ink, weight = 900, ic = null, align = 'center', padX = 0.55, alpha = 1 } = {}) {
  if (k <= 0.001 || alpha <= 0) return { w: 0, h: 0 };
  const f = font(size, weight);
  const tw = measure(ctx, str, f), iw = ic ? size * 1.05 : 0;
  const w = tw + iw + size * padX * 2, h = size * 1.55;
  const x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  ctx.save();
  ctx.globalAlpha *= alpha * Math.min(1, k * 1.6);
  ctx.translate(x0 + w / 2, y);
  ctx.scale(k, k);
  shadow(ctx, 26, 10, 0.35);
  rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = bg; ctx.fill();
  noShadow(ctx);
  // icon leads the text: on the left for Latin, on the right for Arabic
  const lat = isLatin(str), edge = w / 2 - size * padX;
  const ix = lat ? -edge + iw / 2 : edge - iw / 2;
  const tx = !ic ? 0 : lat ? -edge + iw + tw / 2 : edge - iw - tw / 2;
  say(ctx, str, tx, size * 0.36, f, fg);
  if (ic) icon(ctx, ic, ix, 0, size * 0.9, fg, { width: 2.4 });
  ctx.restore();
  return { w, h, x: x0 };
}

// ------------------------------------------------------------------ brand
// The VanCash mark (gradient tile, white V tick, mint dot) + wordmark. p: 0..1 assembly.
export function mark(ctx, cx, cy, size, { rot = 0, p = 1 } = {}) {
  ctx.save();
  ctx.translate(cx, cy); ctx.rotate(rot);
  const s = size;
  const g = ctx.createLinearGradient(-s / 2, -s / 2, s / 2, s / 2);
  g.addColorStop(0, C.mark[0]); g.addColorStop(0.45, C.mark[1]); g.addColorStop(1, C.mark[2]);
  shadow(ctx, s * 0.4, s * 0.12, 0.45);
  rrect(ctx, -s / 2, -s / 2, s, s, s * 0.3); ctx.fillStyle = g; ctx.fill();
  noShadow(ctx);
  ctx.scale(s / 32, s / 32); ctx.translate(-16, -16);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 3.6; ctx.strokeStyle = '#fff';
  ctx.setLineDash([40 * clamp(p), 60]);
  ctx.stroke(new Path2D('m6 9 9 16L27 5'));
  ctx.setLineDash([]);
  if (p > 0.6) { ctx.beginPath(); ctx.arc(26, 6, 3 * E.outBack(prog(p, 0.6, 1)), 0, M.TAU); ctx.fillStyle = '#61E3B7'; ctx.fill(); }
  ctx.restore();
}
export function logo(ctx, cx, cy, scale, u0, u) {
  const k1 = springU(u, u0, SPRING.bouncy), k2 = springU(u, u0 + 0.5, SPRING.snappy), k3 = springU(u, u0 + 1, SPRING.snappy);
  if (k1 <= 0) return;
  const ms = 150 * scale;
  const fw = font(150 * scale, 900), fs = font(34 * scale, 700);
  const tw = measure(ctx, 'VanCash', fw);
  const total = ms + 30 * scale + tw;
  const x0 = cx - total / 2;
  mark(ctx, x0 + ms / 2, cy, ms * Math.min(1.1, k1), { rot: (1 - Math.min(1, k1)) * -1.2, p: prog(u, u0 + 0.2, u0 + 1.2) });
  ctx.save();
  ctx.beginPath(); ctx.rect(x0 + ms + 10 * scale, cy - 140 * scale, tw + 60 * scale, 280 * scale); ctx.clip();
  say(ctx, 'VanCash', x0 + ms + 30 * scale + (1 - k2) * -tw * 0.6, cy + 30 * scale, fw, C.white, { align: 'left', alpha: Math.min(1, k2 * 2), track: -4 * scale });
  say(ctx, 'ERP SYSTEM', x0 + ms + 36 * scale, cy + 82 * scale + (1 - k3) * 40, fs, C.muted, { align: 'left', alpha: Math.min(1, k3 * 2), track: 13 * scale });
  ctx.restore();
}

// ------------------------------------------------------------------ objects drawn in code
// A generic handset (not the product UI): body, glass, notch. screen(ctx, x, y, w, h) paints inside.
export function handset(ctx, cx, cy, w, h, { rot = 0, sx = 1, sy = 1, screen = null } = {}) {
  ctx.save();
  ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(sx, sy);
  shadow(ctx, 70, 34, 0.6);
  rrect(ctx, -w / 2, -h / 2, w, h, w * 0.16); ctx.fillStyle = '#1B2236'; ctx.fill();
  noShadow(ctx);
  const g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
  g.addColorStop(0, '#59647F'); g.addColorStop(0.5, '#262E44'); g.addColorStop(1, '#59647F');
  ctx.lineWidth = w * 0.018; ctx.strokeStyle = g; ctx.stroke();
  const bz = w * 0.045, sw = w - 2 * bz, sh = h - 2 * bz;
  ctx.save();
  rrect(ctx, -sw / 2, -sh / 2, sw, sh, w * 0.12); ctx.clip();
  ctx.fillStyle = '#0A1022'; ctx.fillRect(-sw / 2, -sh / 2, sw, sh);
  if (screen) screen(ctx, -sw / 2, -sh / 2, sw, sh);
  ctx.restore();
  rrect(ctx, -w * 0.14, -sh / 2 + w * 0.035, w * 0.28, w * 0.075, w * 0.04); ctx.fillStyle = '#05070D'; ctx.fill();
  ctx.restore();
}
// Cardboard phone box with a label.
export function phoneBox(ctx, cx, cy, w, h, label, color, { rot = 0, s = 1, lift = 0 } = {}) {
  if (s <= 0.001) return;
  ctx.save();
  ctx.translate(cx, cy - lift); ctx.rotate(rot); ctx.scale(s, s);
  shadow(ctx, 30, 14 + lift * 0.3, 0.5);
  rrect(ctx, -w / 2, -h / 2, w, h, 18); ctx.fillStyle = '#1D2C52'; ctx.fill();
  noShadow(ctx);
  rrect(ctx, -w / 2, -h / 2, w, h * 0.2, 18); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fill();
  icon(ctx, 'phone', 0, -h * 0.08, h * 0.42, 'rgba(255,255,255,0.85)', { width: 1.6 });
  const f = font(h * 0.15, 900);
  const tw = measure(ctx, label, f) + h * 0.16;
  rrect(ctx, -tw / 2, h * 0.22, tw, h * 0.2, h * 0.1); ctx.fillStyle = color; ctx.fill();
  say(ctx, label, 0, h * 0.37, f, C.ink);
  ctx.restore();
}
// Vector barcode with an optional laser sweep (p 0..1).
export function barcode(ctx, cx, cy, w, h, seed, laser = -1) {
  ctx.save();
  rrect(ctx, cx - w / 2 - 24, cy - h / 2 - 24, w + 48, h + 48, 18); ctx.fillStyle = '#fff'; ctx.fill();
  let x = cx - w / 2, i = 0;
  ctx.fillStyle = '#0B1220';
  while (x < cx + w / 2 - 4) {
    const bw = 3 + Math.floor(M.hash01(i, seed) * 4) * 3;
    if (i % 2 === 0) ctx.fillRect(x, cy - h / 2, Math.min(bw, cx + w / 2 - x), h);
    x += bw; i++;
  }
  if (laser >= 0 && laser <= 1) {
    const ly = cy - h / 2 + h * laser;
    ctx.fillStyle = 'rgba(255,77,94,0.9)'; ctx.fillRect(cx - w / 2 - 30, ly - 3, w + 60, 6);
    ctx.fillStyle = 'rgba(255,77,94,0.18)'; ctx.fillRect(cx - w / 2 - 30, ly - 22, w + 60, 44);
  }
  ctx.restore();
}
// Paper receipt that prints out of a slot (p 0..1). Lines only: a pictogram, not the app's invoice.
export function receipt(ctx, cx, top, w, maxH, p, { title = 'FACTURE' } = {}) {
  const h = maxH * clamp(p);
  if (h < 2) return;
  ctx.save();
  ctx.beginPath(); ctx.rect(cx - w / 2 - 40, top, w + 80, maxH + 60); ctx.clip();
  const y0 = top + h - maxH;
  shadow(ctx, 40, 18, 0.45);
  ctx.beginPath();
  ctx.moveTo(cx - w / 2, y0); ctx.lineTo(cx + w / 2, y0); ctx.lineTo(cx + w / 2, y0 + maxH);
  const n = 12;
  for (let i = 0; i <= n; i++) ctx.lineTo(cx + w / 2 - (w * i) / n, y0 + maxH + (i % 2 ? 18 : 0));
  ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill();
  noShadow(ctx);
  say(ctx, title, cx, y0 + 86, font(54, 900), C.ink, { track: 6 });
  ctx.fillStyle = '#D9E1F0';
  for (let i = 0; i < 5; i++) {
    rrect(ctx, cx - w / 2 + 50, y0 + 140 + i * 52, w * (0.5 + 0.3 * M.hash01(i, 4)), 18, 9); ctx.fill();
    rrect(ctx, cx + w / 2 - 50 - 90, y0 + 140 + i * 52, 90, 18, 9); ctx.fill();
  }
  ctx.fillStyle = C.blue;
  rrect(ctx, cx - w / 2 + 50, y0 + 140 + 5 * 52 + 20, w - 100, 8, 4); ctx.fill();
  ctx.restore();
}
// A big check badge (circle + tick drawn on).
export function checkBadge(ctx, cx, cy, r, k, color = C.lime) {
  if (k <= 0.001) return;
  ctx.save();
  ctx.translate(cx, cy); ctx.scale(k, k);
  ctx.beginPath(); ctx.arc(0, 0, r, 0, M.TAU); ctx.fillStyle = color; ctx.fill();
  ctx.restore();
  icon(ctx, 'check', cx, cy + r * 0.04, r * 1.25, C.ink, { width: 3.2, p: clamp((k - 0.4) / 0.6) });
}
// Whip/push helper: offset (px) of a scene that enters at a and leaves at b, T beats of overlap.
export function whipX(u, a, b, T = 0.35, dist = W * 1.05) {
  const pin = E.inOutCubic(prog(u, a - T, a + T)), pout = E.inOutCubic(prog(u, b - T, b + T));
  return (1 - pin) * dist - pout * dist;
}

// The Arabic subsets load lazily (unicode-range): load them before the first frame is painted.
export async function preloadFonts() {
  const specs = [font(100, 1000), font(100, 900), font(100, 800), font(100, 700), font(100, 600),
    font(40, 400, UI), font(40, 500, UI), font(40, 600, UI), font(40, 700, UI)];
  await Promise.all(specs.map((f) => document.fonts.load(f, 'عربي Aé0')));
}

// ------------------------------------------------------------------ shared scenes
// Zoom lens over a REAL screenshot. keys: [[u, [fx, fy, zoom]], ...] (source px, zoom in log space).
// items: [{a, b, r: [x, y, w, h], lab}] get a ring + label chip while a <= u < b.
export function lens(ctx, u, img, keys, items, { box = { x: 50, y: 400, w: 900, h: 820 }, flipA = null } = {}) {
  const k = keys.map(([ku, [x, y, z]]) => [ku, [x, y, Math.log(z)]]);
  const [fx, fy, lz] = M.springKeys(u, k, SPRING.gentle);
  const z = Math.exp(lz), cx = box.x + box.w / 2, cy = box.y + box.h / 2;
  const toScr = (px, py) => [cx + (px - fx) * z, cy + (py - fy) * z];
  const flip = flipA === null ? 1 : E.outBack(prog(u, flipA - 0.1, flipA + 0.4), 1.2);
  if (flip <= 0.002) return toScr;
  ctx.save();
  ctx.translate(cx, cy); ctx.scale(flip, 1); ctx.translate(-cx, -cy);
  shadow(ctx, 70, 30, 0.55);
  rrect(ctx, box.x, box.y, box.w, box.h, 36); ctx.fillStyle = '#F6F8FC'; ctx.fill();
  noShadow(ctx);
  ctx.save();
  rrect(ctx, box.x, box.y, box.w, box.h, 36); ctx.clip();
  const [x0, y0] = toScr(0, 0);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, x0, y0, img.width * z, img.height * z);
  for (const it of items) {
    if (u < it.a || u > it.b + 0.3) continue;
    const [sx, sy] = toScr(it.r[0], it.r[1]);
    ctx.save(); ctx.globalAlpha = 1 - prog(u, it.b, it.b + 0.3);
    ring(ctx, sx, sy, it.r[2] * z, it.r[3] * z, prog(u, it.a, it.a + 0.6));
    ctx.restore();
  }
  ctx.restore();
  ctx.restore();
  for (const it of items) {
    if (!it.lab || u < it.a || u > it.b + 0.3) continue;
    const [sx, sy] = toScr(it.r[0] + it.r[2] / 2, it.r[1]);
    const kk = springU(u, it.a, SPRING.bouncy) * (1 - prog(u, it.b, it.b + 0.3));
    chip(ctx, it.lab, clamp(sx, 260, 740), Math.max(box.y + 70, sy - 80), kk, { size: 52 });
  }
  return toScr;
}
// Card pulled out of a real screenshot: flies from where it sits in `from` (a uiCard result) to x,y.
export function pull(ctx, u, a, img, src, from, x, y, scale, opts = {}) {
  const k = springU(u, a, SPRING.snappy);
  if (k <= 0.001) return null;
  const kk = Math.min(1, k);
  const [fx, fy] = from ? from.map(src[0] + src[2] / 2, src[1] + src[3] / 2) : [x, y + 120];
  const s0 = from ? from.scale : scale * 0.6;
  return uiCard(ctx, img, src, lerp(fx, x, k), lerp(fy, y, k), lerp(opts.s0 ?? s0, scale, kk), { radius: 22, rot: (1 - kk) * 0.08, ...opts });
}
// A stamp: circle + word, slammed at u0.
export function stamp(ctx, u, u0, str, x, y, { r = 150, color = C.red, rot = -0.18, size = 100 } = {}) {
  const k = springU(u, u0, SPRING.bouncy);
  if (k <= 0.001) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k, k);
  if (r > 0) { ctx.beginPath(); ctx.arc(0, 0, r, 0, M.TAU); }
  else { const tw = measure(ctx, str, font(size, 1000)); rrect(ctx, -tw / 2 - size * 0.45, -size * 0.75, tw + size * 0.9, size * 1.5, size * 0.3); }
  ctx.lineWidth = 14; ctx.strokeStyle = color; ctx.stroke();
  say(ctx, str, 0, size * 0.36, font(size, 1000), color);
  ctx.restore();
}
// Stopwatch that sweeps once from u0.
export function stopwatch(ctx, u, u0, cx, cy, r = 70) {
  const ks = springU(u, u0 - 0.1, SPRING.bouncy);
  if (ks <= 0.001) return;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(ks, ks);
  ctx.beginPath(); ctx.arc(0, 0, r + 22, 0, M.TAU); ctx.fillStyle = C.lime; ctx.fill();
  ctx.strokeStyle = C.ink; ctx.lineWidth = 9; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, 0, r - 12, 0, M.TAU); ctx.stroke();
  const ang = -Math.PI / 2 + M.TAU * E.outCubic(prog(u, u0, u0 + 1.5));
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(ang) * (r - 26), Math.sin(ang) * (r - 26)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-14, -r - 8); ctx.lineTo(14, -r - 8); ctx.stroke();
  ctx.restore();
}
// Recap list: a title and rows of checked items (Latin labels), one per 0.75 beat from a.
export function recap(ctx, u, a, titleWords, rows, step = 0.75) {
  const kp = springU(u, a, SPRING.snappy);
  ctx.save(); ctx.globalAlpha = Math.min(1, kp * 2);
  rrect(ctx, 90, 520 + (1 - Math.min(1, kp)) * 120, 820, 140 * rows.length + 80, 44); ctx.fillStyle = 'rgba(19,40,79,0.82)'; ctx.fill();
  ctx.restore();
  headline(ctx, u, [titleWords.map((w, i) => ({ w, u: a + 0.1 + i * 0.2 }))], 400, 92);
  rows.forEach((r, i) => {
    const ar = a + 0.8 + i * step;
    const k = springU(u, ar, SPRING.snappy);
    if (k <= 0.001) return;
    const y = 650 + i * 140;
    const f = font(70, 900), tw = measure(ctx, r, f), x1 = 500 + (tw + 110) / 2;
    checkBadge(ctx, x1 - 40, y, 40, springU(u, ar + 0.1, SPRING.bouncy));
    say(ctx, r, x1 - 110 + (1 - Math.min(1, k)) * 60, y + 24, f, C.white, { align: 'right', alpha: Math.min(1, k * 2) });
  });
}
// The end card: logo, «جرّب مجانًا», a big 3 days, WhatsApp pill with a pulse, Offline/Online chips.
// at: {start, tryU, freeU, threeU, daysU, waU, chipsU}
export function cta(ctx, u, at) {
  logo(ctx, 500, 330, 0.55, at.start - 0.15, u);
  headline(ctx, u, [[{ w: 'جرّب', u: at.tryU }, { w: 'مجانًا', u: at.freeU }]], 540, 140, { color: (w) => (w === 'مجانًا' ? C.lime : C.white) });
  const k3 = springU(u, at.threeU - 0.1, SPRING.bouncy);
  if (k3 > 0.001) {
    ctx.save(); ctx.translate(650, 880); ctx.scale(k3, k3); ctx.rotate(0.06 * M.wobble(u - at.threeU, 1.5, 3));
    say(ctx, '3', 0, 190, font(560, 1000), C.lime);
    ctx.restore();
    say(ctx, 'أيام', 330, 930, font(150, 1000), C.white, { alpha: Math.min(1, springU(u, at.daysU - 0.1, SPRING.snappy) * 2) });
  }
  const kw = springU(u, at.waU - 0.15, SPRING.bouncy);
  if (kw > 0.001) {
    ctx.save(); ctx.translate(500, 1190); ctx.scale(kw, kw);
    shadow(ctx, 40, 16, 0.5);
    rrect(ctx, -380, -70, 760, 140, 70); ctx.fillStyle = C.wa; ctx.fill();
    noShadow(ctx);
    icon(ctx, 'chat', 290, 0, 84, C.white, { width: 2.2 });
    icon(ctx, 'call', 290, 0, 84, C.white, { width: 2.2 });
    say(ctx, '0655 97 00 64', -50, 26, font(72, 900), C.white, { track: 2 });
    ctx.restore();
    if (u > at.waU + 1) {
      const ph = ((u - at.waU - 1) % 2) / 2;
      ctx.save(); ctx.globalAlpha = (1 - ph) * 0.8; ctx.strokeStyle = C.wa; ctx.lineWidth = 6;
      const g = 30 * E.outCubic(ph);
      rrect(ctx, 500 - 380 - g, 1190 - 70 - g, 760 + 2 * g, 140 + 2 * g, 70 + g); ctx.stroke(); ctx.restore();
    }
  }
  say(ctx, 'mobileposdz.com', 500, 1320, font(40, 700, UI), C.muted, { alpha: Math.min(1, springU(u, at.waU + 1, SPRING.snappy) * 2) });
  chip(ctx, 'Offline', 300, 1430, springU(u, at.chipsU, SPRING.bouncy), { size: 44, bg: C.panel, fg: C.white, ic: 'wifiOff' });
  chip(ctx, 'Online', 700, 1430, springU(u, at.chipsU + 1, SPRING.bouncy), { size: 44, bg: C.panel, fg: C.white, ic: 'cloud' });
}
// A flat person bust (head + shoulders) for the problem scenes.
export function person(ctx, cx, cy, s, color, k = 1) {
  if (k <= 0.001) return;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(k * s, k * s);
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(0, -60, 52, 0, M.TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-95, 110); ctx.bezierCurveTo(-95, 10, -50, 0, 0, 0); ctx.bezierCurveTo(50, 0, 95, 10, 95, 110); ctx.closePath(); ctx.fill();
  ctx.restore();
}
// Speech bubble with a tail toward (tx, ty) in local px. k = entry spring.
export function bubble(ctx, cx, cy, w, h, k, { fill = C.white, tail = [0.3, 1], rot = -0.03 } = {}) {
  if (k <= 0.001) return;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(Math.min(1.08, k), Math.min(1.08, k)); ctx.rotate(rot);
  shadow(ctx, 40, 18, 0.45);
  rrect(ctx, -w / 2, -h / 2, w, h, Math.min(70, h / 2)); ctx.fillStyle = fill; ctx.fill();
  const tx = (tail[0] - 0.5) * w;
  ctx.beginPath();
  if (tail[1] > 0) { ctx.moveTo(tx - 40, h / 2 - 10); ctx.lineTo(tx + 10, h / 2 + 80); ctx.lineTo(tx + 40, h / 2 - 10); }
  else { ctx.moveTo(tx - 40, -h / 2 + 10); ctx.lineTo(tx + 10, -h / 2 - 80); ctx.lineTo(tx + 40, -h / 2 + 10); }
  ctx.fill();
  noShadow(ctx);
  ctx.restore();
}
// Amount in dinars, RTL: number on the right, «دج» on its left.
export function dinars(ctx, value, cx, y, size, color, alpha = 1) {
  const f = font(size, 1000);
  const L = layoutWords(ctx, [Math.round(value).toLocaleString('en-US'), 'دج'], f, cx);
  L.items.forEach((it) => drawWord(ctx, it, y, f, color, { alpha }));
}
// One expanding ring on a big hit (the drop): a shockwave, not a particle burst.
export function shockwave(ctx, u, u0, x, y, color = C.lime) {
  const p = prog(u, u0, u0 + 1.4);
  if (p <= 0 || p >= 1) return;
  ctx.save();
  ctx.globalAlpha = (1 - p) * 0.9;
  ctx.lineWidth = 40 * (1 - p) + 4; ctx.strokeStyle = color;
  ctx.beginPath(); ctx.arc(x, y, 60 + 900 * E.outCubic(p), 0, M.TAU); ctx.stroke();
  ctx.restore();
}
