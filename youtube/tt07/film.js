// VanCash ERP · TikTok 7: أين ذهب الربح؟ (1080x1920, ~60 s). A pure function of time.
// The voice drives the cut; every element enters on the word that names it. Captions: shorts/kit9.js.
// Amounts, dates and references on drawn cards are examples; the finance screen is the real app.
import * as K from '../shorts/kit9.js';

const {
  C, F, UI, S, E, prog, clamp, springU, SPRING, rrect, text, ltr, reveal, card, pop, enter, icon, badge,
  bg, cue, at, XR, XL, CW, CX, TOP, brand, kick, title, row, rows, stamp, xmark, pill, pillW, exampleTag,
  screen, rings, money, ctaScene, short,
} = K;
const TAG = 'المصاريف';

// A dashed outline pill: something that happened but was never written down.
function ghost(ctx, xR, y, str, k) {
  const f = F(38, 800, UI), h = 76, wd = pillW(ctx, str, f, h, null, 26);
  pop(ctx, k, xR - wd / 2, y + h / 2, () => {
    rrect(ctx, xR - wd, y, wd, h, h / 2); ctx.fillStyle = C.white; ctx.fill();
    ctx.save(); ctx.setLineDash([10, 8]); ctx.strokeStyle = C.faint; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
    text(ctx, str, xR - 26, y + 50, f, C.muted);
  }, { from: 0.5, rise: 20 });
  return wd;
}

// s01 · A small expense not recorded today, and at the end of the month you don't know where the profit went.
const SMALL = [['نقل سلعة 800 دج', 0], ['قهوة 200 دج', 0.25], ['شاحن للمحل 1,500 دج', 0.5]];
function hook(ctx, u) {
  bg(ctx, 'paper'); brand(ctx, u, TAG);
  const s = 's01';
  title(ctx, u, 'أين ذهب', 520, -0.5, { size: 120 });
  title(ctx, u, 'الربح؟', 690, -0.1, { size: 150, color: C.red, mark: [0, 0, at(s, 'الربح') + 0.1] });
  // small expenses, never written down
  let xr = XR, y = 760;
  SMALL.forEach(([str, d], i) => {
    if (i === 2) { xr = XR; y += 92; }
    const k = springU(u, at(s, 'مصروف') - 0.1 + d, SPRING.bouncy);
    xr -= ghost(ctx, xr, y, str, k) + 18;
  });
  const kN = springU(u, at(s, 'يُسجَّل'), SPRING.bouncy);
  pop(ctx, kN, XL + 120, 892, () => {
    const f = F(34, 900, UI), str = 'لم يُسجَّل', wd = pillW(ctx, str, f, 66, 'x', 22);
    pill(ctx, XL + wd, 859, 66, str, f, { bg: C.red, fg: C.white, ico: 'x', pad: 22 });
  }, { from: 0.4 });
  // end of the month: the program and the till disagree
  const tM = at(s, 'الشهر') - 0.3;
  rows(ctx, u, [
    { at: tM, ico: 'monitor', label: 'ربح الشهر', value: '120,000 دج', size: 50 },
    { at: tM + 0.3, ico: 'cash', label: 'في الصندوق', value: '104,500 دج', valueColor: C.red, size: 50 },
  ], 950, 120, 14);
  const kQ = springU(u, at(s, 'أين') - 0.1, SPRING.bouncy);
  pop(ctx, kQ, CX, 1250, () => {
    const f = F(40, 900), str = 'أين ذهبت 15,500 دج؟', wd = pillW(ctx, str, f, 74, 'alert', 28);
    pill(ctx, CX + wd / 2, 1214, 74, str, f, { bg: C.redWash, fg: C.red, ico: 'alert', stroke: '#f3c2bd', pad: 28 });
  }, { from: 0.5 });
}

// s02 · The rule: record every movement when it happens, not at the end of the day from memory.
function rule(ctx, u) {
  bg(ctx, 'navy'); brand(ctx, u, TAG, { dark: true });
  const s = 's02';
  kick(ctx, 'القاعدة', 'check', TOP + 60, C.lime);
  title(ctx, u, 'سجّل كل حركة', 560, cue(s, 'سجّل كل حركة'), { size: 120, color: C.white });
  title(ctx, u, 'وقت حدوثها', 720, cue(s, 'وقت حدوثها'), { size: 120, color: C.lime });
  rows(ctx, u, [
    { at: at(s, 'حدوثها') + 0.2, ico: 'clock', label: 'فورًا، عند كل حركة', tone: 'good' },
    { at: at(s, 'آخر'), ico: 'eye', label: 'آخر اليوم من الذاكرة', tone: 'bad' },
  ], 830, 170, 30);
  stamp(ctx, springU(u, at(s, 'حدوثها') + 0.6, SPRING.bouncy), XL + 60, 915, 34);
  xmark(ctx, springU(u, at(s, 'ذاكرتك'), SPRING.bouncy), XL + 60, 1115, 34);
}

// s03 · When you pay an expense: reason, amount, date, and keep the reference: invoice or receipt.
const FORM = [['السبب', 'نقل سلعة', 'السبب', false], ['المبلغ', '1,500 دج', 'والمبلغ', false], ['التاريخ', '20/10/2026', 'والتاريخ', true], ['المرجع', 'وصل رقم 58', 'بالمرجع', false]];
function form(ctx, u) {
  bg(ctx, 'paper'); brand(ctx, u, TAG);
  const s = 's03';
  kick(ctx, 'عند دفع مصروف', 'wallet', TOP + 60);
  title(ctx, u, 'دوّن 4 أشياء', 520, [at(s, 'دوّن') - 0.15, at(s, 'السبب') - 0.15, at(s, 'السبب') - 0.05], { size: 112, mark: [1, 2, at(s, 'السبب') + 0.2] });
  const k0 = springU(u, at(s, 'مصروف') - 0.2, SPRING.snappy);
  enter(ctx, k0, () => {
    card(ctx, XL, 600, CW, 590, 34, C.white, { stroke: C.line, shade: 0.16 });
    badge(ctx, 'wallet', XR - 62, 670, 36, C.wash, C.accent, 2.2);
    text(ctx, 'مصروف جديد', XR - 116, 686, F(48, 900), C.ink);
    exampleTag(ctx, XL + 30, 650);
  }, { dy: 80 });
  FORM.forEach(([lab, val, word, isLtr], i) => {
    const y = 740 + i * 108, k = springU(u, at(s, word) - 0.15, SPRING.snappy);
    if (k <= 0.002) return;
    ctx.save(); ctx.globalAlpha *= clamp(k * 1.6); ctx.translate((1 - k) * -40, 0);
    text(ctx, lab, XR - 44, y + 60, F(40, 700, UI), C.muted);
    if (isLtr) ltr(ctx, val, XL + 44, y + 62, F(46, 900, UI), C.accent, 'left');
    else text(ctx, val, XL + 44, y + 62, F(46, 900, UI), C.accent, 'left');
    ctx.fillStyle = C.line; ctx.fillRect(XL + 40, y + 94, CW - 80, 2);
    ctx.restore();
  });
  [['فاتورة', 'فاتورة', 'receipt'], ['وصل', 'وصل', 'file']].forEach(([lab, word, ico], i) => {
    const k = springU(u, at(s, word) - 0.15, SPRING.bouncy), f = F(42, 800, UI), wd = pillW(ctx, lab, f, 84, ico, 30);
    const xr = i === 0 ? XR : XR - 320;
    pop(ctx, k, xr - wd / 2, 1262, () => pill(ctx, xr, 1220, 84, lab, f, { bg: C.ink, fg: C.white, ico, icoColor: C.lime, pad: 30 }), { rise: 20 });
  });
}

// s04 · The finance screen: add expense, current balance, total received and spent, net profit.
const FIN = [
  { r: [223, 37, 147, 40], word: 'إضافة' },
  { r: [853, 123, 155, 88], word: 'والرصيد', ico: 'wallet', lab: 'الرصيد الحالي' },
  { r: [685, 123, 160, 88], word: 'المقبوضات', ico: 'cash', lab: 'المقبوضات' },
  { r: [518, 123, 160, 88], word: 'والمصروفات', ico: 'receipt', lab: 'المصروفات' },
  { r: [350, 123, 160, 88], word: 'وصافي', ico: 'trend', lab: 'صافي الربح' },
];
function finance(ctx, u) {
  bg(ctx, 'paper'); brand(ctx, u, TAG);
  const s = 's04';
  kick(ctx, 'في VanCash', 'monitor', TOP + 60);
  title(ctx, u, 'شاشة المالية', 520, cue(s, 'شاشة المالية'), { size: 112 });
  const kS = springU(u, at(s, 'شاشة') - 0.3, SPRING.snappy);
  let map = null;
  enter(ctx, kS, () => { map = screen(ctx, S.IMG.finance, XL, 590, CW, 330, { zoom: 1.22, cx: 0.6, cy: 0.27, shade: 0.18 }); }, { dy: 80 });
  if (map && kS > 0.5) rings(ctx, u, map, FIN.map((f, i) => [...f.r, at(s, f.word) - 0.15, i < FIN.length - 1 ? at(s, FIN[i + 1].word) - 0.15 : undefined]));
  // the add button, then the four totals in a grid
  const kB = springU(u, at(s, 'إضافة') - 0.15, SPRING.bouncy);
  pop(ctx, kB, CX, 1000, () => {
    const f = F(44, 900), str = 'إضافة مصروف', wd = pillW(ctx, str, f, 88, 'plus', 30);
    pill(ctx, CX + wd / 2, 958, 88, str, f, { bg: C.accent, fg: C.white, ico: 'plus', pad: 30 });
  }, { from: 0.5 });
  FIN.slice(1).forEach((f, i) => {
    const wd = (CW - 24) / 2, x = XR - wd - (i % 2) * (wd + 24), y = 1074 + Math.floor(i / 2) * 106;
    const k = springU(u, at(s, f.word) - 0.15, SPRING.snappy);
    enter(ctx, k, () => {
      card(ctx, x, y, wd, 92, 24, i === 3 ? C.mint : C.white, { stroke: i === 3 ? '#bfe8d4' : C.line, shade: 0.1 });
      icon(ctx, f.ico, x + wd - 44, y + 46, 40, i === 3 ? C.green : C.accent, { lw: 2.2 });
      text(ctx, f.lab, x + wd - 82, y + 60, F(38, 800, UI), C.ink);
    }, { dy: 30 });
  });
}

// s05 · Two mistakes: the same movement twice; sales mixed with repayments.
// Then: at the end of the day, the till must match the program.
function close(ctx, u) {
  bg(ctx, 'paper'); brand(ctx, u, TAG);
  const s = 's05';
  const tW = at(s, 'وفي') - 0.4, kW = springU(u, tW, SPRING.snappy);
  // the two mistakes, leaving to the right as the close-of-day check arrives
  if (kW < 0.998) {
    ctx.save(); ctx.globalAlpha *= 1 - kW; ctx.translate(kW * 260, 0);
    kick(ctx, 'انتبه', 'alert', TOP + 60, C.red);
    title(ctx, u, 'خطآن شائعان', 520, [S.SEC[s].beat - 0.3, at(s, 'لخطأين') - 0.1], { size: 112 });
    rows(ctx, u, [
      { at: at(s, 'تسجّل'), ico: 'repeat', label: 'نفس الحركة مرتين', tone: 'bad' },
      { at: at(s, 'تخلط'), ico: 'cash', label: 'خلط البيع بالتسديدات', tone: 'bad' },
    ], 620, 170, 30);
    xmark(ctx, springU(u, at(s, 'مرتين'), SPRING.bouncy), XL + 60, 705, 34);
    xmark(ctx, springU(u, at(s, 'بالتسديدات'), SPRING.bouncy), XL + 60, 905, 34);
    ctx.restore();
  }
  if (kW <= 0.002) return;
  ctx.save(); ctx.globalAlpha *= clamp(kW * 1.5); ctx.translate(-(1 - kW) * 260, 0);
  kick(ctx, 'في آخر اليوم', 'clock', TOP + 60, C.green);
  title(ctx, u, 'الصندوق = البرنامج', 520, [tW + 0.2, at(s, 'يطابق') - 0.15, at(s, 'البرنامج') - 0.15], { size: 96, mark: [1, 1, at(s, 'يطابق')] });
  [['cash', 'الصندوق', 'الصندوق', 0], ['monitor', 'البرنامج', 'البرنامج', 1]].forEach(([ico, lab, word, i]) => {
    const t = at(s, word) - 0.2, y = 640 + i * 290;
    const k = springU(u, t, SPRING.snappy);
    if (k <= 0.002) return;
    enter(ctx, k, () => {
      card(ctx, XL, y, CW, 250, 32, C.white, { stroke: C.line, shade: 0.14 });
      badge(ctx, ico, XR - 66, y + 72, 40, C.wash, C.accent, 2.2);
      text(ctx, lab, XR - 128, y + 88, F(48, 900), C.ink);
      money(ctx, 104500, XR - 40, y + 200, 84, C.ink, { k: clamp(prog(u, t, t + 1.0)) });
    }, { dy: 50 });
  });
  const kEq = springU(u, at(s, 'البرنامج') + 0.6, SPRING.bouncy);
  pop(ctx, kEq, XL + 110, 908, () => {
    ctx.beginPath(); ctx.arc(XL + 110, 908, 56, 0, Math.PI * 2); ctx.fillStyle = C.green; ctx.fill();
    ltr(ctx, '=', XL + 110, 934, F(80, 900, UI), C.white, 'center');
  }, { from: 0.3 });
  exampleTag(ctx, XL + 30, 1210);
  ctx.restore();
}

const cta = ctaScene({ sid: 's06' });

short({
  n: 7,
  scenes: [hook, rule, form, finance, close, cta, cta],
  hits: (H_) => {
    H_(K.at('s01', 'يُسجَّل'), 'not recorded', 'thud', { gain: 0.3 });
    H_(K.at('s01', 'أين') - 0.1, 'where did it go', 'pop', { gain: 0.3 });
    H_(K.at('s02', 'ذاكرتك'), 'not from memory', 'thud', { gain: 0.3 });
    ['السبب', 'والمبلغ', 'والتاريخ', 'بالمرجع'].forEach((wd) => H_(K.at('s03', wd) - 0.15, wd, 'type', { gain: 0.25 }));
    H_(K.at('s04', 'إضافة') - 0.15, 'add expense', 'click', { gain: 0.35 });
    H_(K.at('s05', 'البرنامج') + 0.6, 'till matches', 'bell', { gain: 0.3 });
    H_(K.at('s06', 'واتساب') - 0.15, 'WhatsApp card', 'pop', { gain: 0.35 });
  },
});
