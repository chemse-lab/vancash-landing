// VanCash ERP — video 3 «المحل في جيبك». 9:16, 60 s, 128 bpm.
// Pure function of time: window.seek(t) paints frame t. Beats come from beats.json; the VO phrases
// were placed on the grid by shared/place_vo.py and word beats come from vo_words.json.
// Product shots are crops of real VanCash ERP screenshots (shared/shots/); the rest is drawn in code.
import * as M from '../shared/motion.js';
import * as K from '../shared/engine.js';

const { W, E, lerp, prog, springU, SPRING, wobble, shake, U } = M;
const { C, font, say, chip, ring, uiCard, icon, headline, checkBadge, logo, handset, mark } = K;

let WD = [], CAP = null;
const B = (i) => U(WD[i].t0);          // beat on which word i is spoken
const HITS = [];
let SCENES = [];

// ---------------------------------------------------------------- pictograms drawn in code
function house(ctx, x, y, s, color) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.lineJoin = 'round'; ctx.lineWidth = 12; ctx.strokeStyle = color;
  ctx.beginPath(); ctx.moveTo(-110, -10); ctx.lineTo(0, -110); ctx.lineTo(110, -10); ctx.stroke();
  ctx.beginPath(); ctx.rect(-80, -30, 160, 130); ctx.stroke();
  ctx.beginPath(); ctx.rect(-22, 30, 44, 70); ctx.stroke();
  ctx.restore();
}
function monitor(ctx, x, y, w, k) {
  if (k <= 0.001) return;
  const h = w * 0.62;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  K.shadow(ctx, 50, 24, 0.5);
  M.rrect(ctx, -w / 2, -h / 2, w, h, 22); ctx.fillStyle = '#1B2236'; ctx.fill();
  K.noShadow(ctx);
  M.rrect(ctx, -w / 2 + 14, -h / 2 + 14, w - 28, h - 28, 12); ctx.fillStyle = '#0A1022'; ctx.fill();
  mark(ctx, 0, 0, h * 0.42);
  ctx.fillStyle = '#59647F';
  ctx.fillRect(-14, h / 2, 28, 44); M.rrect(ctx, -90, h / 2 + 40, 180, 16, 8); ctx.fill();
  ctx.restore();
}
function phoneWithMark(ctx, x, y, w, k, rot = 0) {
  if (k <= 0.001) return;
  handset(ctx, x, y, w * k, w * 2 * k, { rot, screen: (c, sx, sy, sw, sh) => mark(c, 0, 0, sw * 0.42) });
}
function toggle(ctx, x, y, on, k) {
  if (k <= 0.001) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  M.rrect(ctx, -70, -40, 140, 80, 40); ctx.fillStyle = M.mix('#3A4A6E', C.lime, on); ctx.fill();
  ctx.beginPath(); ctx.arc(lerp(30, -30, on), 0, 30, 0, M.TAU); ctx.fillStyle = C.white; ctx.fill();
  ctx.restore();
}
function eye(ctx, x, y, s, color) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.lineWidth = 7; ctx.strokeStyle = color;
  ctx.beginPath(); ctx.moveTo(-50, 0); ctx.quadraticCurveTo(0, -46, 50, 0); ctx.quadraticCurveTo(0, 46, -50, 0); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, 15, 0, M.TAU); ctx.fillStyle = color; ctx.fill();
  ctx.restore();
}
function pencil(ctx, x, y, s, color) {
  ctx.save(); ctx.translate(x - 50 * s, y - 50 * s); ctx.scale(s * 100 / 24, s * 100 / 24);
  ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.strokeStyle = color;
  ctx.stroke(new Path2D('M4 20l4-1 11-11-3-3L5 16l-1 4Zm10-13 3 3'));
  ctx.restore();
}

// ================================================================ S0 hook: home vs. shop
function sHook(ctx, u) {
  const kA = springU(u, -0.5, SPRING.bouncy), kB = springU(u, B(3) - 0.25, SPRING.bouncy);
  const panel = (y, k, fill) => {
    if (k <= 0.001) return;
    ctx.save(); ctx.translate(500, y); ctx.scale(Math.min(1, k), Math.min(1, k));
    M.rrect(ctx, -420, -190, 840, 380, 44); ctx.fillStyle = fill; ctx.fill();
    ctx.restore();
  };
  panel(540, kA, 'rgba(36,87,245,0.28)');
  if (kA > 0.3) {
    house(ctx, 290, 520, Math.min(1, kA), C.white);
    K.person(ctx, 640, 600, 0.9, C.blueL, Math.min(1, kA));
    phoneWithMark(ctx, 735, 560, 46, Math.min(1, springU(u, 0.6, SPRING.bouncy)), 0.25);
    say(ctx, 'راك في الدار', 500, 700, font(64, 1000), C.white);
  }
  panel(1010, kB, 'rgba(255,159,67,0.22)');
  if (kB > 0.3) {
    icon(ctx, 'shop', 290, 990, 230, C.white, { width: 1.6 });
    K.person(ctx, 660, 1070, 0.9, '#FF9F43', Math.min(1, kB));
    say(ctx, 'والخدّام وحدو في المحل', 500, 1170, font(56, 1000), C.white);
  }
  // the link between them is broken
  const kq = springU(u, B(7) - 0.2, SPRING.bouncy);
  if (kq > 0.001) {
    ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 8; ctx.setLineDash([18, 16]); ctx.lineDashOffset = -u * 30;
    ctx.beginPath(); ctx.moveTo(500, 735); ctx.lineTo(500, 815); ctx.stroke(); ctx.restore();
    ctx.save(); ctx.translate(500, 775); ctx.scale(kq, kq); ctx.rotate(0.3 * wobble(u - B(10), 2, 3));
    ctx.beginPath(); ctx.arc(0, 0, 70, 0, M.TAU); ctx.fillStyle = C.red; ctx.fill();
    say(ctx, '؟', 0, 40, font(110, 1000), C.white);
    ctx.restore();
  }
}

// ================================================================ S1 at night the cash doesn't add up
function sNight(ctx, u, S) {
  const km = springU(u, S.a, SPRING.gentle);
  ctx.save(); ctx.globalAlpha = Math.min(1, km);
  ctx.beginPath(); ctx.arc(780, 380, 70, 0, M.TAU); ctx.fillStyle = '#FFE9A8'; ctx.fill();
  ctx.beginPath(); ctx.arc(812, 356, 62, 0, M.TAU); ctx.fillStyle = C.ink; ctx.fill();
  ctx.restore();
  chip(ctx, 'La caisse', 420, 400, springU(u, B(14) - 0.1, SPRING.bouncy), { size: 56, ic: 'wallet' });
  const kc = springU(u, S.a + 0.3, SPRING.snappy);
  if (kc > 0.001) {
    ctx.save(); ctx.translate(500, 800); ctx.scale(Math.min(1, kc), Math.min(1, kc));
    M.rrect(ctx, -400, -250, 800, 500, 40); ctx.fillStyle = C.panel; ctx.fill();
    ctx.restore();
    const r1 = 48500 * E.outCubic(prog(u, S.a + 0.6, B(15)));
    const r2 = 45000 * E.outCubic(prog(u, B(15), B(16)));
    say(ctx, 'المبيعات', 780, 660, font(50, 700, K.UI), C.muted, { align: 'right', alpha: Math.min(1, kc) });
    K.dinars(ctx, r1, 300, 668, 72, C.white, Math.min(1, kc));
    say(ctx, 'في الكاسة', 780, 800, font(50, 700, K.UI), C.muted, { align: 'right', alpha: Math.min(1, springU(u, B(15), SPRING.snappy)) });
    if (u > B(15)) K.dinars(ctx, r2, 300, 808, 72, C.white);
    const kd = springU(u, B(17) - 0.1, SPRING.bouncy);
    if (kd > 0.001) {
      ctx.save(); ctx.translate(0, 0);
      ctx.fillStyle = 'rgba(255,77,94,0.18)'; M.rrect(ctx, 130, 880, 740, 120, 24); ctx.fill();
      ctx.restore();
      ctx.save(); ctx.translate(500, 960); ctx.scale(kd, kd); ctx.translate(-500, -960);
      K.dinars(ctx, -3500, 500, 968, 86, C.red);
      ctx.restore();
    }
  }
}

// ================================================================ S2 the drop: the shop in your pocket
function sDrop(ctx, u, S) {
  K.shockwave(ctx, u, S.a - 0.05, 500, 880);
  logo(ctx, 500, 360, 0.7, S.a - 0.45, u);
  const kp = springU(u, S.a - 0.3, SPRING.bouncy);
  phoneWithMark(ctx, 500, lerp(1700, 860, Math.min(1.05, kp)), 330, 1, 0.05 * wobble(u - S.a, 1.4, 3));
  headline(ctx, u, [[{ w: 'المحل', u: B(21) }, { w: 'في', u: B(22) }, { w: 'جيبك', u: B(23) }]], 1330, 110,
    { color: (w) => (w === 'جيبك' ? C.lime : C.white) });
}

// ================================================================ S3 the real dashboard
function sDash(ctx, u, S, IMG) {
  const kh = springU(u, S.a, SPRING.snappy);
  const hd = uiCard(ctx, IMG.dash, [15, 4, 985, 86], 500, 380, 0.92, { radius: 18, sy: Math.min(1, kh), alpha: Math.min(1, kh * 2) });
  K.pull(ctx, u, B(25) - 0.1, IMG.dash, [148, 28, 117, 34], hd, 500, 510, 2.4, { s0: 0.92 });
  const c1 = K.pull(ctx, u, B(27) - 0.2, IMG.dash, [770, 100, 238, 122], hd, 715, 720, 1.75, { s0: 0.92 });
  const c2 = K.pull(ctx, u, B(31) - 0.2, IMG.dash, [15, 100, 238, 122], hd, 285, 720, 1.75, { s0: 0.92 });
  if (c1) ring(ctx, c1.x, c1.y, c1.w, c1.h, prog(u, B(27), B(27) + 0.5) * (1 - prog(u, B(31) - 0.3, B(31))), { radius: 22 });
  if (c2) ring(ctx, c2.x, c2.y, c2.w, c2.h, prog(u, B(31), B(31) + 0.5) * (1 - prog(u, B(33) - 0.3, B(33))), { radius: 22 });
  const ch = K.pull(ctx, u, B(33) - 0.2, IMG.dash, [520, 238, 488, 296], hd, 500, 1080, 1.55, { s0: 0.92 });
  if (ch) ring(ctx, ch.x, ch.y, ch.w, ch.h, prog(u, B(33), B(33) + 0.6), { radius: 22 });
}

// ================================================================ S4 the real finance page
const FIN = [
  { w: 39, r: [852, 122, 156, 88], x: 705, y: 640 }, { w: 40, r: [686, 122, 156, 88], x: 295, y: 640 },
  { w: 42, r: [520, 122, 156, 88], x: 705, y: 890 }, { w: 45, r: [350, 122, 162, 88], x: 295, y: 890 },
];
function sFinance(ctx, u, S, IMG) {
  const kh = springU(u, S.a, SPRING.snappy);
  const hd = uiCard(ctx, IMG.fin, [560, 16, 448, 76], 500, 390, 1.85, { radius: 18, sy: Math.min(1, kh), alpha: Math.min(1, kh * 2) });
  FIN.forEach((f) => {
    const c = K.pull(ctx, u, B(f.w) - 0.2, IMG.fin, f.r, null, f.x, f.y, 2.45);
    if (c) ring(ctx, c.x, c.y, c.w, c.h, prog(u, B(f.w), B(f.w) + 0.5) * (1 - prog(u, B(f.w) + 1.4, B(f.w) + 1.8)), { radius: 20, width: 6 });
  });
  const d = K.pull(ctx, u, B(46) - 0.2, IMG.fin, [568, 243, 54, 38], null, 650, 1110, 2.8);
  const m = K.pull(ctx, u, B(48) - 0.2, IMG.fin, [475, 243, 85, 38], null, 370, 1110, 2.8);
  if (d) ring(ctx, d.x, d.y, d.w, d.h, prog(u, B(46), B(46) + 0.5) * (1 - prog(u, B(48) - 0.2, B(48))), { radius: 18 });
  if (m) ring(ctx, m.x, m.y, m.w, m.h, prog(u, B(48), B(48) + 0.5), { radius: 18 });
}

// ================================================================ S5 three devices, synchronised
function sDevices(ctx, u, S, IMG) {
  const k1 = springU(u, B(50) - 0.2, SPRING.bouncy), k2 = springU(u, B(53) - 0.2, SPRING.bouncy), k3 = springU(u, B(55) - 0.2, SPRING.bouncy);
  const ks = prog(u, B(57) - 0.3, B(57) + 0.6);
  const P = [[500, 500], [250, 960], [750, 960]];
  if (ks > 0) {
    ctx.save(); ctx.strokeStyle = C.lime; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.setLineDash([3, 22]); ctx.lineDashOffset = -u * 40;
    ctx.globalAlpha = ks;
    [[0, 1], [0, 2], [1, 2]].forEach(([a, b]) => { ctx.beginPath(); ctx.moveTo(...P[a]); ctx.lineTo(...P[b]); ctx.stroke(); });
    ctx.restore();
    ctx.save(); ctx.translate(500, 800); ctx.rotate(u * 1.2); ctx.scale(ks, ks);
    ctx.beginPath(); ctx.arc(0, 0, 66, 0, M.TAU); ctx.fillStyle = C.lime; ctx.fill();
    ctx.restore();
    icon(ctx, 'sync', 500, 800, 80 * ks, C.ink, { width: 2.6 });
  }
  monitor(ctx, 500, 480, 380, Math.min(1, k1));
  phoneWithMark(ctx, 250, 950, 150, Math.min(1, k2), -0.08);
  phoneWithMark(ctx, 750, 950, 150, Math.min(1, k3), 0.08);
  chip(ctx, 'PC', 500, 330, k1, { size: 44, bg: C.white, ic: 'monitor' });
  chip(ctx, 'انت', 250, 1150, k2, { size: 44, bg: C.white });
  chip(ctx, 'الخدّام', 750, 1150, k3, { size: 44, bg: C.white });
  const kb = springU(u, B(57) + 0.3, SPRING.bouncy);
  uiCard(ctx, IMG.dash, [148, 28, 117, 34], 500, 1270, 2.3, { radius: 16, sx: Math.min(1, kb), sy: Math.min(1, kb), alpha: Math.min(1, kb * 2) });
}

// ================================================================ S6 you decide what the worker sees and edits
function sPerms(ctx, u, S) {
  chip(ctx, 'Permissions', 500, 360, springU(u, B(59) - 0.2, SPRING.bouncy), { size: 56, ic: 'shield' });
  const kp = springU(u, S.a, SPRING.bouncy);
  K.person(ctx, 500, 640, 1.0, '#FF9F43', kp);
  say(ctx, 'الخدّام', 500, 800, font(52, 900), C.muted, { alpha: Math.min(1, kp) });
  const row = (y, k, drawIcon, label, on) => {
    if (k <= 0.001) return;
    ctx.save(); ctx.globalAlpha = Math.min(1, k * 2);
    M.rrect(ctx, 130, y - 75, 740, 150, 34); ctx.fillStyle = C.panel; ctx.fill();
    ctx.restore();
    drawIcon(780, y);
    say(ctx, label, 690, y + 22, font(64, 1000), C.white, { align: 'right', alpha: Math.min(1, k * 2) });
    toggle(ctx, 260, y, on, Math.min(1, k));
  };
  const k1 = springU(u, B(61) - 0.2, SPRING.bouncy), k2 = springU(u, B(63) - 0.2, SPRING.bouncy);
  row(960, k1, (x, y) => eye(ctx, x, y, 0.9, C.lime), 'يشوف', E.outBack(prog(u, B(61), B(61) + 0.5)));
  row(1150, k2, (x, y) => pencil(ctx, x, y, 0.75, C.muted), 'يبدّل', 1 - E.outBack(prog(u, B(63), B(63) + 0.5)));
  say(ctx, 'خطة Online · 3 أجهزة', 500, 1290, font(40, 600, K.UI), C.muted, { alpha: Math.min(1, springU(u, B(63) + 0.5, SPRING.snappy)) });
}

// ================================================================ S7 the real reports
const REP = [
  { w: 66, r: [873, 88, 134, 112], x: 690, y: 650 }, { w: 67, r: [445, 88, 135, 112], x: 310, y: 650 },
  { w: 68, r: [302, 88, 136, 112], x: 690, y: 960 }, { w: 69, r: [15, 88, 136, 112], x: 310, y: 960 },
];
function sReports(ctx, u, S, IMG) {
  const kh = springU(u, S.a, SPRING.snappy);
  uiCard(ctx, IMG.rep, [700, 6, 308, 66], 500, 380, 2.0, { radius: 18, sy: Math.min(1, kh), alpha: Math.min(1, kh * 2) });
  REP.forEach((r) => {
    const c = K.pull(ctx, u, B(r.w) - 0.2, IMG.rep, r.r, null, r.x, r.y, 2.4);
    if (c) ring(ctx, c.x, c.y, c.w, c.h, prog(u, B(r.w), B(r.w) + 0.5) * (1 - prog(u, B(r.w) + 1.1, B(r.w) + 1.5)), { radius: 20, width: 6 });
  });
  const k8 = K.pull(ctx, u, B(70) - 0.2, IMG.rep, [12, 38, 106, 30], null, 460, 1210, 2.6);
  if (k8) checkBadge(ctx, 690, 1210, 40, springU(u, B(71), SPRING.bouncy));
}

// ================================================================ S8 no internet? Offline
function sOffline(ctx, u, S) {
  const k = springU(u, B(74) - 0.25, SPRING.bouncy);
  if (k > 0.001) {
    ctx.save(); ctx.translate(500, 620); ctx.scale(k, k);
    ctx.beginPath(); ctx.arc(0, 0, 190, 0, M.TAU); ctx.fillStyle = C.panel; ctx.fill();
    ctx.restore();
    icon(ctx, 'wifiOff', 500, 620, 210 * Math.min(1, k), C.white, { width: 1.8 });
  }
  chip(ctx, 'Offline 100%', 500, 900, springU(u, B(78) - 0.2, SPRING.bouncy), { size: 76, ic: 'wifiOff' });
  monitor(ctx, 330, 1110, 200, Math.min(1, springU(u, B(79) - 0.1, SPRING.bouncy)));
  phoneWithMark(ctx, 680, 1110, 92, Math.min(1, springU(u, B(80) - 0.1, SPRING.bouncy)), 0.06);
  chip(ctx, 'Online · Cloud', 500, 1290, springU(u, B(81) + 1.5, SPRING.bouncy), { size: 48, bg: C.panel, fg: C.white, ic: 'cloud' });
}

// ================================================================ S9 recap, S10 CTA
function sRecap(ctx, u, S) {
  K.recap(ctx, u, S.a, ['المحل', 'في', 'جيبك'], ['Dashboard', 'Finance', 'PC + Mobile', 'Permissions', 'Rapports', 'Offline / Online'], 1.5);
}
function sCta(ctx, u, S) {
  K.cta(ctx, u, { start: S.a, tryU: B(82), freeU: B(85), threeU: B(86), daysU: B(87), waU: B(90), chipsU: 117 });
}

// ================================================================ assembly
function build() {
  SCENES = [
    { a: 0, b: 10, f: sHook, tin: 'cut', tout: 'whip' },
    { a: 10, b: 16, f: sNight, tin: 'whip', tout: 'cut' },
    { a: 16, b: 24, f: sDrop, tin: 'cut', tout: 'whip' },
    { a: 24, b: 35, f: sDash, tin: 'whip', tout: 'whip' },
    { a: 35, b: 49.5, f: sFinance, tin: 'whip', tout: 'whip' },
    { a: 49.5, b: 60, f: sDevices, tin: 'whip', tout: 'whip' },
    { a: 60, b: 67.5, f: sPerms, tin: 'whip', tout: 'whip' },
    { a: 67.5, b: 79, f: sReports, tin: 'whip', tout: 'whip' },
    { a: 79, b: 90, f: sOffline, tin: 'whip', tout: 'whip' },
    { a: 90, b: 105, f: sRecap, tin: 'whip', tout: 'cut' },
    { a: 105, b: 130, f: sCta, tin: 'cut', tout: 'cut' },
  ];
  const H_ = (b, l, s, o) => HITS.push([+b.toFixed(3), l, s, o]);
  const notes = ['A5', 'C6', 'D6', 'E6', 'G6', 'A6', 'C7'];
  H_(0.05, 'home panel', 'thud+sub', { gain: 0.6 });
  H_(0.6, 'phone in hand', 'pop', { pitch: 'E5' });
  H_(B(3) - 0.25, 'shop panel', 'thud', { gain: 0.4 });
  H_(B(7) - 0.2, 'broken link', 'click', { gain: 0.25 });
  H_(B(10) - 0.1, '؟', 'thud', { gain: 0.35 });
  SCENES.forEach((s) => { if (s.tin === 'whip') H_(s.a, `whip into ${s.f.name}`, 'whoosh', { len: 0.45, gain: 0.22 }); });
  H_(B(14) - 0.1, 'caisse chip', 'pop', { pitch: 'D5' });
  H_(10.6, 'sales count', 'coins', { gain: 0.18 });
  H_(B(17) - 0.1, 'difference', 'thud+boing', { pitch: 'C4', to: 'G3', gain: 0.4 });
  H_(15.95, 'riser into drop', 'riser', { len: 1.8, gain: 0.3 });
  H_(16, 'drop', 'impact');
  H_(16.3, 'logo', 'bell', { pitch: 'E6' });
  H_(B(23), 'جيبك', 'pop', { pitch: 'G5' });
  H_(B(25) - 0.1, 'sync badge', 'blip', { pitch: 'E6', gain: 0.15 });
  [27, 31, 33].forEach((w, i) => H_(B(w) - 0.2, `dash ${w}`, 'pop', { pitch: notes[i] }));
  FIN.forEach((f, i) => H_(B(f.w) - 0.2, `fin ${f.w}`, 'blip', { pitch: notes[i + 1], gain: 0.15 }));
  H_(B(46) - 0.2, 'today', 'tick', { gain: 0.2 });
  H_(B(48) - 0.2, 'month', 'tick', { gain: 0.2 });
  [50, 53, 55].forEach((w, i) => H_(B(w) - 0.2, `device ${w}`, 'pop', { pitch: notes[i + 2] }));
  H_(B(57) - 0.3, 'sync', 'riser', { len: 0.6, gain: 0.2 });
  H_(B(57) + 0.3, 'sync badge', 'bell', { pitch: 'A6', gain: 0.2 });
  H_(B(59) - 0.2, 'permissions', 'pop', { pitch: 'D5' });
  H_(B(61), 'toggle on', 'click', { gain: 0.3 });
  H_(B(63), 'toggle off', 'click', { gain: 0.3 });
  REP.forEach((r, i) => H_(B(r.w) - 0.2, `report ${r.w}`, 'blip', { pitch: notes[i + 1], gain: 0.15 }));
  H_(B(71), 'reports ready', 'bell', { pitch: 'E6', gain: 0.2 });
  H_(B(74) - 0.25, 'no internet', 'thud', { gain: 0.35 });
  H_(B(78) - 0.2, 'Offline 100%', 'pop+bell', { pitch: 'C6' });
  H_(B(81) + 1.5, 'online cloud', 'pop', { pitch: 'G5' });
  ['', '', '', '', '', ''].forEach((_, i) => H_(90 + 0.9 + i * 1.5, `recap ${i}`, 'blip', { pitch: notes[i], gain: 0.16 }));
  H_(105, 'cta', 'impact', { gain: 0.6 });
  H_(B(86) - 0.1, 'big 3', 'thud', { gain: 0.5 });
  H_(B(90) - 0.15, 'whatsapp', 'pop+bell', { pitch: 'C6' });
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
  images: { dash: '../shared/shots/raw_00.png', fin: '../shared/shots/raw_10.png', rep: '../shared/shots/raw_11.png' },
  hits: HITS,
  samples: 10,
  async init(ctx) {
    await K.preloadFonts();
    WD = await fetch('vo_words.json').then((r) => r.json());
    CAP = K.buildCaptions(ctx, WD, { hide: [0, 2, 9, 10] });
    build();
    window.HITS = HITS;
  },
  draw(ctx, u, t, IMG) {
    const mood = E.inOutCubic(prog(u, 15.8, 16.4));
    let cam = 0;
    SCENES.forEach((s) => { if (s.tin === 'whip') cam += E.inOutCubic(prog(u, s.a - 0.35, s.a + 0.35)) * W; });
    K.background(ctx, u, mood, -cam * 0.4);
    ctx.save();
    if (u < 2) shake(ctx, u, 0.05, 18, 3, 0.25);
    else if (u > 15 && u < 18) shake(ctx, u, 16, 30, 7, 0.22);
    else if (u > 104) shake(ctx, u, 105, 18, 9, 0.2);
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
