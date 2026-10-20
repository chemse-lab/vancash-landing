// VanCash ERP · TikTok 3: ابدأ بجرد حقيقي (1080x1920, ~60 s). A pure function of time.
// The voice drives the cut; every element enters on the word that names it. Captions: shorts/kit9.js.
// Counts, prices and the barcode on drawn cards are examples; the stock screen is the real app.
import * as K from '../shorts/kit9.js';

const {
  C, F, UI, S, E, prog, clamp, springU, SPRING, rrect, text, ltr, reveal, card, pop, enter, icon, badge,
  bg, cue, at, XR, XL, CW, CX, TOP, brand, kick, title, row, rows, stamp, xmark, pill, pillW, exampleTag,
  screen, ctaScene, short,
} = K;
const TAG = 'المخزون';

// s01 · The biggest mistake: entering products from memory, then finding the gap a week later.
function hook(ctx, u) {
  bg(ctx, 'paper'); brand(ctx, u, TAG);
  const s = 's01';
  kick(ctx, 'أكبر خطأ عند البداية', 'alert', TOP + 60, C.red);
  title(ctx, u, 'إدخال المنتجات', 560, -0.5, { size: 112 });
  title(ctx, u, 'من الذاكرة', 720, -0.1, { size: 132, color: C.red, mark: [1, 1, at(s, 'ذاكرتك') + 0.1] });
  // memory says 12, the shelf has 9
  const C2 = [
    { x: XR - 400, ico: 'eye', lab: 'في الذاكرة', n: 12, word: 'ذاكرتك', col: C.muted },
    { x: XL, ico: 'box', lab: 'على الرف', n: 9, word: 'تكتشف', col: C.ink },
  ];
  C2.forEach((c) => {
    const k = springU(u, at(s, c.word) - 0.2, SPRING.bouncy);
    pop(ctx, k, c.x + 200, 970, () => {
      card(ctx, c.x, 840, 400, 260, 32, C.white, { stroke: C.line, shade: 0.14 });
      badge(ctx, c.ico, c.x + 400 - 60, 900, 34, C.wash, C.accent, 2.2);
      text(ctx, c.lab, c.x + 400 - 110, 914, F(38, 800, UI), C.ink);
      ltr(ctx, String(c.n), c.x + 200, 1060, F(120, 900), c.col, 'center');
    }, { from: 0.5, rise: 40 });
  });
  const tF = at(s, 'الفرق');
  const kd = springU(u, tF - 0.1, SPRING.bouncy);
  pop(ctx, kd, CX, 1180, () => {
    const f = F(48, 900), str = 'فرق: 3 قطع', wd = pillW(ctx, str, f, 88, 'alert', 30);
    pill(ctx, CX + wd / 2, 1136, 88, str, f, { bg: C.red, fg: C.white, ico: 'alert', pad: 30 });
  }, { from: 0.4 });
}

// s02 · Count what is really in the shop and write the quantities on paper or in a file.
const COUNT = [['Galaxy A15', 2], ['Redmi 13C', 1], ['شاحن سريع 25W', 10], ['سماعات بلوتوث', 6]];
function count(ctx, u) {
  bg(ctx, 'paper'); brand(ctx, u, TAG);
  const s = 's02';
  kick(ctx, 'ابدأ بجرد حقيقي', 'list', TOP + 60);
  title(ctx, u, 'عُدّ الموجود فعلًا', 520, [at(s, 'عُدّ') - 0.15, at(s, 'موجود') - 0.15, at(s, 'فعلًا') - 0.15], { size: 104, mark: [2, 2, at(s, 'فعلًا') + 0.2] });
  const k0 = springU(u, at(s, 'عُدّ') - 0.4, SPRING.snappy);
  enter(ctx, k0, () => { card(ctx, XL, 600, CW, 540, 34, C.white, { stroke: C.line, shade: 0.16 }); exampleTag(ctx, XL + 30, 626); }, { dy: 80 });
  const t0 = at(s, 'موجود'), t1 = at(s, 'الكميات');
  COUNT.forEach(([lab, n], i) => {
    const ti = t0 + (t1 - t0) * (i / COUNT.length), y = 700 + i * 108;
    const k = springU(u, ti - 0.1, SPRING.snappy);
    if (k <= 0.002) return;
    ctx.save(); ctx.globalAlpha *= clamp(k * 1.6);
    text(ctx, lab, XR - 44, y + 52, F(44, 800, UI), C.ink);
    const shown = Math.min(n, Math.floor(clamp(prog(u, ti, ti + 1.2)) * n + 0.0001));
    ltr(ctx, String(Math.max(shown, 0)), XL + 60, y + 54, F(56, 900), C.accent, 'left');
    ctx.fillStyle = C.line; ctx.fillRect(XL + 40, y + 84, CW - 80, 2);
    ctx.restore();
  });
  [['على ورقة', 'ورقة', 'file'], ['أو في ملف', 'ملف', 'grid']].forEach(([lab, word, ico], i) => {
    const k = springU(u, at(s, word) - 0.15, SPRING.bouncy), f = F(42, 800, UI), wd = pillW(ctx, lab, f, 84, ico, 30);
    const xr = i === 0 ? XR : XR - 400;
    pop(ctx, k, xr - wd / 2, 1222, () => pill(ctx, xr, 1180, 84, lab, f, { bg: C.ink, fg: C.white, ico, icoColor: C.lime, pad: 30 }), { rise: 20 });
  });
}

// s03 · Then split everything into three groups: new phones, used phones, accessories.
function groups(ctx, u) {
  bg(ctx, 'blue'); brand(ctx, u, TAG, { dark: true });
  const s = 's03';
  kick(ctx, 'ثم قسّم المنتجات', null, TOP + 60, 'rgba(255,255,255,.8)');
  title(ctx, u, 'ثلاث مجموعات', 540, cue(s, 'ثلاث مجموعات'), { size: 120, color: C.white });
  rows(ctx, u, [
    { at: at(s, 'هواتف'), ico: 'phone', label: 'هواتف جديدة' },
    { at: at(s, 'وهواتف'), ico: 'repeat', label: 'هواتف مستعملة' },
    { at: at(s, 'وإكسسوارات'), ico: 'box', label: 'إكسسوارات' },
  ], 660, 190, 30);
}

// s04 · A phone is saved by its IMEI; an accessory gets a card: barcode, cost, price, quantity.
const ACC = [['الباركود', '6971234567890', 'الباركود', true], ['سعر الشراء', '1,200 دج', 'وسعر', false, 0], ['سعر البيع', '1,800 دج', 'وسعر', false, 1], ['الكمية', '10', 'والكمية', true]];
function cards(ctx, u) {
  bg(ctx, 'paper'); brand(ctx, u, TAG);
  const s = 's04';
  // the phone: one IMEI per device
  const kP = springU(u, at(s, 'الهاتف') - 0.2, SPRING.snappy);
  enter(ctx, kP, () => {
    card(ctx, XL, 360, CW, 240, 32, C.white, { stroke: C.line, shade: 0.14 });
    badge(ctx, 'phone', XR - 62, 440, 40, C.wash, C.accent, 2.2);
    text(ctx, 'الهاتف', XR - 124, 458, F(56, 900), C.ink);
    text(ctx, 'برقم IMEI', XR - 124, 530, F(36, 700, UI), C.muted);
  }, { dy: 60 });
  const kI = springU(u, at(s, 'آي') - 0.1, SPRING.bouncy);
  pop(ctx, kI, XL + 230, 480, () => {
    rrect(ctx, XL + 30, 430, 420, 100, 20); ctx.fillStyle = C.ink; ctx.fill();
    ltr(ctx, '356789104523187', XL + 240, 496, F(40, 900, UI), C.lime, 'center');
  }, { from: 0.5 });
  // the accessory card
  const kA = springU(u, at(s, 'والإكسسوار') - 0.2, SPRING.snappy);
  enter(ctx, kA, () => {
    card(ctx, XL, 650, CW, 640, 32, C.white, { stroke: C.line, shade: 0.16 });
    badge(ctx, 'box', XR - 62, 730, 40, C.wash, C.accent, 2.2);
    text(ctx, 'الإكسسوار', XR - 124, 748, F(56, 900), C.ink);
    exampleTag(ctx, XL + 30, 690);
  }, { dy: 80 });
  ACC.forEach(([lab, val, word, isLtr, occ = 0], i) => {
    const y = 810 + i * 116, k = springU(u, at(s, word, occ) - 0.15, SPRING.snappy);
    if (k <= 0.002) return;
    ctx.save(); ctx.globalAlpha *= clamp(k * 1.6); ctx.translate((1 - k) * -40, 0);
    text(ctx, lab, XR - 44, y + 62, F(42, 700, UI), C.muted);
    if (i === 0) {
      // a small barcode drawn from the digits
      for (let j = 0; j < 30; j++) { const wd = ((val.charCodeAt(j % 13) + j) % 3) + 2; ctx.fillStyle = C.ink; ctx.fillRect(XL + 44 + j * 9, y + 18, wd, 54); }
      ltr(ctx, val, XL + 340, y + 62, F(34, 700, UI), C.ink, 'left');
    } else if (isLtr) ltr(ctx, val, XL + 44, y + 64, F(52, 900, UI), C.accent, 'left');
    else text(ctx, val, XL + 44, y + 64, F(50, 900, UI), C.accent, 'left');
    ctx.fillStyle = C.line; ctx.fillRect(XL + 40, y + 98, CW - 80, 2);
    ctx.restore();
  });
}

// s05 · Take a sample from the shelves and compare it with the stock screen. If it matches, you're ready.
function check(ctx, u) {
  bg(ctx, 'mint'); brand(ctx, u, TAG);
  const s = 's05';
  kick(ctx, 'في النهاية', 'check', TOP + 60, C.green);
  title(ctx, u, 'خذ عيّنة وقارنها', 520, cue(s, 'خذ عيّنة') .concat(cue(s, 'وقارنها')), { size: 104, mark: [1, 1, at(s, 'الرفوف')] });
  const kS = springU(u, at(s, 'بشاشة') - 0.3, SPRING.snappy);
  enter(ctx, kS, () => screen(ctx, S.IMG.products, XL, 590, CW, 330, { zoom: 1.25, cx: 0.55, cy: 0.62, shade: 0.16 }), { dy: 80 });
  [['هاتف', 'هاتفين', 0], ['هاتف', 'هاتفين', 1], ['إكسسوار', 'وإكسسوارًا', 0]].forEach(([lab, word, j], i) => {
    const t = at(s, word) + j * 0.3;
    const k = springU(u, t - 0.15, SPRING.bouncy), f = F(40, 800, UI);
    const xr = XR - i * 290;
    pop(ctx, k, xr - 130, 1000, () => pill(ctx, xr, 958, 84, lab, f, { bg: C.white, fg: C.ink, ico: lab === 'هاتف' ? 'phone' : 'box', stroke: '#cfe9dc', pad: 30 }), { rise: 20 });
    stamp(ctx, springU(u, at(s, 'تطابقت') + i * 0.15, SPRING.bouncy), xr - 16, 958, 22);
  });
  const kR = springU(u, at(s, 'جاهز') - 0.15, SPRING.bouncy);
  pop(ctx, kR, CX, 1170, () => {
    const f = F(64, 900), str = 'جاهز للبيع', wd = pillW(ctx, str, f, 124, 'check', 44);
    pill(ctx, CX + wd / 2, 1108, 124, str, f, { bg: C.green, fg: C.white, ico: 'check', pad: 44 });
  }, { from: 0.4 });
}

const cta = ctaScene({ sid: 's06' });

short({
  n: 3,
  scenes: [hook, count, groups, cards, check, cta, cta],
  hits: (H_) => {
    H_(K.at('s01', 'الفرق') - 0.1, 'the gap', 'thud', { gain: 0.35 });
    H_(K.at('s04', 'آي') - 0.1, 'IMEI', 'pop', { gain: 0.3 });
    H_(K.at('s05', 'جاهز') - 0.15, 'ready to sell', 'bell', { gain: 0.3 });
    H_(K.at('s06', 'واتساب') - 0.15, 'WhatsApp card', 'pop', { gain: 0.35 });
  },
});
