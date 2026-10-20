// VanCash ERP · TikTok 5: الدفع الجزئي بدون أخطاء (1080x1920, ~60 s). A pure function of time.
// The voice drives the cut; every element enters on the word that names it. Captions: shorts/kit9.js.
// Names and amounts on drawn cards are examples; the point-of-sale screen is the real app.
import * as K from '../shorts/kit9.js';

const {
  C, F, UI, S, E, prog, clamp, springU, SPRING, rrect, text, ltr, reveal, card, pop, enter, icon, badge, stepNo,
  bg, cue, at, XR, XL, CW, CX, TOP, brand, kick, title, tile, stamp, xmark, strike, pill, pillW, exampleTag,
  shot, ring, arrowDown, money, ctaScene, short,
} = K;
const TAG = 'البيع';

// s01 · Sold a phone for 75,000 DA, the customer paid only 50,000. How do you record it?
function hook(ctx, u) {
  bg(ctx, 'paper'); brand(ctx, u, TAG);
  const s = 's01';
  kick(ctx, 'بيع بدفع جزئي', 'cart', TOP + 60);
  title(ctx, u, 'كيف تسجّلها؟', 560, -0.5, { size: 132, mark: [0, 0, at(s, 'كيف')] });
  const t75 = at(s, 'بخمسة') - 0.2, t50 = at(s, 'خمسين') - 0.2;
  tile(ctx, springU(u, t75, SPRING.snappy), XL, 660, CW, 230, { ico: 'phone', label: 'سعر الهاتف', amount: 75000, size: 96, count: clamp(prog(u, t75, at(s, 'دينار'))) });
  tile(ctx, springU(u, t50, SPRING.snappy), XL, 920, CW, 230, { ico: 'cash', label: 'دفع الزبون', amount: 50000, size: 96, color: C.green, count: clamp(prog(u, t50, at(s, 'فقط'))) });
  const kF = springU(u, at(s, 'فقط'), SPRING.bouncy);
  pop(ctx, kF, XL + 150, 1225, () => {
    const f = F(44, 900), str = 'فقط!', wd = pillW(ctx, str, f, 84, 'alert', 28);
    pill(ctx, XL + 20 + wd, 1183, 84, str, f, { bg: C.red, fg: C.white, ico: 'alert', pad: 28 });
  }, { from: 0.4 });
}

// s02 · At the point of sale: pick the phone by IMEI and the customer by name, not a walk-in,
// because what is left will be a debt on him.
const POS = [0, 8, 383, 632], PS = 400 / 383, PX = XL, PY = 560;
const pmap = (sx, sy, sw, sh) => [PX + sx * PS, PY + (sy - 8) * PS, sw * PS, sh * PS];
function pos(ctx, u) {
  bg(ctx, 'paper'); brand(ctx, u, TAG);
  const s = 's02';
  kick(ctx, 'في نقطة البيع', 'cart', TOP + 60);
  title(ctx, u, 'اختر الهاتف والزبون', 480, [S.SEC[s].beat - 0.4, at(s, 'الهاتف') - 0.15, at(s, 'الزبون') - 0.15], { size: 84 });
  // the real cart panel
  const kS = springU(u, S.SEC[s].beat - 0.2, SPRING.snappy);
  enter(ctx, kS, () => shot(ctx, 'pos', POS, PX, PY, 400, 660), { dx: -60, dy: 0 });
  const [cx_, cy_, cw_, ch_] = pmap(120, 22, 150, 38);
  ring(ctx, cx_, cy_, cw_, ch_, springU(u, at(s, 'باسمه') - 0.1, SPRING.snappy) * (1 - prog(u, at(s, 'الباقي'), at(s, 'الباقي') + 0.5)));
  // the two picks, on the right
  const X0 = XL + 432;
  const STEP = [
    { n: 1, lab: 'الهاتف', sub: 'برقم IMEI', t: at(s, 'آي') - 0.2, ico: 'phone' },
    { n: 2, lab: 'الزبون', sub: 'باسمه', t: at(s, 'واختر') - 0.2, ico: 'user' },
  ];
  STEP.forEach((st, i) => {
    const y = 570 + i * 210, k = springU(u, st.t, SPRING.snappy);
    enter(ctx, k, () => {
      card(ctx, X0, y, XR - X0, 186, 30, C.white, { stroke: C.line, shade: 0.14 });
      stepNo(ctx, 1, XR - 56, y + 93, st.n, 36);
      text(ctx, st.lab, XR - 112, y + 84, F(52, 900), C.ink);
      text(ctx, st.sub, XR - 112, y + 140, F(34, 700, UI), C.accent);
    }, { dy: 50 });
  });
  // not a walk-in customer
  const tNo = at(s, 'لا');
  strike(ctx, u, 'زبون عابر', XR - 20, 1050, 52, tNo - 0.15);
  xmark(ctx, springU(u, tNo + 0.5, SPRING.bouncy), X0 + 40, 1034, 28);
  // the rest becomes his debt
  const kD = springU(u, at(s, 'دينًا') - 0.15, SPRING.bouncy);
  pop(ctx, kD, X0 + (XR - X0) / 2, 1180, () => {
    rrect(ctx, X0, 1120, XR - X0, 120, 28); ctx.fillStyle = C.redWash; ctx.fill();
    ctx.strokeStyle = '#f3c2bd'; ctx.lineWidth = 3; ctx.stroke();
    text(ctx, 'الباقي = دين عليه', XR - 30, 1197, F(46, 900), C.red);
  }, { from: 0.5 });
}

// s03 · Then record what was actually paid: 50,000, not the full amount.
function paid(ctx, u) {
  bg(ctx, 'paper'); brand(ctx, u, TAG);
  const s = 's03';
  kick(ctx, 'ثم', null, TOP + 60, C.muted);
  title(ctx, u, 'سجّل المقبوض فعلًا', 520, [at(s, 'سجّل') - 0.15, at(s, 'المقبوض') - 0.15, at(s, 'فعلًا') - 0.15], { size: 100, mark: [2, 2, at(s, 'فعلًا') + 0.25] });
  const k0 = springU(u, S.SEC[s].beat - 0.3, SPRING.snappy);
  enter(ctx, k0, () => {
    card(ctx, XL, 620, CW, 320, 34, C.white, { stroke: C.line, shade: 0.16 });
    badge(ctx, 'cash', XR - 62, 690, 38, C.mint, C.green, 2.2);
    text(ctx, 'المبلغ المقبوض', XR - 120, 706, F(44, 800, UI), C.ink);
    exampleTag(ctx, XL + 30, 660);
    rrect(ctx, XL + 40, 760, CW - 80, 140, 24); ctx.fillStyle = C.wash; ctx.fill();
  }, { dy: 80 });
  // typed digit by digit on "خمسين ألفًا"
  const t0 = at(s, 'خمسين') - 0.2, DIG = '50,000';
  const n = Math.min(DIG.length, Math.floor(clamp(prog(u, t0, t0 + 1.2)) * DIG.length + 0.0001));
  if (k0 > 0.5) {
    const str = DIG.slice(0, n), f = F(96, 900);
    ltr(ctx, str, XL + 80, 862, f, C.green, 'left');
    const wd = K.textW(ctx, str, f);
    if (n < DIG.length || Math.floor(u * 2) % 2 === 0) { ctx.fillStyle = C.green; ctx.fillRect(XL + 88 + wd, 790, 6, 86); }
    if (n === DIG.length) text(ctx, 'دج', XR - 80, 856, F(54, 800), C.muted);
  }
  stamp(ctx, springU(u, at(s, 'ألفًا') + 0.4, SPRING.bouncy), XR - 40, 640, 34);
  // not the full amount
  const tN = at(s, 'وليس');
  const kN = springU(u, tN - 0.3, SPRING.snappy);
  enter(ctx, kN, () => {
    card(ctx, XL, 990, CW, 230, 34, C.redWash, { stroke: '#f3c2bd', shade: 0.1 });
    text(ctx, 'المبلغ الكامل', XR - 40, 1062, F(40, 700, UI), C.red);
  }, { dy: 60 });
  if (kN > 0.3) {
    const f = F(84, 900), str = '75,000', x = XL + 60;
    ltr(ctx, str, x, 1175, f, C.muted, 'left');
    const wd = K.textW(ctx, str, f), p = E.outCubic(prog(u, tN + 0.2, tN + 0.7));
    if (p > 0) {
      ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 9; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x - 10, 1150); ctx.lineTo(x - 10 + (wd + 20) * p, 1150); ctx.stroke(); ctx.restore();
    }
    xmark(ctx, springU(u, tN + 0.6, SPRING.bouncy), XR - 70, 1150, 34);
  }
}

// s04 · Three numbers: sales 75,000, received 50,000, debt 25,000 on the customer.
const NUMS = [
  { lab: 'مبيعات', amt: 75000, word: 'مبيعات', color: C.accent, ico: 'cart' },
  { lab: 'مقبوض', amt: 50000, word: 'ومقبوض', color: C.green, ico: 'cash' },
  { lab: 'دين على الزبون', amt: 25000, word: 'ودين', color: C.red, ico: 'user' },
];
function three(ctx, u) {
  bg(ctx, 'paper'); brand(ctx, u, TAG);
  const s = 's04';
  kick(ctx, 'هكذا تظهر', null, TOP + 60, C.muted);
  title(ctx, u, 'ثلاثة أرقام', 520, cue(s, 'ثلاثة أرقام'), { size: 120, mark: [0, 1, at(s, 'أرقام') + 0.3] });
  NUMS.forEach((nm, i) => {
    const t = at(s, nm.word) - 0.2, y = 620 + i * 228;
    tile(ctx, springU(u, t, SPRING.snappy), XL + 110, y, CW - 110, 200, { ico: nm.ico, label: nm.lab, amount: nm.amt, size: 80, color: nm.color, count: clamp(prog(u, t, t + 1.4)) });
  });
  // − and = between them, at the left
  [['−', 1], ['=', 2]].forEach(([op, i]) => {
    const k = springU(u, at(s, NUMS[i].word) - 0.3, SPRING.bouncy), cy = 620 + i * 228 - 14;
    pop(ctx, k, XL + 44, cy, () => {
      ctx.beginPath(); ctx.arc(XL + 44, cy, 40, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
      ltr(ctx, op, XL + 44, cy + 20, F(58, 900, UI), C.lime, 'center');
    }, { from: 0.3 });
  });
}

// s05 · Three different numbers, don't mix them. When the customer pays, link it to the same name.
function link(ctx, u) {
  bg(ctx, 'navy'); brand(ctx, u, TAG, { dark: true });
  const s = 's05';
  title(ctx, u, 'ثلاثة أرقام مختلفة', 470, cue(s, 'ثلاثة أرقام مختلفة'), { size: 92, color: C.white });
  // sales ≠ received ≠ debt
  const CH = [['مبيعات', C.accent], ['مقبوض', C.green], ['دين', C.red]];
  const f = F(44, 900), h = 84, gap = 76;
  const ws = CH.map(([l]) => pillW(ctx, l, f, h, null, 28));
  const total = ws.reduce((a, b) => a + b, 0) + gap * 2;
  let xr = CX + total / 2;
  CH.forEach(([l, col], i) => {
    const k = springU(u, at(s, 'مختلفة') - 0.2 + i * 0.15, SPRING.bouncy), x = xr;
    pop(ctx, k, x - ws[i] / 2, 582, () => pill(ctx, x, 540, h, l, f, { bg: col, fg: C.white, pad: 28 }), { from: 0.4 });
    if (i < 2) {
      const kx = springU(u, at(s, 'مختلفة') + i * 0.15, SPRING.bouncy), ox = x - ws[i] - gap / 2;
      pop(ctx, kx, ox, 582, () => ltr(ctx, '≠', ox, 604, F(64, 900, UI), C.lime, 'center'), { from: 0.3 });
    }
    xr -= ws[i] + gap;
  });
  reveal(ctx, u, 'لا تخلط بينها.', XR, 720, F(62, 900), C.lime, cue(s, 'لا تخلط بينها'));
  // a payment, linked to the same name
  const tP = at(s, 'يسدّد');
  const kP = springU(u, tP - 0.2, SPRING.bouncy);
  pop(ctx, kP, CX, 846, () => {
    const fp = F(46, 900), str = 'تسديد 25,000 دج', wd = pillW(ctx, str, fp, 92, 'cash', 30);
    pill(ctx, CX + wd / 2, 800, 92, str, fp, { bg: C.green, fg: C.white, ico: 'cash', pad: 30 });
  }, { from: 0.5 });
  arrowDown(ctx, CX, 906, 966, C.lime, E.outCubic(prog(u, at(s, 'اربط') - 0.2, at(s, 'اربط') + 0.3)), 6);
  const kC = springU(u, at(s, 'اربط') - 0.4, SPRING.snappy);
  enter(ctx, kC, () => {
    card(ctx, XL, 980, CW, 270, 34, C.white, { shade: 0.3 });
    badge(ctx, 'user', XR - 66, 1060, 42, C.wash, C.accent, 2.2);
    text(ctx, 'كريم ب.', XR - 130, 1078, F(58, 900), C.ink);
    text(ctx, 'الدين المتبقي', XR - 130, 1180, F(38, 700, UI), C.muted);
    exampleTag(ctx, XL + 30, 1010);
  }, { dy: 80 });
  if (kC > 0.3) {
    const tN = at(s, 'الاسم');
    const left = 25000 * (1 - E.outCubic(prog(u, tN - 0.1, tN + 0.9)));
    money(ctx, left, XL + 330, 1186, 72, left < 1 ? C.green : C.red);
    stamp(ctx, springU(u, tN + 0.9, SPRING.bouncy), XL + 400, 1100, 34);
  }
}

const cta = ctaScene({ sid: 's06' });

short({
  n: 5,
  scenes: [hook, pos, paid, three, link, cta, cta],
  hits: (H_) => {
    H_(K.at('s01', 'فقط'), 'only', 'thud', { gain: 0.35 });
    H_(K.at('s02', 'دينًا') - 0.15, 'debt', 'pop', { gain: 0.3 });
    H_(K.at('s03', 'ألفًا') + 0.4, 'paid', 'tick', { gain: 0.35 });
    NUMS.forEach((nm) => H_(K.at('s04', nm.word) - 0.2, nm.lab, 'coins', { gain: 0.25 }));
    H_(K.at('s05', 'الاسم') + 0.9, 'linked', 'bell', { gain: 0.3 });
    H_(K.at('s06', 'واتساب') - 0.15, 'WhatsApp card', 'pop', { gain: 0.35 });
  },
});
