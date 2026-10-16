// VanCash ERP · الحلقة 5: تابع الحركات. A pure function of time.
// The voice-over drives the cut (shared/score.py -> vo_timeline.json, vo_words.json); every element
// enters on the word that names it, looked up by its spoken text (cue/at in shared/kit.js).
// Screens are the real app screenshots from the landing page (shared/shots/). Amounts, dates, names
// and references on drawn cards are illustrations, labelled as examples.
import * as K from '../shared/kit.js';

const {
  M, E, prog, lerp, clamp, springU, SPRING, rrect, C, F, UI, R, L0, S, cue, at,
  lineLayout, text, ltr, reveal, marker, headline, card, pop, enter, pill, pillW, pillC, icon, badge, stamp, stepNo,
  arrowLeft, screen, cutout, ring, rings, camera, kicker, chipsRow, field, bg, hookHeader, textW, tagAt,
  seriesScene, checkScene, nextScene, endScene, episode, money, exampleTag,
} = K;

// A row of a little ledger: label at the right, amount at the left.
function ledgerRow(ctx, x, y, w_, lab, n, col, { sign = '', sub = null, tint = '#f6f8fd', strike = 0 } = {}) {
  rrect(ctx, x, y, w_, 92, 16); ctx.fillStyle = tint; ctx.fill();
  text(ctx, lab, x + w_ - 30, y + (sub ? 44 : 58), F(32, 800), C.ink);
  if (sub) text(ctx, sub, x + w_ - 30, y + 78, F(22, 600, UI), C.muted);
  money(ctx, n, x + 300, y + 60, 38, col, { sign });
  if (strike > 0) { ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x + w_ - 20, y + 46); ctx.lineTo(x + w_ - 20 - (w_ - 40) * strike, y + 46); ctx.stroke(); ctx.restore(); }
}

// ================================================================ scenes
// 01 · Hook: one expense missing, one repayment twice; at closing the numbers don't match.
function hook(ctx, u) {
  bg(ctx, 'paper'); hookHeader(ctx, u);
  const s = 's01';
  const dim = 1 - 0.55 * E.inOutCubic(prog(u, at(s, 'الحل') - 0.6, at(s, 'الحل')));
  reveal(ctx, u, 'مصروف لم يُسجَّل،', R, 300, F(66, 900), C.ink, [-0.3, ...cue(s, 'لم يُسجَّل')], { alpha: dim });
  reveal(ctx, u, 'أو تسديد سُجّل مرتين،', R, 400, F(66, 900), C.ink, cue(s, 'أو تسديد سُجّل مرتين'), { alpha: dim, colors: { 3: C.red } });
  reveal(ctx, u, 'وفي نهاية اليوم لا تتطابق الأرقام.', R, 500, F(50, 700), C.muted, cue(s, 'وفي نهاية اليوم لا تتطابق الأرقام'), { alpha: dim, colors: { 4: C.red, 5: C.red } });
  reveal(ctx, u, 'الحل بسيط:', R, 680, F(50, 800), C.accent, cue(s, 'الحل بسيط'));
  headline(ctx, u, 'سجّل كل حركة وقت حدوثها.', R, 806, F(70, 900), C.ink, cue(s, 'سجّل كل حركة وقت حدوثها'), [3, 4, at(s, 'حدوثها') + 0.2]);
  // the day's ledger and the closing count
  const x = 110, y = 230, cw = 720;
  const k0 = springU(u, -0.6, SPRING.gentle);
  enter(ctx, k0, () => {
    card(ctx, x, y, cw, 700, 30, C.white, { stroke: C.line });
    icon(ctx, 'list', x + cw - 50, y + 64, 40, C.accent, { lw: 2 });
    text(ctx, 'حركات اليوم', x + cw - 90, y + 78, F(38, 900), C.ink);
    exampleTag(ctx, x + 30, y + 44);
  }, { dx: -200, dy: 0 });
  const tE = at(s, 'مصروف'), tD = at(s, 'سُجّل');
  const kE = springU(u, tE + 0.2, SPRING.snappy);
  enter(ctx, kE, () => {
    rrect(ctx, x + 30, y + 130, cw - 60, 92, 16); ctx.setLineDash([10, 8]); ctx.strokeStyle = C.red; ctx.lineWidth = 3; ctx.stroke(); ctx.setLineDash([]);
    text(ctx, 'مصروف: نقل بضاعة', x + cw - 60, y + 188, F(32, 800), C.red);
    text(ctx, 'لم يُسجَّل', x + 120, y + 188, F(30, 800), C.red, 'center');
  }, { dy: 20 });
  [0, 1].forEach((i) => {
    const k = springU(u, tD - 0.3 + i * 0.35, SPRING.snappy);
    enter(ctx, k, () => ledgerRow(ctx, x + 30, y + 240 + i * 108, cw - 60, 'تسديد: كريم ب.', 10000, C.green, { sign: '+', tint: i ? C.redWash : C.mint }), { dy: 20 });
    if (i === 1 && k > 0.5) pill(ctx, x + cw - 40, y + 240 + 108 - 18, 40, 'مرتين', F(22, 800, UI), { bg: C.red, fg: C.white, pad: 14 });
  });
  const tN = at(s, 'نهاية'), kn = springU(u, tN - 0.2, SPRING.snappy);
  enter(ctx, kn, () => {
    ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 40, y + 470); ctx.lineTo(x + cw - 40, y + 470); ctx.stroke();
    text(ctx, 'الصندوق حسب البرنامج', x + cw - 40, y + 530, F(28, 700, UI), C.muted); money(ctx, 42500, x + 300, y + 532, 36, C.ink);
    text(ctx, 'الموجود فعلًا', x + cw - 40, y + 590, F(28, 700, UI), C.muted); money(ctx, 31000, x + 300, y + 592, 36, C.ink);
  }, { dy: 20 });
  const kd = springU(u, at(s, 'تتطابق') - 0.1, SPRING.bouncy);
  pop(ctx, kd, x + cw / 2, y + 650, () => {
    rrect(ctx, x + 30, y + 618, cw - 60, 64, 16); ctx.fillStyle = C.redWash; ctx.fill();
    text(ctx, 'فرق', x + cw - 60, y + 662, F(32, 900), C.red);
    money(ctx, 11500, x + 300, y + 664, 38, C.red, { sign: '−' });
  }, { from: 0.6 });
}

// 02 · The series.
const series = seriesScene({
  sid: 's02', lead: 'الحلقة الخامسة من سلسلة تشغيل', brand: 'فان كاش', done: 'بعد أول بيع',
  recap: 'بعد أول بيع،', today: 'اليوم', goal: 'المشتريات والمصاريف والتسديدات', goalCue: 'المشتريات والمصاريف والتسديدات',
});

// 03 · The rule: record movements as they happen; keep what explains each amount.
function rule(ctx, u) {
  bg(ctx, 'paper');
  const s = 's03';
  kicker(ctx, 'القاعدة', 'clock');
  headline(ctx, u, 'سجّل الحركات وقت حدوثها', R, 250, F(96, 900), C.ink, cue(s, 'سجّل الحركات وقت حدوثها'), [2, 3, at(s, 'حدوثها') + 0.2]);
  reveal(ctx, u, 'قدر الإمكان', R, 340, F(44, 700), C.muted, cue(s, 'قدر الإمكان'));
  reveal(ctx, u, 'واحتفظ بالمعلومة التي تفسّر كل مبلغ:', R, 470, F(50, 800), C.ink, cue(s, 'واحتفظ بالمعلومة التي تفسّر كل مبلغ'));
  // one movement and its explanation
  const F3 = [['التاريخ', 'calendar', 'التاريخ', '16/10 · 10:30', true], ['السبب', 'file', 'والسبب', 'نقل بضاعة من المورّد', false], ['الشخص', 'user', 'والشخص', 'سمير (العامل)', false]];
  const x = 110, y = 300, cw = 760;
  const k0 = springU(u, at(s, 'مبلغ') - 0.4, SPRING.snappy);
  enter(ctx, k0, () => {
    card(ctx, x, y, cw, 660, 30, C.white, { stroke: C.line });
    text(ctx, 'حركة: مصروف', x + cw - 40, y + 74, F(40, 900), C.ink);
    exampleTag(ctx, x + 30, y + 40);
    money(ctx, 1500, x + 400, y + 190, 80, C.amber);
  }, { dx: -160, dy: 0 });
  F3.forEach(([lab, ico, word, val, isLtr], i) => {
    const t = at(s, word), k = springU(u, t - 0.2, SPRING.snappy), ry = y + 260 + i * 120;
    enter(ctx, k, () => {
      rrect(ctx, x + 30, ry, cw - 60, 100, 16); ctx.fillStyle = '#f6f8fd'; ctx.fill();
      badge(ctx, ico, x + cw - 80, ry + 50, 30, C.wash, C.accent, 2);
      text(ctx, lab, x + cw - 130, ry + 62, F(32, 800), C.ink);
      if (isLtr) ltr(ctx, val, x + 60, ry + 62, F(32, 700, UI), C.accent);
      else text(ctx, val, x + 470, ry + 62, F(30, 700, UI), C.accent);
    }, { dx: -40, dy: 0 });
    // and the chip on the right
    const kk = springU(u, t - 0.15, SPRING.bouncy);
    pop(ctx, kk, R - 120, 590 + i * 100, () => pill(ctx, R, 560 + i * 100, 66, lab, F(34, 700, UI), { bg: C.white, fg: C.ink, ico, stroke: C.line, icoColor: C.accent }), { rise: 14 });
  });
  const kh = springU(u, at(s, 'عند') - 0.1, SPRING.bouncy);
  pop(ctx, kh, 1300, 893, () => pill(ctx, R - 230, 870, 46, 'عند الحاجة', F(24, 700, UI), { bg: C.wash, fg: C.accent, pad: 16 }), { from: 0.5 });
}

// 04 · Goods arrive: match quantity, condition, IMEI and cost against what you received; then record.
const CHK = [['الكمية', 'box', 'الكمية'], ['الحالة', 'eye', 'والحالة'], ['IMEI', 'phone', 'ورقم'], ['التكلفة', 'cash', 'والتكلفة']];
function arrival(ctx, u) {
  bg(ctx, 'paper');
  const s = 's04';
  kicker(ctx, 'المشتريات', 'truck');
  reveal(ctx, u, 'عند وصول بضاعة', R, 250, F(96, 900), C.ink, cue(s, 'عند وصول بضاعة'));
  // the delivery, checked line by line
  const x = 110, y = 300, cw = 800;
  const k0 = springU(u, S.START[3] - 0.6, SPRING.gentle);
  enter(ctx, k0, () => {
    card(ctx, x, y, cw, 660, 30, C.white, { stroke: C.line });
    icon(ctx, 'truck', x + cw - 56, y + 64, 48, C.accent, { lw: 1.8 });
    text(ctx, 'الطلبية المستلمة', x + cw - 100, y + 78, F(38, 900), C.ink);
    exampleTag(ctx, x + 30, y + 44);
  }, { dx: -160, dy: 0 });
  CHK.forEach(([lab, ico, word], i) => {
    const t = at(s, word), ry = y + 130 + i * 112;
    const k = springU(u, t - 0.25, SPRING.snappy);
    enter(ctx, k, () => {
      rrect(ctx, x + 30, ry, cw - 60, 96, 16); ctx.fillStyle = '#f6f8fd'; ctx.fill();
      badge(ctx, ico, x + cw - 80, ry + 48, 30, C.wash, C.accent, 2);
      text(ctx, lab, x + cw - 130, ry + 60, F(34, 800), C.ink);
      text(ctx, 'الفاتورة', x + 330, ry + 42, F(22, 600, UI), C.faint, 'center');
      text(ctx, 'المستلم', x + 170, ry + 42, F(22, 600, UI), C.faint, 'center');
      text(ctx, '=', x + 250, ry + 72, F(40, 900), C.green, 'center');
    }, { dx: -40, dy: 0 });
    stamp(ctx, springU(u, t + 0.45, SPRING.bouncy), x + 64, ry + 48, 22);
  });
  // "with what you actually received"
  const kr = springU(u, at(s, 'استلمته') - 0.2, SPRING.bouncy);
  pop(ctx, kr, 1400, 420, () => pillC(ctx, 1400, 386, 72, 'مع ما استلمته فعلًا', F(36, 900), { bg: C.lime, fg: C.ink, ico: 'check' }), { rise: 16 });
  // then record
  reveal(ctx, u, 'ثم سجّل:', R, 560, F(40, 700), C.muted, cue(s, 'ثم سجّل'));
  chipsRow(ctx, u, [['المشتريات', at(s, 'المشتريات') - 0.2, 'cart'], ['والمورد', at(s, 'والمورد') - 0.2, 'truck']], 600, R, { size: 36, h_: 76, bg: C.accent, fg: C.white, stroke: null });
  const kp = springU(u, at(s, 'الخطة') - 0.2, SPRING.bouncy);
  pop(ctx, kp, 1400, 760, () => {
    card(ctx, 980, 720, 844, 110, 26, C.wash, { shadow: false });
    icon(ctx, 'shield', R - 54, 775, 44, C.accent, { lw: 2 });
    text(ctx, 'في الخطة التي تدعمها', R - 100, 790, F(38, 800), C.ink);
  }, { from: 0.9, rise: 16 });
}

// 05 · Where: phones -> "new purchase from supplier"; accessories -> "receive goods".
function purchase(ctx, u) {
  bg(ctx, 'paper');
  const s = 's05';
  kicker(ctx, 'في البرنامج', 'grid');
  reveal(ctx, u, 'شراء جديد من مورّد', R, 230, F(84, 900), C.ink, cue(s, 'شراء جديد من مورّد'));
  const tB = at(s, 'وللإكسسوارات'), q = E.inOutCubic(prog(u, tB - 0.3, tB + 0.5));
  if (q < 1) {
    ctx.save(); ctx.globalAlpha = 1 - q; ctx.translate(0, -q * 60);
    const sc = 1.7, sx0 = 0, sy0 = 66, x = (1920 - 1008 * sc) / 2, y = 290;
    const k0 = springU(u, S.START[4] - 0.6, SPRING.gentle);
    enter(ctx, k0, () => {
      cutout(ctx, S.IMG.imei, [sx0, sy0, 1008, 282], x, y, sc);
      const map = (px, py) => [x + (px - sx0) * sc, y + (py - sy0) * sc, sc];
      rings(ctx, u, map, [
        [627, 78, 160, 36, at(s, 'شراء') - 0.15, at(s, 'المورد') - 0.2],
        [15, 140, 993, 118, at(s, 'المورد') - 0.15, at(s, 'ورقم') - 0.2],
        [685, 272, 322, 62, at(s, 'ورقم') - 0.15, at(s, 'وتاريخ') - 0.2],
        [350, 272, 323, 62, at(s, 'وتاريخ') - 0.15, at(s, 'وطريقة') - 0.2],
        [15, 272, 323, 62, at(s, 'وطريقة') - 0.15],
      ]);
    }, { dy: 80 });
    const T = [['المورد', 'المورد', 'truck'], ['رقم فاتورته', 'ورقم', 'receipt'], ['تاريخ الشراء', 'وتاريخ', 'calendar'], ['طريقة الدفع', 'وطريقة', 'cash']];
    T.forEach(([lab, word, ico], i) => tagAt(ctx, u, 960, 900, lab, at(s, word) - 0.15, { ico, size: 36, h_: 72, off: i < 3 ? at(s, T[i + 1][1]) - 0.25 : undefined }));
    reveal(ctx, u, 'للهواتف', 1060, 230, F(44, 800), C.accent, cue(s, 'للهواتف'));
    ctx.restore();
  }
  if (q > 0) {
    // the products screen's button row, large
    const s_ = 2.2, sx0 = 250, sy0 = 166, x = (1920 - 756 * s_) / 2, y = 450;
    enter(ctx, q, () => {
      cutout(ctx, S.IMG.products, [sx0, sy0, 756, 80], x, y, s_);
      const map = (px, py) => [x + (px - sx0) * s_, y + (py - sy0) * s_, s_];
      rings(ctx, u, map, [[326, 186, 128, 40, at(s, 'استلام') - 0.15]], C.green);
    }, { dy: 120 });
    reveal(ctx, u, 'وللإكسسوارات: زر استلام بضاعة', R, 350, F(56, 900), C.ink, cue(s, 'وللإكسسوارات زر استلام بضاعة'), { colors: { 2: C.green, 3: C.green } });
    reveal(ctx, u, 'في شاشة المنتجات', R, 740, F(40, 700), C.muted, cue(s, 'في شاشة المنتجات'));
  }
}

// 06 · Paying an expense: reason, amount, date, a reference; never twice.
function expense(ctx, u) {
  bg(ctx, 'paper');
  const s = 's06';
  kicker(ctx, 'المصاريف', 'wallet');
  reveal(ctx, u, 'عند دفع مصروف', R, 250, F(96, 900), C.ink, cue(s, 'عند دفع مصروف'));
  const x = 1000, y = 320, cw = R - x;
  const k0 = springU(u, at(s, 'دوّن') - 0.4, SPRING.snappy);
  enter(ctx, k0, () => { card(ctx, x, y, cw, 520, 30, C.white, { stroke: C.line }); exampleTag(ctx, x + 30, y + 30); }, { dy: 40 });
  const FL = [['السبب', 'فاتورة الكهرباء', 'السبب', false], ['المبلغ', '4,000 دج', 'والمبلغ', false], ['التاريخ', '16/10', 'والتاريخ', true], ['المرجع', 'وصل رقم 0231', 'بالمرجع', false]];
  FL.forEach(([lab, val, word, isLtr], i) => {
    const t = at(s, word), col = i % 2, row = (i / 2) | 0;
    const fx = col === 0 ? R - 40 - 370 : R - 40 - 370 - 24 - 370, fy = y + 120 + row * 180;
    const k = springU(u, t - 0.3, SPRING.snappy);
    enter(ctx, k, () => field(ctx, fx, fy, 370, lab, val, prog(u, t, t + 0.5), { ltrValue: isLtr, focus: 1 - prog(u, t + 0.5, t + 1) }), { dy: 30 });
  });
  // not twice
  const tN = at(s, 'ولا'), strike = E.outCubic(prog(u, at(s, 'مرتين'), at(s, 'مرتين') + 0.5));
  [0, 1].forEach((i) => {
    const k = springU(u, tN - 0.3 + i * 0.3, SPRING.snappy);
    enter(ctx, k, () => ledgerRow(ctx, L0 + 20, 400 + i * 112, 780, 'مصروف: فاتورة الكهرباء', 4000, C.amber, { sign: '−', sub: '16/10 · وصل 0231', tint: i ? C.redWash : '#f6f8fd', strike: i ? strike : 0 }), { dx: -60, dy: 0 });
  });
  const kx = springU(u, at(s, 'مرتين') + 0.3, SPRING.bouncy);
  pop(ctx, kx, 500, 700, () => pillC(ctx, 500, 668, 64, 'نفس الحركة مرة واحدة فقط', F(32, 800), { bg: C.red, fg: C.white, ico: 'x' }), { rise: 16 });
  reveal(ctx, u, 'ولا تسجّل نفس الحركة مرتين.', R, 940, F(52, 800), C.ink, cue(s, 'ولا تسجّل نفس الحركة مرتين'), { colors: { 4: C.red } });
}

// 07 · The finance screen: add expense, current balance, totals, net profit, the movements table.
const FIN = [
  { lab: 'إضافة مصروف', ico: 'plus', t: 'إضافة', r: [223, 37, 147, 40] },
  { lab: 'الرصيد الحالي', ico: 'wallet', t: 'والرصيد', r: [853, 123, 155, 88] },
  { lab: 'إجمالي المقبوضات', ico: 'cash', t: 'وإجمالي', r: [685, 123, 160, 88] },
  { lab: 'إجمالي المصروفات', ico: 'receipt', t: 'والمصروفات', r: [518, 123, 160, 88] },
  { lab: 'صافي الربح', ico: 'trend', t: 'وصافي', r: [350, 123, 160, 88] },
  { lab: 'جدول الحركات المالية', ico: 'list', t: 'جدول', r: [15, 312, 993, 95] },
];
const COLS = [['التاريخ', 'التاريخ', [900, 365, 100, 38]], ['نوع العملية', 'ونوع', [700, 365, 130, 38]], ['المبلغ', 'والمبلغ', [410, 365, 80, 38]], ['المستخدم', 'والمستخدم', [330, 365, 90, 38]], ['المرجع', 'والمرجع', [120, 365, 80, 38]]];
function finance(ctx, u) {
  bg(ctx, 'paper');
  const s = 's07';
  kicker(ctx, 'في البرنامج', 'chart');
  reveal(ctx, u, 'شاشة المالية', R, 230, F(90, 900), C.ink, cue(s, 'شاشة المالية'));
  const img = S.IMG.finance, x = L0, y = 290, cw = R - L0, ch = 690;
  const tT = at(s, 'جدول');
  const [cx, cy, z] = camera(u, [[S.START[6] - 1, [0.5, 0.3, 1]], [tT - 0.4, [0.5, 0.78, 1.05]]]);
  const k0 = springU(u, S.START[6] - 0.8, SPRING.gentle);
  enter(ctx, k0, () => {
    const map = screen(ctx, img, x, y, cw, ch, { zoom: z, cx, cy });
    ctx.save(); rrect(ctx, x, y, cw, ch, 18); ctx.clip();
    rings(ctx, u, map, [
      ...FIN.map((p, i) => [...p.r, at(s, p.t) - 0.15, i < FIN.length - 1 ? at(s, FIN[i + 1].t) - 0.2 : at(s, 'التاريخ') - 0.2]),
      ...COLS.map(([, word, r], i) => [...r, at(s, word) - 0.15, i < COLS.length - 1 ? at(s, COLS[i + 1][1]) - 0.2 : undefined]),
    ]);
    ctx.restore();
  }, { dy: 120 });
  [...FIN.map((p) => [p.lab, p.t, p.ico]), ...COLS.map(([lab, word]) => [lab, word, 'list'])].forEach(([lab, word, ico], i, arr) => {
    const t0 = at(s, word), t1 = i < arr.length - 1 ? at(s, arr[i + 1][1]) : undefined;
    tagAt(ctx, u, 960, 920, lab, t0 - 0.15, { ico, size: 36, h_: 72, off: t1 !== undefined ? t1 - 0.25 : undefined });
  });
}

// 08 · A debt repayment: the person, the amount, the balance after; never mixed with sales.
function repayment(ctx, u) {
  bg(ctx, 'paper');
  const s = 's08';
  kicker(ctx, 'التسديدات', 'cash');
  reveal(ctx, u, 'عند تسديد دين', R, 250, F(96, 900), C.ink, cue(s, 'عند تسديد دين'));
  const x = 110, y = 310, cw = 800;
  const k0 = springU(u, at(s, 'تحقق') - 0.4, SPRING.snappy);
  enter(ctx, k0, () => { card(ctx, x, y, cw, 470, 30, C.white, { stroke: C.line }); exampleTag(ctx, x + 30, y + 30); text(ctx, 'تسديد', x + cw - 40, y + 70, F(40, 900), C.ink); }, { dx: -160, dy: 0 });
  const P = [['الشخص', 'كريم ب.', 'الشخص'], ['المبلغ', '10,000 دج', 'والمبلغ']];
  P.forEach(([lab, val, word], i) => {
    const t = at(s, word), ry = y + 110 + i * 110, k = springU(u, t - 0.25, SPRING.snappy);
    enter(ctx, k, () => {
      rrect(ctx, x + 30, ry, cw - 60, 94, 16); ctx.fillStyle = '#f6f8fd'; ctx.fill();
      text(ctx, lab, x + cw - 60, ry + 60, F(34, 800), C.muted);
      text(ctx, val, x + 330, ry + 60, F(38, 900), C.ink, 'center');
    }, { dx: -40, dy: 0 });
    stamp(ctx, springU(u, t + 0.45, SPRING.bouncy), x + 70, ry + 47, 24);
  });
  const kr = springU(u, at(s, 'الرصيد') - 0.25, SPRING.snappy);
  enter(ctx, kr, () => {
    rrect(ctx, x + 30, y + 340, cw - 60, 104, 16); ctx.fillStyle = C.wash; ctx.fill();
    text(ctx, 'الرصيد المتبقي', x + cw - 60, y + 404, F(36, 900), C.ink);
    money(ctx, 15000, x + 330, y + 408, 50, C.accent);
  }, { dy: 20 });
  // three separate drawers
  const D = [['البيع', 'receipt', C.accent, 'البيع'], ['المقبوضات', 'cash', C.green, 'بالمقبوضات'], ['التسديدات', 'repeat', C.amber, 'التسديدات']];
  D.forEach(([lab, ico, col, word], i) => {
    const xr = R - i * 300, k = springU(u, at(s, word) - 0.25, SPRING.bouncy);
    pop(ctx, k, xr - 135, 520, () => {
      card(ctx, xr - 270, 360, 270, 320, 26, C.white, { stroke: C.line });
      badge(ctx, ico, xr - 135, 470, 56, C.wash, col, 1.8);
      text(ctx, lab, xr - 135, 610, F(36, 900), C.ink, 'center');
    }, { from: 0.6, rise: 40 });
  });
  const kw = springU(u, at(s, 'تخلط') - 0.2, SPRING.bouncy);
  pop(ctx, kw, 1380, 760, () => pillC(ctx, 1380, 728, 66, 'لا تخلط بينها', F(34, 900), { bg: C.ink, fg: C.white, ico: 'alert', icoColor: C.lime }), { rise: 16 });
  reveal(ctx, u, 'ثم راجع الرصيد المتبقي بعد التسجيل.', R, 930, F(50, 800), C.ink, cue(s, 'ثم راجع الرصيد المتبقي بعد التسجيل'), { colors: { 2: C.accent, 3: C.accent } });
}

// 09 · When something doesn't match: find the original operation first; ask support about returns.
function mismatch(ctx, u) {
  bg(ctx, 'navy');
  const s = 's09', wh = 'rgba(255,255,255,.78)';
  icon(ctx, 'alert', R - 22, 108, 44, C.lime, { lw: 2.2 });
  text(ctx, 'عند ظهور اختلاف', R - 60, 122, F(34, 700, UI), C.lime);
  headline(ctx, u, 'راجع العملية الأصلية', R, 280, F(100, 900), C.white, cue(s, 'راجع العملية الأصلية'), [1, 2, at(s, 'الأصلية') + 0.2], { box: true });
  reveal(ctx, u, 'قبل إدخال أي تصحيح.', R, 380, F(52, 700), wh, cue(s, 'قبل إدخال أي تصحيح'));
  // the order: difference -> original -> correction
  const STEP = [['الاختلاف', 'alert', at(s, 'وعند')], ['العملية الأصلية', 'search', at(s, 'الأصلية')], ['ثم التصحيح', 'check', at(s, 'تصحيح')]];
  STEP.forEach(([lab, ico, t], i) => {
    const xr = R - i * 600, k = springU(u, t - 0.2, SPRING.bouncy);
    pop(ctx, k, xr - 240, 560, () => {
      card(ctx, xr - 480, 460, 480, 200, 28, i === 1 ? C.lime : 'rgba(255,255,255,.08)', { shadow: false, stroke: i === 1 ? null : 'rgba(255,255,255,.2)' });
      icon(ctx, ico, xr - 70, 560, 56, i === 1 ? C.ink : C.lime, { lw: 2 });
      text(ctx, lab, xr - 130, 576, F(42, 900), i === 1 ? C.ink : C.white);
      text(ctx, String(i + 1), xr - 450, 510, F(30, 900), i === 1 ? C.ink : 'rgba(255,255,255,.5)');
    }, { from: 0.6, rise: 40 });
    if (i < 2) arrowLeft(ctx, xr - 492, xr - 588, 560, 'rgba(255,255,255,.5)', E.outCubic(prog(u, STEP[i + 1][2] - 0.5, STEP[i + 1][2] - 0.1)));
  });
  // ask support
  const ka = springU(u, at(s, 'واسأل') - 0.3, SPRING.snappy);
  enter(ctx, ka, () => {
    card(ctx, L0 + 20, 740, 1708, 220, 30, C.wa);
    icon(ctx, 'chat', R - 70, 850, 64, C.white, { lw: 2 });
  }, { dy: 50 });
  reveal(ctx, u, 'اسأل الدعم عن معالجة المرتجعات أو الاستبدال', R - 140, 840, F(48, 900), C.white, cue(s, 'واسأل الدعم عن معالجة المرتجعات أو الاستبدال'), { colors: { 4: C.lime, 6: C.lime } });
  reveal(ctx, u, 'حسب نسختك · واتساب 0655970064', R - 140, 910, F(32, 700, UI), 'rgba(255,255,255,.85)', cue(s, 'حسب نسختك'));
}

// 10 · Make it a daily habit: open, during the day, before closing, end the day.
const DAY = [
  { lab: 'عند فتح المحل', sub: 'تحقق من نقطة البداية', ico: 'shop', t: 'فتح' },
  { lab: 'أثناء العمل', sub: 'سجّل كل حركة في وقتها', ico: 'clock', t: 'وأثناء' },
  { lab: 'قبل الإغلاق', sub: 'طابق', ico: 'check', t: 'الإغلاق' },
  { lab: 'أنهِ اليوم', sub: 'بعد المطابقة', ico: 'lock', t: 'أنهِ' },
];
function routine(ctx, u) {
  bg(ctx, 'paper');
  const s = 's10';
  kicker(ctx, 'عادة يومية', 'calendar');
  reveal(ctx, u, 'يوم عمل منظّم', R, 250, F(96, 900), C.ink, [S.START[9] - 0.5, S.START[9] - 0.3, S.START[9] - 0.1]);
  // the day's line, right (morning) to left (closing)
  const y = 560, x0 = R - 160, x1 = L0 + 160;
  const pl = E.inOutCubic(prog(u, at(s, 'فتح') - 0.3, at(s, 'أنهِ') + 0.3));
  ctx.save(); ctx.strokeStyle = C.line; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
  ctx.strokeStyle = C.accent; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(lerp(x0, x1, pl), y); ctx.stroke(); ctx.restore();
  DAY.forEach((d, i) => {
    const cx = lerp(x0, x1, i / 3), t = at(s, d.t), k = springU(u, t - 0.25, SPRING.bouncy);
    pop(ctx, k, cx, y, () => {
      ctx.beginPath(); ctx.arc(cx, y, 56, 0, Math.PI * 2); ctx.fillStyle = i === 3 ? C.green : C.accent; ctx.fill();
      icon(ctx, d.ico, cx, y, 54, C.white, { lw: 2 });
    }, { from: 0.3 });
    const kt = springU(u, t - 0.1, SPRING.snappy);
    enter(ctx, kt, () => {
      text(ctx, d.lab, cx, y - 110, F(40, 900), C.ink, 'center');
      card(ctx, cx - 200, y + 100, 400, 150, 24, C.white, { stroke: C.line, shade: 0.12 });
      text(ctx, d.sub, cx, y + 190, F(32, 800), i === 3 ? C.green : C.accent, 'center');
    }, { dy: 30 });
  });
  stamp(ctx, springU(u, at(s, 'اليوم', 0) + 0.4, SPRING.bouncy), x1, y - 70, 26);
}

// 11 · Checkpoint: every movement tied to a date and a reason (and a person when needed); no mixing.
const ROWS11 = [
  { str: 'بتاريخ', cue: 'بتاريخ' },
  { str: 'وسبب', cue: 'وسبب' },
  { str: 'وبشخص عند الحاجة', cue: 'وبشخص عند الحاجة' },
];
const check = checkScene({
  sid: 's11', head: 'كل حركة مرتبطة:', headCue: 'كل حركة مرتبطة', headSize: 96,
  rowsL: 1060, rowsY: 340, rowGap: 150, rows: ROWS11,
  body(ctx, u) {
    const s = 's11';
    const t = at(s, 'دون'), k0 = springU(u, t - 0.3, SPRING.snappy);
    enter(ctx, k0, () => {
      card(ctx, 120, 340, 860, 430, 28, C.white, { stroke: '#cfe9dc', shade: 0.12 });
      text(ctx, 'دون خلط:', 120 + 860 - 40, 410, F(40, 900), C.ink);
    }, { dx: -120, dy: 0 });
    [['البيع', 'receipt', 'البيع'], ['المقبوضات', 'cash', 'بالمقبوضات'], ['التسديدات', 'repeat', 'التسديدات']].forEach(([lab, ico, word], i) => {
      const xr = 120 + 860 - 30 - i * 270, k = springU(u, at(s, word) - 0.2, SPRING.bouncy);
      pop(ctx, k, xr - 120, 580, () => {
        rrect(ctx, xr - 240, 460, 240, 260, 22); ctx.fillStyle = C.mint; ctx.fill();
        badge(ctx, ico, xr - 120, 550, 46, C.white, C.green, 1.8);
        text(ctx, lab, xr - 120, 670, F(32, 900), C.ink, 'center');
      }, { from: 0.6, rise: 30 });
    });
  },
});

// 12 · Next (the last) episode and the two asks.
const next = nextScene({
  sid: 's12', kicker: 'في الحلقة الأخيرة', sub: 'النتائج والصلاحيات وحفظ البيانات', subCue: 'النتائج والصلاحيات وحفظ البيانات', shots: ['reports', 'dash'],
  shotCues: ['النتائج', 'البيانات'], trialCue: 'اطلب تجربتك', subscribeCue: 'واشترك',
});
const endCard = endScene({ shot: 'reports', panelTitle: 'الحلقة 6 · راجع وراقب' });

episode({
  n: 5,
  scenes: [hook, series, rule, arrival, purchase, expense, finance, repayment, mismatch, routine, check, next, endCard],
  hits(H_) {
    H_(at('s01', 'مصروف') + 0.2, 'missing expense', 'blip', { pitch: 'E5', gain: 0.45 });
    H_(at('s01', 'سُجّل') + 0.05, 'counted twice', 'pop', { pitch: 'D5', gain: 0.45 });
    H_(at('s01', 'تتطابق') - 0.1, 'difference', 'blip', { pitch: 'C5', gain: 0.5 });
    H_(at('s01', 'حدوثها') + 0.2, 'the rule', 'bell', { pitch: 'D6', gain: 0.45 });
    H_(cue('s02', 'فان كاش')[0], 'logo', 'bell', { pitch: 'D6', gain: 0.5 });
    H_(cue('s02', 'بعد أول بيع')[0], 'stages done', 'tick', { gain: 0.55 });
    H_(at('s02', 'اليوم'), 'episode 5 chip', 'bell', { pitch: 'A5', gain: 0.5 });
    ['التاريخ', 'والسبب', 'والشخص'].forEach((wd, i) => H_(at('s03', wd) - 0.2, `explain ${wd}`, 'pop', { pitch: ['D5', 'F#5', 'A5'][i], gain: 0.42 }));
    CHK.forEach(([, , wd]) => H_(at('s04', wd) + 0.45, `matched ${wd}`, 'tick', { gain: 0.5 }));
    H_(at('s04', 'المشتريات') - 0.2, 'record purchase', 'pop', { pitch: 'A5', gain: 0.42 });
    ['شراء', 'المورد', 'ورقم', 'وتاريخ', 'وطريقة', 'استلام'].forEach((wd) => H_(at('s05', wd) - 0.15, `purchase ${wd}`, 'click', { gain: 0.42 }));
    ['السبب', 'والمبلغ', 'والتاريخ', 'بالمرجع'].forEach((wd) => H_(at('s06', wd), `expense ${wd}`, 'tick', { gain: 0.42 }));
    H_(at('s06', 'مرتين'), 'struck', 'blip', { pitch: 'C5', gain: 0.45 });
    [...FIN.map((p) => p.t), ...COLS.map((c) => c[1])].forEach((wd) => H_(at('s07', wd) - 0.15, `finance ${wd}`, 'click', { gain: 0.4 }));
    ['الشخص', 'والمبلغ'].forEach((wd) => H_(at('s08', wd) + 0.45, `verified ${wd}`, 'tick', { gain: 0.5 }));
    H_(at('s08', 'الرصيد') - 0.25, 'balance', 'pop', { pitch: 'A5', gain: 0.42 });
    H_(at('s09', 'الأصلية') - 0.2, 'original first', 'pop', { pitch: 'F#5', gain: 0.45 });
    H_(at('s09', 'واسأل') - 0.3, 'support', 'bell', { pitch: 'A5', gain: 0.42 });
    DAY.forEach((d, i) => H_(at('s10', d.t) - 0.25, `day ${d.lab}`, 'pop', { pitch: ['D5', 'F#5', 'A5', 'D6'][i], gain: 0.42 }));
    ROWS11.forEach((r, i) => H_(cue('s11', r.cue).at(-1) + 0.4, `check ${r.str}`, 'bell', { pitch: ['A5', 'B5', 'D6'][i], gain: 0.55 }));
    H_(cue('s12', 'اطلب تجربتك')[0] - 0.15, 'cta trial', 'pop', { gain: 0.45 });
    H_(cue('s12', 'واشترك')[0] - 0.15, 'cta subscribe', 'bell', { pitch: 'D6', gain: 0.45 });
  },
});
