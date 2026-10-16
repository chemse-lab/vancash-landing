// VanCash ERP · الحلقة 3: رتّب الحسابات. A pure function of time.
// The voice-over drives the cut (shared/score.py -> vo_timeline.json, vo_words.json); every element
// enters on the word that names it, looked up by its spoken text (cue/at in shared/kit.js).
// Screens are the real app screenshots from the landing page (shared/shots/). Names, dates and
// balances on drawn cards are illustrations and are labelled as examples; the worked numbers
// (75,000 / 50,000 / 25,000, cost 68,000, margin 7,000) are the landing page's own example.
import * as K from '../shared/kit.js';

const {
  M, E, prog, lerp, clamp, springU, SPRING, rrect, C, F, UI, R, L0, S, cue, at,
  lineLayout, text, ltr, reveal, marker, headline, card, pop, enter, pill, pillW, pillC, icon, badge, stamp, stepNo,
  arrowLeft, screen, cutout, ring, rings, camera, kicker, chipsRow, bg, hookHeader, textW, tagAt,
  seriesScene, checkScene, nextScene, endScene, episode, money, mini,
} = K;

// ================================================================ scenes
// 01 · Hook: "I paid you last week." Can you show it?
function hook(ctx, u) {
  bg(ctx, 'paper'); hookHeader(ctx, u);
  const s = 's01';
  const dim = 1 - 0.6 * E.inOutCubic(prog(u, at(s, 'عندما') - 0.6, at(s, 'عندما')));
  // the customer's words, in a speech bubble
  reveal(ctx, u, 'زبون يقول لك:', R, 280, F(46, 700), C.muted, [-0.3, ...cue(s, 'يقول لك')], { alpha: dim });
  const kb = springU(u, at(s, 'سدّدت') - 0.4, SPRING.snappy);
  ctx.save(); ctx.globalAlpha = dim;
  pop(ctx, kb, R - 380, 380, () => {
    card(ctx, R - 820, 318, 820, 128, 40, C.white, { stroke: C.line });
    ctx.beginPath(); ctx.moveTo(R - 70, 444); ctx.lineTo(R - 30, 488); ctx.lineTo(R - 120, 444); ctx.fillStyle = C.white; ctx.fill();
    badge(ctx, 'user', R - 70, 382, 36, C.wash, C.accent, 2);
  }, { from: 0.8, rise: 30 });
  ctx.restore();
  reveal(ctx, u, '«سدّدت لك الأسبوع الماضي»', R - 130, 405, F(58, 900), C.ink, cue(s, 'سدّدت لك الأسبوع الماضي'), { alpha: dim });
  headline(ctx, u, 'هل عندك ما يوضّح ذلك؟', R, 590, F(84, 900), C.accent, cue(s, 'هل عندك ما يوضّح ذلك'), [3, 3, at(s, 'يوضّح') + 0.2], { alpha: dim });
  reveal(ctx, u, 'عندما يرتبط كل مبلغ بصاحبه وبسبب واضح،', R, 760, F(50, 800), C.ink, cue(s, 'عندما يرتبط كل مبلغ بصاحبه وبسبب واضح'), { colors: { 4: C.accent, 5: C.accent, 6: C.accent } });
  headline(ctx, u, 'لا تحتاج إلى الذاكرة.', R, 900, F(100, 900), C.ink, cue(s, 'لا تحتاج إلى الذاكرة'), [3, 3, at(s, 'الذاكرة') + 0.25]);

  // the customer's account: each amount with its owner and its reason; the payment is there
  const k0 = springU(u, -0.6, SPRING.gentle);
  const x = 110, y = 250, cw = 700, ch = 640;
  enter(ctx, k0, () => {
    card(ctx, x, y, cw, ch, 30, C.white, { stroke: C.line });
    badge(ctx, 'user', x + cw - 70, y + 72, 40, C.wash, C.accent, 2);
    text(ctx, 'حساب الزبون: كريم ب.', x + cw - 130, y + 86, F(40, 900), C.ink);
    mini(ctx, 'مثال', x + 30 + pillW(ctx, 'مثال', F(22, 700, UI), 40, null, 14), y + 52);
  }, { dx: -200, dy: 0 });
  const ROWS = [
    { lab: 'بيع هاتف · كريدي', date: '14/09', n: 25000, sign: '+', col: C.amber, t: at(s, 'يرتبط') },
    { lab: 'تسديد نقدًا', date: '09/10', n: 10000, sign: '−', col: C.green, t: at(s, 'بصاحبه'), hi: true },
  ];
  ROWS.forEach((r, i) => {
    const ry = y + 150 + i * 150;
    const k = springU(u, r.t - 0.3, SPRING.snappy);
    enter(ctx, k, () => {
      rrect(ctx, x + 30, ry, cw - 60, 124, 18); ctx.fillStyle = r.hi ? C.mint : '#f6f8fd'; ctx.fill();
      text(ctx, r.lab, x + cw - 60, ry + 54, F(36, 800), C.ink);
      ltr(ctx, r.date, x + cw - 60, ry + 98, F(26, 600, UI), C.muted, 'right');
      money(ctx, r.n, x + 330, ry + 78, 44, r.col, { sign: r.sign });
    }, { dy: 30 });
    if (r.hi) ring(ctx, x + 30, ry, cw - 60, 124, springU(u, at(s, 'وبسبب'), SPRING.snappy), C.green);
  });
  const kt = springU(u, at(s, 'واضح') - 0.2, SPRING.snappy);
  enter(ctx, kt, () => {
    ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 40, y + 478); ctx.lineTo(x + cw - 40, y + 478); ctx.stroke();
    text(ctx, 'الرصيد', x + cw - 60, y + 560, F(40, 900), C.ink);
    money(ctx, 15000, x + 330, y + 562, 56, C.accent);
  }, { dy: 20 });
}

// 02 · The series.
const series = seriesScene({
  sid: 's02', lead: 'الحلقة الثالثة من سلسلة تشغيل', brand: 'فان كاش', done: 'بعد إدخال المخزون',
  recap: 'بعد إدخال المخزون،', today: 'اليوم', goal: 'من له؟ ومن عليه؟ الزبائن والموردون والديون.', goalCue: 'من له ومن عليه الزبائن والموردون والديون',
});

// 03 · The customer card: a distinct name, a phone; optional second phone, city, address.
function customer(ctx, u) {
  bg(ctx, 'paper');
  const s = 's03';
  stepNo(ctx, springU(u, S.START[2] - 0.4, SPRING.bouncy), R - 44, 222, 1, 44);
  reveal(ctx, u, 'عرّف الأشخاص بوضوح', R - 112, 260, F(96, 900), C.ink, cue(s, 'عرّف الأشخاص بوضوح'));
  const img = S.IMG.customer, x = L0 + 20, y = 320, cw = 760, ch = 600;
  const k0 = springU(u, at(s, 'بطاقة') - 0.5, SPRING.gentle);
  enter(ctx, k0, () => {
    const map = screen(ctx, img, x, y, cw, ch, { cy: 0 });
    ctx.save(); rrect(ctx, x, y, cw, ch, 18); ctx.clip();
    rings(ctx, u, map, [
      [342, 95, 313, 42, at(s, 'اسمًا') - 0.15],
      [17, 95, 313, 42, at(s, 'ورقم') - 0.15],
      [342, 169, 313, 42, at(s, 'ثانوي') - 0.15],
      [17, 169, 313, 42, at(s, 'والمدينة') - 0.15],
      [17, 243, 638, 42, at(s, 'والعنوان') - 0.15],
    ]);
    ctx.restore();
  }, { dx: -160, dy: 0 });
  text(ctx, 'في بطاقة الزبون', R, 380, F(34, 700, UI), C.accent, 'right', clamp(prog(u, at(s, 'بطاقة'), at(s, 'بطاقة') + 0.4)));
  // a distinct name: two people, one first name
  const kn = springU(u, at(s, 'مميزًا') - 0.3, SPRING.snappy);
  pop(ctx, kn, 1380, 520, () => {
    card(ctx, 960, 420, 864, 230, 26, C.white, { stroke: C.line });
    badge(ctx, 'x', R - 60, 490, 26, C.redWash, C.red, 3);
    text(ctx, 'محمد', R - 110, 503, F(40, 800), C.muted);
    text(ctx, 'اسم يتكرّر عند أكثر من زبون', 1300, 503, F(26, 500, UI), C.faint);
    badge(ctx, 'check', R - 60, 590, 26, C.mint, C.green, 3);
    text(ctx, 'محمد بلقاسم · باب الوادي', R - 110, 603, F(40, 900), C.ink);
  }, { from: 0.85, rise: 30 });
  text(ctx, 'ثم:', R, 728, F(30, 700, UI), C.muted, 'right', clamp(prog(u, at(s, 'ورقم') - 0.2, at(s, 'ورقم') + 0.3)));
  chipsRow(ctx, u, [['الهاتف', at(s, 'ورقم') - 0.2, 'phone']], 750, R, { size: 32, h_: 64 });
  text(ctx, 'ويمكنك إضافة:', R, 868, F(30, 700, UI), C.muted, 'right', clamp(prog(u, at(s, 'ويمكنك') - 0.2, at(s, 'ويمكنك') + 0.3)));
  chipsRow(ctx, u, [['هاتف ثانوي', at(s, 'ثانوي') - 0.2, 'phone'], ['المدينة', at(s, 'والمدينة') - 0.2, 'globe'], ['العنوان', at(s, 'والعنوان') - 0.2, 'shop']], 890, R,
    { size: 32, h_: 64, bg: C.wash, fg: C.accent, stroke: null });
}

// 04 · The terms: price level, credit limit, grace period; and never one person in two records.
const TERMS = [
  { lab: 'مستوى السعر', sub: 'تجزئة أو جملة', ico: 'tag', t: 'مستوى', r: [342, 317, 313, 50] },
  { lab: 'سقف الدين', sub: 'أقصى مبلغ مسموح', ico: 'wallet', t: 'وسقف', r: [17, 317, 313, 42] },
  { lab: 'مدة السماح', sub: '30 / 60 / 90 يومًا', ico: 'calendar', t: 'ومدة', r: [342, 399, 313, 42] },
];
function terms(ctx, u) {
  bg(ctx, 'paper');
  const s = 's04';
  kicker(ctx, 'شروط التعامل مع الزبون', 'user');
  TERMS.forEach((p, i) => {
    const xr = R - i * 576, x = xr - 540, y = 170;
    const k = springU(u, at(s, p.t) - 0.25, SPRING.bouncy);
    pop(ctx, k, x + 270, y + 110, () => {
      card(ctx, x, y, 540, 220, 28, C.white, { stroke: C.line });
      badge(ctx, p.ico, xr - 80, y + 82, 48, C.wash, C.accent, 1.8);
      text(ctx, p.lab, xr - 150, y + 100, F(50, 900), C.ink);
      text(ctx, p.sub, xr - 40, y + 180, F(30, 600, UI), C.muted);
    }, { from: 0.7, rise: 40 });
  });
  reveal(ctx, u, 'حسب طريقة تعاملك مع الزبون.', R, 470, F(44, 700), C.muted, cue(s, 'حسب طريقة تعاملك مع الزبون'));
  // the real form, the three fields ringed in turn
  const k0 = springU(u, S.START[3] - 0.6, SPRING.gentle);
  enter(ctx, k0, () => {
    const sc = 1.45;
    cutout(ctx, S.IMG.customer, [0, 290, 680, 170], L0 + 20, 540, sc);
    const map = (sx, sy) => [L0 + 20 + sx * sc, 540 + (sy - 290) * sc, sc];
    rings(ctx, u, map, TERMS.map((p, i) => [...p.r, at(s, p.t) - 0.15, i < 2 ? at(s, TERMS[i + 1].t) - 0.2 : at(s, 'وتحقق') - 0.3]));
  }, { dy: 80 });
  // one person, one record
  const tD = at(s, 'وتحقق'), kd = springU(u, tD - 0.3, SPRING.snappy);
  const merge = E.inOutCubic(prog(u, at(s, 'سجلّين') - 0.1, at(s, 'سجلّين') + 0.7));
  pop(ctx, kd, 1530, 760, () => {
    card(ctx, 1150, 540, 674, 440, 28, C.white, { stroke: C.line });
    text(ctx, 'نفس الشخص في سجلّين؟', R - 36, 606, F(38, 900), C.ink);
    [0, 1].forEach((i) => {
      const yy = lerp(650 + i * 110, 700, merge), a = i === 1 ? 1 - merge : 1;
      ctx.save(); ctx.globalAlpha *= a;
      rrect(ctx, 1190, yy, 594, 92, 16); ctx.fillStyle = '#f6f8fd'; ctx.fill(); ctx.strokeStyle = C.line; ctx.stroke();
      badge(ctx, 'user', R - 80, yy + 46, 28, C.wash, C.accent, 2);
      text(ctx, 'محمد بلقاسم', R - 126, yy + 58, F(34, 800), C.ink);
      ltr(ctx, i ? '0550 12 34 56' : '0550123456', 1220, yy + 58, F(28, 700, UI), C.muted);
      ctx.restore();
    });
    if (merge < 0.5) icon(ctx, 'alert', 1240, 606 - 12, 40, C.amber, { lw: 2.2 });
    stamp(ctx, springU(u, at(s, 'سجلّين') + 0.6, SPRING.bouncy), 1230, 746, 30);
    text(ctx, 'سجل واحد لكل شخص', R - 36, 940, F(32, 800), C.green, 'right', clamp(prog(u, at(s, 'سجلّين') + 0.5, at(s, 'سجلّين') + 0.9)));
  }, { from: 0.85, rise: 30 });
}

// 05 · Suppliers the same way: name, phone, address, notes.
const SUP = [
  { lab: 'الاسم', t: 'الاسم', r: [350, 95, 313, 42], ico: 'tag' },
  { lab: 'الهاتف', t: 'والهاتف', r: [25, 95, 313, 42], ico: 'phone' },
  { lab: 'العنوان', t: 'والعنوان', r: [25, 243, 638, 42], ico: 'shop' },
  { lab: 'الملاحظات', t: 'والملاحظات', r: [25, 425, 638, 66], ico: 'file' },
];
function supplier(ctx, u) {
  bg(ctx, 'paper');
  const s = 's05';
  kicker(ctx, 'بنفس الطريقة', 'truck');
  headline(ctx, u, 'أضف الموردين', R, 250, F(100, 900), C.ink, cue(s, 'أضف الموردين'), [1, 1, at(s, 'الموردين') + 0.2]);
  const img = S.IMG.supplier, x = L0 + 20, y = 300, cw = 800, ch = Math.round(cw * img.height / img.width);
  const k0 = springU(u, S.START[4] - 0.6, SPRING.gentle);
  enter(ctx, k0, () => {
    const map = screen(ctx, img, x, y, cw, ch);
    ctx.save(); rrect(ctx, x, y, cw, ch, 18); ctx.clip();
    rings(ctx, u, map, SUP.map((p, i) => [...p.r, at(s, p.t) - 0.15, i < 3 ? at(s, SUP[i + 1].t) - 0.2 : undefined]));
    ctx.restore();
  }, { dx: -160, dy: 0 });
  SUP.forEach((p, i) => {
    const k = springU(u, at(s, p.t) - 0.2, SPRING.bouncy);
    pop(ctx, k, R - 150, 375 + i * 86, () => pill(ctx, R, 345 + i * 86, 66, p.lab, F(34, 700, UI), { bg: C.white, fg: C.ink, ico: p.ico, stroke: C.line, icoColor: C.accent }), { from: 0.5, rise: 14 });
  });
  // why: to find them again while following the shop's purchases
  const tW = at(s, 'لتسهيل'), kw = springU(u, tW - 0.3, SPRING.snappy);
  enter(ctx, kw, () => {
    card(ctx, 1000, 720, 824, 220, 28, C.ink);
    icon(ctx, 'truck', R - 70, 800, 64, C.lime, { lw: 1.8 });
  }, { dy: 40 });
  reveal(ctx, u, 'لتسهيل الرجوع إليهم', R - 130, 812, F(46, 900), C.white, cue(s, 'لتسهيل الرجوع إليهم'));
  reveal(ctx, u, 'أثناء متابعة مشتريات المحل', R - 130, 886, F(36, 600, UI), 'rgba(255,255,255,.8)', cue(s, 'أثناء متابعة مشتريات المحل'));
}

// 06 · Existing debts: list them with dates; keep the opening balance apart from new sales.
const OLD = [['كريم ب.', 25000, '14/09'], ['سمير ع.', 8000, '02/10'], ['ورشة الأمل', 40000, '20/08']];
function opening(ctx, u) {
  bg(ctx, 'paper');
  const s = 's06';
  stepNo(ctx, springU(u, at(s, 'ثانيًا') - 0.4, SPRING.bouncy), R - 44, 222, 2, 44);
  reveal(ctx, u, 'راجع الديون القائمة', R - 112, 260, F(96, 900), C.ink, cue(s, 'راجع الديون القائمة'));
  // the list prepared beforehand: amounts and dates
  const x = 110, y = 330, cw = 760;
  const k0 = springU(u, at(s, 'حضّر') - 0.4, SPRING.snappy);
  enter(ctx, k0, () => {
    card(ctx, x, y, cw, 470, 28, C.white, { stroke: C.line });
    text(ctx, 'قائمة الديون السابقة', x + cw - 40, y + 76, F(40, 900), C.ink);
    mini(ctx, 'مثال', x + 30 + pillW(ctx, 'مثال', F(22, 700, UI), 40, null, 14), y + 44);
    text(ctx, 'الزبون', x + cw - 40, y + 136, F(24, 700, UI), C.faint);
    text(ctx, 'المبلغ', x + 420, y + 136, F(24, 700, UI), C.faint);
    text(ctx, 'التاريخ', x + 150, y + 136, F(24, 700, UI), C.faint);
  }, { dx: -160, dy: 0 });
  OLD.forEach(([name, n, d], i) => {
    const ry = y + 160 + i * 96;
    const k = springU(u, (i ? at(s, 'السابقة') : at(s, 'بالمبالغ')) - 0.2 + i * 0.25, SPRING.snappy);
    enter(ctx, k, () => {
      ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 30, ry + 82); ctx.lineTo(x + cw - 30, ry + 82); ctx.stroke();
      text(ctx, name, x + cw - 40, ry + 52, F(34, 800), C.ink);
      money(ctx, n, x + 420, ry + 54, 36, C.ink);
    }, { dx: -60, dy: 0 });
    const kd = springU(u, at(s, 'وتواريخها') - 0.2 + i * 0.15, SPRING.bouncy);
    pop(ctx, kd, x + 100, ry + 40, () => ltr(ctx, d, x + 150, ry + 52, F(30, 700, UI), C.accent, 'right'), { from: 0.5 });
  });
  // opening balance vs a new sale: two different things
  const kA = springU(u, at(s, 'الرصيد') - 0.3, SPRING.bouncy), kB = springU(u, at(s, 'بيع') - 0.3, SPRING.bouncy);
  pop(ctx, kA, 1600, 440, () => {
    card(ctx, 1404, 330, 420, 230, 26, C.ink);
    icon(ctx, 'file', R - 60, 392, 48, C.lime, { lw: 2 });
    text(ctx, 'رصيد افتتاحي', R - 110, 408, F(42, 900), C.white);
    text(ctx, 'ما كان قبل البرنامج', R - 36, 488, F(28, 500, UI), 'rgba(255,255,255,.75)');
  }, { from: 0.8, rise: 30 });
  const kv = springU(u, at(s, 'عن') - 0.1, SPRING.bouncy);
  pop(ctx, kv, 1374, 445, () => text(ctx, '≠', 1374, 472, F(60, 900), C.red, 'center'), { from: 0.3 });
  pop(ctx, kB, 1122, 440, () => {
    card(ctx, 920, 330, 424, 230, 26, C.white, { stroke: C.accent, lw: 3 });
    icon(ctx, 'receipt', 1344 - 60, 392, 48, C.accent, { lw: 2 });
    text(ctx, 'بيع جديد', 1344 - 110, 408, F(42, 900), C.ink);
    text(ctx, 'عملية بعد بدء التسجيل', 1344 - 36, 488, F(28, 500, UI), C.muted);
  }, { from: 0.8, rise: 30 });
  // the method your version offers
  const kn = springU(u, at(s, 'واستعمل') - 0.3, SPRING.snappy);
  pop(ctx, kn, 1372, 690, () => {
    card(ctx, 920, 620, 904, 150, 28, C.wash, { shadow: false });
    icon(ctx, 'shield', R - 64, 695, 52, C.accent, { lw: 2 });
  }, { from: 0.9, rise: 20 });
  reveal(ctx, u, 'استعمل الطريقة المتاحة في نسختك', R - 120, 712, F(42, 800), C.ink, cue(s, 'واستعمل الطريقة المتاحة في نسختك'));
  headline(ctx, u, 'افصل الرصيد الافتتاحي عن أي بيع جديد.', R, 930, F(52, 900), C.ink, cue(s, 'وميّز الرصيد الافتتاحي عن أي بيع جديد'), [1, 2, at(s, 'الافتتاحي') + 0.2]);
}

// 07 · Record what was actually received: total, paid, and the rest on the customer's account.
function received(ctx, u) {
  bg(ctx, 'paper');
  const s = 's07';
  stepNo(ctx, springU(u, at(s, 'ثالثًا') - 0.4, SPRING.bouncy), R - 44, 222, 3, 44);
  headline(ctx, u, 'دوّن المقبوض فعلًا', R - 112, 260, F(96, 900), C.ink, cue(s, 'دوّن المقبوض فعلًا'), [2, 2, at(s, 'فعلًا') + 0.2]);
  const kc = springU(u, at(s, 'الجزئي') - 0.3, SPRING.bouncy);
  pop(ctx, kc, R - 200, 365, () => pill(ctx, R, 332, 64, 'عند البيع بالدفع الجزئي', F(32, 700, UI), { bg: C.wash, fg: C.accent, ico: 'cash' }), { rise: 16 });
  // the equation, as blocks: total − paid = remaining
  const B = [
    { lab: 'إجمالي العملية', ico: 'receipt', t: 'إجمالي', col: C.ink, bgc: C.white },
    { lab: 'المبلغ المدفوع', ico: 'cash', t: 'والمبلغ', col: C.green, bgc: C.white },
    { lab: 'المتبقي على الزبون', ico: 'wallet', t: 'المتبقي', col: C.amber, bgc: '#fff6e6' },
  ];
  B.forEach((b, i) => {
    const xr = R - i * 600, x = xr - 500, y = 470;
    const k = springU(u, at(s, b.t) - 0.3, SPRING.bouncy);
    pop(ctx, k, x + 250, y + 150, () => {
      card(ctx, x, y, 500, 300, 30, b.bgc, { stroke: C.line });
      badge(ctx, b.ico, x + 250, y + 100, 56, C.wash, b.col === C.ink ? C.accent : b.col, 1.8);
      text(ctx, b.lab, x + 250, y + 230, F(44, 900), b.col, 'center');
    }, { from: 0.7, rise: 40 });
    if (i < 2) {
      const ko = springU(u, at(s, B[i + 1].t) - 0.5, SPRING.bouncy);
      pop(ctx, ko, xr - 550, y + 150, () => text(ctx, i === 0 ? '−' : '=', xr - 550, y + 178, F(90, 900), C.faint, 'center'), { from: 0.3 });
    }
  });
  headline(ctx, u, 'والفرق هو المبلغ المتبقي على الزبون.', R, 920, F(50, 800), C.ink, cue(s, 'والفرق هو المبلغ المتبقي على الزبون'), [3, 4, at(s, 'المتبقي') + 0.2]);
}

// 08 · The landing page's worked example: 75,000 sold, 50,000 received, 25,000 owed; cost 68,000, margin 7,000.
function example(ctx, u) {
  bg(ctx, 'navy');
  const s = 's08', wh = 'rgba(255,255,255,.75)';
  text(ctx, 'مثال بالأرقام', R, 140, F(40, 800), C.lime);
  const rowsL = [
    { lab: 'بعت هاتفًا بـ', n: 75000, t: cue(s, 'بعت هاتفًا [بخمسة وسبعين ألف دينار]')[2], col: C.white },
    { lab: 'وقبضت', n: 50000, t: cue(s, 'وقبضت [خمسين ألفًا]')[1], col: '#5fe3a8', sign: '−' },
    { lab: 'يبقى على الزبون', n: 25000, t: cue(s, 'يبقى على الزبون [خمسة وعشرون ألفًا]')[3], col: '#ffc46b', sum: true },
  ];
  const rowsR = [
    { lab: 'سعر البيع', n: 75000, t: at(s, 'وإذا'), col: C.white },
    { lab: 'تكلفة الشراء', n: 68000, t: cue(s, 'تكلفة الشراء [ثمانية وستين ألفًا]')[2], col: '#ff8f80', sign: '−' },
    { lab: 'هامش البيع', n: 7000, t: cue(s, 'فهامش البيع [سبعة آلاف دينار]')[2], col: C.lime, sum: true },
  ];
  const col = (rows, xR, title, ico, tIn) => {
    const k0 = springU(u, tIn, SPRING.snappy);
    enter(ctx, k0, () => {
      card(ctx, xR - 800, 200, 800, 700, 34, 'rgba(255,255,255,.06)', { shadow: false, stroke: 'rgba(255,255,255,.16)' });
      icon(ctx, ico, xR - 60, 270, 48, C.lime, { lw: 2 });
      text(ctx, title, xR - 110, 286, F(42, 900), C.white);
    }, { dy: 50 });
    rows.forEach((r, i) => {
      const y = 420 + i * 150 + (r.sum ? 30 : 0);
      const k = springU(u, r.t - 0.3, SPRING.snappy);
      if (r.sum) {
        const p = E.outCubic(prog(u, r.t - 0.5, r.t));
        ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(xR - 50, y - 92); ctx.lineTo(xR - 50 - 700 * p, y - 92); ctx.stroke(); ctx.restore();
      }
      enter(ctx, k, () => {
        text(ctx, r.lab, xR - 50, y, F(r.sum ? 40 : 36, r.sum ? 900 : 700), r.sum ? C.white : wh);
        money(ctx, r.n, xR - 360, y + 6, r.sum ? 72 : 60, r.col, { k: E.outCubic(prog(u, r.t - 0.2, r.t + 0.6)), sign: r.sign || '', unit: wh });
      }, { dy: 30 });
    });
  };
  col(rowsL, R, 'حساب الزبون', 'user', S.START[7] - 0.6);
  col(rowsR, L0 + 800, 'هامش البيع', 'chart', at(s, 'وإذا') - 0.4);
  const kn = springU(u, at(s, 'قبل') - 0.2, SPRING.bouncy);
  pop(ctx, kn, L0 + 400, 960, () => pillC(ctx, L0 + 400, 928, 64, 'قبل المصاريف', F(32, 800), { bg: C.lime, fg: C.ink, ico: 'alert' }), { rise: 16 });
}

// 09 · Tie each repayment to its owner; a repayment is not a new sale.
function repay(ctx, u) {
  bg(ctx, 'paper');
  const s = 's09';
  stepNo(ctx, springU(u, at(s, 'رابعًا') - 0.4, SPRING.bouncy), R - 44, 222, 4, 44);
  headline(ctx, u, 'اربط التسديد بصاحبه', R - 112, 260, F(96, 900), C.ink, cue(s, 'اربط التسديد بصاحبه'), [2, 2, at(s, 'بصاحبه') + 0.2]);
  // the account after a repayment
  const x = 110, y = 330, cw = 800;
  const k0 = springU(u, at(s, 'راجع') - 0.4, SPRING.snappy);
  enter(ctx, k0, () => {
    card(ctx, x, y, cw, 560, 30, C.white, { stroke: C.line });
    badge(ctx, 'user', x + cw - 70, y + 72, 40, C.wash, C.accent, 2);
    text(ctx, 'حساب الزبون: كريم ب.', x + cw - 130, y + 86, F(40, 900), C.ink);
    mini(ctx, 'مثال', x + 30 + pillW(ctx, 'مثال', F(22, 700, UI), 40, null, 14), y + 52);
  }, { dx: -160, dy: 0 });
  const L = [
    { lab: 'دين: بيع هاتف', n: 25000, sign: '+', col: C.amber, t: at(s, 'حساب') },
    { lab: 'تسديد', n: 10000, sign: '−', col: C.green, t: at(s, 'تسديد') },
  ];
  L.forEach((r, i) => {
    const ry = y + 150 + i * 130;
    const k = springU(u, r.t - 0.3, SPRING.snappy);
    enter(ctx, k, () => {
      rrect(ctx, x + 30, ry, cw - 60, 108, 18); ctx.fillStyle = i ? C.mint : '#f6f8fd'; ctx.fill();
      text(ctx, r.lab, x + cw - 60, ry + 68, F(38, 800), C.ink);
      money(ctx, r.n, x + 360, ry + 70, 46, r.col, { sign: r.sign });
    }, { dy: 30 });
  });
  const kb = springU(u, at(s, 'تسديد') + 0.4, SPRING.snappy);
  enter(ctx, kb, () => {
    ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 40, y + 420); ctx.lineTo(x + cw - 40, y + 420); ctx.stroke();
    text(ctx, 'الرصيد', x + cw - 60, y + 500, F(42, 900), C.ink);
    money(ctx, 15000, x + 360, y + 502, 60, C.accent);
  }, { dy: 20 });
  // wrong vs right
  const tN = at(s, 'ولا'), kw = springU(u, tN - 0.3, SPRING.snappy), kr = springU(u, at(s, 'كأنه') + 0.4, SPRING.snappy);
  const strike = E.outCubic(prog(u, at(s, 'كأنه'), at(s, 'كأنه') + 0.5));
  pop(ctx, kw, 1400, 450, () => {
    card(ctx, 1000, 340, 824, 210, 28, C.redWash, { shadow: false });
    badge(ctx, 'x', R - 60, 410, 30, C.white, C.red, 3);
    text(ctx, 'بيع جديد', R - 110, 424, F(44, 900), C.red);
    money(ctx, 10000, 1360, 426, 44, C.red, { sign: '+' });
    text(ctx, 'يرفع المبيعات ولا يُنقص الدين', R - 40, 500, F(30, 600, UI), C.red);
    if (strike > 0) { ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(R - 110, 410); ctx.lineTo(R - 110 - 520 * strike, 410); ctx.stroke(); ctx.restore(); }
  }, { from: 0.85, rise: 30 });
  pop(ctx, kr, 1400, 690, () => {
    card(ctx, 1000, 590, 824, 210, 28, C.mint, { shadow: false });
    badge(ctx, 'check', R - 60, 660, 30, C.white, C.green, 3);
    text(ctx, 'تسديد من دين كريم ب.', R - 110, 674, F(44, 900), C.green);
    money(ctx, 10000, 1300, 676, 44, C.green, { sign: '−' });
    text(ctx, 'يُنقص رصيد الزبون', R - 40, 750, F(30, 600, UI), C.green);
  }, { from: 0.85, rise: 30 });
  reveal(ctx, u, 'ولا تسجّل تسديد الدين كأنه بيع جديد.', R, 930, F(48, 800), C.ink, cue(s, 'ولا تسجّل تسديد الدين كأنه بيع جديد'), { colors: { 5: C.red, 6: C.red } });
}

// 10 · The debt book: customers and suppliers, today's receipts and new debts, debts by age.
function book(ctx, u) {
  bg(ctx, 'paper');
  const s = 's10';
  kicker(ctx, 'في البرنامج', 'wallet');
  reveal(ctx, u, 'دفتر الديون', R, 230, F(90, 900), C.ink, [S.START[9] - 0.5, at(s, 'الديون') - 0.15]);
  const img = S.IMG.debts, x = L0, y = 290, cw = R - L0, ch = 700;
  const tA = at(s, 'توزيع');
  const [cx, cy, z] = camera(u, [[S.START[9] - 1, [0.5, 0.2, 1]], [tA - 0.6, [0.5, 0.52, 1.05]]]);
  const k0 = springU(u, S.START[9] - 0.8, SPRING.gentle);
  enter(ctx, k0, () => {
    const map = screen(ctx, img, x, y, cw, ch, { zoom: z, cx, cy });
    ctx.save(); rrect(ctx, x, y, cw, ch, 18); ctx.clip();
    rings(ctx, u, map, [
      [510, 72, 498, 42, at(s, 'ديون') - 0.15, at(s, 'والمقبوض') - 0.2],
      [0, 72, 500, 42, at(s, 'وديون') - 0.15, at(s, 'والمقبوض') - 0.2],
      [255, 130, 245, 74, at(s, 'والمقبوض') - 0.15, tA - 0.3],
      [0, 130, 245, 74, at(s, 'والديون') - 0.15, tA - 0.3],
      [17, 313, 975, 48, tA - 0.15, at(s, 'من', 0) - 0.2],
      [751, 313, 241, 48, at(s, 'شهر') - 0.15],
      [17, 313, 241, 48, at(s, 'تسعين') - 0.15],
    ]);
    ctx.restore();
  }, { dy: 120 });
  const T = [['ديون الزبائن', 'ديون', 'users'], ['ديون الموردين', 'وديون', 'truck'], ['المقبوض اليوم', 'والمقبوض', 'cash'], ['الديون الجديدة', 'والديون', 'plus'],
    ['حسب مدّتها', 'توزيع', 'clock'], ['من شهر واحد', 'شهر', 'calendar'], ['إلى أكثر من 90 يومًا', 'تسعين', 'alert']];
  T.forEach(([lab, word, ico], i) => {
    const t0 = at(s, word), t1 = i < T.length - 1 ? at(s, T[i + 1][1]) : undefined;
    tagAt(ctx, u, 960, 925, lab, t0 - 0.15, { ico, size: 36, h_: 72, off: t1 !== undefined ? t1 - 0.25 : undefined });
  });
}

// 11 · Checkpoint: explain every customer's balance.
const ROWS11 = [
  { str: 'دين سابق', cue: 'دين سابق' },
  { str: 'بيع جديد', cue: 'بيع جديد' },
  { str: 'مبلغ تمّ تسديده', cue: 'مبلغ تمّ تسديده' },
];
const check = checkScene({
  sid: 's11', head: 'فسّر رصيد كل زبون', headCue: 'تفسير رصيد كل زبون', headSize: 90,
  rowsL: 1060, rowsY: 400, rowGap: 150, rows: ROWS11,
  body(ctx, u) {
    const s = 's11';
    text(ctx, 'كل مبلغ في الرصيد واحد من ثلاثة:', R, 365, F(32, 700, UI), C.green, 'right', clamp(prog(u, at(s, 'دين') - 0.4, at(s, 'دين'))));
    // the balance, built from its three kinds
    const x = 140, y = 360, cw = 820;
    const k0 = springU(u, S.START[10] - 0.6, SPRING.snappy);
    enter(ctx, k0, () => {
      card(ctx, x, y, cw, 470, 28, C.white, { stroke: '#cfe9dc', shade: 0.12 });
      text(ctx, 'رصيد الزبون', x + cw - 40, y + 76, F(40, 900), C.ink);
      mini(ctx, 'مثال', x + 30 + pillW(ctx, 'مثال', F(22, 700, UI), 40, null, 14), y + 44);
    }, { dx: -160, dy: 0 });
    const P = [
      { lab: 'دين سابق', n: 8000, sign: '+', col: C.ink, t: at(s, 'دين') },
      { lab: 'بيع جديد', n: 25000, sign: '+', col: C.amber, t: at(s, 'بيع') },
      { lab: 'تمّ تسديده', n: 10000, sign: '−', col: C.green, t: at(s, 'تمّ') },
    ];
    P.forEach((p, i) => {
      const ry = y + 110 + i * 92, k = springU(u, p.t - 0.25, SPRING.snappy);
      enter(ctx, k, () => {
        text(ctx, p.lab, x + cw - 50, ry + 52, F(34, 800), C.ink);
        money(ctx, p.n, x + 330, ry + 54, 40, p.col, { sign: p.sign });
      }, { dx: -40, dy: 0 });
    });
    const kt = springU(u, at(s, 'تسديده') + 0.3, SPRING.snappy);
    enter(ctx, kt, () => {
      ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 40, y + 390); ctx.lineTo(x + cw - 40, y + 390); ctx.stroke();
      text(ctx, 'الرصيد', x + cw - 50, y + 446, F(38, 900), C.ink);
      money(ctx, 23000, x + 330, y + 450, 50, C.accent);
    }, { dy: 20 });
  },
});

// 12 · Next episode and the two asks.
const next = nextScene({
  sid: 's12', sub: 'من اختيار المنتج إلى الفاتورة', subCue: 'من اختيار المنتج إلى الفاتورة', shots: ['pos', 'imei'],
  shotCues: ['اختيار', 'الفاتورة'], trialCue: 'اطلب تجربتك', subscribeCue: 'واشترك',
});
const endCard = endScene({ shot: 'pos', panelTitle: 'الحلقة 4 · نفّذ أول بيع' });

episode({
  n: 3,
  scenes: [hook, series, customer, terms, supplier, opening, received, example, repay, book, check, next, endCard],
  hits(H_) {
    H_(at('s01', 'سدّدت') - 0.4, 'speech bubble', 'pop', { pitch: 'D5', gain: 0.45 });
    H_(at('s01', 'يوضّح') + 0.2, 'question', 'tick', { gain: 0.55 });
    H_(at('s01', 'يرتبط') - 0.3, 'ledger row', 'pop', { pitch: 'F#5', gain: 0.4 });
    H_(at('s01', 'بصاحبه') - 0.3, 'payment row', 'pop', { pitch: 'A5', gain: 0.4 });
    H_(at('s01', 'وبسبب'), 'payment found', 'bell', { pitch: 'D6', gain: 0.45 });
    H_(cue('s02', 'فان كاش')[0], 'logo', 'bell', { pitch: 'D6', gain: 0.5 });
    H_(cue('s02', 'بعد إدخال المخزون')[0], 'stages done', 'tick', { gain: 0.55 });
    H_(at('s02', 'اليوم'), 'episode 3 chip', 'bell', { pitch: 'A5', gain: 0.5 });
    H_(S.START[2] - 0.4, 'step 1', 'pop', { pitch: 'D5', gain: 0.45 });
    ['اسمًا', 'ورقم', 'ثانوي', 'والمدينة', 'والعنوان'].forEach((wd) => H_(at('s03', wd) - 0.15, `field ${wd}`, 'click', { gain: 0.4 }));
    TERMS.forEach((p, i) => H_(at('s04', p.t) - 0.25, p.lab, 'pop', { pitch: ['D5', 'F#5', 'A5'][i], gain: 0.4 }));
    H_(at('s04', 'سجلّين') + 0.6, 'one record', 'bell', { pitch: 'A5', gain: 0.5 });
    SUP.forEach((p) => H_(at('s05', p.t) - 0.2, `supplier ${p.lab}`, 'click', { gain: 0.4 }));
    H_(at('s06', 'ثانيًا') - 0.4, 'step 2', 'pop', { pitch: 'E5', gain: 0.45 });
    H_(at('s06', 'الرصيد') - 0.3, 'opening balance', 'pop', { pitch: 'D5', gain: 0.4 });
    H_(at('s06', 'بيع') - 0.3, 'new sale', 'pop', { pitch: 'A5', gain: 0.4 });
    H_(at('s07', 'ثالثًا') - 0.4, 'step 3', 'pop', { pitch: 'F#5', gain: 0.45 });
    ['إجمالي', 'والمبلغ', 'المتبقي'].forEach((wd, i) => H_(at('s07', wd) - 0.3, `block ${wd}`, 'pop', { pitch: ['D5', 'F#5', 'A5'][i], gain: 0.4 }));
    H_(cue('s08', 'بعت هاتفًا [بخمسة وسبعين ألف دينار]')[2], '75,000', 'coins', { gain: 0.45 });
    H_(cue('s08', 'وقبضت [خمسين ألفًا]')[1], '50,000', 'coins', { gain: 0.4 });
    H_(cue('s08', 'تكلفة الشراء [ثمانية وستين ألفًا]')[2], '68,000', 'coins', { gain: 0.4 });
    H_(cue('s08', 'فهامش البيع [سبعة آلاف دينار]')[2], 'margin', 'bell', { pitch: 'D6', gain: 0.5 });
    H_(at('s09', 'رابعًا') - 0.4, 'step 4', 'pop', { pitch: 'A5', gain: 0.45 });
    H_(at('s09', 'كأنه'), 'strike', 'tick', { gain: 0.5 });
    H_(at('s09', 'كأنه') + 0.4, 'right way', 'bell', { pitch: 'A5', gain: 0.5 });
    ['ديون', 'وديون', 'والمقبوض', 'والديون', 'توزيع', 'شهر', 'تسعين'].forEach((wd) => H_(at('s10', wd) - 0.15, `book ${wd}`, 'click', { gain: 0.42 }));
    ROWS11.forEach((r, i) => H_(cue('s11', r.cue).at(-1) + 0.4, `check ${r.str}`, 'bell', { pitch: ['A5', 'B5', 'D6'][i], gain: 0.55 }));
    H_(cue('s12', 'اطلب تجربتك')[0] - 0.15, 'cta trial', 'pop', { gain: 0.45 });
    H_(cue('s12', 'واشترك')[0] - 0.15, 'cta subscribe', 'bell', { pitch: 'D6', gain: 0.45 });
  },
});
