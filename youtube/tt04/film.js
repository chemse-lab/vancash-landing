// VanCash ERP · TikTok 4: الكريدي بدون فوضى (1080x1920, ~60 s). A pure function of time.
// The voice drives the cut; every element enters on the word that names it. Captions: shorts/kit9.js.
// Names, amounts and dates on drawn cards are examples.
import * as K from '../shorts/kit9.js';

const {
  C, F, UI, S, E, prog, clamp, springU, SPRING, rrect, text, ltr, reveal, card, pop, enter, icon, badge, stepNo,
  bg, cue, at, XR, XL, CW, CX, TOP, brand, kick, title, row, rows, stamp, xmark, pill, pillW, exampleTag,
  arrowLeft, money, ctaScene, short,
} = K;
const TAG = 'الديون';

// s01 · Selling on credit? Set three things for each customer before the first sale.
function hook(ctx, u) {
  bg(ctx, 'paper'); brand(ctx, u, TAG);
  const s = 's01';
  title(ctx, u, 'تبيع بالكريدي؟', 560, -0.5, { size: 136 });
  reveal(ctx, u, 'حتى لا يتحوّل الدين إلى خسارة', XR, 680, F(54, 800), C.red, cue(s, 'حتى لا يتحوّل الدين إلى خسارة'));
  title(ctx, u, 'حدّد 3 أشياء لكل زبون', 850, [at(s, 'حدّد') - 0.15, at(s, 'ثلاثة') - 0.15, at(s, 'أشياء') - 0.15, at(s, 'لكل') - 0.15, at(s, 'زبون') - 0.15],
    { size: 84, mark: [1, 2, at(s, 'أشياء') + 0.2] });
  [1, 2, 3].forEach((n, i) => {
    const k = springU(u, at(s, 'ثلاثة') - 0.1 + i * 0.22, SPRING.bouncy);
    stepNo(ctx, k, XR - 120 - i * 320, 1080, n, 92);
  });
}

// s02-s04 · One customer card, filled as the voice names each field: price level, credit limit,
// grace period; then the example values (20,000 DA, 30 days) and "not in your head, not in a side notebook".
const FLD = [
  { n: 1, lab: 'مستوى السعر', sub: 'الذي يشتري به', sid: 's02', word: 'الأول', ico: 'tag' },
  { n: 2, lab: 'سقف الدين', sub: 'أقصى مبلغ يبقى عليه', sid: 's02', word: 'والثاني', ico: 'wallet' },
  { n: 3, lab: 'مدة السماح', sub: 'متى يجب أن يسدّد', sid: 's03', word: 'والثالث', ico: 'calendar' },
];
function customer(ctx, u) {
  bg(ctx, 'paper'); brand(ctx, u, TAG);
  kick(ctx, 'لكل زبون', 'user', TOP + 60);
  title(ctx, u, 'بطاقة الزبون', 520, S.SEC.s02.beat - 0.5, { size: 112 });
  const tEx = at('s04', 'مثلًا');
  const kEx = springU(u, tEx - 0.2, SPRING.bouncy);
  pop(ctx, kEx, XL + 60, 490, () => exampleTag(ctx, XL, 470), { from: 0.4 });
  FLD.forEach((f, i) => {
    const y = 600 + i * 214, k = springU(u, at(f.sid, f.word) - 0.2, SPRING.snappy);
    enter(ctx, k, () => {
      card(ctx, XL, y, CW, 190, 32, C.white, { stroke: C.line, shade: 0.14 });
      ctx.beginPath(); ctx.arc(XR - 70, y + 95, 44, 0, Math.PI * 2); ctx.fillStyle = C.accent; ctx.fill();
      text(ctx, String(f.n), XR - 70, y + 113, F(52, 900), C.white, 'center');
      text(ctx, f.lab, XR - 140, y + 92, F(56, 900), C.ink);
      text(ctx, f.sub, XR - 140, y + 146, F(32, 600, UI), C.muted);
    }, { dy: 60 });
  });
  // the example values
  const k20 = springU(u, at('s04', 'عشرين') - 0.15, SPRING.bouncy);
  pop(ctx, k20, XL + 170, 814 + 95, () => money(ctx, 20000, XL + 310, 814 + 116, 60, C.accent, { k: clamp(prog(u, at('s04', 'عشرين') - 0.15, at('s04', 'دينار'))) }), { from: 0.6 });
  const k30 = springU(u, at('s04', 'ثلاثين') - 0.15, SPRING.bouncy);
  pop(ctx, k30, XL + 150, 1028 + 95, () => text(ctx, '30 يومًا', XL + 40, 1028 + 116, F(60, 900), C.accent, 'left'), { from: 0.6 });
  // written on the card, not in your head or a side notebook
  [['في ذاكرتك', 'ذاكرتك'], ['في دفتر جانبي', 'دفتر']].forEach(([lab, word], i) => {
    const t = at('s04', word), k = springU(u, t - 0.15, SPRING.bouncy), f = F(42, 800, UI);
    const xr = i === 0 ? XR : XR - 440, wd = pillW(ctx, lab, f, 84, null, 32);
    pop(ctx, k, xr - wd / 2, 1262, () => pill(ctx, xr, 1220, 84, lab, f, { bg: C.redWash, fg: C.red, stroke: '#f3c2bd', pad: 32 }), { rise: 20 });
    xmark(ctx, springU(u, t + 0.35, SPRING.bouncy), xr - wd + 6, 1226, 26);
  });
}

// s05 · Link every payment to the customer: who owes, how much, since when.
const LEDGER = [['كريم ب.', 15000, '14/09'], ['سمير ع.', 8000, '02/10'], ['ورشة الأمل', 40000, '20/08']];
function ledger(ctx, u) {
  bg(ctx, 'paper'); brand(ctx, u, TAG);
  const s = 's05';
  kick(ctx, 'عند كل تسديد', 'repeat', TOP + 60);
  // payment -> customer
  const kP = springU(u, at(s, 'تسديد') - 0.15, SPRING.bouncy);
  pop(ctx, kP, XR - 200, 470, () => {
    const f = F(44, 900), str = 'تسديد 10,000 دج', wd = pillW(ctx, str, f, 92, 'cash', 30);
    pill(ctx, XR, 424, 92, str, f, { bg: C.green, fg: C.white, ico: 'cash', pad: 30 });
  }, { from: 0.5 });
  arrowLeft(ctx, XR - 470, XR - 560, 470, C.muted, E.outCubic(prog(u, at(s, 'اربطه') - 0.2, at(s, 'اربطه') + 0.3)), 6);
  const kN = springU(u, at(s, 'باسم') - 0.1, SPRING.bouncy);
  pop(ctx, kN, XL + 160, 470, () => {
    const f = F(44, 900), str = 'كريم ب.', wd = pillW(ctx, str, f, 92, 'user', 30);
    pill(ctx, XL + wd, 424, 92, str, f, { bg: C.ink, fg: C.white, ico: 'user', icoColor: C.lime, pad: 30 });
  }, { from: 0.5 });
  title(ctx, u, 'دفتر ديون واضح', 640, [at(s, 'دفتر') - 0.15, at(s, 'الديون') - 0.15, at(s, 'واضحًا') - 0.15], { size: 100, mark: [2, 2, at(s, 'واضحًا') + 0.2] });
  // the ledger: who, how much, since when
  const k0 = springU(u, at(s, 'دفتر') - 0.3, SPRING.snappy);
  enter(ctx, k0, () => { card(ctx, XL, 700, CW, 560, 32, C.white, { stroke: C.line, shade: 0.16 }); exampleTag(ctx, XL + 30, 1210); }, { dy: 80 });
  const COLS = [['من عليه', XR - 40, 'right', 'من'], ['كم', XL + 520, 'center', 'وكم'], ['منذ متى', XL + 150, 'center', 'ومنذ']];
  COLS.forEach(([lab, x, al, word]) => {
    const k = springU(u, at(s, word) - 0.15, SPRING.snappy);
    if (k <= 0.002) return;
    ctx.save(); ctx.globalAlpha *= clamp(k * 1.6);
    rrect(ctx, al === 'right' ? x - 300 : x - 150, 730, 300, 76, 18); ctx.fillStyle = C.wash; ctx.fill();
    text(ctx, lab, al === 'right' ? x - 150 : x, 782, F(40, 900, UI), C.accent, 'center');
    ctx.restore();
  });
  LEDGER.forEach(([who, amt, since], i) => {
    const y = 870 + i * 112, t = at(s, 'من') + i * 0.25;
    const k = springU(u, t, SPRING.snappy);
    if (k <= 0.002) return;
    ctx.save(); ctx.globalAlpha *= clamp(k * 1.6);
    text(ctx, who, XR - 40, y + 30, F(46, 800, UI), C.ink);
    if (u >= at(s, 'وكم') - 0.2) money(ctx, amt, XL + 640, y + 32, 46, C.ink);
    if (u >= at(s, 'ومنذ') - 0.2) ltr(ctx, since, XL + 150, y + 32, F(44, 800, UI), C.muted, 'center');
    ctx.fillStyle = C.line; ctx.fillRect(XL + 40, y + 62, CW - 80, 2);
    ctx.restore();
  });
}

const cta = ctaScene({ sid: 's06' });

short({
  n: 4,
  scenes: [hook, customer, customer, customer, ledger, cta, cta],
  hits: (H_) => {
    [0, 1, 2].forEach((i) => H_(K.at('s01', 'ثلاثة') - 0.1 + i * 0.22, 'step', 'pop', { gain: 0.3 }));
    H_(K.at('s04', 'عشرين') - 0.15, '20,000', 'tick', { gain: 0.35 });
    H_(K.at('s04', 'ثلاثين') - 0.15, '30 days', 'tick', { gain: 0.35 });
    H_(K.at('s05', 'باسم') - 0.1, 'linked', 'bell', { gain: 0.3 });
    H_(K.at('s06', 'واتساب') - 0.15, 'WhatsApp card', 'pop', { gain: 0.35 });
  },
});
