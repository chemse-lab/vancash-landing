// VanCash ERP · TikTok 9: صلاحيات العمال (1080x1920, ~60 s). A pure function of time.
// The voice drives the cut; every element enters on the word that names it. Captions: shorts/kit9.js.
// Names and the permission table on drawn cards are examples.
import * as K from '../shorts/kit9.js';

const {
  C, F, UI, S, E, prog, clamp, springU, SPRING, rrect, text, ltr, reveal, card, pop, enter, icon, badge,
  bg, cue, at, XR, XL, CW, CX, TOP, brand, kick, title, row, rows, stamp, xmark, pill, pillW, exampleTag,
  phone, ctaScene, short,
} = K;
const TAG = 'الفريق';

// An on/off switch that flips at beat t (on = green, knob right).
function toggle(ctx, u, cx, cy, on, t) {
  const k = clamp(prog(u, t - 0.1, t + 0.25)), p = on ? k : 0;
  const wd = 112, h = 60;
  rrect(ctx, cx - wd / 2, cy - h / 2, wd, h, h / 2);
  ctx.fillStyle = on ? K.M.mix(C.line, C.green, p) : K.M.mix(C.line, '#f3c2bd', k); ctx.fill();
  const kx = cx - wd / 2 + h / 2 + (wd - h) * p;
  ctx.beginPath(); ctx.arc(kx, cy, h / 2 - 7, 0, Math.PI * 2); ctx.fillStyle = C.white; ctx.fill();
  if (!on && k > 0.5) icon(ctx, 'lock', kx, cy, 26, C.red, { lw: 2.4 });
}

// s01 · Your worker needs to sell. But does he need to see your profits and expenses?
function hook(ctx, u) {
  bg(ctx, 'paper'); brand(ctx, u, TAG);
  const s = 's01';
  kick(ctx, 'عاملك يحتاج أن يبيع', 'user', TOP + 60);
  title(ctx, u, 'هل يرى عاملك', 540, -0.5, { size: 112 });
  title(ctx, u, 'أرباحك؟', 710, -0.1, { size: 150, color: C.red, mark: [0, 0, at(s, 'أرباحك') + 0.1] });
  rows(ctx, u, [
    { at: at(s, 'يبيع'), ico: 'cart', label: 'البيع', value: 'نعم', valueColor: C.green, tone: 'good' },
    { at: at(s, 'أرباحك'), ico: 'trend', label: 'الأرباح', value: '؟', valueColor: C.red, size: 56 },
    { at: at(s, 'ومصاريفك'), ico: 'receipt', label: 'المصاريف', value: '؟', valueColor: C.red, size: 56 },
  ], 790, 136, 20);
}

// s02 · On multi-user plans (e.g. Online for three devices) every worker gets his own account.
const USERS = [
  { name: 'أنت', role: 'المالك', word: 'تعطي', ico: 'key', tone: C.accent },
  { name: 'سمير', role: 'عامل · حساب خاص', word: 'عامل', ico: 'user', tone: C.ink },
  { name: 'أمين', role: 'عامل · حساب خاص', word: 'حسابه', ico: 'user', tone: C.ink },
];
function accounts(ctx, u) {
  bg(ctx, 'paper'); brand(ctx, u, TAG);
  const s = 's02';
  kick(ctx, 'في الخطط متعددة المستخدمين', 'users', TOP + 60);
  title(ctx, u, 'لكل عامل حسابه', 520, S.SEC[s].beat - 0.2, { size: 112, mark: [2, 2, at(s, 'حسابه') + 0.2] });
  const kP = springU(u, at(s, 'مستخدمين') - 0.15, SPRING.bouncy);
  pop(ctx, kP, XR - 220, 616, () => {
    const f = F(42, 900), str = 'Online · 3 أجهزة';
    pill(ctx, XR, 576, 80, str, f, { bg: C.accent, fg: C.white, ico: 'cloud', pad: 28 });
  }, { from: 0.5 });
  USERS.forEach((us, i) => {
    const y = 690 + i * 190, k = springU(u, at(s, us.word) - 0.2, SPRING.snappy);
    enter(ctx, k, () => {
      card(ctx, XL, y, CW, 170, 30, C.white, { stroke: C.line, shade: 0.14 });
      ctx.beginPath(); ctx.arc(XR - 80, y + 85, 50, 0, Math.PI * 2); ctx.fillStyle = i === 0 ? C.accent : C.wash; ctx.fill();
      icon(ctx, us.ico, XR - 80, y + 85, 50, i === 0 ? C.white : C.accent, { lw: 2.2 });
      text(ctx, us.name, XR - 156, y + 80, F(54, 900), C.ink);
      text(ctx, us.role, XR - 156, y + 134, F(32, 700, UI), C.muted);
      icon(ctx, 'lock', XL + 70, y + 85, 46, i === 0 ? C.accent : C.muted, { lw: 2.2 });
    }, { dy: 50 });
  });
  exampleTag(ctx, XL, 1262);
}

// s03 · For each section decide what he can do: view or edit. Sales yes; finance and reports no.
const PERM = [
  { lab: 'المبيعات', ico: 'cart', on: true, word: 'نعم' },
  { lab: 'المالية', ico: 'wallet', on: false, word: 'لا' },
  { lab: 'التقارير', ico: 'chart', on: false, word: 'لا' },
];
function perms(ctx, u) {
  bg(ctx, 'paper'); brand(ctx, u, TAG);
  const s = 's03';
  kick(ctx, 'حساب سمير', 'user', TOP + 60);
  title(ctx, u, 'صلاحيات كل قسم', 520, [at(s, 'تحدّد') - 0.15, at(s, 'لكل') - 0.15, at(s, 'قسم') - 0.15], { size: 108 });
  const k0 = springU(u, at(s, 'قسم') - 0.2, SPRING.snappy);
  enter(ctx, k0, () => card(ctx, XL, 600, CW, 620, 34, C.white, { stroke: C.line, shade: 0.16 }), { dy: 80 });
  if (k0 < 0.3) return;
  const CV = XL + 380, CE = XL + 150;          // the two columns: view, edit
  [['مشاهدة', CV, 'eye', 'مشاهدة'], ['تعديل', CE, 'plus', 'تعديل']].forEach(([lab, x, ico, word]) => {
    const k = springU(u, at(s, word) - 0.15, SPRING.bouncy);
    pop(ctx, k, x, 680, () => {
      rrect(ctx, x - 110, 646, 220, 70, 20); ctx.fillStyle = C.wash; ctx.fill();
      text(ctx, lab, x, 694, F(38, 900, UI), C.accent, 'center');
    }, { from: 0.4 });
  });
  PERM.forEach((p, i) => {
    const y = 790 + i * 136, t = at(s, p.word), kL = springU(u, at(s, p.lab === 'المبيعات' ? 'المبيعات' : p.lab === 'المالية' ? 'والمالية' : 'والتقارير') - 0.15, SPRING.snappy);
    if (kL <= 0.002) return;
    ctx.save(); ctx.globalAlpha *= clamp(kL * 1.6);
    badge(ctx, p.ico, XR - 60, y + 40, 34, p.on ? C.mint : C.wash, p.on ? C.green : C.accent, 2.2);
    text(ctx, p.lab, XR - 114, y + 56, F(48, 900), C.ink);
    toggle(ctx, u, CV, y + 40, p.on, t);
    toggle(ctx, u, CE, y + 40, p.on, t + 0.15);
    if (i < 2) { ctx.fillStyle = C.line; ctx.fillRect(XL + 40, y + 100, CW - 80, 2); }
    ctx.restore();
  });
}

// s04 · After setup, sign in with the worker's account and check yourself what he sees, before he starts.
const MENU = [['cart', 'نقطة البيع', true], ['box', 'المنتجات', true], ['wallet', 'المالية', false], ['chart', 'التقارير', false]];
function check(ctx, u) {
  bg(ctx, 'navy'); brand(ctx, u, TAG, { dark: true });
  const s = 's04';
  title(ctx, u, 'ادخل بحسابه وتأكّد', 470, [at(s, 'ادخل') - 0.15, at(s, 'بحساب') - 0.15, at(s, 'وتأكّد') - 0.15], { size: 88, color: C.white, mark: [2, 2, at(s, 'بنفسك')], box: false });
  const kp = springU(u, at(s, 'ادخل') - 0.4, SPRING.snappy);
  enter(ctx, kp, () => {
    const [sx, sy, sw] = phone(ctx, CX - 240, 560, 480, 720);
    // signed in as the worker
    rrect(ctx, sx + 24, sy + 60, sw - 48, 96, 22); ctx.fillStyle = C.wash; ctx.fill();
    icon(ctx, 'user', sx + sw - 74, sy + 108, 40, C.accent, { lw: 2.2 });
    text(ctx, 'سمير · عامل', sx + sw - 110, sy + 122, F(36, 900, UI), C.ink);
    const tV = at(s, 'يظهر') - 0.3;
    MENU.forEach(([ico, lab, ok], i) => {
      const y = sy + 190 + i * 104, k = springU(u, tV + i * 0.18, SPRING.snappy);
      if (k <= 0.002) return;
      ctx.save(); ctx.globalAlpha *= clamp(k * 1.6) * (ok ? 1 : 0.55); ctx.translate((1 - k) * 30, 0);
      rrect(ctx, sx + 24, y, sw - 48, 88, 20); ctx.fillStyle = ok ? C.white : '#eef1f6'; ctx.fill();
      ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.stroke();
      icon(ctx, ico, sx + sw - 70, y + 44, 38, ok ? C.accent : C.faint, { lw: 2.2 });
      text(ctx, lab, sx + sw - 110, y + 58, F(36, 800, UI), ok ? C.ink : C.faint);
      icon(ctx, ok ? 'check' : 'lock', sx + 64, y + 44, 36, ok ? C.green : C.red, { lw: 2.6 });
      ctx.restore();
    });
  }, { dy: 100 });
  stamp(ctx, springU(u, at(s, 'يبدأ') - 0.1, SPRING.bouncy), CX + 220, 590, 44);
}

// s05 · Each worker sees what fits his role; you see everything, from any activated device.
function roles(ctx, u) {
  bg(ctx, 'mint'); brand(ctx, u, TAG);
  const s = 's05';
  title(ctx, u, 'كل واحد يرى دوره', 520, [at(s, 'كل') - 0.15, at(s, 'عامل') - 0.15, at(s, 'يرى') - 0.15, at(s, 'دوره') - 0.15], { size: 100, mark: [3, 3, at(s, 'دوره') + 0.2] });
  const CARDS = [
    { y: 600, who: 'العامل', ico: 'user', word: 'عامل', chips: [['نقطة البيع', 'يناسب'], ['المنتجات', 'يناسب']] },
    { y: 840, who: 'أنت', ico: 'key', word: 'وأنت', chips: [['كل شيء', 'شيء']] },
  ];
  CARDS.forEach((c, i) => {
    const k = springU(u, at(s, c.word) - 0.2, SPRING.snappy);
    enter(ctx, k, () => {
      card(ctx, XL, c.y, CW, 210, 32, i === 1 ? C.ink : C.white, { stroke: i === 1 ? C.ink : '#cfe9dc', shade: 0.14 });
      badge(ctx, c.ico, XR - 62, c.y + 66, 36, i === 1 ? 'rgba(255,255,255,.14)' : C.wash, i === 1 ? C.lime : C.accent, 2.2);
      text(ctx, c.who, XR - 116, c.y + 82, F(48, 900), i === 1 ? C.white : C.ink);
    }, { dy: 50 });
    let xr = XR - 30;
    c.chips.forEach(([lab, word], j) => {
      const kc = springU(u, at(s, word) - 0.1 + j * 0.15, SPRING.bouncy), f = F(38, 800, UI);
      const wd = pillW(ctx, lab, f, 70, null, 26), x = xr;
      pop(ctx, kc, x - wd / 2, c.y + 155, () => pill(ctx, x, c.y + 120, 70, lab, f, { bg: i === 1 ? C.lime : C.mint, fg: C.ink, pad: 26 }), { from: 0.5 });
      xr -= wd + 16;
    });
  });
  // from any activated device
  [['monitor', XR - 120], ['phone', CX], ['phone', XL + 120]].forEach(([ico, x], j) => {
    const k = springU(u, at(s, 'جهاز') - 0.15 + j * 0.12, SPRING.bouncy);
    pop(ctx, k, x, 1170, () => {
      ctx.beginPath(); ctx.arc(x, 1170, 78, 0, Math.PI * 2); ctx.fillStyle = C.white; ctx.fill();
      ctx.strokeStyle = '#cfe9dc'; ctx.lineWidth = 4; ctx.stroke();
      icon(ctx, ico, x, 1170, 76, C.accent, { lw: 1.9 });
    }, { from: 0.4 });
    stamp(ctx, springU(u, at(s, 'مفعّل') + j * 0.12, SPRING.bouncy), x + 56, 1112, 24);
  });
}

const cta = ctaScene({ sid: 's06' });

short({
  n: 9,
  scenes: [hook, accounts, perms, check, roles, cta, cta],
  hits: (H_) => {
    H_(K.at('s01', 'أرباحك') + 0.1, 'profits?', 'thud', { gain: 0.3 });
    USERS.forEach((us) => H_(K.at('s02', us.word) - 0.2, us.name, 'pop', { gain: 0.22 }));
    H_(K.at('s03', 'نعم'), 'sales on', 'click', { gain: 0.4 });
    H_(K.at('s03', 'لا'), 'finance off', 'click', { gain: 0.4 });
    H_(K.at('s04', 'يبدأ') - 0.1, 'checked', 'bell', { gain: 0.3 });
    H_(K.at('s05', 'مفعّل'), 'devices', 'tick', { gain: 0.35 });
    H_(K.at('s06', 'واتساب') - 0.15, 'WhatsApp card', 'pop', { gain: 0.35 });
  },
});
