// VanCash ERP · TikTok 2: رقم IMEI لكل هاتف (1080x1920, ~60 s). A pure function of time.
// The voice drives the cut; every element enters on the word that names it. Captions: shorts/kit9.js.
// IMEI numbers, names and amounts on drawn cards are examples.
import * as K from '../shorts/kit9.js';

const {
  C, F, UI, S, E, prog, clamp, springU, SPRING, rrect, text, ltr, reveal, card, pop, enter, icon, badge,
  bg, cue, at, XR, XL, CW, CX, TOP, brand, kick, title, titleC, row, rows, stamp, xmark, strike, phone,
  pill, pillW, exampleTag, ctaScene, short,
} = K;
const TAG = 'الهواتف';
const IMEI = '356789104523187';

// An IMEI written in groups, the last digit in its own colour.
function imeiLine(ctx, str, xL, y, size, color, lastColor = color) {
  const f = F(size, 900, UI), head = str.slice(0, -1), w0 = K.textW(ctx, head, f);
  ltr(ctx, head, xL, y, f, color); ltr(ctx, str.slice(-1), xL + w0, y, f, lastColor);
}

// s01 · The box says one IMEI, the program another. That's where the trouble starts.
function hook(ctx, u) {
  bg(ctx, 'paper'); brand(ctx, u, TAG);
  const s = 's01';
  title(ctx, u, 'رقم IMEI مختلف؟', 520, -0.5, { size: 112, mark: [1, 1, at(s, 'مختلف') + 0.1] });
  const tBad = at(s, 'مختلف');
  const B = [
    { y: 640, ico: 'box', lab: 'على العلبة', num: IMEI, word: 'العلبة', bad: false },
    { y: 900, ico: 'monitor', lab: 'في البرنامج', num: IMEI.slice(0, -1) + '8', word: 'البرنامج', bad: true },
  ];
  B.forEach((b) => {
    const k = springU(u, at(s, b.word) - 0.25, SPRING.snappy);
    const red = b.bad ? clamp(prog(u, tBad, tBad + 0.4)) : 0;
    enter(ctx, k, () => {
      card(ctx, XL, b.y, CW, 220, 32, red > 0.5 ? C.redWash : C.white, { stroke: red > 0.5 ? '#f3c2bd' : C.line, shade: 0.14 });
      badge(ctx, b.ico, XR - 62, b.y + 72, 40, C.wash, C.accent, 2.2);
      text(ctx, b.lab, XR - 124, b.y + 88, F(44, 800), C.ink);
      imeiLine(ctx, b.num, XL + 44, b.y + 176, 62, C.ink, b.bad ? K.M.mix(C.ink, C.red, red) : C.ink);
    }, { dy: 60 });
  });
  xmark(ctx, springU(u, tBad + 0.1, SPRING.bouncy), XL + 70, 880, 40);
  reveal(ctx, u, 'هنا تبدأ المشاكل.', XR, 1230, F(66, 900), C.red, cue(s, 'هنا تبدأ المشاكل'));
}

// s02 · Every phone is saved with its own number: brand, model, storage, new or used.
const FIELDS = [['IMEI', IMEI, 'برقمه', true], ['الماركة', 'Samsung', 'الماركة', true], ['الموديل', 'Galaxy A15', 'والموديل', true], ['السعة', '128GB', 'والسعة', true]];
function record(ctx, u) {
  bg(ctx, 'paper'); brand(ctx, u, TAG);
  const s = 's02';
  kick(ctx, 'في VanCash', 'phone', TOP + 60);
  title(ctx, u, 'كل هاتف برقمه', 520, cue(s, 'كل هاتف يُسجَّل برقمه').filter((_, i) => i !== 2), { size: 112, mark: [2, 2, at(s, 'برقمه') + 0.2] });
  const k0 = springU(u, at(s, 'برقمه') - 0.5, SPRING.snappy);
  enter(ctx, k0, () => { card(ctx, XL, 620, CW, 660, 34, C.white, { stroke: C.line, shade: 0.16 }); exampleTag(ctx, XL + 30, 646); }, { dy: 80 });
  FIELDS.forEach(([lab, val, word], i) => {
    const y = 700 + i * 112, k = springU(u, at(s, word) - 0.15, SPRING.snappy);
    if (k <= 0.002) return;
    ctx.save(); ctx.globalAlpha *= clamp(k * 1.6);
    text(ctx, lab, XR - 44, y + 60, F(40, 700, UI), C.muted);
    if (i === 0) imeiLine(ctx, val, XL + 44, y + 62, 50, C.accent);
    else ltr(ctx, val, XL + 44, y + 62, F(50, 900, UI), C.ink);
    ctx.fillStyle = C.line; ctx.fillRect(XL + 40, y + 96, CW - 80, 2);
    ctx.restore();
  });
  // condition: new or used
  text(ctx, 'الحالة', XR - 44, 1210, F(40, 700, UI), K.M.mix('#ffffff', C.muted, clamp(springU(u, at(s, 'والحالة') - 0.15, SPRING.snappy) * 1.5)));
  [['جديد', 'جديد'], ['مستعمل', 'مستعمل']].forEach(([lab, word], i) => {
    const k = springU(u, at(s, word) - 0.15, SPRING.bouncy), f = F(40, 800, UI);
    const xr = XL + 44 + (i === 0 ? 420 : 200);
    pop(ctx, k, xr - 90, 1196, () => pill(ctx, xr, 1162, 72, lab, f, { bg: i === 0 ? C.accent : C.wash, fg: i === 0 ? C.white : C.accent, pad: 30 }), { rise: 20 });
  });
}

// s03 · Match the number with the phone itself, not just the invoice: dial *#06#.
const DIAL = [['*', 'نجمة', 0], ['#', 'مربّع', 0], ['0', 'صفر', 0], ['6', 'ستة', 0], ['#', 'مربّع', 1]];
function match(ctx, u) {
  bg(ctx, 'navy'); brand(ctx, u, TAG, { dark: true });
  const s = 's03';
  title(ctx, u, 'طابق مع الجهاز نفسه', 470, cue(s, 'طابق الرقم مع الجهاز نفسه').filter((_, i) => i !== 1 && i !== 2), { size: 80, color: C.white, mark: [2, 3, at(s, 'نفسه') + 0.1] });
  strike(ctx, u, 'لا مع الفاتورة فقط', XR, 580, 52, at(s, 'لا') - 0.1);
  // the phone, dialling *#06#
  const kp = springU(u, at(s, 'اطلب') - 0.4, SPRING.snappy);
  enter(ctx, kp, () => {
    const [sx, sy, sw] = phone(ctx, CX - 230, 650, 460, 640);
    const typed = DIAL.filter(([, word, occ]) => u >= at(s, word, occ) - 0.05).map(([ch]) => ch).join('');
    ltr(ctx, typed, sx + sw / 2, sy + 150, F(84, 900, UI), C.ink, 'center');
    const tShow = at(s, 'مربّع', 1) + 0.5;
    const ks = springU(u, tShow, SPRING.snappy);
    if (ks > 0.01) {
      ctx.save(); ctx.globalAlpha *= clamp(ks * 1.6);
      rrect(ctx, sx + 26, sy + 230, sw - 52, 220, 24); ctx.fillStyle = C.wash; ctx.fill();
      ltr(ctx, 'IMEI', sx + sw / 2, sy + 300, F(36, 700, UI), C.muted, 'center');
      ltr(ctx, IMEI, sx + sw / 2, sy + 380, F(42, 900, UI), C.accent, 'center');
      ctx.restore();
      stamp(ctx, springU(u, tShow + 0.4, SPRING.bouncy), sx + sw / 2, sy + 520, 44);
    }
  }, { dy: 100 });
  // the keys light up as they are named
  DIAL.forEach(([ch, word, occ], i) => {
    const t = at(s, word, occ), k = springU(u, t - 0.1, SPRING.bouncy) * (1 - prog(u, t + 0.5, t + 0.8));
    pop(ctx, k, XR - 60, 760 + i * 96, () => {
      ctx.beginPath(); ctx.arc(XR - 60, 760 + i * 96, 40, 0, Math.PI * 2); ctx.fillStyle = C.lime; ctx.fill();
      ltr(ctx, ch, XR - 60, 760 + i * 96 + 16, F(44, 900, UI), C.ink, 'center');
    }, { from: 0.3 });
  });
}

// s04 · When you sell, you pick the phone by its number: which device left, to whom, for how much.
function sale(ctx, u) {
  bg(ctx, 'paper'); brand(ctx, u, TAG);
  const s = 's04';
  kick(ctx, 'عند البيع', 'cart', TOP + 60);
  title(ctx, u, 'اختر الهاتف برقمه', 520, cue(s, 'تختار الهاتف برقمه'), { size: 100 });
  const kc = springU(u, at(s, 'برقمه') - 0.1, SPRING.bouncy);
  pop(ctx, kc, CX, 630, () => {
    const f = F(40, 800, UI), str = 'Galaxy A15 · IMEI …3187', wd = pillW(ctx, str, f, 80, 'phone', 30);
    pill(ctx, CX + wd / 2, 590, 80, str, f, { bg: C.ink, fg: C.white, ico: 'phone', icoColor: C.lime, pad: 30 });
  }, { from: 0.5 });
  rows(ctx, u, [
    { at: at(s, 'أي'), ico: 'phone', label: 'أي جهاز خرج', value: '…3187', valueLtr: true },
    { at: at(s, 'ولمن'), ico: 'user', label: 'لمن', value: 'كريم ب.' },
    { at: at(s, 'وبكم'), ico: 'cash', label: 'بكم', value: '75,000 دج' },
  ], 720);
}

// s05 · One number per device: clear stock, fewer problems with customers.
function summary(ctx, u) {
  bg(ctx, 'mint'); brand(ctx, u, TAG);
  const s = 's05';
  title(ctx, u, 'رقم واحد', 560, cue(s, 'رقم واحد'), { size: 150, color: C.green });
  title(ctx, u, 'لكل جهاز', 730, cue(s, 'لكل جهاز'), { size: 150, mark: [1, 1, at(s, 'جهاز') + 0.2] });
  rows(ctx, u, [
    { at: at(s, 'مخزونًا'), ico: 'box', label: 'مخزون واضح', tone: 'good' },
    { at: at(s, 'ومشاكل'), ico: 'users', label: 'مشاكل أقل مع الزبائن', tone: 'good' },
  ], 860);
}

const cta = ctaScene({ sid: 's06' });

short({
  n: 2,
  scenes: [hook, record, match, sale, summary, cta, cta],
  hits: (H_) => {
    H_(K.at('s01', 'مختلف') + 0.1, 'mismatch', 'thud', { gain: 0.35 });
    DIAL.forEach(([, word, occ]) => H_(K.at('s03', word, occ) - 0.05, 'key', 'tick', { gain: 0.35 }));
    H_(K.at('s03', 'مربّع', 1) + 0.9, 'IMEI matches', 'bell', { gain: 0.3 });
    H_(K.at('s06', 'واتساب') - 0.15, 'WhatsApp card', 'pop', { gain: 0.35 });
  },
});
