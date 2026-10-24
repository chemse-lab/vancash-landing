// VanCash ERP — video 1 «كل تيليفون بالـ IMEI تاعو». 9:16, 60 s, 128 bpm.
// Pure function of time: window.seek(t) paints frame t. Timing is in beats (u) on beats.json; the
// VO phrases were placed on that grid by shared/place_vo.py, and word beats come from vo_words.json.
// Product shots are crops of real VanCash ERP screenshots (shared/shots/); everything else is
// motion graphics drawn in code.
import * as M from '../shared/motion.js';
import * as K from '../shared/engine.js';

const { W, H, E, clamp, lerp, prog, springU, springKeys, SPRING, wobble, shake, U, hash01, noise1 } = M;
const { C, font, say, chip, ring, uiCard, icon, headline, handset, phoneBox, barcode, receipt, checkBadge, logo } = K;

let WD = [], CAP = null;
const B = (i) => U(WD[i].t0);          // beat on which word i is spoken

// ---------------------------------------------------------------- hits (sound on every accent)
// Filled in init() once word beats are known; sfx.mjs reads window.HITS after load.
const HITS = [];

// ---------------------------------------------------------------- scene table
// [a, b) in beats; tin/tout: 'whip' (pan, both shots on screen), 'cut', 'flip'.
let SCENES = [];

// ================================================================ S0 hook: the customer is back
function sHook(ctx, u) {
  // target tag: who this is for (frame 0 already moving)

  // the phone falls onto the counter
  const fall = E.inQuad(prog(u, -1.25, 0.5));
  const cy = lerp(-700, 1010, fall);
  const sq = 0.07 * wobble(u - 0.5, 2.6, 6);
  const glitch = u > B(4) - 0.1;
  handset(ctx, 520, cy, 360, 720, {
    rot: lerp(-0.35, -0.06, fall), sx: 1 + sq, sy: 1 - sq,
    screen: (c, x, y, w, h) => {
      const g = c.createLinearGradient(0, y, 0, y + h);
      g.addColorStop(0, '#101B3D'); g.addColorStop(1, '#070C1C');
      c.fillStyle = g; c.fillRect(x, y, w, h);
      say(c, 'IMEI', 0, y + h * 0.36, font(58, 900), glitch ? C.red : C.muted, { track: 8 });
      const digits = ['356938', '104772', '115'];
      digits.forEach((d, i) => {
        const yy = y + h * 0.47 + i * 70;
        if (glitch) {
          const off = 26 * noise1(Math.floor(u * 6) + i * 3, 9);
          say(c, '? ? ?', off, yy, font(60, 900), C.red);
        } else say(c, d, 0, yy, font(60, 900), C.white, { track: 6 });
      });
      if (glitch) {                                   // slice glitch on the screen
        for (let s = 0; s < 6; s++) {
          const sy0 = y + h * hash01(s + Math.floor(u * 8) * 7, 3), sh = 6 + 20 * hash01(s, 5);
          c.fillStyle = `rgba(255,77,94,${0.25 + 0.3 * hash01(s, 8)})`;
          c.fillRect(x + 30 * noise1(u * 9 + s, 2), sy0, w, sh);
        }
      }
    },
  });

  const kt = springU(u, -0.6, SPRING.bouncy), tOut = E.inBack(prog(u, B(3) - 0.6, B(3)), 1.4);
  chip(ctx, 'لأصحاب محلات الهواتف', 500, 330 - tOut * 300, kt, { size: 54, bg: C.lime, fg: C.ink, ic: 'phone', alpha: 1 - tOut });

  // speech bubble: the customer's words, as they are said
  const kb = springU(u, B(3) - 0.15, SPRING.bouncy);
  if (kb > 0.001) {
    ctx.save();
    ctx.translate(480, 470); ctx.scale(Math.min(1.08, kb), Math.min(1.08, kb)); ctx.rotate(-0.03);
    K.shadow(ctx, 50, 20, 0.5);
    M.rrect(ctx, -400, -150, 800, 280, 70); ctx.fillStyle = C.white; ctx.fill();
    ctx.beginPath(); ctx.moveTo(40, 120); ctx.lineTo(110, 230); ctx.lineTo(150, 110); ctx.fill();
    K.noShadow(ctx);
    ctx.restore();
    const lines = [[{ w: 'ماشي', u: B(4) }, { w: 'هذا', u: B(5) }], [{ w: 'اللي', u: B(6) }, { w: 'بعتهولي!', u: B(7) }]];
    ctx.save(); ctx.translate(480 - (W / 2 - 40), 470 - 20); ctx.translate(0, 0);
    headline(ctx, u, lines, 0, 104, { color: (w) => (w.startsWith('بعت') ? C.red : C.ink) });
    ctx.restore();
  }
}

// ================================================================ S1 «واش راك دير؟»
function sQuestion(ctx, u, S) {
  const k = springU(u, S.a - 0.12, SPRING.wobbly);
  ctx.save();
  ctx.translate(500, 980); ctx.rotate(0.5 * wobble(u - S.a, 1.6, 3)); ctx.scale(k, k);
  say(ctx, '؟', 0, 300, font(900, 1000), C.red);
  ctx.restore();
  headline(ctx, u, [[{ w: 'واش', u: B(8) }, { w: 'راك', u: B(9) }, { w: 'دير', u: B(10) }]], 470, 150);
}

// ================================================================ S2 dozens of boxes, new and used
const BOXES = ['NEUF', 'OCCASION', 'NEUF', 'OCCASION', 'NEUF', 'NEUF', 'OCCASION', 'NEUF', 'OCCASION'];
function sBoxes(ctx, u, S) {
  const neuf = springU(u, B(13), SPRING.snappy), occ = springU(u, B(15), SPRING.snappy);
  BOXES.forEach((lab, i) => {
    const c = i % 3, r = Math.floor(i / 3);
    const ub = S.a + 0.15 + i * 0.42;
    const k = springU(u, ub, SPRING.bouncy);
    if (k <= 0.001) return;
    const x = 230 + c * 270, y = 560 + r * 330;
    const isN = lab === 'NEUF';
    const lift = 34 * (isN ? neuf * (1 - occ) : occ);
    phoneBox(ctx, x, y - (1 - Math.min(1, k)) * 500, 240, 290, lab, isN ? C.mint : '#FFB347',
      { rot: (hash01(i, 4) - 0.5) * 0.12, s: 1, lift });
  });
}

// ================================================================ S3 the notebook
const NOTES = ['A55 · 356938104772115', 'iPhone 13 · 3594110927', 'Redmi 12 · 8674…', 'A15 · ???'];
function sNotebook(ctx, u, S) {
  const crush = E.inBack(prog(u, S.b - 1.1, S.b - 0.05), 1.3);
  const s = 1 - crush * 0.95;
  ctx.save();
  ctx.translate(500, 860); ctx.rotate(-0.05 + crush * 2.2); ctx.scale(s, s);
  K.shadow(ctx, 60, 30, 0.55);
  M.rrect(ctx, -400, -470, 800, 940, 26); ctx.fillStyle = '#FFF7E1'; ctx.fill();
  K.noShadow(ctx);
  ctx.strokeStyle = 'rgba(70,110,200,0.28)'; ctx.lineWidth = 3;
  for (let y = -330; y < 440; y += 90) { ctx.beginPath(); ctx.moveTo(-370, y); ctx.lineTo(370, y); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(255,77,94,0.55)';
  ctx.beginPath(); ctx.moveTo(300, -460); ctx.lineTo(300, 460); ctx.stroke();
  say(ctx, 'كارني', 0, -380, font(64, 900), '#2140A8');
  NOTES.forEach((n, i) => {
    const p = prog(u, S.a + 0.6 + i * 0.9, S.a + 1.3 + i * 0.9);
    if (p <= 0) return;
    const y = -255 + i * 180;
    ctx.save();
    ctx.beginPath(); ctx.rect(-360, y - 70, 720 * p, 100); ctx.clip();
    ctx.transform(1, 0, -0.18, 1, 0, 0);
    say(ctx, n, -340, y, font(50, 600), '#2140A8', { align: 'left' });
    ctx.restore();
    // scribbled out when the VO says it's not even written
    const sp = prog(u, B(21) + i * 0.35, B(21) + 0.5 + i * 0.35);
    if (i >= 1 && sp > 0) {
      ctx.save();
      ctx.strokeStyle = C.red; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let k = 0; k <= 14 * sp; k++) ctx.lineTo(-350 + k * 50, y - 20 + (k % 2 ? -22 : 18));
      ctx.stroke(); ctx.restore();
    }
  });
  ctx.restore();
  // «وين؟» stamp
  const ks = springU(u, B(25), SPRING.bouncy) * (1 - crush);
  if (ks > 0.001) {
    ctx.save(); ctx.translate(560, 1180); ctx.rotate(-0.18); ctx.scale(ks, ks);
    ctx.beginPath(); ctx.arc(0, 0, 150, 0, M.TAU); ctx.lineWidth = 14; ctx.strokeStyle = C.red; ctx.stroke();
    say(ctx, 'وين؟', 0, 40, font(110, 1000), C.red);
    ctx.restore();
  }
}

// ================================================================ S4 the drop: «الحل» + logo
function sReveal(ctx, u, S) {
  const k = springU(u, S.a - 0.12, SPRING.bouncy);
  const up = springU(u, B(27) - 0.3, SPRING.gentle);
  const size = lerp(320, 130, up), y = lerp(860, 520, up);
  const sc = lerp(1.5, 1, Math.min(1, k));
  ctx.save(); ctx.translate(500, y); ctx.scale(sc, sc);
  say(ctx, 'الحل', 0, size * 0.35, font(size, 1000), C.lime, { alpha: Math.min(1, k * 3) });
  ctx.restore();
  logo(ctx, 500, 860, 1.0, B(27) - 0.2, u);
  const kt = springU(u, B(28) + 0.6, SPRING.snappy);
  say(ctx, 'تسيير محلات الهواتف والإكسسوارات', 500, 1060 + (1 - Math.min(1, kt)) * 40, font(46, 600, K.UI), C.muted, { alpha: Math.min(1, kt * 2) });
}

// ================================================================ S5 a phone's ID card
const IDF = ['Marque', 'Modèle', 'IMEI 1', 'IMEI 2', 'Stockage'];
function sIdCard(ctx, u, S) {
  const flipOut = prog(u, S.b - 0.45, S.b);
  const sx = 1 - E.inCubic(flipOut);
  if (sx <= 0.002) return;
  ctx.save();
  ctx.translate(500, 850); ctx.scale(sx, 1);
  K.shadow(ctx, 70, 30, 0.55);
  M.rrect(ctx, -440, -300, 880, 600, 40); ctx.fillStyle = C.white; ctx.fill();
  K.noShadow(ctx);
  ctx.save(); M.rrect(ctx, -440, -300, 880, 600, 40); ctx.clip();
  ctx.fillStyle = C.blue; ctx.fillRect(-440, -300, 880, 120);
  ctx.restore();
  const kt = springU(u, B(32), SPRING.snappy);
  say(ctx, "Carte d'identité", -390, -218, font(60, 900), C.white, { align: 'left', alpha: Math.min(1, kt * 2) });
  icon(ctx, 'phone', 350, -240, 70, C.white, { width: 2 });
  // phone pictogram
  M.rrect(ctx, -400, -140, 240, 400, 30); ctx.fillStyle = '#EAF0FF'; ctx.fill();
  icon(ctx, 'phone', -280, 60, 210, C.blue, { width: 1.4 });
  IDF.forEach((lab, i) => {
    const y = -110 + i * 82;
    say(ctx, lab, -120, y, font(36, 700, K.UI), '#5C6B80', { align: 'left' });
    const p = E.outCubic(prog(u, S.a + 1.4 + i * 0.7, S.a + 2.0 + i * 0.7));
    M.rrect(ctx, -120, y + 14, 520, 20, 10); ctx.fillStyle = '#E2E9F2'; ctx.fill();
    if (p > 0) { M.rrect(ctx, -120, y + 14, 520 * p * (0.55 + 0.4 * hash01(i, 2)), 20, 10); ctx.fillStyle = C.blue; ctx.fill(); }
  });
  ctx.restore();
}

// ================================================================ S6 the real purchase form, field by field
// raw_05: الهواتف › شراء جديد من موّرد. Field rects in source pixels.
const FIELDS = [
  { w: 37, r: [752, 453, 242, 41], lab: 'Marque' },
  { w: 38, r: [517, 453, 226, 41], lab: 'Modèle' },
  { w: 39, r: [325, 453, 183, 41], lab: 'IMEI 1' },
  { w: 42, r: [45, 453, 226, 41], lab: 'IMEI 2' },
  { w: 45, r: [281, 503, 227, 41], lab: 'Stockage' },
  { w: 47, r: [752, 553, 242, 41], lab: "Prix d'achat" },
  { w: 49, r: [517, 553, 226, 41], lab: 'Prix de vente' },
];
const LENS = { x: 50, y: 400, w: 900, h: 820, cx: 500, cy: 800 };
function formCam(u, S) {
  const z0 = Math.log(0.88), z1 = Math.log(2.35);
  const keys = [[S.a, [504, 330, z0]]];
  FIELDS.forEach((f) => keys.push([B(f.w) - 0.35, [f.r[0] + f.r[2] / 2, f.r[1] + f.r[3] / 2, z1]]));
  keys.push([B(51) - 0.2, [520, 520, Math.log(1.3)]]);
  const [fx, fy, lz] = springKeys(u, keys, SPRING.gentle);
  return { fx, fy, z: Math.exp(lz) };
}
function sForm(ctx, u, S, IMG) {
  const flip = E.outBack(prog(u, S.a - 0.1, S.a + 0.4), 1.2);
  if (flip <= 0.002) return;
  const cam = formCam(u, S);
  const toScr = (px, py) => [LENS.cx + (px - cam.fx) * cam.z, LENS.cy + (py - cam.fy) * cam.z];
  ctx.save();
  ctx.translate(LENS.cx, LENS.cy); ctx.scale(flip, 1); ctx.translate(-LENS.cx, -LENS.cy);
  K.shadow(ctx, 70, 30, 0.55);
  M.rrect(ctx, LENS.x, LENS.y, LENS.w, LENS.h, 36); ctx.fillStyle = '#F6F8FC'; ctx.fill();
  K.noShadow(ctx);
  ctx.save();
  M.rrect(ctx, LENS.x, LENS.y, LENS.w, LENS.h, 36); ctx.clip();
  const [x0, y0] = toScr(0, 0);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(IMG.phones, x0, y0, IMG.phones.width * cam.z, IMG.phones.height * cam.z);
  // ring + label on the field being said
  FIELDS.forEach((f, i) => {
    const a = B(f.w) - 0.15, b = i + 1 < FIELDS.length ? B(FIELDS[i + 1].w) - 0.15 : B(51) - 0.2;
    if (u < a || u > b + 0.3) return;
    const [sx, sy] = toScr(f.r[0], f.r[1]);
    const fade = 1 - prog(u, b, b + 0.3);
    ctx.save(); ctx.globalAlpha = fade;
    ring(ctx, sx, sy, f.r[2] * cam.z, f.r[3] * cam.z, prog(u, a, a + 0.6));
    ctx.restore();
  });
  ctx.restore();
  ctx.restore();
  FIELDS.forEach((f, i) => {
    const a = B(f.w) - 0.15, b = i + 1 < FIELDS.length ? B(FIELDS[i + 1].w) - 0.15 : B(51) - 0.2;
    if (u < a || u > b + 0.3) return;
    const [sx, sy] = toScr(f.r[0] + f.r[2] / 2, f.r[1]);
    const k = springU(u, a, SPRING.bouncy) * (1 - prog(u, b, b + 0.3));
    chip(ctx, f.lab, clamp(sx, 260, 740), Math.max(LENS.y + 70, sy - 80), k, { size: 52 });
  });
  // «في ثواني»: a stopwatch sweeps once
  const ks = springU(u, B(51) - 0.1, SPRING.bouncy);
  if (ks > 0.001) {
    const cx = 500, cy = 1110, r = 70;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(ks, ks);
    ctx.beginPath(); ctx.arc(0, 0, r + 22, 0, M.TAU); ctx.fillStyle = C.lime; ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 9; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, 0, r - 12, 0, M.TAU); ctx.stroke();
    const ang = -Math.PI / 2 + M.TAU * E.outCubic(prog(u, B(51), B(51) + 1.5));
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(ang) * (r - 26), Math.sin(ang) * (r - 26)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-14, -r - 8); ctx.lineTo(14, -r - 8); ctx.stroke();
    ctx.restore();
  }
}

// ================================================================ S7 used, trade-in, IMEI history (real tabs)
const TABS = [
  { w: 53, r: [484, 76, 134, 38], lab: 'Occasion', y: 660 },
  { w: 56, r: [395, 76, 77, 38], lab: 'Échange', y: 880 },
  { w: 60, r: [279, 76, 107, 38], lab: 'Historique', y: 1100 },
];
function sTabs(ctx, u, S, IMG) {
  const kb = springU(u, S.a, SPRING.snappy);
  const bar = uiCard(ctx, IMG.phones, [150, 66, 858, 58], 500, 390, 1.04, { radius: 18, alpha: Math.min(1, kb * 2), sy: Math.min(1, kb) });
  TABS.forEach((tb, i) => {
    const a = B(tb.w) - 0.25;
    const k = springU(u, a, SPRING.snappy);
    if (k <= 0.001) return;
    const [fx, fy] = bar.map(tb.r[0] + tb.r[2] / 2, tb.r[1] + tb.r[3] / 2);
    const kk = Math.min(1, k);
    const tx = 610, ty = tb.y;
    const sc = lerp(1.04, 3.3, kk);
    ring(ctx, bar.map(tb.r[0], 0)[0] - 2, bar.map(0, tb.r[1])[1] - 2, tb.r[2] * 1.04 + 4, tb.r[3] * 1.04 + 4, prog(u, a, a + 0.5), { width: 5, radius: 14, grow: 4 });
    const card = uiCard(ctx, IMG.phones, tb.r, lerp(fx, tx, k), lerp(fy, ty, k), sc, { radius: 20, rot: (1 - kk) * 0.1 });
    chip(ctx, tb.lab, tx - (tb.r[2] * 3.3) / 2 - 26, ty, springU(u, a + 0.35, SPRING.bouncy), { size: 52, align: 'right' });
    const done = i < 2 ? B(57) : B(63) - 0.1;
    checkBadge(ctx, tx + (tb.r[2] * 3.3) / 2 + 62, ty, 42, springU(u, done + i * 0.15, SPRING.bouncy));
  });
}

// ================================================================ S8 find anything: IMEI or barcode (real list)
function sSearch(ctx, u, S, IMG) {
  const k0 = springU(u, S.a, SPRING.snappy);
  uiCard(ctx, IMG.prod, [655, 4, 353, 56], 500, 380, 1.55, { radius: 18, alpha: Math.min(1, k0 * 2) });
  const sb = uiCard(ctx, IMG.prod, [715, 180, 293, 56], 500, 600, 3.0, { radius: 24, sy: Math.min(1, springU(u, S.a + 0.2, SPRING.bouncy)) });
  ring(ctx, sb.x, sb.y, sb.w, sb.h, prog(u, B(66) - 0.2, B(66) + 0.5), { radius: 22 });
  chip(ctx, 'IMEI', 190, 735, springU(u, B(66) - 0.1, SPRING.bouncy), { size: 50, ic: 'scan' });
  // the real result row: name, barcode, price
  const kn = springU(u, B(68) - 0.2, SPRING.bouncy);
  uiCard(ctx, IMG.prod, [790, 305, 218, 55], 620, 860, 3.0, { radius: 22, sx: Math.min(1, kn), sy: Math.min(1, kn), alpha: Math.min(1, kn * 2) });
  const kc = springU(u, B(70) - 0.2, SPRING.bouncy);
  if (kc > 0.001) {
    const laser = prog(u, B(70), B(70) + 1.2);
    ctx.save(); ctx.translate(250, 1080); ctx.scale(Math.min(1, kc), Math.min(1, kc));
    barcode(ctx, 0, 0, 240, 150, 7, laser > 0 && laser < 1 ? (Math.sin(laser * Math.PI * 2) + 1) / 2 : -1);
    ctx.restore();
    const bc = uiCard(ctx, IMG.prod, [478, 305, 125, 55], 700, 1080, 3.0, { radius: 22, sx: Math.min(1, kc), sy: Math.min(1, kc) });
    ring(ctx, bc.x, bc.y, bc.w, bc.h, prog(u, B(70) + 0.3, B(70) + 0.9), { radius: 20 });
  }
  const kf = springU(u, B(71) - 0.1, SPRING.bouncy);
  uiCard(ctx, IMG.prod, [288, 305, 80, 55], 175, 860, 2.6, { radius: 22, sx: Math.min(1, kf), sy: Math.min(1, kf), alpha: Math.min(1, kf * 2) });
  checkBadge(ctx, 880, 770, 44, kf);
}

// ================================================================ S9 a sale, step by step (real POS)
const NODES = [
  { w: 74, r: [580, 8, 132, 50], y: 420, x: 500, s: 2.7 },
  { w: 76, r: [272, 18, 112, 44], y: 590, x: 500, s: 2.7 },
  { w: 77, r: [118, 20, 154, 42], y: 750, x: 500, s: 2.7 },
  { w: 78, r: [195, 541, 178, 55], y: 910, x: 715, s: 2.2, lab: 'Cash' },
  { w: 80, r: [11, 541, 179, 55], y: 910, x: 285, s: 2.2, lab: 'Crédit' },
];
function sPos(ctx, u, S, IMG) {
  // establishing: the whole POS screen, then its parts are pulled out of it
  const kin = springU(u, S.a, SPRING.snappy);
  const shrink = E.inOutCubic(prog(u, B(74) - 0.8, B(74) + 0.2));
  const full = uiCard(ctx, IMG.pos, [0, 0, 1008, 648], 500, lerp(820, 820, shrink), lerp(0.9, 0.9, shrink),
    { radius: 26, alpha: (1 - shrink) * Math.min(1, kin * 2), sy: Math.min(1, kin) });
  NODES.forEach((n, i) => {
    const a = B(n.w) - 0.2;
    const k = springU(u, a, SPRING.snappy);
    if (k <= 0.001) return;
    const [fx, fy] = full.map(n.r[0] + n.r[2] / 2, n.r[1] + n.r[3] / 2);
    const kk = Math.min(1, k);
    uiCard(ctx, IMG.pos, n.r, lerp(fx, n.x, k), lerp(fy, n.y, k), lerp(0.9, n.s, kk), { radius: 22 });
    if (n.lab) chip(ctx, n.lab, n.x, n.y + 100, springU(u, a + 0.3, SPRING.bouncy), { size: 40 });
    // connector from the previous node
    if (i > 0 && i < 4) {
      const p = E.outCubic(prog(u, a - 0.1, a + 0.4));
      const y0 = NODES[i - 1].y + 62, y1 = n.y - 62;
      ctx.save(); ctx.strokeStyle = C.lime; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.setLineDash([2, 16]);
      ctx.beginPath(); ctx.moveTo(500, y0); ctx.lineTo(500, lerp(y0, y1, p)); ctx.stroke(); ctx.restore();
    }
  });
  // scan beam on the scan button
  const sp = prog(u, B(74), B(74) + 1.4);
  if (sp > 0 && sp < 1) icon(ctx, 'scan', 810, 420, 90 * (1 + 0.15 * Math.sin(sp * 18)), C.lime, { width: 2.2 });
  // the invoice prints
  const pr = E.outCubic(prog(u, B(84) - 0.6, B(84) + 0.9));
  if (pr > 0) {
    ctx.save(); ctx.translate(500, 1046);
    M.rrect(ctx, -220, -18, 440, 32, 16); ctx.fillStyle = C.panel; ctx.fill();
    ctx.restore();
    receipt(ctx, 500, 1050, 380, 240, pr);
  }
}

// ================================================================ S10 the dashboard (real)
const KPI = [
  { r: [770, 100, 238, 122], x: 715, y: 700 }, { r: [518, 100, 239, 122], x: 285, y: 700 },
  { r: [266, 100, 239, 122], x: 715, y: 960 }, { r: [15, 100, 238, 122], x: 285, y: 960 },
];
function sDash(ctx, u, S, IMG) {
  const kh = springU(u, S.a, SPRING.snappy);
  uiCard(ctx, IMG.dash, [15, 4, 985, 86], 500, 430, 0.92, { radius: 18, sy: Math.min(1, kh), alpha: Math.min(1, kh * 2) });
  KPI.forEach((c, i) => {
    const k = springU(u, B(89) - 0.3 + i * 0.35, SPRING.bouncy);
    const card = uiCard(ctx, IMG.dash, c.r, c.x, c.y, 1.72, { radius: 22, sx: Math.min(1, k), sy: Math.min(1, k), alpha: Math.min(1, k * 2) });
    const hi = i === 0 ? B(92) : i === 3 ? B(94) : -1;
    if (hi > 0) ring(ctx, card.x, card.y, card.w, card.h, prog(u, hi - 0.2, hi + 0.5), { radius: 24 });
  });
}

// ================================================================ S11 recap
const RECAP = ['IMEI 1 & 2', 'Neuf & Occasion', 'Échange', 'Code-barre', 'Facture'];
function sRecap(ctx, u, S) {
  const kp = springU(u, S.a, SPRING.snappy);
  ctx.save(); ctx.globalAlpha = Math.min(1, kp * 2);
  M.rrect(ctx, 90, 520 + (1 - Math.min(1, kp)) * 120, 820, 780, 44); ctx.fillStyle = 'rgba(19,40,79,0.82)'; ctx.fill();
  ctx.restore();
  headline(ctx, u, [[{ w: 'كلش', u: S.a + 0.1 }, { w: 'في', u: S.a + 0.3 }, { w: 'بلاصة', u: S.a + 0.5 }, { w: 'وحدة', u: S.a + 0.7 }]], 400, 92);
  RECAP.forEach((r, i) => {
    const a = S.a + 0.8 + i * 0.75;
    const k = springU(u, a, SPRING.snappy);
    if (k <= 0.001) return;
    const y = 650 + i * 140;
    const f = font(70, 900), tw = K.measure(ctx, r, f), x1 = 500 + (tw + 110) / 2;
    checkBadge(ctx, x1 - 40, y, 40, springU(u, a + 0.1, SPRING.bouncy));
    say(ctx, r, x1 - 110 + (1 - Math.min(1, k)) * 60, y + 24, f, C.white, { align: 'right', alpha: Math.min(1, k * 2) });
  });
}

// ================================================================ S12 call to action
function sCta(ctx, u, S) {
  logo(ctx, 500, 330, 0.55, S.a - 0.15, u);
  headline(ctx, u, [[{ w: 'جرّب', u: B(95) }, { w: 'مجانًا', u: B(98) }]], 540, 140, { color: (w) => (w === 'مجانًا' ? C.lime : C.white) });
  const k3 = springU(u, B(99) - 0.1, SPRING.bouncy);
  if (k3 > 0.001) {
    ctx.save(); ctx.translate(650, 880); ctx.scale(k3, k3); ctx.rotate(0.06 * wobble(u - B(99), 1.5, 3));
    say(ctx, '3', 0, 190, font(560, 1000), C.lime);
    ctx.restore();
    say(ctx, 'أيام', 330, 930, font(150, 1000), C.white, { alpha: Math.min(1, springU(u, B(100) - 0.1, SPRING.snappy) * 2) });
  }
  const kw = springU(u, B(103) - 0.15, SPRING.bouncy);
  if (kw > 0.001) {
    const pulse = 1 + 0.04 * Math.max(0, Math.sin((u - B(104)) * Math.PI)) * (u > B(104) ? 1 : 0);
    ctx.save(); ctx.translate(500, 1190); ctx.scale(kw * pulse, kw * pulse);
    K.shadow(ctx, 40, 16, 0.5);
    M.rrect(ctx, -380, -70, 760, 140, 70); ctx.fillStyle = C.wa; ctx.fill();
    K.noShadow(ctx);
    icon(ctx, 'chat', 290, 0, 84, C.white, { width: 2.2 });
    icon(ctx, 'call', 290, 0, 84, C.white, { width: 2.2 });
    say(ctx, '0655 97 00 64', -50, 26, font(72, 900), C.white, { track: 2 });
    ctx.restore();
  }
  if (u > B(104)) {
    const ph = (u - B(104)) % 2 / 2;
    ctx.save(); ctx.globalAlpha = (1 - ph) * 0.8; ctx.strokeStyle = C.wa; ctx.lineWidth = 6;
    const g = 30 * E.outCubic(ph);
    M.rrect(ctx, 500 - 380 - g, 1190 - 70 - g, 760 + 2 * g, 140 + 2 * g, 70 + g); ctx.stroke(); ctx.restore();
  }
  chip(ctx, 'Offline', 300, 1430, springU(u, 117, SPRING.bouncy), { size: 44, bg: C.panel, fg: C.white, ic: 'wifiOff' });
  chip(ctx, 'Online', 700, 1430, springU(u, 118, SPRING.bouncy), { size: 44, bg: C.panel, fg: C.white, ic: 'cloud' });
  say(ctx, 'mobileposdz.com', 500, 1320, font(40, 700, K.UI), C.muted, { alpha: Math.min(1, springU(u, B(104), SPRING.snappy) * 2) });
}

// ================================================================ assembly
function build() {
  SCENES = [
    { a: 0, b: 8.25, f: sHook, tin: 'cut', tout: 'cut' },
    { a: 8.25, b: 10.25, f: sQuestion, tin: 'cut', tout: 'whip' },
    { a: 10.25, b: 16, f: sBoxes, tin: 'whip', tout: 'whip' },
    { a: 16, b: 24, f: sNotebook, tin: 'whip', tout: 'cut' },
    { a: 24, b: 29.25, f: sReveal, tin: 'cut', tout: 'whip' },
    { a: 29.25, b: 35, f: sIdCard, tin: 'whip', tout: 'flip' },
    { a: 35, b: 54, f: sForm, tin: 'flip', tout: 'whip' },
    { a: 54, b: 67, f: sTabs, tin: 'whip', tout: 'whip' },
    { a: 67, b: 77, f: sSearch, tin: 'whip', tout: 'whip' },
    { a: 77, b: 91, f: sPos, tin: 'whip', tout: 'whip' },
    { a: 91, b: 99, f: sDash, tin: 'whip', tout: 'whip' },
    { a: 99, b: 105, f: sRecap, tin: 'whip', tout: 'cut' },
    { a: 105, b: 130, f: sCta, tin: 'cut', tout: 'cut' },
  ];
  const H_ = (b, l, s, o) => HITS.push([+b.toFixed(3), l, s, o]);
  H_(0.5, 'phone lands', 'thud+sub', { gain: 0.8 });
  H_(B(3) - 0.15, 'speech bubble', 'pop', { pitch: 'E5' });
  H_(B(4) - 0.1, 'screen glitch', 'click', { gain: 0.25 });
  H_(8.25, '؟ slams', 'thud+crash', { gain: 0.7, len: 0.8 });
  SCENES.forEach((s) => { if (s.tin === 'whip') H_(s.a, `whip into ${s.f.name}`, 'whoosh', { len: 0.45, gain: 0.22 }); });
  BOXES.forEach((_, i) => H_(10.25 + 0.15 + i * 0.42 + 0.3, `box ${i}`, 'thud', { gain: 0.18, pitch: 120, to: 60 }));
  H_(B(13), 'NEUF lifts', 'blip', { pitch: 'C6' });
  H_(B(15), 'OCCASION lifts', 'blip', { pitch: 'G5' });
  NOTES.forEach((_, i) => H_(16 + 0.6 + i * 0.9, `note ${i}`, 'type', { len: 0.32, gain: 0.16 }));
  H_(B(21), 'scribbles', 'click', { gain: 0.22 });
  H_(B(25), 'وين stamp', 'thud', { gain: 0.4 });
  H_(24, 'drop', 'impact');
  H_(23.95, 'riser into drop', 'riser', { len: 1.8, gain: 0.3 });
  H_(B(27) - 0.2, 'logo', 'bell', { pitch: 'E6' });
  H_(B(32), 'carte title', 'pop', { pitch: 'A5' });
  IDF.forEach((_, i) => H_(29.25 + 1.4 + i * 0.7, `id field ${i}`, 'tick', { gain: 0.14 }));
  H_(35, 'flip to real form', 'whoosh', { len: 0.35, gain: 0.2 });
  const notes = ['A5', 'C6', 'D6', 'E6', 'G6', 'A6', 'C7'];
  FIELDS.forEach((f, i) => H_(B(f.w) - 0.15, `field ${f.lab}`, 'blip', { pitch: notes[i], gain: 0.14 }));
  H_(B(51) - 0.1, 'stopwatch', 'bell', { pitch: 'A6', gain: 0.22 });
  TABS.forEach((tb) => H_(B(tb.w) - 0.25, `tab ${tb.lab}`, 'pop', { pitch: 'D5' }));
  H_(B(57), 'checks', 'bell', { pitch: 'E6', gain: 0.2 });
  H_(B(66) - 0.2, 'search ring', 'blip', { pitch: 'E6', gain: 0.14 });
  H_(B(68) - 0.2, 'result row', 'pop', { pitch: 'C5' });
  H_(B(70) + 0.25, 'barcode beep', 'blip', { pitch: 'B6', gain: 0.3, len: 0.12 });
  H_(B(71) - 0.1, 'found', 'bell', { pitch: 'E6', gain: 0.22 });
  NODES.forEach((n) => H_(B(n.w) - 0.2, `pos node ${n.w}`, 'pop', { pitch: 'D5' }));
  H_(B(84) - 0.6, 'invoice prints', 'type', { len: 0.9, gain: 0.2 });
  H_(B(84) + 0.4, 'invoice done', 'bell', { pitch: 'G6' });
  KPI.forEach((_, i) => H_(B(89) - 0.3 + i * 0.35, `kpi ${i}`, 'tick', { gain: 0.18 }));
  RECAP.forEach((_, i) => H_(99 + 0.9 + i * 0.75, `recap ${i}`, 'blip', { pitch: notes[i + 1], gain: 0.16 }));
  H_(105, 'cta', 'impact', { gain: 0.6 });
  H_(B(99) - 0.1, 'big 3', 'thud', { gain: 0.5 });
  H_(B(103) - 0.15, 'whatsapp', 'pop+bell', { pitch: 'C6' });
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
function visible(s, u) {
  const lo = s.a - (s.tin === 'whip' ? 0.35 : 0), hi = s.b + (s.tout === 'whip' ? 0.35 : 0);
  return u >= lo && u < hi;
}

M.film({
  fonts: [font(100, 1000), font(100, 900), font(40, 600, K.UI), font(40, 700, K.UI)],
  images: { phones: '../shared/shots/raw_05.png', pos: '../shared/shots/raw_06.png', prod: '../shared/shots/raw_03.png', dash: '../shared/shots/raw_00.png' },
  hits: HITS,
  samples: 10,
  async init(ctx) {
    await K.preloadFonts();
    WD = await fetch('vo_words.json').then((r) => r.json());
    CAP = K.buildCaptions(ctx, WD, { hide: [1, 5, 13, 14] });
    CAP.chunks = CAP.chunks.filter((c) => !c.words.some((w) => ['ماشي', 'هذا', 'اللي', 'بعتهولي!'].includes(w.raw) && c.p === 0));
    build();
    window.HITS = HITS;
  },
  draw(ctx, u, t, IMG) {
    const mood = E.inOutCubic(prog(u, 23.8, 24.4));
    let cam = 0;
    SCENES.forEach((s) => { if (s.tin === 'whip') cam += E.inOutCubic(prog(u, s.a - 0.35, s.a + 0.35)) * W; });
    K.background(ctx, u, mood, -cam * 0.4);
    ctx.save();
    if (u < 2) shake(ctx, u, 0.5, 26, 3, 0.25);
    else if (u < 9) shake(ctx, u, 8.25, 22, 5, 0.2);
    else if (u < 26) shake(ctx, u, 24, 30, 7, 0.22);
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
