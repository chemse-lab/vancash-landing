// VanCash ERP · TikTok 8: أرقام يومك في دقيقتين (1080x1920, ~60 s). A pure function of time.
// The voice drives the cut; every element enters on the word that names it. Captions: shorts/kit9.js.
// Amounts and counts on drawn cards are examples; the reports screen is the real app.
import * as K from '../shorts/kit9.js';

const {
  C, F, UI, S, E, prog, clamp, springU, SPRING, rrect, text, ltr, reveal, card, pop, enter, icon, badge,
  bg, cue, at, XR, XL, CW, CX, TOP, brand, kick, title, row, rows, stamp, xmark, pill, pillW, exampleTag,
  screen, rings, arrowLeft, money, ctaScene, short,
} = K;
const TAG = 'التقارير';

// s01 · A full day in the shop. Can you explain its numbers in two minutes?
function hook(ctx, u) {
  bg(ctx, 'paper'); brand(ctx, u, TAG);
  const s = 's01';
  kick(ctx, 'يوم عمل كامل', 'shop', TOP + 60);
  title(ctx, u, 'تفسّر أرقام يومك', 540, -0.5, { size: 112 });
  title(ctx, u, 'في دقيقتين؟', 700, -0.1, { size: 140, color: C.accent, mark: [1, 1, at(s, 'دقيقتين') + 0.1] });
  // the stopwatch
  const cx = CX, cy = 1000, r = 190;
  const k = springU(u, at(s, 'تفسّر') - 0.3, SPRING.bouncy);
  pop(ctx, k, cx, cy, () => {
    ctx.beginPath(); ctx.arc(cx, cy, r + 26, 0, Math.PI * 2); ctx.fillStyle = C.white; ctx.fill();
    ctx.strokeStyle = C.line; ctx.lineWidth = 6; ctx.stroke();
    rrect(ctx, cx - 34, cy - r - 70, 68, 44, 12); ctx.fillStyle = C.ink; ctx.fill();
    const p = E.outCubic(prog(u, at(s, 'دقيقتين') - 0.2, at(s, 'دقيقتين') + 3));
    ctx.beginPath(); ctx.arc(cx, cy, r - 14, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2);
    ctx.strokeStyle = C.accent; ctx.lineWidth = 26; ctx.lineCap = 'round'; if (p > 0.001) ctx.stroke();
    ltr(ctx, '2', cx, cy + 40, F(150, 900), C.ink, 'center');
    text(ctx, 'دقيقتان', cx, cy + 104, F(40, 800, UI), C.muted, 'center');
  }, { from: 0.5 });
}

// s02 · Open the reports, pick the period: sales, profit & loss, best sellers, stock value, debts.
const REP = [
  { r: [873, 88, 135, 114], word: 'المبيعات', lab: 'المبيعات', ico: 'cart' },
  { r: [730, 88, 135, 114], word: 'والأرباح', lab: 'الأرباح والخسائر', ico: 'trend' },
  { r: [587, 88, 135, 114], word: 'والأكثر', lab: 'الأكثر مبيعًا', ico: 'chart' },
  { r: [444, 88, 135, 114], word: 'وتقييم', lab: 'تقييم المخزون', ico: 'box' },
  { r: [158, 88, 278, 114], word: 'وديون', lab: 'ديون العملاء والموردين', ico: 'users' },
];
function reports(ctx, u) {
  bg(ctx, 'paper'); brand(ctx, u, TAG);
  const s = 's02';
  title(ctx, u, 'افتح التقارير', 500, cue(s, 'افتح التقارير'), { size: 108 });
  const kP = springU(u, at(s, 'الفترة') - 0.15, SPRING.bouncy);
  pop(ctx, kP, XL + 140, 936, () => {
    const f = F(36, 800, UI), str = 'الفترة: اليوم', wd = pillW(ctx, str, f, 72, 'calendar', 24);
    pill(ctx, XL + wd, 900, 72, str, f, { bg: C.ink, fg: C.white, ico: 'calendar', icoColor: C.lime, pad: 24 });
  }, { from: 0.4 });
  const kS = springU(u, at(s, 'التقارير') - 0.3, SPRING.snappy);
  let map = null;
  enter(ctx, kS, () => { map = screen(ctx, S.IMG.reports, XL, 570, CW, 300, { zoom: 1, cx: 0.5, cy: 0.2, shade: 0.18 }); }, { dy: 80 });
  if (map && kS > 0.5) rings(ctx, u, map, REP.map((x, i) => [...x.r, at(s, x.word) - 0.15, i < REP.length - 1 ? at(s, REP[i + 1].word) - 0.15 : undefined]));
  // the five reports, read out as a list
  REP.forEach((x, i) => {
    const y = 900 + i * 76, k = springU(u, at(s, x.word) - 0.15, SPRING.snappy);
    if (k <= 0.002) return;
    ctx.save(); ctx.globalAlpha *= clamp(k * 1.6); ctx.translate((1 - k) * -40, 0);
    badge(ctx, x.ico, XR - 30, y + 30, 28, C.wash, C.accent, 2);
    text(ctx, x.lab, XR - 76, y + 44, F(42, 800), C.ink);
    ctx.restore();
  });
}

// s03 · Then match four numbers (sales, received, debts, expenses) with what you actually recorded.
const FOUR = [
  { lab: 'المبيعات', amt: 185000, word: 'المبيعات', ico: 'cart', color: C.accent },
  { lab: 'المقبوض', amt: 160000, word: 'والمقبوض', ico: 'cash', color: C.green },
  { lab: 'الديون', amt: 25000, word: 'والديون', ico: 'user', color: C.red },
  { lab: 'المصاريف', amt: 6500, word: 'والمصاريف', ico: 'receipt', color: C.amber },
];
function match(ctx, u) {
  bg(ctx, 'paper'); brand(ctx, u, TAG);
  const s = 's03';
  kick(ctx, 'ثم', null, TOP + 60, C.muted);
  title(ctx, u, 'طابق 4 أرقام', 520, cue(s, 'طابق أربعة أرقام'), { size: 120, mark: [1, 2, at(s, 'أرقام') + 0.2] });
  const wd = (CW - 24) / 2, tOk = at(s, 'فعلًا');
  FOUR.forEach((f, i) => {
    const x = XR - wd - (i % 2) * (wd + 24), y = 600 + Math.floor(i / 2) * 250, t = at(s, f.word) - 0.2;
    K.tile(ctx, springU(u, t, SPRING.snappy), x, y, wd, 226, { ico: f.ico, label: f.lab, amount: f.amt, size: 62, color: f.color, count: clamp(prog(u, t, t + 1.2)) });
    stamp(ctx, springU(u, tOk + i * 0.12, SPRING.bouncy), x + 30, y + 30, 28);
  });
  const kR = springU(u, at(s, 'العمليات') - 0.15, SPRING.bouncy);
  pop(ctx, kR, CX, 1170, () => {
    const f = F(44, 900), str = 'مع العمليات المسجّلة فعلًا', wd2 = pillW(ctx, str, f, 92, 'list', 30);
    pill(ctx, CX + wd2 / 2, 1124, 92, str, f, { bg: C.ink, fg: C.white, ico: 'list', icoColor: C.lime, pad: 30 });
  }, { from: 0.5 });
  exampleTag(ctx, XL, 1240);
}

// s04 · Take a small stock sample: two phones and an accessory. A gap? Find its cause before fixing it.
const SAMPLE = [['Galaxy A15', 2, 2, 'هاتفان', 0], ['Redmi 13C', 1, 1, 'هاتفان', 0.3], ['شاحن سريع 25W', 10, 9, 'وإكسسوار', 0]];
function sample(ctx, u) {
  bg(ctx, 'paper'); brand(ctx, u, TAG);
  const s = 's04';
  kick(ctx, 'عيّنة صغيرة من المخزون', 'box', TOP + 60);
  title(ctx, u, 'قارن مع الرف', 520, [at(s, 'وخذ') - 0.15, at(s, 'عيّنة') - 0.15, at(s, 'المخزون') - 0.15], { size: 112 });
  const k0 = springU(u, at(s, 'عيّنة') - 0.3, SPRING.snappy);
  enter(ctx, k0, () => {
    card(ctx, XL, 590, CW, 440, 32, C.white, { stroke: C.line, shade: 0.16 });
    text(ctx, 'البرنامج', XL + 290, 650, F(30, 700, UI), C.muted, 'center');
    text(ctx, 'الرف', XL + 110, 650, F(30, 700, UI), C.muted, 'center');
  }, { dy: 80 });
  const tF = at(s, 'فرق');
  SAMPLE.forEach(([lab, inApp, onShelf, word, d], i) => {
    const y = 680 + i * 112, k = springU(u, at(s, word) - 0.15 + d, SPRING.snappy);
    if (k <= 0.002) return;
    const bad = inApp !== onShelf, red = bad ? clamp(prog(u, tF - 0.1, tF + 0.3)) : 0;
    ctx.save(); ctx.globalAlpha *= clamp(k * 1.6);
    if (red > 0) { rrect(ctx, XL + 16, y, CW - 32, 96, 20); ctx.fillStyle = `rgba(253,236,234,${red})`; ctx.fill(); }
    if (/^[A-Z]/.test(lab)) ltr(ctx, lab, XR - 40, y + 62, F(44, 800, UI), C.ink, 'right');
    else text(ctx, lab, XR - 40, y + 62, F(44, 800, UI), C.ink);
    ltr(ctx, String(inApp), XL + 290, y + 64, F(54, 900, UI), C.ink, 'center');
    ltr(ctx, String(onShelf), XL + 110, y + 64, F(54, 900, UI), bad ? K.M.mix(C.ink, C.red, red) : C.green, 'center');
    if (i < 2) { ctx.fillStyle = C.line; ctx.fillRect(XL + 40, y + 102, CW - 80, 2); }
    ctx.restore();
    if (!bad) stamp(ctx, springU(u, at(s, word) + 0.4 + d, SPRING.bouncy), XL + 180, y + 48, 22);
  });
  xmark(ctx, springU(u, tF, SPRING.bouncy), XL + 180, 680 + 2 * 112 + 48, 24);
  // first the cause, then the fix
  const kA = springU(u, at(s, 'ابحث') - 0.15, SPRING.bouncy);
  pop(ctx, kA, XR - 230, 1150, () => {
    const f = F(44, 900), str = 'ابحث عن السبب', wd = pillW(ctx, str, f, 96, 'search', 30);
    pill(ctx, XR, 1102, 96, str, f, { bg: C.accent, fg: C.white, ico: 'search', pad: 30 });
  }, { from: 0.5 });
  arrowLeft(ctx, XR - 470, XR - 540, 1150, C.muted, E.outCubic(prog(u, at(s, 'قبل') - 0.2, at(s, 'قبل') + 0.3)), 6);
  const kB = springU(u, at(s, 'تصحيحه') - 0.15, SPRING.bouncy);
  pop(ctx, kB, XL + 150, 1150, () => {
    const f = F(44, 900), str = 'ثم صحّح', wd = pillW(ctx, str, f, 96, 'check', 30);
    pill(ctx, XL + wd, 1102, 96, str, f, { bg: C.white, fg: C.ink, ico: 'check', stroke: C.line, pad: 30 });
  }, { from: 0.5 });
}

// s05 · Two minutes every evening: clear numbers all month, and you know where your profit goes.
function month(ctx, u) {
  bg(ctx, 'mint'); brand(ctx, u, TAG);
  const s = 's05';
  title(ctx, u, 'دقيقتان', 540, cue(s, 'دقيقتان'), { size: 140, color: C.green });
  title(ctx, u, 'كل مساء', 700, cue(s, 'كل مساء'), { size: 120, mark: [0, 1, at(s, 'مساء') + 0.2] });
  // a month of evenings, ticked one by one
  const cols = 7, cw = 108, ch = 72, gx = 14, gy = 12, y0 = 770;
  const t0 = at(s, 'وأرقام') - 0.2, t1 = at(s, 'الشهر') + 0.4;
  const k0 = springU(u, t0 - 0.3, SPRING.snappy);
  if (k0 > 0.002) {
    ctx.save(); ctx.globalAlpha *= clamp(k0 * 1.6);
    for (let d = 0; d < 30; d++) {
      const c = d % cols, rI = Math.floor(d / cols);
      const x = XR - (c + 1) * cw - c * gx, y = y0 + rI * (ch + gy);
      const on = u >= t0 + (t1 - t0) * (d / 30);
      rrect(ctx, x, y, cw, ch, 16); ctx.fillStyle = on ? C.green : C.white; ctx.fill();
      if (!on) { ctx.strokeStyle = '#cfe9dc'; ctx.lineWidth = 2; ctx.stroke(); }
      if (on) icon(ctx, 'check', x + cw / 2, y + ch / 2, 34, C.white, { lw: 3 });
      else ltr(ctx, String(d + 1), x + cw / 2, y + ch / 2 + 12, F(30, 700, UI), C.faint, 'center');
    }
    ctx.restore();
  }
  const kR = springU(u, at(s, 'ربحك') - 0.2, SPRING.bouncy);
  pop(ctx, kR, CX, 1242, () => {
    const f = F(44, 900), str = 'تعرف أين يذهب ربحك', wd = pillW(ctx, str, f, 84, 'trend', 30);
    pill(ctx, CX + wd / 2, 1200, 84, str, f, { bg: C.ink, fg: C.white, ico: 'trend', icoColor: C.lime, pad: 30 });
  }, { from: 0.5 });
}

const cta = ctaScene({ sid: 's06' });

short({
  n: 8,
  scenes: [hook, reports, match, sample, month, cta, cta],
  hits: (H_) => {
    H_(K.at('s01', 'دقيقتين') - 0.2, 'stopwatch', 'tick', { gain: 0.4 });
    REP.forEach((x) => H_(K.at('s02', x.word) - 0.15, x.lab, 'blip', { gain: 0.2 }));
    H_(K.at('s03', 'فعلًا'), 'all match', 'bell', { gain: 0.3 });
    H_(K.at('s04', 'فرق'), 'a gap', 'thud', { gain: 0.35 });
    H_(K.at('s05', 'ربحك') - 0.2, 'profit', 'coins', { gain: 0.3 });
    H_(K.at('s06', 'واتساب') - 0.15, 'WhatsApp card', 'pop', { gain: 0.35 });
  },
});
