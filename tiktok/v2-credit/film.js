// VanCash ERP — video 2 «Le crédit». 9:16, 60 s, 128 bpm.
// Pure function of time: window.seek(t) paints frame t. Beats come from beats.json; the VO phrases
// were placed on the grid by shared/place_vo.py and word beats come from vo_words.json.
// Product shots are crops of real VanCash ERP screenshots (shared/shots/); the rest is drawn in code.
import * as M from '../shared/motion.js';
import * as K from '../shared/engine.js';

const { W, E, clamp, lerp, prog, springU, SPRING, wobble, shake, U, hash01 } = M;
const { C, font, say, chip, ring, uiCard, icon, headline, checkBadge, logo } = K;

let WD = [], CAP = null;
const B = (i) => U(WD[i].t0);          // beat on which word i is spoken
const HITS = [];
let SCENES = [];

// ---------------------------------------------------------------- the credit notebook (drawn in code)
const DEBTS = ['محمد · 25,000', 'كريم · 12,000', 'ياسين · 8,500', 'سفيان · 40,000'];
function creditBook(ctx, x, y, s, rot, u, u0) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  K.shadow(ctx, 60, 30, 0.55);
  M.rrect(ctx, -350, -310, 700, 620, 26); ctx.fillStyle = '#FFF7E1'; ctx.fill();
  K.noShadow(ctx);
  ctx.strokeStyle = 'rgba(70,110,200,0.28)'; ctx.lineWidth = 3;
  for (let yy = -170; yy < 300; yy += 100) { ctx.beginPath(); ctx.moveTo(-320, yy); ctx.lineTo(320, yy); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(255,77,94,0.55)';
  ctx.beginPath(); ctx.moveTo(260, -300); ctx.lineTo(260, 300); ctx.stroke();
  say(ctx, 'الكريدي', 0, -220, font(70, 1000), '#2140A8');
  DEBTS.forEach((d, i) => {
    const p = prog(u, u0 + i * 0.5, u0 + 0.45 + i * 0.5);
    if (p <= 0) return;
    const yy = -110 + i * 100;
    ctx.save();
    ctx.beginPath(); ctx.rect(250 - 560 * p, yy - 70, 560 * p + 10, 100); ctx.clip();
    ctx.transform(1, 0, -0.15, 1, 0, 0);
    say(ctx, d, 240, yy, font(54, 700), '#2140A8', { align: 'right' });
    ctx.restore();
  });
  ctx.restore();
}
// Banknotes leaking out of the notebook: seeded arcs, pure functions of u.
function leak(ctx, u, x0, y0, from, to) {
  for (let i = 0; i < 14; i++) {
    const st = from + (to - from) * hash01(i, 21);
    const tt = (u - st) * M.GRID.period;
    if (tt <= 0 || tt > 1.6) continue;
    const vx = (hash01(i, 3) - 0.5) * 900, vy = 900 + 500 * hash01(i, 5);
    const x = x0 + vx * tt, y = y0 - vy * tt + 900 * tt * tt;
    ctx.save();
    ctx.globalAlpha = 1 - prog(tt, 1.1, 1.6);
    ctx.translate(x, y); ctx.rotate((hash01(i, 9) - 0.5) * 6 * tt);
    M.rrect(ctx, -80, -40, 160, 80, 10); ctx.fillStyle = '#2FA36B'; ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = '#1C7A4C'; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 22, 0, M.TAU); ctx.fillStyle = '#1C7A4C'; ctx.fill();
    say(ctx, 'DA', -52, 12, font(30, 900), '#E9FFF2');
    ctx.restore();
  }
}

// ================================================================ S0 hook
function sHook(ctx, u) {
  headline(ctx, u, [[{ w: 'شحال', u: B(0) - 0.3 }, { w: 'من', u: B(1) }, { w: 'دورو', u: B(2) }], [{ w: 'ضايعلك؟', u: B(4) }]], 470, 132,
    { color: (w) => (w === 'ضايعلك؟' ? C.red : C.white) });
  const kb = springU(u, -0.5, SPRING.bouncy);
  const glow = 0.04 * Math.sin(u * Math.PI);
  creditBook(ctx, 500, 1010 + (1 - Math.min(1, kb)) * 600, 0.95 + glow, -0.06, u, 0.4);
  leak(ctx, u, 500, 900, 1.2, 9);
  chip(ctx, 'لكل التجار', 500, 1420, springU(u, 2, SPRING.bouncy), { size: 50, ic: 'shop' });
}

// ================================================================ S1 «خلّصتك!» — and you don't remember
function sTalk(ctx, u, S) {
  K.person(ctx, 280, 1040, 1.25, '#FF9F43', springU(u, S.a, SPRING.bouncy));
  ctx.save();
  ctx.translate(720, 1040); ctx.rotate(0.12 * wobble(u - B(13), 2.4, 3)); ctx.translate(-720, -1040);
  K.person(ctx, 720, 1040, 1.25, C.blueL, springU(u, S.a + 0.3, SPRING.bouncy));
  ctx.restore();
  const k1 = springU(u, B(8) - 0.2, SPRING.bouncy);
  K.bubble(ctx, 330, 640, 470, 210, k1, { tail: [0.3, 1] });
  if (k1 > 0.3) say(ctx, 'خلّصتك!', 330, 676, font(104 * Math.min(1, springU(u, B(10) - 0.1, SPRING.bouncy)), 1000), C.red);
  const k2 = springU(u, B(11) - 0.1, SPRING.bouncy);
  K.bubble(ctx, 720, 640, 330, 190, k2, { tail: [0.6, 1], fill: '#E9EEF9' });
  if (k2 > 0.3) say(ctx, '؟ ؟ ؟', 720, 676, font(96, 1000), C.ink);
  say(ctx, 'الزبون', 280, 1290, font(48, 800), C.muted, { alpha: Math.min(1, springU(u, S.a + 0.4, SPRING.snappy)) });
  say(ctx, 'انت', 720, 1290, font(48, 800), C.muted, { alpha: Math.min(1, springU(u, S.a + 0.7, SPRING.snappy)) });
}

// ================================================================ S2 the supplier is waiting
function sSupplier(ctx, u, S) {
  const kb = springU(u, S.a, SPRING.bouncy);
  ctx.save(); ctx.translate(500, 760); ctx.scale(kb, kb);
  ctx.beginPath(); ctx.arc(0, 0, 210, 0, M.TAU); ctx.fillStyle = C.panel; ctx.fill();
  icon(ctx, 'box', 0, 0, 260, '#FFB347', { width: 1.5 });
  ctx.restore();
  chip(ctx, 'Fournisseur', 500, 480, springU(u, B(15) - 0.1, SPRING.bouncy), { size: 56 });
  // the clock keeps running
  const kc = springU(u, B(16) - 0.2, SPRING.bouncy);
  if (kc > 0.001) {
    ctx.save(); ctx.translate(500, 1130); ctx.scale(kc, kc);
    ctx.beginPath(); ctx.arc(0, 0, 120, 0, M.TAU); ctx.fillStyle = C.white; ctx.fill();
    ctx.lineWidth = 12; ctx.strokeStyle = C.red; ctx.stroke();
    ctx.strokeStyle = C.ink; ctx.lineCap = 'round';
    const a1 = -Math.PI / 2 + u * 1.6, a2 = -Math.PI / 2 + u * 0.2;
    ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a1) * 88, Math.sin(a1) * 88); ctx.stroke();
    ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a2) * 58, Math.sin(a2) * 58); ctx.stroke();
    ctx.restore();
  }
}

// ================================================================ S3 the drop: logo + «يحفظلك كلش… بلا ما تحفظ»
function sDrop(ctx, u, S) {
  K.shockwave(ctx, u, S.a - 0.05, 500, 560);
  logo(ctx, 500, 560, 1.0, S.a - 0.45, u);
  headline(ctx, u, [[{ w: 'يحفظلك', u: B(21) }, { w: 'كلش', u: B(22) }]], 860, 124);
  headline(ctx, u, [[{ w: 'بلا', u: B(23) }, { w: 'ما', u: B(24) }, { w: 'تحفظ', u: B(25) }]], 1030, 124, { color: () => C.lime });
}

// ================================================================ S4 the real customer card
function sClient(ctx, u, S, IMG) {
  chip(ctx, 'Fiche client', 500, 330, springU(u, B(26) - 0.1, SPRING.bouncy), { size: 56, ic: 'users' });
  const F = [
    { w: 28, r: [342, 72, 314, 67], lab: 'Nom' },
    { w: 29, r: [17, 72, 314, 67], lab: 'Téléphone' },
    { w: 30, r: [17, 220, 640, 67], lab: 'Adresse' },
    { w: 31, r: [342, 295, 314, 67], lab: 'Niveau de prix' },
    { w: 36, r: [17, 295, 314, 67], lab: 'Plafond crédit' },
  ];
  const keys = [[S.a, [340, 250, 1.25]]];
  F.forEach((f) => keys.push([B(f.w) - 0.35, [f.r[0] + f.r[2] / 2, f.r[1] + f.r[3] / 2, f.r[2] > 400 ? 1.35 : 2.2]]));
  keys.push([B(38) + 0.6, [340, 250, 1.25]]);
  const items = F.map((f, i) => ({ a: B(f.w) - 0.15, b: i + 1 < F.length ? B(F[i + 1].w) - 0.15 : B(38) + 0.6, r: f.r, lab: f.lab }));
  K.lens(ctx, u, IMG.client, keys, items, { box: { x: 50, y: 420, w: 900, h: 820 } });
}

// ================================================================ S5 sold 75,000, got 50,000: 25,000 left (worked example)
function sMath(ctx, u, S) {
  chip(ctx, 'Vente', 500, 350, springU(u, B(39) - 0.1, SPRING.bouncy), { size: 52, ic: 'phone' });
  const kv = springU(u, B(40) - 0.1, SPRING.snappy);
  const sale = 75000 * E.outCubic(prog(u, B(41), B(43) + 0.4));
  if (kv > 0.001) K.dinars(ctx, sale, 500, 560, 150, C.white, Math.min(1, kv * 2));
  say(ctx, 'سبع ملاين ونص', 500, 650, font(46, 600, K.UI), C.muted, { alpha: Math.min(1, springU(u, B(43), SPRING.snappy) * 2) });
  // the bar: paid fills from the right (RTL), the rest is what the customer still owes
  const kb = springU(u, B(41), SPRING.snappy);
  if (kb > 0.001) {
    const x = 90, w = 820, y = 730, h = 92;
    ctx.save(); ctx.globalAlpha = Math.min(1, kb * 2);
    M.rrect(ctx, x, y, w, h, 46); ctx.fillStyle = C.panel; ctx.fill();
    ctx.save(); M.rrect(ctx, x, y, w, h, 46); ctx.clip();
    const pp = E.outCubic(prog(u, B(44), B(46) + 0.5)) * (2 / 3);
    ctx.fillStyle = C.mint; ctx.fillRect(x + w - w * pp, y, w * pp, h);
    const rp = E.outCubic(prog(u, B(50), B(52))) * (1 / 3);
    ctx.fillStyle = '#FFB347'; ctx.fillRect(x, y, w * rp, h);
    ctx.restore(); ctx.restore();
  }
  const kp = springU(u, B(44) - 0.1, SPRING.bouncy);
  chip(ctx, 'Payé', 700, 900, kp, { size: 46, bg: C.mint });
  if (kp > 0.001) K.dinars(ctx, 50000 * E.outCubic(prog(u, B(44), B(46) + 0.5)), 700, 1010, 76, C.mint, Math.min(1, kp * 2));
  const kr = springU(u, B(50) - 0.1, SPRING.bouncy);
  chip(ctx, 'Reste', 300, 900, kr, { size: 46, bg: '#FFB347' });
  if (kr > 0.001) K.dinars(ctx, 25000 * E.outCubic(prog(u, B(50), B(52))), 300, 1010, 76, '#FFB347', Math.min(1, kr * 2));
  K.stamp(ctx, u, B(55) - 0.1, 'Automatique', 500, 1180, { r: 0, color: C.lime, size: 84, rot: -0.08 });
}

// ================================================================ S6 the real debts book
const AGING = [
  { w: 68, r: [750, 312, 242, 50], x: 705, y: 1010 }, { w: 69, r: [506, 312, 245, 50], x: 295, y: 1010 },
  { w: 70, r: [260, 312, 242, 50], x: 705, y: 1110 }, { w: 71, r: [16, 312, 242, 50], x: 295, y: 1110 },
];
function sDebts(ctx, u, S, IMG) {
  const kh = springU(u, S.a, SPRING.snappy);
  uiCard(ctx, IMG.debts, [700, 4, 308, 52], 500, 360, 1.9, { radius: 18, sy: Math.min(1, kh), alpha: Math.min(1, kh * 2) });
  const t1 = springU(u, B(59) - 0.2, SPRING.bouncy), t2 = springU(u, B(62) - 0.2, SPRING.bouncy);
  const c1 = uiCard(ctx, IMG.debts, [510, 72, 495, 42], 500, 520, 1.6, { radius: 18, sx: Math.min(1, t1), sy: Math.min(1, t1), alpha: Math.min(1, t1 * 2) });
  const c2 = uiCard(ctx, IMG.debts, [0, 72, 500, 42], 500, 625, 1.6, { radius: 18, sx: Math.min(1, t2), sy: Math.min(1, t2), alpha: Math.min(1, t2 * 2) });
  ring(ctx, c1.x, c1.y, c1.w, c1.h, prog(u, B(59), B(59) + 0.5) * (1 - prog(u, B(62) - 0.2, B(62))), { radius: 18 });
  ring(ctx, c2.x, c2.y, c2.w, c2.h, prog(u, B(62), B(62) + 0.5) * (1 - prog(u, B(64) - 0.2, B(64))), { radius: 18 });
  const kt = springU(u, B(64) - 0.2, SPRING.bouncy);
  const tot = uiCard(ctx, IMG.debts, [895, 232, 110, 72], 500, 810, 2.6, { radius: 22, sx: Math.min(1, kt), sy: Math.min(1, kt), alpha: Math.min(1, kt * 2) });
  if (kt > 0.001) ring(ctx, tot.x, tot.y, tot.w, tot.h, prog(u, B(64), B(64) + 0.6), { radius: 22 });
  AGING.forEach((g) => {
    const k = springU(u, B(g.w) - 0.15, SPRING.bouncy);
    const c = uiCard(ctx, IMG.debts, g.r, g.x, g.y, 1.6, { radius: 18, sx: Math.min(1, k), sy: Math.min(1, k), alpha: Math.min(1, k * 2) });
    if (k > 0.001) ring(ctx, c.x, c.y, c.w, c.h, prog(u, B(g.w), B(g.w) + 0.5) * (1 - prog(u, B(g.w) + 1.2, B(g.w) + 1.6)), { radius: 16, width: 6 });
  });
  const kp = springU(u, B(74) - 0.3, SPRING.bouncy);
  const pb = uiCard(ctx, IMG.debts, [2, 12, 137, 38], 560, 1240, 2.6, { radius: 20, sx: Math.min(1, kp), sy: Math.min(1, kp), alpha: Math.min(1, kp * 2) });
  if (kp > 0.001) ring(ctx, pb.x, pb.y, pb.w, pb.h, prog(u, B(74), B(74) + 0.6), { radius: 20 });
  chip(ctx, 'Relevé', 175, 1240, springU(u, B(74), SPRING.bouncy), { size: 46, ic: 'receipt' });
}

// ================================================================ S7 the real supplier card
function sSupplierCard(ctx, u, S, IMG) {
  chip(ctx, 'Fiche fournisseur', 500, 330, springU(u, S.a + 0.1, SPRING.bouncy), { size: 52, ic: 'box' });
  const F = [
    { w: 76, r: [350, 72, 314, 67], lab: 'Fournisseur' },
    { w: 77, r: [25, 72, 314, 67], lab: 'Téléphone' },
    { w: 79, r: [25, 400, 640, 115], lab: 'Notes' },
  ];
  const keys = [[S.a, [344, 260, 1.3]]];
  F.forEach((f) => keys.push([B(f.w) - 0.35, [f.r[0] + f.r[2] / 2, f.r[1] + f.r[3] / 2, f.r[2] > 400 ? 1.35 : 2.2]]));
  const items = F.map((f, i) => ({ a: B(f.w) - 0.15, b: i + 1 < F.length ? B(F[i + 1].w) - 0.15 : S.b, r: f.r, lab: f.lab }));
  K.lens(ctx, u, IMG.supplier, keys, items, { box: { x: 50, y: 420, w: 900, h: 820 } });
}

// ================================================================ S8 who owes whom, in a second — bye bye notebook
function sWho(ctx, u, S, IMG) {
  const k1 = springU(u, B(81) - 0.2, SPRING.bouncy), k2 = springU(u, B(83) - 0.2, SPRING.bouncy);
  const out = E.inBack(prog(u, B(87) - 0.6, B(87)), 1.3);
  const y1 = 470 - out * 900, y2 = 640 - out * 900;
  uiCard(ctx, IMG.debts, [510, 72, 495, 42], 500, y1, 1.75, { radius: 18, sx: Math.min(1, k1), sy: Math.min(1, k1) });
  uiCard(ctx, IMG.debts, [0, 72, 500, 42], 500, y2, 1.75, { radius: 18, sx: Math.min(1, k2), sy: Math.min(1, k2) });
  chip(ctx, 'لنا', 880, y1 - 60, k1, { size: 40, bg: C.mint });
  chip(ctx, 'علينا', 880, y2 - 60, k2, { size: 40, bg: '#FFB347' });
  K.stopwatch(ctx, u, B(86), 500, 880 - out * 900);
  // the notebook waves goodbye, then is thrown away
  const kn = springU(u, B(87) - 0.4, SPRING.bouncy);
  if (kn > 0.001) {
    const fly = E.inCubic(prog(u, B(89) + 0.4, B(89) + 1.6));
    const x = 500 - fly * 900, y = 960 - fly * 1100;
    creditBook(ctx, x, y, 0.62 * Math.min(1, kn), 0.18 * Math.sin((u - B(87)) * Math.PI * 2) * (1 - fly) - fly * 4, u, -10);
    const kx = springU(u, B(89) - 0.1, SPRING.bouncy) * (1 - fly);
    if (kx > 0.001) {
      ctx.save(); ctx.translate(x, y); ctx.scale(kx, kx);
      ctx.strokeStyle = C.red; ctx.lineWidth = 26; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-170, -150); ctx.lineTo(170, 150); ctx.moveTo(170, -150); ctx.lineTo(-170, 150); ctx.stroke();
      ctx.restore();
    }
  }
}

// ================================================================ S9 recap, S10 CTA
function sRecap(ctx, u, S) {
  K.recap(ctx, u, S.a, ['كلش', 'محسوب'], ['Fiche client', 'Plafond crédit', 'Reste à payer', 'Dettes 30 · 60 · 90', 'Relevé']);
}
function sCta(ctx, u, S) {
  K.cta(ctx, u, { start: S.a, tryU: B(90), freeU: B(93), threeU: B(94), daysU: B(95), waU: B(98), chipsU: 117 });
}

// ================================================================ assembly
function build() {
  SCENES = [
    { a: 0, b: 6, f: sHook, tin: 'cut', tout: 'whip' },
    { a: 6, b: 14.5, f: sTalk, tin: 'whip', tout: 'whip' },
    { a: 14.5, b: 20, f: sSupplier, tin: 'whip', tout: 'cut' },
    { a: 20, b: 28.5, f: sDrop, tin: 'cut', tout: 'whip' },
    { a: 28.5, b: 42, f: sClient, tin: 'whip', tout: 'whip' },
    { a: 42, b: 61, f: sMath, tin: 'whip', tout: 'whip' },
    { a: 61, b: 80.5, f: sDebts, tin: 'whip', tout: 'whip' },
    { a: 80.5, b: 88.5, f: sSupplierCard, tin: 'whip', tout: 'whip' },
    { a: 88.5, b: 98, f: sWho, tin: 'whip', tout: 'whip' },
    { a: 98, b: 104, f: sRecap, tin: 'whip', tout: 'cut' },
    { a: 104, b: 130, f: sCta, tin: 'cut', tout: 'cut' },
  ];
  const H_ = (b, l, s, o) => HITS.push([+b.toFixed(3), l, s, o]);
  H_(0.2, 'notebook lands', 'thud+sub', { gain: 0.7 });
  DEBTS.forEach((_, i) => H_(0.4 + i * 0.5, `debt line ${i}`, 'type', { len: 0.2, gain: 0.14 }));
  H_(B(4), 'ضايعلك', 'thud', { gain: 0.35 });
  H_(1.4, 'money leaks', 'coins', { gain: 0.25 });
  H_(2, 'tag', 'pop', { pitch: 'E5' });
  SCENES.forEach((s) => { if (s.tin === 'whip') H_(s.a, `whip into ${s.f.name}`, 'whoosh', { len: 0.45, gain: 0.22 }); });
  H_(B(8) - 0.2, 'customer bubble', 'pop', { pitch: 'D5' });
  H_(B(10) - 0.1, 'خلّصتك', 'thud', { gain: 0.3 });
  H_(B(11) - 0.1, 'owner ???', 'boing', { pitch: 'C5', to: 'G4' });
  H_(B(15) - 0.1, 'Fournisseur chip', 'pop', { pitch: 'A5' });
  H_(B(16) - 0.2, 'clock', 'tick', { gain: 0.25 });
  H_(19.95, 'riser into drop', 'riser', { len: 1.8, gain: 0.3 });
  H_(20, 'drop', 'impact');
  H_(20.3, 'logo', 'bell', { pitch: 'E6' });
  H_(B(23), 'بلا ما تحفظ', 'pop', { pitch: 'G5' });
  H_(B(26) - 0.1, 'fiche client', 'pop', { pitch: 'D5' });
  const notes = ['A5', 'C6', 'D6', 'E6', 'G6', 'A6', 'C7'];
  [28, 29, 30, 31, 36].forEach((w, i) => H_(B(w) - 0.15, `client field ${w}`, 'blip', { pitch: notes[i], gain: 0.14 }));
  H_(B(39) - 0.1, 'vente', 'pop', { pitch: 'C5' });
  H_(B(41), 'sale counts up', 'coins', { gain: 0.22 });
  H_(B(44), 'paid fills', 'blip', { pitch: 'E6', gain: 0.16 });
  H_(B(50), 'rest fills', 'blip', { pitch: 'A5', gain: 0.16 });
  H_(B(55) - 0.1, 'Automatique', 'thud+bell', { pitch: 'A6', gain: 0.5 });
  H_(B(59) - 0.2, 'tab clients', 'pop', { pitch: 'D5' });
  H_(B(62) - 0.2, 'tab suppliers', 'pop', { pitch: 'A4' });
  H_(B(64) - 0.2, 'total', 'pop', { pitch: 'C6' });
  AGING.forEach((g, i) => H_(B(g.w) - 0.15, `aging ${i}`, 'blip', { pitch: notes[i + 2], gain: 0.15 }));
  H_(B(74) - 0.3, 'relevé', 'pop+bell', { pitch: 'G6' });
  [76, 77, 79].forEach((w, i) => H_(B(w) - 0.15, `supplier field ${w}`, 'blip', { pitch: notes[i + 1], gain: 0.14 }));
  H_(B(81) - 0.2, 'لنا', 'pop', { pitch: 'E5' });
  H_(B(83) - 0.2, 'علينا', 'pop', { pitch: 'B4' });
  H_(B(86) - 0.1, 'stopwatch', 'bell', { pitch: 'A6', gain: 0.22 });
  H_(B(89) - 0.1, 'X on notebook', 'thud', { gain: 0.4 });
  H_(B(89) + 0.5, 'notebook thrown', 'whoosh', { len: 0.6, gain: 0.3 });
  ['', '', '', '', ''].forEach((_, i) => H_(98 + 0.9 + i * 0.75, `recap ${i}`, 'blip', { pitch: notes[i + 1], gain: 0.16 }));
  H_(104, 'cta', 'impact', { gain: 0.6 });
  H_(B(94) - 0.1, 'big 3', 'thud', { gain: 0.5 });
  H_(B(98) - 0.15, 'whatsapp', 'pop+bell', { pitch: 'C6' });
  H_(117, 'offline chip', 'pop', { pitch: 'G5' });
  H_(118, 'online chip', 'pop', { pitch: 'C6' });
  HITS.sort((a, b) => a[0] - b[0]);
}

function sceneOffset(s, u) {
  const T = 0.35, d = -W * 1.05;
  let x = 0;
  if (s.tin === 'whip') x += (1 - E.inOutCubic(prog(u, s.a - T, s.a + T))) * d;
  if (s.tout === 'whip') x -= E.inOutCubic(prog(u, s.b - T, s.b + T)) * d;
  return x;
}
const visible = (s, u) => u >= s.a - (s.tin === 'whip' ? 0.35 : 0) && u < s.b + (s.tout === 'whip' ? 0.35 : 0);

M.film({
  fonts: [font(100, 1000), font(100, 900), font(40, 600, K.UI), font(40, 700, K.UI)],
  images: { client: '../shared/shots/raw_07.png', debts: '../shared/shots/raw_08.png', supplier: '../shared/shots/raw_09.png' },
  hits: HITS,
  samples: 10,
  async init(ctx) {
    await K.preloadFonts();
    WD = await fetch('vo_words.json').then((r) => r.json());
    CAP = K.buildCaptions(ctx, WD, { hide: [0, 4, 13, 14] });
    build();
    window.HITS = HITS;
  },
  draw(ctx, u, t, IMG) {
    const mood = E.inOutCubic(prog(u, 19.8, 20.4));
    let cam = 0;
    SCENES.forEach((s) => { if (s.tin === 'whip') cam += E.inOutCubic(prog(u, s.a - 0.35, s.a + 0.35)) * W; });
    K.background(ctx, u, mood, -cam * 0.4);
    ctx.save();
    if (u < 2) shake(ctx, u, 0.2, 22, 3, 0.25);
    else if (u > 19 && u < 22) shake(ctx, u, 20, 30, 7, 0.22);
    else if (u > 103) shake(ctx, u, 104, 18, 9, 0.2);
    for (const s of SCENES) {
      if (!visible(s, u)) continue;
      ctx.save();
      ctx.translate(sceneOffset(s, u), 0);
      s.f(ctx, u, s, IMG);
      ctx.restore();
    }
    ctx.restore();
    K.captions(ctx, t, CAP);
  },
});
