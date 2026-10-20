// VanCash ERP · TikTok shorts kit (1080x1920). Built on shared/kit.js: the same type, colours, icons,
// real screens and voice-driven cut as the YouTube series, plus what a vertical short needs:
//   - a frame that stays clear of TikTok's UI (top tabs, the right-hand buttons, the bottom caption),
//   - burned-in captions that follow the voice word by word (most people watch muted at first),
//   - the call-to-action scene every short ends on.
// Render with --format 9x16; shorts/<film>/film.json lists "9x16" first.
import * as K from '../shared/kit.js';

export * from '../shared/kit.js';
const {
  C, F, UI, S, E, prog, clamp, lerp, springU, SPRING, rrect, text, ltr, reveal, marker, lineLayout, sizeOf,
  card, pop, enter, pill, pillW, icon, badge, logo, shadow, cropCover, bg, w,
} = K;

// ---------------------------------------------------------------- frame
// Text hangs from XR (RTL). The right rail of TikTok buttons starts near x 960; the top tabs end near
// y 200; TikTok's own caption covers y > 1500. Scenes keep to y 330..1290; captions sit at CAP_Y.
export const XR = 948, XL = 72, CW = XR - XL, CX = (XR + XL) / 2;
export const TOP = 340, CAP_Y = 1400;

// The brand line at the top of every scene: logo, VanCash ERP and the short's topic.
export function brand(ctx, u, tag, { dark = false } = {}) {
  const k = springU(u, -0.5, SPRING.snappy);
  if (k <= 0.002) return;
  ctx.save(); ctx.globalAlpha *= clamp(k * 1.4);
  logo(ctx, XR - 60, 214, 60, dark ? { bg: C.white, fg: C.accent } : {});
  text(ctx, 'VanCash ERP', XR - 80, 258, F(40, 900), dark ? C.white : C.ink);
  if (tag) {
    const f = F(28, 700, UI);
    pill(ctx, XL + pillW(ctx, tag, f, 54, null, 22), 216, 54, tag, f,
      { bg: dark ? 'rgba(255,255,255,.14)' : C.wash, fg: dark ? C.white : C.accent, pad: 22 });
  }
  ctx.restore();
}

// A small coloured line above a title.
export function kick(ctx, str, ico = null, y = TOP, color = C.accent) {
  if (ico) { icon(ctx, ico, XR - 20, y - 12, 42, color, { lw: 2.2 }); text(ctx, str, XR - 56, y, F(36, 700, UI), color); }
  else text(ctx, str, XR, y, F(36, 700, UI), color);
}
// A title line from XR that arrives word by word, with the lime marker under words i0..i1.
export function title(ctx, u, str, y, at_, { size = 92, color = C.ink, mark = null, box = false, colors } = {}) {
  const f = F(size, 900);
  if (mark) marker(ctx, u, lineLayout(ctx, str, f), XR, y, size, mark[0], mark[1], mark[2], C.lime, 1, box);
  return reveal(ctx, u, str, XR, y, f, color, at_, { colors });
}
// The same, centred on CX.
export function titleC(ctx, u, str, y, at_, { size = 92, color = C.ink, colors } = {}) {
  const f = F(size, 900), L = lineLayout(ctx, str, f);
  return reveal(ctx, u, str, CX + L.width / 2, y, f, color, at_, { colors });
}

// ---------------------------------------------------------------- pieces
// A full-width row card: icon disc at the right, a label, an optional value at the left.
// tone: 'plain' | 'good' (mint, green check) | 'bad' (rose, red cross) | 'accent' (blue).
export function row(ctx, k, y, h, { ico = null, label, value, valueLtr = false, valueColor = C.accent, tone = 'plain',
  size = 54, x0 = XL, x1 = XR, sub = null, mark = null } = {}) {
  if (k <= 0.002) return;
  enter(ctx, k, () => {
    const fills = { plain: C.white, good: C.mint, bad: C.redWash, accent: C.accent };
    const strokes = { plain: C.line, good: '#bfe8d4', bad: '#f3c2bd', accent: C.accent };
    card(ctx, x0, y, x1 - x0, h, 28, fills[tone], { stroke: strokes[tone], shade: 0.12 });
    let xr = x1 - 32;
    const ink = tone === 'accent' ? C.white : C.ink;
    if (ico) {
      const discBg = { plain: C.wash, good: C.green, bad: C.red, accent: 'rgba(255,255,255,.18)' }[tone];
      badge(ctx, ico, xr - 42, y + h / 2, 42, discBg, tone === 'plain' ? C.accent : C.white, 2.3);
      xr -= 110;
    }
    const ly = y + h / 2 + size * 0.36 - (sub ? 18 : 0);
    text(ctx, label, xr, ly, F(size, 800), ink);
    if (sub) text(ctx, sub, xr, y + h / 2 + 48, F(32, 600, UI), tone === 'accent' ? 'rgba(255,255,255,.8)' : C.muted);
    if (value !== undefined && value !== null) {
      const vf = F(Math.round(size * 0.9), 800, UI);
      if (valueLtr) ltr(ctx, value, x0 + 34, y + h / 2 + size * 0.33, vf, valueColor, 'left');
      else text(ctx, value, x0 + 34, y + h / 2 + size * 0.33, vf, valueColor, 'left');
    }
    if (mark) mark(ctx, x0, y, x1 - x0, h);
  }, { dy: 60 });
}
// Rows that arrive one after another: items = [{ at, ...row options }].
export function rows(ctx, u, items, y0, h = 180, gap = 28) {
  items.forEach((it, i) => row(ctx, springU(u, it.at - 0.15, SPRING.snappy), y0 + i * (h + gap), h, it));
}
// A red "no" disc.
export function xmark(ctx, k, cx, cy, r = 30) {
  pop(ctx, k, cx, cy, () => {
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = C.red; ctx.fill();
    icon(ctx, 'x', cx, cy, r * 1.2, C.white, { lw: 3.2 });
  }, { from: 0.3 });
}
// A struck-through label (what not to do).
export function strike(ctx, u, str, xR, y, size, at_, color = C.red) {
  const L = reveal(ctx, u, str, xR, y, F(size, 800), C.muted, at_);
  const p = E.outCubic(prog(u, at_ + 0.6, at_ + 1.1));
  if (p > 0) {
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(xR + 8, y - size * 0.32); ctx.lineTo(xR + 8 - (L.width + 16) * p, y - size * 0.32); ctx.stroke();
    ctx.restore();
  }
}
// A money tile: icon, label and an amount that counts up.
export function tile(ctx, k, x, y, wd, h, { ico, label, amount, color = C.accent, count = 1, size = 64, fill = C.white } = {}) {
  if (k <= 0.002) return;
  enter(ctx, k, () => {
    card(ctx, x, y, wd, h, 28, fill, { stroke: C.line, shade: 0.12 });
    if (ico) badge(ctx, ico, x + wd - 58, y + 58, 32, C.wash, color, 2.2);
    text(ctx, label, x + wd - (ico ? 104 : 32), y + 70, F(36, 800, UI), C.ink);
    K.money(ctx, amount, x + wd - 32, y + h - 40, size, color, { k: count });
  }, { dy: 50 });
}
// A phone outline with a white screen; returns the screen box.
export function phone(ctx, x, y, wd, h, { tint = C.white } = {}) {
  shadow(ctx, x, y, wd, h, 56, 0.28);
  rrect(ctx, x, y, wd, h, 56); ctx.fillStyle = C.ink; ctx.fill();
  rrect(ctx, x + 16, y + 16, wd - 32, h - 32, 42); ctx.fillStyle = tint; ctx.fill();
  rrect(ctx, x + wd / 2 - 60, y + 30, 120, 22, 11); ctx.fillStyle = C.ink; ctx.fill();
  return [x + 16, y + 16, wd - 32, h - 32];
}
// A crop of a real screen in a card.
export function shot(ctx, key, crop, x, y, wd, h, { r = 22, shade = 0.18 } = {}) {
  card(ctx, x, y, wd, h, r, '#f3f6fb', { shade });
  cropCover(ctx, S.IMG[key], crop, x, y, wd, h, r);
}
// Optional cue: the beat of a phrase, or a fallback when the section doesn't say it.
export function maybe(sid, phrase, fallback, occ = 0) {
  try { return K.at(sid, phrase, occ); } catch (e) { return fallback; }
}

// ---------------------------------------------------------------- captions
// The words as they are said, with the brand and IMEI written the way they look on screen.
const REPL = [[['فان', 'كاش'], 'VanCash'], [['اي', 'ام', 'اي', 'اي'], 'IMEI'], [['كيو', 'ار'], 'QR']];
const plain = (s) => s.replace(/[ً-ْٰـ]/g, '').replace(/[،,.:؛؟?!«»"()]/g, '')
  .replace(/[أإآ]/g, 'ا');
function spokenWords() {
  const out = [];
  const ids = Object.keys(S.WORDS).sort((a, b) => S.SEC[a].beat - S.SEC[b].beat);
  for (const sid of ids) {
    const ws = S.WORDS[sid];
    for (let i = 0; i < ws.length; i++) {
      const hit = REPL.find(([pat]) => pat.every((p, j) => ws[i + j] && plain(ws[i + j][0]) === p));
      if (hit) {
        const last = ws[i + hit[0].length - 1];
        const tail = (/[،,.:؛؟?!]+$/.exec(last[0]) || [''])[0];
        out.push({ s: hit[1] + tail, on: w(sid, ws[i][1]), off: w(sid, last[2]), sid });
        i += hit[0].length - 1;
      } else out.push({ s: ws[i][0], on: w(sid, ws[i][1]), off: w(sid, ws[i][2]), sid });
    }
  }
  return out;
}
// Short chunks of up to four words, broken at punctuation, never across sections.
function chunk(words) {
  const out = [];
  let cur = [];
  const flush = () => { if (cur.length) out.push(cur); cur = []; };
  for (const wd of words) {
    if (cur.length && cur[0].sid !== wd.sid) flush();
    cur.push(wd);
    const len = cur.map((x) => x.s).join(' ').length;
    if (/[،,.:؛؟?!]$/.test(wd.s) || cur.length >= 4 || len >= 19) flush();
  }
  flush();
  out.forEach((c, i) => {
    const nx = out[i + 1];
    c.on = c[0].on - 0.12;
    c.off = c.at(-1).off + 0.8;
    if (nx) c.off = Math.min(c.off, nx[0].on - 0.12);
  });
  return out;
}
let CAPS = null;
const CAP_F = F(60, 900);
export function captions(ctx, u) {
  if (!CAPS) CAPS = chunk(spokenWords());
  const c = CAPS.find((x) => u >= x.on && u < x.off);
  if (!c) return;
  const str = c.map((x) => x.s).join(' ');
  const L = lineLayout(ctx, str, CAP_F);
  const k = springU(u, c.on, SPRING.snappy), out = 1 - prog(u, c.off - 0.12, c.off);
  const sc = Math.min(1, 800 / L.width) * lerp(0.92, 1, clamp(k));
  const bw = L.width + 70, bh = 112;
  ctx.save();
  ctx.globalAlpha *= clamp(k * 2.2) * out;
  ctx.translate(CX, CAP_Y); ctx.scale(sc, sc);
  rrect(ctx, -bw / 2, -bh / 2, bw, bh, 28); ctx.fillStyle = 'rgba(12,35,74,.92)'; ctx.fill();
  ctx.font = CAP_F; ctx.direction = 'rtl'; ctx.textAlign = 'right';
  const xR = L.width / 2;
  L.words.forEach((wd, i) => {
    const x = c[i] || c.at(-1);
    const nextOn = i + 1 < c.length ? c[i + 1].on : c.off;
    const active = u >= x.on - 0.1 && u < nextOn - 0.1;
    ctx.fillStyle = active ? C.lime : u >= x.on - 0.1 ? '#ffffff' : 'rgba(255,255,255,.5)';
    ctx.fillText(wd.s, xR - wd.x, 21);
  });
  ctx.restore();
}

// ---------------------------------------------------------------- the call to action
// The standard ending: "جرّب فان كاش مجانًا لمدة ثلاثة أيام. اطلب تجربتك الآن عبر واتساب، وتابعنا للمزيد."
// It holds after the last word as the short's end card. cfg: { sid, cues: {...} } overrides the cue words.
export function ctaScene(cfg) {
  const q = { brand: 'فان كاش', free: 'مجانًا', days: 'ثلاثة أيام', wa: 'واتساب', ask: 'اطلب', follow: 'وتابعنا', num: null, ...(cfg.cues || {}) };
  return function cta(ctx, u) {
    bg(ctx, 'blue');
    const s = cfg.sid, t0 = S.SEC[s].beat;
    brand(ctx, u, null, { dark: true });
    const tB = maybe(s, q.brand, t0 + 0.2);
    const kl = springU(u, t0 - 0.4, SPRING.bouncy);
    pop(ctx, kl, CX, 470, () => logo(ctx, CX - 85, 385, 170, { bg: C.white, fg: C.accent, p: clamp(prog(u, t0 - 0.4, t0 + 0.8)) }), { from: 0.4 });
    titleC(ctx, u, 'VanCash ERP', 690, [tB - 0.1], { size: 108, color: C.white });
    // the free trial
    const tF = maybe(s, q.free, tB + 0.6), tD = q.days ? maybe(s, q.days, tF + 0.5) : tF;
    const kf = springU(u, tF - 0.15, SPRING.bouncy);
    pop(ctx, kf, CX, 800, () => {
      const f = F(46, 900), str = 'تجربة مجانية · 3 أيام', wd = pillW(ctx, str, f, 92, 'gift', 34);
      pill(ctx, CX + wd / 2, 754, 92, str, f, { bg: C.lime, fg: C.ink, ico: 'gift', pad: 34 });
    }, { from: 0.5 });
    // WhatsApp
    const tW = maybe(s, q.wa, tD + 1), tA = maybe(s, q.ask, tW - 0.6);
    const kw = springU(u, Math.min(tA, tW) - 0.15, SPRING.bouncy);
    pop(ctx, kw, CX, 980, () => {
      shadow(ctx, XL, 890, CW, 210, 40, 0.35);
      rrect(ctx, XL, 890, CW, 210, 40); ctx.fillStyle = C.wa; ctx.fill();
      icon(ctx, 'chat', XR - 70, 960, 70, C.white, { lw: 2 });
      text(ctx, 'اطلب تجربتك عبر واتساب', XR - 130, 978, F(50, 900), C.white);
      ltr(ctx, '0655970064', XR - 130, 1062, F(64, 900), C.lime, 'right');
    }, { from: 0.6 });
    // follow
    const tFo = maybe(s, q.follow, tW + 1);
    const kb = springU(u, tFo - 0.15, SPRING.bouncy);
    pop(ctx, kb, CX, 1195, () => {
      const f = F(46, 900), str = 'تابعنا للمزيد', wd = pillW(ctx, str, f, 96, 'plus', 36);
      shadow(ctx, CX - wd / 2, 1147, wd, 96, 48, 0.3);
      pill(ctx, CX + wd / 2, 1147, 96, str, f, { bg: C.white, fg: C.ink, ico: 'plus', icoColor: C.accent, pad: 36 });
    }, { from: 0.5 });
  };
}

// ---------------------------------------------------------------- runner
// scenes: one per section + the end card (usually the CTA again, so the ending holds without a cut).
export function short({ n, scenes, hits }) {
  K.episode({ n, scenes, hits, overlay: captions, fonts: [CAP_F] });
}
