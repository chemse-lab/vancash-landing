// VanCash ERP · الحلقة 4: نفّذ أول بيع. A pure function of time.
// The voice-over drives the cut (shared/score.py -> vo_timeline.json, vo_words.json); every element
// enters on the word that names it, looked up by its spoken text (cue/at in shared/kit.js).
// Screens are the real app screenshots from the landing page (shared/shots/). The phone, the customer
// and the stock count on drawn cards are illustrations, labelled as examples; the numbers
// (75,000 sold, 50,000 received, 25,000 owed) are the landing page's own worked example.
import * as K from '../shared/kit.js';

const {
  M, E, prog, lerp, clamp, springU, SPRING, rrect, C, F, UI, R, L0, S, cue, at,
  lineLayout, text, ltr, reveal, marker, headline, card, pop, enter, pill, pillW, pillC, icon, badge, stamp, stepNo,
  arrowLeft, screen, cutout, ring, rings, camera, kicker, chipsRow, field, bg, hookHeader, textW, tagAt,
  seriesScene, checkScene, nextScene, endScene, episode, money, exampleTag, logo,
} = K;

// ================================================================ scenes
// 01 · Hook: a sale is five things in one order, every time.
const CHAIN = [
  { lab: 'منتج', ico: 'box', t: 'منتج' }, { lab: 'سعر', ico: 'tag', t: 'وسعر' }, { lab: 'زبون', ico: 'user', t: 'وزبون' },
  { lab: 'مبلغ مقبوض', ico: 'cash', t: 'ومبلغ' }, { lab: 'فاتورة', ico: 'receipt', t: 'وفاتورة' },
];
function hook(ctx, u) {
  bg(ctx, 'paper'); hookHeader(ctx, u);
  const s = 's01';
  headline(ctx, u, 'البيع ليس ضغطة زر فقط.', R, 300, F(92, 900), C.ink, [-0.3, ...cue(s, 'ليس ضغطة زر فقط')], [2, 3, at(s, 'زر') + 0.2]);
  // the one button everyone thinks a sale is
  const kb = springU(u, -0.5, SPRING.gentle), press = Math.exp(-((u - at(s, 'ضغطة') - 0.3) ** 2) * 18);
  pop(ctx, kb, 360, 300, () => {
    ctx.save(); ctx.translate(360, 300); ctx.scale(1 - 0.06 * press, 1 - 0.06 * press); ctx.translate(-360, -300);
    K.shadow(ctx, 130, 240, 460, 120, 60, 0.3 * (1 - press));
    rrect(ctx, 130, 240, 460, 120, 60); ctx.fillStyle = C.accent; ctx.fill();
    text(ctx, 'إتمام البيع', 360, 318, F(50, 900), C.white, 'center');
    ctx.restore();
  }, { from: 0.8 });
  // the five, in order, right to left
  const cw = 300, gap = 52, y = 470;
  CHAIN.forEach((c, i) => {
    const xr = R - i * (cw + gap), x = xr - cw;
    const k = springU(u, at(s, c.t) - 0.2, SPRING.bouncy);
    pop(ctx, k, x + cw / 2, y + 110, () => {
      card(ctx, x, y, cw, 220, 26, C.white, { stroke: C.line });
      badge(ctx, c.ico, x + cw / 2, y + 80, 46, C.wash, C.accent, 1.8);
      text(ctx, c.lab, x + cw / 2, y + 180, F(38, 900), C.ink, 'center');
      text(ctx, String(i + 1), x + 34, y + 50, F(30, 900), C.faint, 'center');
    }, { from: 0.6, rise: 40 });
    if (i < 4) arrowLeft(ctx, x - 8, x - gap + 10, y + 110, C.faint, E.outCubic(prog(u, at(s, CHAIN[i + 1].t) - 0.5, at(s, CHAIN[i + 1].t) - 0.1)), 4);
  });
  // the same order every time keeps everything matching
  const tS = at(s, 'نفس'), loop = prog(u, tS, at(s, 'يبقى'));
  if (loop > 0 && loop < 1) {
    const i = Math.min(4, Math.floor(loop * 5)), xr = R - i * (cw + gap);
    ring(ctx, xr - cw, y, cw, 220, 1, C.lime);
  }
  reveal(ctx, u, 'إذا اعتمدت نفس الترتيب في كل عملية،', R, 820, F(46, 700), C.muted, cue(s, 'إذا اعتمدت نفس الترتيب في كل عملية'));
  headline(ctx, u, 'يبقى كل شيء متطابقًا.', R, 930, F(80, 900), C.ink, cue(s, 'يبقى كل شيء متطابقًا'), [3, 3, at(s, 'متطابقًا') + 0.2]);
  stamp(ctx, springU(u, at(s, 'متطابقًا') + 0.5, SPRING.bouncy), R - 900, 905, 40);
}

// 02 · The series.
const series = seriesScene({
  sid: 's02', lead: 'الحلقة الرابعة من سلسلة تشغيل', brand: 'فان كاش', done: 'المخزون جاهز والحسابات مرتّبة',
  recap: 'المخزون جاهز والحسابات مرتّبة،', today: 'واليوم', goal: 'ننفّذ أول عملية بيع، ثم نتحقق منها.', goalCue: 'ننفّذ أول عملية بيع ثم نتحقق منها',
});

// 03 · The point of sale: search or scan, categories, then the cart, the customer and the payment.
const POS = [
  { lab: 'البحث', ico: 'search', t: 'ابحث', r: [717, 10, 290, 48] },
  { lab: 'مسح الباركود', ico: 'scan', t: 'امسح', r: [584, 10, 124, 46] },
  { lab: 'الفئات', ico: 'list', t: 'الفئات', r: [395, 66, 613, 34] },
  { lab: 'سلة المبيعات', ico: 'cart', t: 'سلة', r: [0, 8, 383, 632] },
  { lab: 'الزبون', ico: 'user', t: 'والزبون', r: [120, 22, 150, 38] },
  { lab: 'طريقة الدفع', ico: 'cash', t: 'وطريقة', r: [12, 543, 359, 52] },
];
function pos(ctx, u) {
  bg(ctx, 'paper');
  const s = 's03';
  kicker(ctx, 'الشاشة التي ستبيع منها', 'scan');
  reveal(ctx, u, 'نقطة البيع', R, 230, F(90, 900), C.ink, [S.START[2] - 0.5, at(s, 'البيع') - 0.15]);
  const img = S.IMG.pos, x = 330, y = 270, cw = 1260, ch = Math.round(cw * img.height / img.width);
  const k0 = springU(u, S.START[2] - 0.8, SPRING.gentle);
  enter(ctx, k0, () => {
    const map = screen(ctx, img, x, y, cw, ch);
    ctx.save(); rrect(ctx, x, y, cw, ch, 18); ctx.clip();
    rings(ctx, u, map, POS.map((p, i) => [...p.r, at(s, p.t) - 0.15, i < POS.length - 1 ? at(s, POS[i + 1].t) - 0.2 : at(s, 'إتمام') + 0.6]));
    ctx.restore();
  }, { dy: 120 });
  POS.forEach((p, i) => {
    const t0 = at(s, p.t), t1 = i < POS.length - 1 ? at(s, POS[i + 1].t) : undefined;
    tagAt(ctx, u, 960, 1000 - 72, p.lab, t0 - 0.15, { ico: p.ico, size: 36, h_: 72, off: t1 !== undefined ? t1 - 0.25 : undefined });
  });
  const kd = springU(u, at(s, 'إتمام') - 0.2, SPRING.bouncy);
  pop(ctx, kd, 960, 964, () => pillC(ctx, 960, 928, 72, 'راجع قبل إتمام العملية', F(36, 800), { bg: C.lime, fg: C.ink, ico: 'check' }), { rise: 16 });
}

// 04 · Step 1: the right product. Phone: model, condition, capacity, IMEI. Accessory: name, quantity.
function product(ctx, u) {
  bg(ctx, 'paper');
  const s = 's04';
  stepNo(ctx, springU(u, S.START[3] - 0.4, SPRING.bouncy), R - 44, 222, 1, 44);
  headline(ctx, u, 'اختر المنتج الصحيح', R - 112, 260, F(96, 900), C.ink, cue(s, 'اختر المنتج الصحيح'), [2, 2, at(s, 'الصحيح') + 0.2]);
  const sideCard = (xr, title, ico, rows, tIn) => {
    const x = xr - 820, k0 = springU(u, tIn - 0.3, SPRING.snappy);
    enter(ctx, k0, () => {
      card(ctx, x, 340, 820, 620, 30, C.white, { stroke: C.line });
      badge(ctx, ico, xr - 76, 418, 44, C.wash, C.accent, 1.8);
      text(ctx, title, xr - 140, 434, F(48, 900), C.ink);
    }, { dy: 60 });
    rows.forEach(([lab, val, word, isLtr], i) => {
      const y = 500 + i * 108, t = at(s, word);
      const k = springU(u, t - 0.2, SPRING.snappy);
      enter(ctx, k, () => {
        rrect(ctx, x + 30, y, 760, 90, 16); ctx.fillStyle = '#f6f8fd'; ctx.fill();
        text(ctx, lab, xr - 60, y + 58, F(34, 800), C.ink);
        if (isLtr) ltr(ctx, val, x + 100, y + 58, F(32, 700, UI), C.accent);
        else text(ctx, val, x + 330, y + 58, F(32, 700, UI), C.accent);
      }, { dx: -40, dy: 0 });
      stamp(ctx, springU(u, t + 0.4, SPRING.bouncy), x + 64, y + 45, 22);
    });
  };
  sideCard(R, 'للهاتف', 'phone', [
    ['الموديل', 'Galaxy A15', 'الموديل', true], ['الحالة', 'جديد', 'والحالة', false],
    ['السعة', '128GB', 'والسعة', true], ['IMEI', '356789104523187', 'آي', true],
  ], at(s, 'للهاتف'));
  sideCard(R - 864, 'للإكسسوار', 'box', [['الاسم', 'شاحن سريع 25W', 'الاسم', false], ['الكمية', '1', 'والكمية', true]], at(s, 'وللإكسسوار'));
  const kx = springU(u, at(s, 'للهاتف') - 0.3, SPRING.snappy);
  enter(ctx, kx, () => exampleTag(ctx, L0 + 40, 300));
}

// 05 · Selling an identified phone: the phones screen has its own tab.
const TABS = [
  { lab: 'بيع هاتف', ico: 'cart', t: 'بيع', occ: 0, r: [795, 78, 105, 36] },
  { lab: 'الشراء من مورّد', ico: 'truck', t: 'الشراء', occ: 0, r: [627, 78, 160, 36] },
  { lab: 'التبديل', ico: 'repeat', t: 'والتبديل', occ: 0, r: [395, 78, 80, 36] },
  { lab: 'تاريخ IMEI', ico: 'clock', t: 'وتاريخ', occ: 0, r: [280, 78, 106, 36] },
];
function phoneSale(ctx, u) {
  bg(ctx, 'paper');
  const s = 's05';
  kicker(ctx, 'شاشة الهواتف', 'phone');
  reveal(ctx, u, 'بيع هاتف معرّف برقمه', R, 230, F(90, 900), C.ink, cue(s, 'ولبيع هاتف معرّف برقمه'));
  // the screen's header and its tabs, large
  const sc = 1.95, sx0 = 150, sy0 = 0, x = R - (1008 - sx0) * sc, y = 300;
  const k0 = springU(u, S.START[4] - 0.6, SPRING.gentle);
  enter(ctx, k0, () => {
    cutout(ctx, S.IMG.imei, [sx0, sy0, 1008 - sx0, 128], x, y, sc);
    const map = (px, py) => [x + (px - sx0) * sc, y + (py - sy0) * sc, sc];
    rings(ctx, u, map, TABS.map((p, i) => [...p.r, at(s, p.t, p.occ) - 0.15, i === 0 ? at(s, 'بجانب') : undefined]));
  }, { dy: 80 });
  // what each tab is for
  TABS.forEach((p, i) => {
    const k = springU(u, at(s, p.t, p.occ) - 0.2, SPRING.bouncy);
    const xr = R - i * 440, yy = 640;
    pop(ctx, k, xr - 205, yy + 110, () => {
      card(ctx, xr - 410, yy, 410, 220, 26, i === 0 ? C.accent : C.white, { stroke: i === 0 ? null : C.line });
      badge(ctx, p.ico, xr - 205, yy + 78, 44, i === 0 ? 'rgba(255,255,255,.18)' : C.wash, i === 0 ? C.white : C.accent, 1.8);
      text(ctx, p.lab, xr - 205, yy + 176, F(38, 900), i === 0 ? C.white : C.ink, 'center');
    }, { from: 0.6, rise: 40 });
  });
  text(ctx, 'بجانب:', R - 460, 620, F(30, 700, UI), C.muted, 'right', clamp(prog(u, at(s, 'بجانب') - 0.2, at(s, 'بجانب') + 0.3)));
}

// 06 · Step 2: price and customer. Quantity and final price; tie a credit sale to its customer.
function priceCustomer(ctx, u) {
  bg(ctx, 'paper');
  const s = 's06';
  stepNo(ctx, springU(u, S.START[5] - 0.4, SPRING.bouncy), R - 44, 222, 2, 44);
  reveal(ctx, u, 'راجع السعر والزبون', R - 112, 260, F(96, 900), C.ink, cue(s, 'راجع السعر والزبون'));
  // the cart: one phone
  const x = L0 + 20, y = 330, cw = 820;
  const k0 = springU(u, at(s, 'أكّد') - 0.4, SPRING.snappy);
  enter(ctx, k0, () => {
    card(ctx, x, y, cw, 300, 28, C.white, { stroke: C.line });
    icon(ctx, 'cart', x + cw - 50, y + 56, 40, C.accent, { lw: 2 });
    text(ctx, 'سلة المبيعات', x + cw - 90, y + 70, F(36, 900), C.ink);
    exampleTag(ctx, x + 30, y + 36);
    rrect(ctx, x + 30, y + 110, cw - 60, 160, 18); ctx.fillStyle = '#f6f8fd'; ctx.fill();
    badge(ctx, 'phone', x + cw - 90, y + 190, 40, C.wash, C.accent, 2);
    text(ctx, 'Samsung Galaxy A15 · 128GB', x + cw - 150, y + 176, F(32, 800), C.ink);
    ltr(ctx, 'IMEI 356789104523187', x + cw - 150, y + 226, F(24, 600, UI), C.muted, 'right');
  }, { dx: -120, dy: 0 });
  const kq = springU(u, at(s, 'الكمية') - 0.2, SPRING.bouncy), kp = springU(u, at(s, 'والسعر') - 0.2, SPRING.bouncy);
  pop(ctx, kq, x + 120, y + 190, () => { rrect(ctx, x + 60, y + 160, 120, 60, 14); ctx.fillStyle = C.white; ctx.fill(); ctx.strokeStyle = C.accent; ctx.lineWidth = 3; ctx.stroke(); text(ctx, '× 1', x + 120, y + 202, F(32, 900), C.accent, 'center'); }, { from: 0.4 });
  // the confirmations at the right
  const rows = [['الكمية', 'الكمية'], ['السعر النهائي', 'والسعر']];
  rows.forEach(([lab, word], i) => {
    const t = at(s, word), k = springU(u, t - 0.2, SPRING.snappy), yy = 360 + i * 120;
    enter(ctx, k, () => {
      card(ctx, 1000, yy, 824, 96, 22, C.white, { stroke: C.line, shade: 0.12 });
      text(ctx, lab, R - 100, yy + 62, F(38, 800), C.ink);
      if (i === 1) money(ctx, 75000, 1300, yy + 64, 40, C.accent, { k: E.outCubic(prog(u, t, t + 0.6)) });
    }, { dy: 20 });
    stamp(ctx, springU(u, t + 0.5, SPRING.bouncy), R - 50, yy + 48, 24);
  });
  text(ctx, 'قبل الحفظ', R, 640, F(30, 700, UI), C.muted, 'right', clamp(prog(u, at(s, 'قبل') - 0.2, at(s, 'قبل') + 0.3)));
  // walk-in customer -> the named customer, when there is a debt
  const tC = at(s, 'واربط'), sw = E.inOutCubic(prog(u, at(s, 'بالزبون') - 0.1, at(s, 'بالزبون') + 0.6));
  const kc = springU(u, tC - 0.3, SPRING.snappy);
  enter(ctx, kc, () => {
    card(ctx, L0 + 20, 690, 1708, 270, 30, C.white, { stroke: C.line });
    text(ctx, 'الزبون', R - 50, 760, F(32, 700, UI), C.muted);
    // the app's own selector, then the named customer
    ctx.save(); ctx.globalAlpha *= 1 - sw;
    cutout(ctx, S.IMG.pos, [120, 22, 150, 38], R - 50 - 150 * 2.4, 790, 2.4, { card: false });
    ctx.restore();
    ctx.save(); ctx.globalAlpha *= sw;
    rrect(ctx, R - 50 - 420, 790, 420, 92, 18); ctx.fillStyle = C.wash; ctx.fill(); ctx.strokeStyle = C.accent; ctx.lineWidth = 3; ctx.stroke();
    badge(ctx, 'user', R - 100, 836, 30, C.white, C.accent, 2);
    text(ctx, 'كريم ب.', R - 150, 850, F(40, 900), C.ink);
    ctx.restore();
  }, { dy: 60 });
  arrowLeft(ctx, 1290, 1110, 836, C.faint, E.outCubic(prog(u, at(s, 'دين') - 0.4, at(s, 'دين'))));
  const kd = springU(u, at(s, 'دين') - 0.1, SPRING.bouncy);
  pop(ctx, kd, 900, 836, () => {
    pillC(ctx, 880, 800, 72, 'عند وجود دين: اربط البيع بالزبون', F(34, 800), { bg: C.amber, fg: C.white, ico: 'wallet' });
  }, { rise: 16 });
  const kw = springU(u, at(s, 'العابر') - 0.2, SPRING.bouncy);
  pop(ctx, kw, 600, 925, () => text(ctx, 'بدل «الزبون العابر»', 600, 935, F(30, 700, UI), C.muted, 'center'), { from: 0.6 });
}

// 07 · Step 3: record the payment: what was received, cash or credit, the rest; then save.
function payment(ctx, u) {
  bg(ctx, 'paper');
  const s = 's07';
  stepNo(ctx, springU(u, S.START[6] - 0.4, SPRING.bouncy), R - 44, 222, 3, 44);
  reveal(ctx, u, 'سجّل الدفع', R - 112, 260, F(96, 900), C.ink, cue(s, 'سجّل الدفع'));
  // the app's own payment area
  const sc = 2.05, sx0 = 0, sy0 = 395, x = L0 + 20, y = 300;
  const k0 = springU(u, S.START[6] - 0.6, SPRING.gentle);
  enter(ctx, k0, () => {
    cutout(ctx, S.IMG.pos, [sx0, sy0, 383, 245], x, y, sc);
    const map = (px, py) => [x + (px - sx0) * sc, y + (py - sy0) * sc, sc];
    rings(ctx, u, map, [
      [196, 543, 175, 52, at(s, 'نقدًا') - 0.15, at(s, 'كريدي') - 0.1],
      [12, 543, 175, 52, at(s, 'كريدي') - 0.15, at(s, 'وراجع') - 0.1],
      [10, 455, 365, 34, at(s, 'وراجع') - 0.15],
    ]);
  }, { dx: -120, dy: 0 });
  // received, then the rest
  const tA = at(s, 'أدخل');
  const kf = springU(u, tA - 0.3, SPRING.snappy);
  enter(ctx, kf, () => field(ctx, 1000, 400, 824, 'المبلغ المقبوض فعلًا', '50,000 دج', prog(u, at(s, 'قبضته'), at(s, 'قبضته') + 0.6), { size: 48, h_: 100, focus: 1 - prog(u, at(s, 'وراجع'), at(s, 'وراجع') + 0.5) }), { dy: 30 });
  chipsRow(ctx, u, [['نقدًا', at(s, 'نقدًا') - 0.2, 'cash'], ['أو كريدي', at(s, 'كريدي') - 0.2, 'wallet']], 540, R, { size: 32, h_: 64 });
  const kr = springU(u, at(s, 'المتبقي') - 0.3, SPRING.snappy);
  enter(ctx, kr, () => {
    card(ctx, 1000, 650, 824, 130, 26, '#fff6e6', { stroke: '#f3dcb0', shade: 0.1 });
    text(ctx, 'المتبقي', R - 40, 730, F(40, 900), C.amber);
    money(ctx, 25000, 1330, 732, 52, C.amber);
  }, { dy: 30 });
  const ks = springU(u, at(s, 'احفظ') - 0.3, SPRING.bouncy);
  pop(ctx, ks, 1412, 870, () => {
    rrect(ctx, 1000, 820, 824, 100, 50); ctx.fillStyle = C.accent; ctx.fill();
    icon(ctx, 'check', R - 60, 870, 40, C.lime, { lw: 3 });
    text(ctx, 'احفظ العملية', R - 110, 886, F(44, 900), C.white);
  }, { from: 0.7, rise: 20 });
  reveal(ctx, u, 'بالطريقة المتاحة في نسختك', R, 990, F(32, 600, UI), C.muted, cue(s, 'بالطريقة المتاحة في نسختك'));
}

// 08 · The worked example: 75,000 sold, 50,000 received, 25,000 on the customer's account.
function numbers(ctx, u) {
  bg(ctx, 'navy');
  const s = 's08', wh = 'rgba(255,255,255,.75)';
  text(ctx, 'مثال بالأرقام', R, 140, F(40, 800), C.lime);
  const tPhone = at(s, 'هاتف');
  const k0 = springU(u, tPhone - 0.3, SPRING.snappy);
  enter(ctx, k0, () => {
    card(ctx, 960, 190, 864, 200, 30, 'rgba(255,255,255,.07)', { shadow: false, stroke: 'rgba(255,255,255,.18)' });
    icon(ctx, 'phone', R - 70, 290, 80, C.lime, { lw: 1.6 });
    text(ctx, 'هاتف سعره', R - 140, 270, F(40, 800), wh);
    text(ctx, 'وقبضت منه', R - 140, 350, F(40, 800), wh);
  }, { dy: 40 });
  const tP = cue(s, 'سعره [خمسة وسبعون ألف دينار]')[1], tQ = cue(s, 'قبضت منه [خمسين ألفًا]')[2];
  enter(ctx, k0, () => {
    if (u > tP - 0.3) money(ctx, 75000, 1300, 278, 56, C.white, { k: E.outCubic(prog(u, tP - 0.2, tP + 0.6)), unit: wh });
    if (u > tQ - 0.3) money(ctx, 50000, 1300, 358, 56, '#5fe3a8', { k: E.outCubic(prog(u, tQ - 0.2, tQ + 0.6)), unit: wh });
  }, { dy: 40 });
  const COLS = [
    { lab: 'المبيعات', n: 75000, col: C.white, t: cue(s, 'المبيعات [خمسة وسبعون ألفًا]')[1], ico: 'chart' },
    { lab: 'المقبوض', n: 50000, col: '#5fe3a8', t: cue(s, 'والمقبوض [خمسون ألفًا]')[1], ico: 'cash' },
    { lab: 'المتبقي على الزبون', n: 25000, col: '#ffc46b', t: cue(s, 'والمتبقي على الزبون [خمسة وعشرون ألفًا]')[3], ico: 'wallet' },
  ];
  COLS.forEach((c, i) => {
    const xr = R - i * 588, x = xr - 552, y = 470;
    const k = springU(u, c.t - 0.5, SPRING.snappy);
    enter(ctx, k, () => {
      card(ctx, x, y, 552, 420, 34, 'rgba(255,255,255,.06)', { shadow: false, stroke: 'rgba(255,255,255,.16)' });
      icon(ctx, c.ico, xr - 64, y + 70, 48, C.lime, { lw: 2 });
      text(ctx, c.lab, xr - 112, y + 86, F(40, 900), C.white);
      money(ctx, c.n, xr - 50, y + 290, 92, c.col, { k: E.outCubic(prog(u, c.t - 0.2, c.t + 0.7)), unit: wh });
    }, { dy: 50 });
  });
  const kl = springU(u, at(s, 'والمتبقي') + 1.4, SPRING.bouncy);
  pop(ctx, kl, 960, 970, () => pillC(ctx, 960, 935, 66, 'ثلاثة أرقام مختلفة: لا تخلط بينها', F(32, 800), { bg: C.lime, fg: C.ink, ico: 'alert' }), { rise: 16 });
}

// 09 · Step 4: check after the sale: invoice, stock movement, customer balance. 3 pieces -> 2.
function verify(ctx, u) {
  bg(ctx, 'paper');
  const s = 's09';
  stepNo(ctx, springU(u, S.START[8] - 0.4, SPRING.bouncy), R - 44, 222, 4, 44);
  reveal(ctx, u, 'تحقق بعد البيع', R - 112, 260, F(96, 900), C.ink, cue(s, 'تحقق بعد البيع'));
  const V = [['الفاتورة', 'receipt', 'الفاتورة'], ['حركة المخزون', 'box', 'وحركة'], ['رصيد الزبون', 'user', 'ورصيد']];
  V.forEach(([lab, ico, word], i) => {
    const xr = R - i * 576, x = xr - 540, y = 340, t = at(s, word);
    const k = springU(u, t - 0.25, SPRING.bouncy);
    pop(ctx, k, x + 270, y + 100, () => {
      card(ctx, x, y, 540, 200, 28, C.white, { stroke: C.line });
      badge(ctx, ico, xr - 80, y + 100, 48, C.wash, C.accent, 1.8);
      text(ctx, lab, xr - 150, y + 116, F(46, 900), C.ink);
    }, { from: 0.7, rise: 40 });
    stamp(ctx, springU(u, t + 0.6, SPRING.bouncy), x + 60, y + 100, 26);
  });
  // three pieces, one sold, two left
  const tB = at(s, 'بيع'), k0 = springU(u, tB - 0.4, SPRING.snappy);
  enter(ctx, k0, () => {
    card(ctx, L0 + 20, 620, 1708, 350, 32, C.white, { stroke: C.line });
    text(ctx, 'المخزون', R - 50, 700, F(36, 900), C.ink);
    exampleTag(ctx, L0 + 50, 650);
  }, { dy: 60 });
  const tThree = at(s, 'ثلاث'), tGone = at(s, 'يعني'), tTwo = at(s, 'قطعتين');
  [0, 1, 2].forEach((i) => {
    const cx = 1400 - i * 230, k = springU(u, tThree - 0.2 + i * 0.15, SPRING.bouncy);
    const out = i === 0 ? E.inOutCubic(prog(u, tGone - 0.2, tGone + 0.5)) : 0;
    ctx.save(); ctx.globalAlpha *= 1 - 0.75 * out; ctx.translate(0, -out * 40);
    pop(ctx, k, cx, 800, () => {
      rrect(ctx, cx - 90, 730, 180, 150, 22); ctx.fillStyle = out > 0.5 ? C.redWash : C.wash; ctx.fill();
      icon(ctx, 'box', cx, 805, 90, out > 0.5 ? C.red : C.accent, { lw: 1.6 });
    }, { from: 0.4, rise: 20 });
    ctx.restore();
    if (i === 0 && out > 0.3) pill(ctx, cx + 70, 890, 44, 'بيعت', F(24, 800, UI), { bg: C.red, fg: C.white, pad: 16 });
  });
  const n = u < tGone ? 3 : 2, kN = springU(u, u < tGone ? tThree : tTwo, SPRING.bouncy);
  pop(ctx, kN, 420, 800, () => {
    text(ctx, String(n), 420, 860, F(170, 900), n === 2 ? C.green : C.accent, 'center');
    text(ctx, n === 2 ? 'قطعتان متبقيتان' : 'قطع في المخزون', 420, 930, F(30, 700, UI), C.muted, 'center');
  }, { from: 0.5 });
}

// 10 · The invoice: print where your version supports it; the QR code is an Online feature.
function invoice(ctx, u) {
  bg(ctx, 'paper');
  const s = 's10';
  kicker(ctx, 'الفاتورة', 'receipt');
  // the receipt
  const k0 = springU(u, S.START[9] - 0.8, SPRING.gentle);
  const x = 340, y = 200, cw = 400, ch = 760;
  enter(ctx, k0, () => {
    card(ctx, x, y, cw, ch, 18, C.white, { stroke: C.line, shade: 0.25 });
    logo(ctx, x + cw / 2 - 32, y + 40, 64);
    text(ctx, 'فاتورة بيع', x + cw / 2, y + 160, F(36, 900), C.ink, 'center');
    ctx.strokeStyle = C.line; ctx.setLineDash([8, 8]); ctx.lineWidth = 2;
    [200, 400, 560].forEach((yy) => { ctx.beginPath(); ctx.moveTo(x + 30, y + yy); ctx.lineTo(x + cw - 30, y + yy); ctx.stroke(); });
    ctx.setLineDash([]);
    text(ctx, 'Galaxy A15 · 128GB', x + cw - 30, y + 250, F(26, 800), C.ink);
    ltr(ctx, 'IMEI 356789104523187', x + cw - 30, y + 290, F(20, 600, UI), C.muted, 'right');
    text(ctx, 'الزبون: كريم ب.', x + cw - 30, y + 340, F(24, 700, UI), C.muted);
    text(ctx, 'الإجمالي', x + cw - 30, y + 450, F(28, 800), C.ink); money(ctx, 75000, x + 190, y + 452, 30, C.ink);
    text(ctx, 'المقبوض', x + cw - 30, y + 500, F(26, 700), C.muted); money(ctx, 50000, x + 190, y + 502, 28, C.green);
    text(ctx, 'المتبقي', x + cw - 30, y + 540, F(26, 700), C.muted); money(ctx, 25000, x + 190, y + 542, 28, C.amber);
  }, { dy: 80 });
  const tQ = at(s, 'والكيو');
  const kq = springU(u, tQ - 0.2, SPRING.bouncy);
  pop(ctx, kq, x + cw / 2, y + 660, () => qr(ctx, x + cw / 2 - 70, y + 590, 140), { from: 0.4 });
  // print (versions that support it) and QR (Online)
  const kp = springU(u, at(s, 'الطباعة') - 0.3, SPRING.bouncy);
  pop(ctx, kp, 1500, 460, () => {
    card(ctx, 1240, 340, 584, 240, 30, C.white, { stroke: C.line });
    badge(ctx, 'printer', R - 80, 420, 46, C.wash, C.accent, 1.8);
    text(ctx, 'الطباعة', R - 150, 436, F(48, 900), C.ink);
    text(ctx, 'في النسخة التي تدعمها', R - 40, 520, F(30, 600, UI), C.muted);
  }, { from: 0.7, rise: 40 });
  const ko = springU(u, at(s, 'نسخة') - 0.2, SPRING.bouncy);
  pop(ctx, ko, 1500, 700, () => {
    card(ctx, 1240, 580, 584, 240, 30, C.ink);
    badge(ctx, 'qr', R - 80, 660, 46, 'rgba(255,255,255,.12)', C.lime, 1.8);
    text(ctx, 'QR كود', R - 150, 676, F(48, 900), C.white);
    pill(ctx, R - 40, 730, 54, 'ضمن مزايا Online', F(28, 800, UI), { bg: C.lime, fg: C.ink, pad: 20 });
  }, { from: 0.7, rise: 40 });
  arrowLeft(ctx, 1225, 780, y + 660, C.faint, E.outCubic(prog(u, tQ, tQ + 0.4)));
  reveal(ctx, u, 'استخدم الطباعة والكيو آر كود', R, 230, F(76, 900), C.ink, [...cue(s, 'واستخدم الطباعة'), ...cue(s, 'والكيو آر كود')]);
}
// A QR-like block pattern (decorative; seeded so it never changes between frames).
function qr(ctx, x, y, s) {
  const n = 21, c = s / n;
  ctx.fillStyle = C.white; ctx.fillRect(x - 6, y - 6, s + 12, s + 12);
  ctx.fillStyle = C.ink;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const finder = (i < 7 && j < 7) || (i < 7 && j > n - 8) || (i > n - 8 && j < 7);
    if (finder) {
      const a = i % 14 > 6 ? i - (n - 7) : i, b = j > n - 8 ? j - (n - 7) : j;
      const ring_ = Math.max(Math.abs(a - 3), Math.abs(b - 3));
      if (ring_ === 3 || ring_ <= 1) ctx.fillRect(x + j * c, y + i * c, c, c);
    } else if (M.hash01(i * n + j, 17) > 0.52) ctx.fillRect(x + j * c, y + i * c, c, c);
  }
}

// 11 · Checkpoint: product, amount and invoice agree; stock and debt reflect the right sale.
const ROWS11 = [
  { str: 'حركة المخزون صحيحة', cue: 'وحركة المخزون' },
  { str: 'الدين يعكس العملية الصحيحة', cue: 'والدين تعكس العملية الصحيحة' },
];
const check = checkScene({
  sid: 's11', head: 'المنتج والمبلغ والفاتورة متطابقة', headCue: 'المنتج والمبلغ والفاتورة متطابقة', headSize: 76,
  rowsY: 620, rowGap: 150, rows: ROWS11,
  body(ctx, u) {
    const s = 's11';
    const T = [['المنتج', 'box', 'المنتج'], ['المبلغ', 'cash', 'والمبلغ'], ['الفاتورة', 'receipt', 'والفاتورة']];
    T.forEach(([lab, ico, word], i) => {
      const xr = R - i * 600, x = xr - 480, y = 330, t = at(s, word);
      const k = springU(u, t - 0.25, SPRING.bouncy);
      pop(ctx, k, x + 240, y + 115, () => {
        card(ctx, x, y, 480, 230, 26, C.white, { stroke: '#cfe9dc', shade: 0.12 });
        badge(ctx, ico, x + 240, y + 86, 48, C.mint, C.green, 1.8);
        text(ctx, lab, x + 240, y + 186, F(40, 900), C.ink, 'center');
      }, { from: 0.6, rise: 40 });
      if (i < 2) {
        const ke = springU(u, at(s, 'متطابقة') - 0.1, SPRING.bouncy);
        pop(ctx, ke, xr - 540, y + 115, () => text(ctx, '=', xr - 540, y + 145, F(80, 900), C.green, 'center'), { from: 0.3 });
      }
    });
  },
});

// 12 · Next episode and the two asks.
const next = nextScene({
  sid: 's12', sub: 'المشتريات والمصاريف والتسديدات', subCue: 'المشتريات والمصاريف والتسديدات', shots: ['finance', 'products'],
  shotCues: ['المشتريات', 'والتسديدات'], trialCue: 'اطلب تجربتك', subscribeCue: 'واشترك',
});
const endCard = endScene({ shot: 'finance', panelTitle: 'الحلقة 5 · تابع الحركات' });

episode({
  n: 4,
  scenes: [hook, series, pos, product, phoneSale, priceCustomer, payment, numbers, verify, invoice, check, next, endCard],
  hits(H_) {
    H_(at('s01', 'ضغطة') + 0.3, 'button press', 'click', { gain: 0.55 });
    CHAIN.forEach((c, i) => H_(at('s01', c.t) - 0.2, `chain ${c.lab}`, 'pop', { pitch: ['D5', 'E5', 'F#5', 'A5', 'B5'][i], gain: 0.42 }));
    H_(at('s01', 'متطابقًا') + 0.5, 'all match', 'bell', { pitch: 'D6', gain: 0.5 });
    H_(cue('s02', 'فان كاش')[0], 'logo', 'bell', { pitch: 'D6', gain: 0.5 });
    H_(cue('s02', 'المخزون جاهز والحسابات مرتّبة')[0], 'stages done', 'tick', { gain: 0.55 });
    H_(at('s02', 'واليوم'), 'episode 4 chip', 'bell', { pitch: 'A5', gain: 0.5 });
    POS.forEach((p) => H_(at('s03', p.t) - 0.15, `pos ${p.lab}`, 'click', { gain: 0.42 }));
    H_(at('s03', 'إتمام') - 0.2, 'review first', 'pop', { pitch: 'A5', gain: 0.45 });
    H_(S.START[3] - 0.4, 'step 1', 'pop', { pitch: 'D5', gain: 0.45 });
    ['الموديل', 'والحالة', 'والسعة', 'آي', 'الاسم', 'والكمية'].forEach((wd) => H_(at('s04', wd) + 0.4, `checked ${wd}`, 'tick', { gain: 0.45 }));
    TABS.forEach((p, i) => H_(at('s05', p.t, p.occ) - 0.2, `tab ${p.lab}`, 'pop', { pitch: ['D5', 'F#5', 'A5', 'B5'][i], gain: 0.42 }));
    H_(S.START[5] - 0.4, 'step 2', 'pop', { pitch: 'E5', gain: 0.45 });
    H_(at('s06', 'الكمية') + 0.5, 'qty ok', 'tick', { gain: 0.5 });
    H_(at('s06', 'والسعر') + 0.5, 'price ok', 'tick', { gain: 0.5 });
    H_(at('s06', 'بالزبون') - 0.1, 'customer linked', 'blip', { pitch: 'A5', gain: 0.45 });
    H_(S.START[6] - 0.4, 'step 3', 'pop', { pitch: 'F#5', gain: 0.45 });
    H_(at('s07', 'قبضته'), 'amount types', 'type', { len: 0.6, gain: 0.45 });
    H_(at('s07', 'المتبقي') - 0.3, 'rest', 'pop', { pitch: 'D5', gain: 0.4 });
    H_(at('s07', 'احفظ') - 0.3, 'save', 'bell', { pitch: 'A5', gain: 0.45 });
    H_(cue('s08', 'المبيعات [خمسة وسبعون ألفًا]')[1], 'sales', 'coins', { gain: 0.45 });
    H_(cue('s08', 'والمقبوض [خمسون ألفًا]')[1], 'received', 'coins', { gain: 0.42 });
    H_(cue('s08', 'والمتبقي على الزبون [خمسة وعشرون ألفًا]')[3], 'owed', 'coins', { gain: 0.42 });
    H_(S.START[8] - 0.4, 'step 4', 'pop', { pitch: 'A5', gain: 0.45 });
    ['الفاتورة', 'وحركة', 'ورصيد'].forEach((wd) => H_(at('s09', wd) + 0.6, `verified ${wd}`, 'tick', { gain: 0.5 }));
    H_(at('s09', 'يعني'), 'one sold', 'pop', { pitch: 'D5', gain: 0.45 });
    H_(at('s09', 'قطعتين'), 'two left', 'bell', { pitch: 'A5', gain: 0.5 });
    H_(at('s10', 'الطباعة') - 0.3, 'print', 'pop', { pitch: 'D5', gain: 0.42 });
    H_(at('s10', 'والكيو') - 0.2, 'qr', 'blip', { pitch: 'A5', gain: 0.45 });
    H_(at('s10', 'نسخة') - 0.2, 'online', 'pop', { pitch: 'D6', gain: 0.42 });
    H_(at('s11', 'متطابقة') - 0.1, 'equal', 'bell', { pitch: 'A5', gain: 0.5 });
    ROWS11.forEach((r, i) => H_(cue('s11', r.cue).at(-1) + 0.4, `check ${r.str}`, 'bell', { pitch: ['B5', 'D6'][i], gain: 0.55 }));
    H_(cue('s12', 'اطلب تجربتك')[0] - 0.15, 'cta trial', 'pop', { gain: 0.45 });
    H_(cue('s12', 'واشترك')[0] - 0.15, 'cta subscribe', 'bell', { pitch: 'D6', gain: 0.45 });
  },
});
