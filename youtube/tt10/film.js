// VanCash ERP · TikTok 10: 3 أيام تجربة: الخطة (1080x1920, ~60 s). A pure function of time.
// The voice drives the cut; every element enters on the word that names it. Captions: shorts/kit9.js.
// s02-s04 are one continuous scene: a 3-day tracker stays put while each day's card slides in.
import * as K from '../shorts/kit9.js';

const {
  C, F, UI, S, E, prog, clamp, springU, SPRING, rrect, text, ltr, reveal, card, pop, enter, icon, badge,
  bg, cue, at, XR, XL, CW, CX, TOP, brand, kick, title, row, rows, stamp, xmark, pill, pillW, exampleTag,
  screen, ctaScene, short,
} = K;
const TAG = 'التجربة المجانية';

// s01 · Three free days? Don't waste them hopping between screens. Here's a simple plan.
const THUMBS = ['dash', 'products', 'pos', 'reports'];
function hook(ctx, u) {
  bg(ctx, 'paper'); brand(ctx, u, TAG);
  const s = 's01';
  kick(ctx, 'تجربة مجانية', 'gift', TOP + 60);
  title(ctx, u, '3 أيام مجانًا', 540, -0.5, { size: 132, mark: [0, 1, at(s, 'مجانية') + 0.1] });
  reveal(ctx, u, 'لا تضيّعها بين الشاشات', XR, 660, F(58, 900), C.red, [at(s, 'لا'), at(s, 'تضيّعها'), at(s, 'بين'), at(s, 'الشاشات')].map((t) => t - 0.15));
  // the three days
  [1, 2, 3].forEach((n, i) => {
    const wd = 270, x = XR - wd - i * (wd + 33), k = springU(u, at(s, 'ثلاثة') - 0.1 + i * 0.18, SPRING.bouncy);
    pop(ctx, k, x + wd / 2, 830, () => {
      card(ctx, x, 720, wd, 220, 30, C.white, { stroke: C.line, shade: 0.14 });
      rrect(ctx, x, 720, wd, 60, 30); ctx.fillStyle = C.accent; ctx.fill(); ctx.fillRect(x, 750, wd, 30);
      text(ctx, 'اليوم', x + wd / 2, 762, F(32, 800, UI), C.white, 'center');
      ltr(ctx, String(n), x + wd / 2, 900, F(110, 900), C.ink, 'center');
    }, { from: 0.4, rise: 30 });
  });
  // hopping between screens: thumbnails shuffling, then crossed out; the plan takes their place
  const tH = at(s, 'التنقّل') - 0.2, tPlan = at(s, 'خطة') - 0.2;
  const kOut = springU(u, tPlan, SPRING.snappy);
  THUMBS.forEach((key, i) => {
    const k = springU(u, tH + i * 0.12, SPRING.bouncy) * (1 - kOut);
    if (k <= 0.002) return;
    const wob = Math.sin(u * 2.4 + i * 1.7) * 14, x = XL + i * 222, y = 1000 + (i % 2) * 40 + wob;
    ctx.save(); ctx.globalAlpha *= clamp(k * 1.5);
    ctx.translate(x + 100, y + 70); ctx.rotate((i % 2 ? 1 : -1) * 0.05 + Math.sin(u * 1.8 + i) * 0.03); ctx.scale(0.6 + 0.4 * k, 0.6 + 0.4 * k); ctx.translate(-(x + 100), -(y + 70));
    screen(ctx, S.IMG[key], x, y, 200, 140, { zoom: 1, shade: 0.2, r: 14 });
    ctx.restore();
  });
  xmark(ctx, springU(u, at(s, 'الشاشات'), SPRING.bouncy) * (1 - kOut), CX, 1080, 46);
  pop(ctx, kOut, CX, 1110, () => {
    const f = F(56, 900), str = 'خطة بسيطة', wd = pillW(ctx, str, f, 110, 'list', 40);
    pill(ctx, CX + wd / 2, 1055, 110, str, f, { bg: C.lime, fg: C.ink, ico: 'list', pad: 40 });
  }, { from: 0.4 });
}

// s02-s04 · The tracker and the three day cards.
const DAYS = [
  { sid: 's02', word: 'الأول', lab: 'جهّز المحل' },
  { sid: 's03', word: 'الثاني', lab: 'بيع وفاتورة' },
  { sid: 's04', word: 'الثالث', lab: 'راجع واختر' },
];
const dx = (i) => XR - 110 - i * ((CW - 220) / 2);
function tracker(ctx, u) {
  const Y = 440, on = DAYS.map((d) => at(d.sid, d.word) - 0.2);
  ctx.fillStyle = C.line; ctx.fillRect(dx(2), Y - 4, dx(0) - dx(2), 8);
  DAYS.forEach((_, i) => {
    if (i === 0) return;
    const p = E.outCubic(prog(u, on[i] - 0.6, on[i]));
    if (p > 0) { ctx.fillStyle = C.green; ctx.fillRect(dx(i - 1) - (dx(i - 1) - dx(i)) * p, Y - 4, (dx(i - 1) - dx(i)) * p, 8); }
  });
  DAYS.forEach((d, i) => {
    const x = dx(i), active = u >= on[i], done = i < 2 && u >= on[i + 1] - 0.3;
    const k = springU(u, on[i], SPRING.bouncy), r = 44 * (1 + 0.18 * Math.sin(clamp(k) * Math.PI));
    ctx.beginPath(); ctx.arc(x, Y, r, 0, Math.PI * 2);
    ctx.fillStyle = done ? C.green : active ? C.accent : C.white; ctx.fill();
    if (!active) { ctx.strokeStyle = C.line; ctx.lineWidth = 4; ctx.stroke(); }
    if (done) icon(ctx, 'check', x, Y, 44, C.white, { lw: 3.2 });
    else ltr(ctx, String(i + 1), x, Y + 18, F(50, 900, UI), active ? C.white : C.muted, 'center');
    text(ctx, 'اليوم ' + (i + 1), x, Y + 96, F(30, 800, UI), active ? C.ink : C.muted, 'center');
  });
}
function slide(ctx, u, i, fn) {
  const kIn = springU(u, S.SEC[DAYS[i].sid].beat - 0.5, SPRING.snappy);
  const kOut = i < 2 ? springU(u, S.SEC[DAYS[i + 1].sid].beat - 0.7, SPRING.snappy) : 0;
  if (kIn <= 0.002 || kOut >= 0.998) return;
  ctx.save(); ctx.globalAlpha *= clamp(kIn * 1.5) * (1 - kOut);
  ctx.translate(-(1 - kIn) * 260 + kOut * 260, 0);
  fn();
  ctx.restore();
}
function days(ctx, u) {
  bg(ctx, 'paper'); brand(ctx, u, TAG);
  tracker(ctx, u);
  // day 1 · set up the shop: a sample of products, phones by IMEI, customers; check they're accurate
  slide(ctx, u, 0, () => {
    const s = 's02';
    title(ctx, u, 'جهّز المحل', 670, S.SEC[s].beat - 0.2, { size: 100, mark: [0, 0, at(s, 'جهّز')] });
    rows(ctx, u, [
      { at: at(s, 'المنتجات'), ico: 'box', label: 'عيّنة من المنتجات' },
      { at: at(s, 'والهواتف'), ico: 'phone', label: 'الهواتف بأرقام IMEI' },
      { at: at(s, 'والزبائن'), ico: 'users', label: 'الزبائن' },
    ], 730, 150, 22);
    [0, 1, 2].forEach((j) => stamp(ctx, springU(u, at(s, 'دقّتها') + j * 0.15, SPRING.bouncy), XL + 60, 805 + j * 172, 30));
  });
  // day 2 · a sale, the printed invoice, a debt and then its repayment
  slide(ctx, u, 1, () => {
    const s = 's03';
    title(ctx, u, 'نفّذ عملية بيع', 670, S.SEC[s].beat - 0.2, { size: 100, mark: [2, 2, at(s, 'بيع')] });
    rows(ctx, u, [
      { at: at(s, 'نفّذ'), ico: 'cart', label: 'عملية بيع' },
      { at: at(s, 'واطبع'), ico: 'printer', label: 'اطبع الفاتورة' },
      { at: at(s, 'وسجّل'), ico: 'repeat', label: 'دين ثم تسديده' },
    ], 730, 150, 22);
  });
  // day 3 · reports and expenses, then pick the version and plan: Offline or Online
  slide(ctx, u, 2, () => {
    const s = 's04';
    title(ctx, u, 'راجع ثم اختر', 670, S.SEC[s].beat - 0.2, { size: 100, mark: [2, 2, at(s, 'اختر')] });
    rows(ctx, u, [
      { at: at(s, 'التقارير'), ico: 'chart', label: 'التقارير' },
      { at: at(s, 'والمصاريف'), ico: 'receipt', label: 'المصاريف' },
    ], 730, 150, 22);
    text(ctx, 'النسخة المناسبة لمحلّك', XR, 1110, F(40, 800, UI), K.M.mix('#ffffff', C.muted, clamp(springU(u, at(s, 'النسخة') - 0.15, SPRING.snappy) * 1.5)));
    [['Offline', 'أوفلاين', 'wifiOff', C.ink], ['Online', 'أونلاين', 'cloud', C.accent]].forEach(([str, word, ico, col], j) => {
      const k = springU(u, at(s, word) - 0.15, SPRING.bouncy), wd = 410, x = XR - wd - j * (wd + 56);
      pop(ctx, k, x + wd / 2, 1210, () => {
        rrect(ctx, x, 1150, wd, 120, 30); ctx.fillStyle = col; ctx.fill();
        icon(ctx, ico, x + wd - 70, 1210, 50, C.lime, { lw: 2.2 });
        ltr(ctx, str, x + wd / 2 - 30, 1230, F(56, 900), C.white, 'center');
      }, { from: 0.4 });
      if (j === 0) {
        const kO = springU(u, at(s, 'أو') - 0.1, SPRING.bouncy);
        pop(ctx, kO, XR - wd - 28, 1210, () => text(ctx, 'أو', XR - wd - 28, 1226, F(40, 900, UI), C.muted, 'center'), { from: 0.3 });
      }
    });
  });
}

// s05 · An important tip: during the trial use clear examples, kept apart from your real work.
function tip(ctx, u) {
  bg(ctx, 'navy'); brand(ctx, u, TAG, { dark: true });
  const s = 's05';
  kick(ctx, 'نصيحة مهمة', 'alert', TOP + 60, C.lime);
  title(ctx, u, 'أمثلة واضحة', 560, S.SEC[s].beat - 0.2, { size: 132, color: C.white, mark: [1, 1, at(s, 'واضحة') + 0.2], box: false });
  const wd = (CW - 70) / 2;
  // the trial's examples
  const kA = springU(u, at(s, 'استخدم') - 0.2, SPRING.snappy);
  enter(ctx, kA, () => {
    card(ctx, XR - wd, 680, wd, 500, 32, C.white, { shade: 0.3 });
    text(ctx, 'التجربة', XR - 36, 750, F(46, 900), C.ink);
    [['منتج تجريبي 1', 'box'], ['زبون تجريبي', 'user'], ['بيع تجريبي', 'cart']].forEach(([lab, ico], j) => {
      const y = 800 + j * 112;
      rrect(ctx, XR - wd + 24, y, wd - 48, 92, 20); ctx.fillStyle = C.wash; ctx.fill();
      icon(ctx, ico, XR - 66, y + 46, 38, C.accent, { lw: 2.2 });
      text(ctx, lab, XR - 104, y + 58, F(32, 800, UI), C.ink);
    });
    exampleTag(ctx, XR - wd + 20, 714);
  }, { dy: 60 });
  // kept apart from the real work
  const tS = at(s, 'وافصلها');
  const p = E.outCubic(prog(u, tS - 0.2, tS + 0.5));
  if (p > 0) {
    ctx.save(); ctx.strokeStyle = C.lime; ctx.lineWidth = 6; ctx.setLineDash([16, 12]);
    ctx.beginPath(); ctx.moveTo(CX, 670); ctx.lineTo(CX, 670 + 520 * p); ctx.stroke(); ctx.restore();
  }
  const kB = springU(u, at(s, 'عملك') - 0.2, SPRING.snappy);
  enter(ctx, kB, () => {
    card(ctx, XL, 680, wd, 500, 32, 'rgba(255,255,255,.08)', { stroke: 'rgba(255,255,255,.3)', shade: 0 });
    text(ctx, 'عملك الحقيقي', XL + wd - 36, 750, F(44, 900), C.white);
    icon(ctx, 'shop', XL + wd / 2, 950, 150, 'rgba(255,255,255,.75)', { lw: 1.6 });
    icon(ctx, 'lock', XL + wd / 2, 1100, 56, C.lime, { lw: 2.4 });
  }, { dy: 60 });
}

const cta = ctaScene({ sid: 's06', cues: { free: 'المجانية', days: null } });

short({
  n: 10,
  scenes: [hook, days, days, days, tip, cta, cta],
  hits: (H_) => {
    [0, 1, 2].forEach((i) => H_(K.at('s01', 'ثلاثة') - 0.1 + i * 0.18, 'day ' + (i + 1), 'pop', { gain: 0.25 }));
    H_(K.at('s01', 'الشاشات'), 'not this', 'thud', { gain: 0.3 });
    H_(K.at('s01', 'خطة') - 0.2, 'the plan', 'bell', { gain: 0.25 });
    DAYS.forEach((d) => H_(K.at(d.sid, d.word) - 0.2, 'day ' + d.lab, 'tick', { gain: 0.4 }));
    H_(K.at('s02', 'دقّتها'), 'checked', 'blip', { gain: 0.3 });
    H_(K.at('s04', 'أونلاين') - 0.15, 'Online', 'pop', { gain: 0.3 });
    H_(K.at('s05', 'وافصلها') - 0.2, 'kept apart', 'whoosh', { gain: 0.2 });
    H_(K.at('s06', 'واتساب') - 0.15, 'WhatsApp card', 'pop', { gain: 0.35 });
  },
});
