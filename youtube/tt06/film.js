// VanCash ERP · TikTok 6: بيع هاتف في 4 خطوات (1080x1920, ~60 s). A pure function of time.
// The voice drives the cut; every element enters on the word that names it. Captions: shorts/kit9.js.
// s02-s05 are one continuous scene: a 4-step tracker stays put while each step's card slides in.
// Names, IMEIs and amounts on drawn cards are examples.
import * as K from '../shorts/kit9.js';

const {
  C, F, UI, S, E, prog, clamp, springU, SPRING, rrect, text, ltr, reveal, card, pop, enter, icon, badge,
  bg, cue, at, XR, XL, CW, CX, TOP, brand, kick, title, row, rows, stamp, xmark, strike, pill, pillW, exampleTag,
  money, ctaScene, short,
} = K;
const TAG = 'نقطة البيع';

// s01 · A sale isn't one button: product, price, customer, amount paid, invoice. Four steps.
const PARTS = [['box', 'منتج', 'منتج'], ['tag', 'سعر', 'وسعر'], ['user', 'زبون', 'وزبون'], ['cash', 'مبلغ مقبوض', 'ومبلغ'], ['receipt', 'فاتورة', 'وفاتورة']];
function hook(ctx, u) {
  bg(ctx, 'paper'); brand(ctx, u, TAG);
  const s = 's01';
  title(ctx, u, 'البيع ليس', 520, -0.5, { size: 120 });
  title(ctx, u, 'ضغطة زر فقط', 670, -0.1, { size: 120, color: C.accent, mark: [0, 1, at(s, 'ضغطة')] });
  // the one button, pressed, then crossed out
  const tOut = at(s, 'منتج') - 0.3, kOut = springU(u, tOut, SPRING.snappy);
  if (kOut < 0.99) {
    ctx.save(); ctx.globalAlpha *= 1 - kOut;
    const press = 1 - 0.06 * Math.max(0, Math.sin(Math.min(u, at(s, 'زر')) * Math.PI));
    ctx.translate(CX, 880); ctx.scale(press * (1 - kOut * 0.3), press * (1 - kOut * 0.3)); ctx.translate(-CX, -880);
    rrect(ctx, CX - 260, 810, 520, 140, 70); ctx.fillStyle = C.green; ctx.fill();
    text(ctx, 'إتمام البيع', CX, 902, F(60, 900), C.white, 'center');
    ctx.restore();
    xmark(ctx, springU(u, at(s, 'فقط'), SPRING.bouncy) * (1 - kOut), CX + 260, 820, 40);
  }
  // what a sale really is: five parts, wrapped right to left
  const f = F(46, 900), h = 96, gx = 22, gy = 24;
  let xr = XR, y = 790;
  PARTS.forEach(([ico, lab, word]) => {
    const wd = pillW(ctx, lab, f, h, ico, 30);
    if (xr - wd < XL) { xr = XR; y += h + gy; }
    const k = springU(u, at(s, word) - 0.15, SPRING.bouncy), x = xr;
    pop(ctx, k, x - wd / 2, y + h / 2, () => pill(ctx, x, y, h, lab, f, { bg: C.white, fg: C.ink, ico, stroke: C.line, pad: 30 }), { from: 0.4, rise: 24 });
    xr -= wd + gx;
  });
  // = four steps that keep every sale matching
  const k4 = springU(u, at(s, 'أربع') - 0.15, SPRING.bouncy);
  pop(ctx, k4, CX, 1180, () => {
    rrect(ctx, XL, 1110, CW, 140, 32); ctx.fillStyle = C.ink; ctx.fill();
    text(ctx, '4 خطوات = عملية مطابقة', CX, 1202, F(60, 900), C.lime, 'center');
  }, { from: 0.5 });
}

// s02-s05 · The tracker and the four step cards.
const STEPS = [
  { sid: 's02', word: 'واحد', lab: 'المنتج' },
  { sid: 's03', word: 'اثنان', lab: 'السعر والزبون' },
  { sid: 's04', word: 'ثلاثة', lab: 'المقبوض' },
  { sid: 's05', word: 'أربعة', lab: 'التحقّق' },
];
const sx = (i) => XR - 70 - i * ((CW - 140) / 3);
function tracker(ctx, u) {
  const Y = 440;
  const on = STEPS.map((st) => at(st.sid, st.word) - 0.2);
  // the rail, filling as the steps are reached
  ctx.fillStyle = C.line; ctx.fillRect(sx(3), Y - 4, sx(0) - sx(3), 8);
  STEPS.forEach((_, i) => {
    if (i === 0) return;
    const p = E.outCubic(prog(u, on[i] - 0.6, on[i]));
    if (p > 0) { ctx.fillStyle = C.green; ctx.fillRect(sx(i - 1) - (sx(i - 1) - sx(i)) * p, Y - 4, (sx(i - 1) - sx(i)) * p, 8); }
  });
  STEPS.forEach((st, i) => {
    const x = sx(i), active = u >= on[i], done = i < 3 && u >= on[i + 1] - 0.3;
    const k = springU(u, on[i], SPRING.bouncy);
    const r = 40 * (1 + 0.18 * Math.sin(clamp(k) * Math.PI));
    ctx.beginPath(); ctx.arc(x, Y, r, 0, Math.PI * 2);
    ctx.fillStyle = done ? C.green : active ? C.accent : C.white; ctx.fill();
    if (!active) { ctx.strokeStyle = C.line; ctx.lineWidth = 4; ctx.stroke(); }
    if (done) icon(ctx, 'check', x, Y, 40, C.white, { lw: 3.2 });
    else ltr(ctx, String(i + 1), x, Y + 17, F(46, 900, UI), active ? C.white : C.muted, 'center');
    text(ctx, st.lab, x, Y + 92, F(30, 800, UI), active ? C.ink : C.muted, 'center');
  });
}
// A step card that slides in from the left (the next step, in Arabic) and out to the right.
function slide(ctx, u, i, fn) {
  const kIn = springU(u, S.SEC[STEPS[i].sid].beat - 0.5, SPRING.snappy);
  const kOut = i < 3 ? springU(u, S.SEC[STEPS[i + 1].sid].beat - 0.7, SPRING.snappy) : 0;
  if (kIn <= 0.002 || kOut >= 0.998) return;
  ctx.save(); ctx.globalAlpha *= clamp(kIn * 1.5) * (1 - kOut);
  ctx.translate(-(1 - kIn) * 260 + kOut * 260, 0);
  fn();
  ctx.restore();
}
const MODELS = [['Galaxy A15', '…3187'], ['Galaxy A15', '…3194'], ['Galaxy A15', '…3202']];
function steps(ctx, u) {
  bg(ctx, 'paper'); brand(ctx, u, TAG);
  tracker(ctx, u);
  // 1 · the right product; a phone by its IMEI, not just its model
  slide(ctx, u, 0, () => {
    const s = 's02';
    title(ctx, u, 'اختر المنتج الصحيح', 670, S.SEC[s].beat - 0.2, { size: 84, mark: [2, 2, at(s, 'الصحيح')] });
    const tI = at(s, 'آي') - 0.15;
    MODELS.forEach(([m, imei], j) => {
      const y = 730 + j * 128, k = springU(u, at(s, 'والهاتف') - 0.2 + j * 0.12, SPRING.snappy);
      const sel = j === 0 ? clamp(prog(u, tI, tI + 0.3)) : 0;
      enter(ctx, k, () => {
        card(ctx, XL, y, CW, 108, 24, sel > 0.5 ? C.accent : C.white, { stroke: sel > 0.5 ? C.accent : C.line, shade: 0.1 });
        icon(ctx, 'phone', XR - 50, y + 54, 46, sel > 0.5 ? C.white : C.accent, { lw: 2 });
        ltr(ctx, m, XR - 90, y + 70, F(44, 800, UI), sel > 0.5 ? C.white : C.ink, 'right');
        ltr(ctx, 'IMEI ' + imei, XL + 36, y + 70, F(40, 900, UI), sel > 0.5 ? C.lime : C.muted, 'left');
      }, { dy: 40 });
    });
    stamp(ctx, springU(u, tI + 0.3, SPRING.bouncy), XL + 20, 740, 30);
    strike(ctx, u, 'بالموديل فقط', XR, 1180, 58, at(s, 'لا') - 0.15);
    xmark(ctx, springU(u, at(s, 'لا') + 0.6, SPRING.bouncy), XL + 60, 1160, 34);
  });
  // 2 · check the price and the customer before completing, above all on credit
  slide(ctx, u, 1, () => {
    const s = 's03';
    title(ctx, u, 'راجع قبل الإتمام', 670, S.SEC[s].beat - 0.2, { size: 92, mark: [0, 0, at(s, 'راجع')] });
    rows(ctx, u, [
      { at: at(s, 'السعر'), ico: 'tag', label: 'السعر', value: '75,000 دج' },
      { at: at(s, 'والزبون'), ico: 'user', label: 'الزبون', value: 'كريم ب.' },
    ], 730, 170, 24);
    [0, 1].forEach((j) => stamp(ctx, springU(u, at(s, 'قبل') + j * 0.15, SPRING.bouncy), XL + 20, 740 + j * 194, 28));
    const kC = springU(u, at(s, 'بالكريدي') - 0.15, SPRING.bouncy);
    pop(ctx, kC, CX, 1180, () => {
      const f = F(48, 900), str = 'خاصة إذا كان بالكريدي', wd = pillW(ctx, str, f, 96, 'alert', 32);
      pill(ctx, CX + wd / 2, 1132, 96, str, f, { bg: C.redWash, fg: C.red, ico: 'alert', stroke: '#f3c2bd', pad: 32 });
    }, { from: 0.5 });
  });
  // 3 · record what was actually paid, cash or credit
  slide(ctx, u, 2, () => {
    const s = 's04';
    title(ctx, u, 'سجّل المقبوض فعلًا', 670, S.SEC[s].beat - 0.2, { size: 92, mark: [2, 2, at(s, 'فعلًا') + 0.2] });
    card(ctx, XL, 730, CW, 250, 32, C.white, { stroke: C.line, shade: 0.14 });
    text(ctx, 'طريقة الدفع', XR - 40, 800, F(40, 700, UI), C.muted);
    [['نقدًا', 'نقدًا', 'cash'], ['كريدي', 'كريدي', 'user']].forEach(([lab, word, ico], j) => {
      const t = at(s, word), sel = clamp(prog(u, t - 0.15, t + 0.1)) * (j === 0 ? 1 - clamp(prog(u, at(s, 'كريدي') - 0.15, at(s, 'كريدي') + 0.1)) : 1);
      const x0 = XR - 40 - j * 410, f = F(48, 900);
      rrect(ctx, x0 - 390, 840, 390, 104, 26);
      ctx.fillStyle = K.M.mix(C.wash, j === 0 ? C.green : C.accent, sel); ctx.fill();
      icon(ctx, ico, x0 - 52, 892, 44, K.M.mix(C.accent, C.white, sel), { lw: 2.2 });
      text(ctx, lab, x0 - 100, 910, f, K.M.mix(C.ink, C.white, sel));
    });
    const kA = springU(u, at(s, 'المقبوض') - 0.1, SPRING.snappy);
    enter(ctx, kA, () => {
      card(ctx, XL, 1010, CW, 210, 32, C.white, { stroke: C.line, shade: 0.14 });
      text(ctx, 'المبلغ المقبوض', XR - 40, 1080, F(40, 700, UI), C.muted);
      money(ctx, 75000, XL + 380, 1170, 80, C.green, { k: clamp(prog(u, at(s, 'المقبوض'), at(s, 'فعلًا') + 0.8)) });
      exampleTag(ctx, XL + 30, 1040);
    }, { dy: 50 });
  });
  // 4 · after the sale, check the invoice, the stock movement and the customer's balance
  slide(ctx, u, 3, () => {
    const s = 's05';
    title(ctx, u, 'تحقّق بعد البيع', 670, S.SEC[s].beat - 0.2, { size: 92, mark: [0, 0, at(s, 'تحقّق')] });
    rows(ctx, u, [
      { at: at(s, 'الفاتورة'), ico: 'receipt', label: 'الفاتورة', tone: 'good' },
      { at: at(s, 'وحركة'), ico: 'box', label: 'حركة المخزون', tone: 'good' },
      { at: at(s, 'ورصيد'), ico: 'user', label: 'رصيد الزبون', tone: 'good' },
    ], 730, 156, 26);
  });
}

// s06 · The invoice is ready to print, with a QR code in the Online version.
function qr(ctx, x, y, s, seed = 7) {
  const n = 21, m = s / n;
  ctx.fillStyle = C.white; ctx.fillRect(x, y, s, s);
  let r = seed;
  const rnd = () => ((r = (r * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  ctx.fillStyle = C.ink;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const fin = (i < 8 && j < 8) || (i < 8 && j > n - 9) || (i > n - 9 && j < 8);
    if (!fin && rnd() > 0.52) ctx.fillRect(x + j * m, y + i * m, m + 0.5, m + 0.5);
  }
  [[0, 0], [0, n - 7], [n - 7, 0]].forEach(([i, j]) => {
    ctx.fillRect(x + j * m, y + i * m, 7 * m, 7 * m);
    ctx.fillStyle = C.white; ctx.fillRect(x + (j + 1) * m, y + (i + 1) * m, 5 * m, 5 * m);
    ctx.fillStyle = C.ink; ctx.fillRect(x + (j + 2) * m, y + (i + 2) * m, 3 * m, 3 * m);
  });
}
function invoice(ctx, u) {
  bg(ctx, 'mint'); brand(ctx, u, TAG);
  const s = 's06';
  title(ctx, u, 'جاهزة للطباعة', 480, [at(s, 'جاهزة') - 0.15, at(s, 'للطباعة') - 0.15], { size: 100, mark: [1, 1, at(s, 'للطباعة') + 0.3] });
  // the printer and the receipt coming out of it
  const RX = CX - 220, RW = 440, RY = 590, RH = 690;
  rrect(ctx, RX - 50, 540, RW + 100, 70, 26); ctx.fillStyle = C.ink; ctx.fill();
  ctx.fillStyle = '#000'; ctx.fillRect(RX - 10, 584, RW + 20, 8);
  const p = E.outCubic(prog(u, S.SEC[s].beat - 0.4, at(s, 'للطباعة') + 1.2));
  ctx.save(); ctx.beginPath(); ctx.rect(RX - 40, 590, RW + 80, RH + 40); ctx.clip();
  ctx.translate(0, -(1 - p) * RH);
  K.shadow(ctx, RX, RY, RW, RH, 8, 0.18);
  ctx.beginPath(); ctx.moveTo(RX, RY); ctx.lineTo(RX + RW, RY); ctx.lineTo(RX + RW, RY + RH);
  for (let i = 0; i < 13; i++) ctx.lineTo(RX + RW - (i + 0.5) * (RW / 13), RY + RH + (i % 2 ? 0 : 16)), ctx.lineTo(RX + RW - (i + 1) * (RW / 13), RY + RH);
  ctx.closePath(); ctx.fillStyle = C.white; ctx.fill();
  ltr(ctx, 'VanCash ERP', RX + RW / 2, RY + 70, F(40, 900), C.accent, 'center');
  text(ctx, 'فاتورة رقم 1042', RX + RW / 2, RY + 118, F(30, 700, UI), C.muted, 'center');
  ctx.fillStyle = C.line; ctx.fillRect(RX + 30, RY + 146, RW - 60, 2);
  [['Galaxy A15', '75,000'], ['IMEI …3187', ''], ['المجموع', '75,000'], ['المقبوض', '75,000']].forEach(([a, b], i) => {
    const y = RY + 200 + i * 56, bold = i >= 2;
    if (/^[A-Z]/.test(a)) ltr(ctx, a, RX + RW - 36, y, F(30, bold ? 900 : 700, UI), i === 1 ? C.muted : C.ink, 'right');
    else text(ctx, a, RX + RW - 36, y, F(32, 900, UI), C.ink);
    if (b) ltr(ctx, b, RX + 36, y, F(32, bold ? 900 : 700, UI), C.ink, 'left');
    if (i === 1) { ctx.fillStyle = C.line; ctx.fillRect(RX + 30, y + 24, RW - 60, 2); }
  });
  qr(ctx, RX + RW / 2 - 110, RY + 430, 220);
  ctx.restore();
  exampleTag(ctx, RX + RW + 20, 640);
  // QR code: the Online version
  const kQ = springU(u, at(s, 'كيو') - 0.15, SPRING.bouncy);
  pop(ctx, kQ, XL + 80, 1130, () => {
    ctx.beginPath(); ctx.arc(XL + 80, 1130, 66, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
    icon(ctx, 'qr', XL + 80, 1130, 64, C.lime, { lw: 2.2 });
  }, { from: 0.3 });
  const kO = springU(u, at(s, 'أونلاين') - 0.15, SPRING.bouncy);
  pop(ctx, kO, XR - 100, 1130, () => {
    const f = F(40, 900), str = 'Online', wd = pillW(ctx, str, f, 88, 'cloud', 26);
    pill(ctx, XR, 1086, 88, str, f, { bg: C.accent, fg: C.white, ico: 'cloud', pad: 26 });
  }, { from: 0.4 });
}

const cta = ctaScene({ sid: 's07' });

short({
  n: 6,
  scenes: [hook, steps, steps, steps, steps, invoice, cta, cta],
  hits: (H_) => {
    H_(K.at('s01', 'فقط'), 'not one button', 'thud', { gain: 0.35 });
    PARTS.forEach(([, , word]) => H_(K.at('s01', word) - 0.15, word, 'pop', { gain: 0.22 }));
    STEPS.forEach((st) => H_(K.at(st.sid, st.word) - 0.2, 'step ' + st.lab, 'tick', { gain: 0.4 }));
    H_(K.at('s02', 'آي') + 0.15, 'IMEI picked', 'blip', { gain: 0.3 });
    H_(K.at('s06', 'جاهزة') - 0.2, 'printing', 'type', { gain: 0.3 });
    H_(K.at('s06', 'أونلاين') - 0.15, 'Online', 'pop', { gain: 0.3 });
    H_(K.at('s07', 'واتساب') - 0.15, 'WhatsApp card', 'pop', { gain: 0.35 });
  },
});
