// VanCash ERP · TikTok 1: Offline أم Online؟ (1080x1920, ~60 s). A pure function of time.
// The voice drives the cut (shared/score.py -> vo_timeline.json, vo_words.json); every element enters
// on the word that names it. Captions are burned in by shorts/kit9.js.
import * as K from '../shorts/kit9.js';

const {
  C, F, UI, S, E, prog, clamp, springU, SPRING, rrect, text, ltr, reveal, card, pop, enter, icon, badge, shadow,
  bg, cue, at, XR, XL, CW, CX, TOP, brand, kick, title, titleC, row, rows, stamp, arrowLeft, pill, pillW, ctaScene, short,
} = K;
const TAG = 'النسخ';

// s01 · Before you pick: where will your data live, and on which device?
function hook(ctx, u) {
  bg(ctx, 'paper'); brand(ctx, u, TAG);
  const s = 's01';
  reveal(ctx, u, 'قبل أن تختار برنامجًا لمحلّك', XR, 430, F(48, 700), K.C.muted, [-0.4, ...cue(s, 'أن تختار برنامجًا لمحلّك')]);
  // the question is on screen from the first frame; the marker lands when it is asked
  title(ctx, u, 'أين ستُحفظ', 600, -0.5, { size: 132 });
  title(ctx, u, 'بياناتك؟', 770, [-0.1], { size: 150, color: C.accent, mark: [0, 0, at(s, 'بياناتك') + 0.25] });
  // three places it could be: the shop computer, your phone, the cloud
  const D = [['monitor', 'حاسوب المحل', 'جهاز'], ['phone', 'هاتفك', 'ستعمل'], ['cloud', 'سحابيًا؟', 'ستعمل']];
  D.forEach(([ico, lab, word], i) => {
    const cx = XR - 140 - i * 300, cy = 1010;
    const k = springU(u, at(s, word) - 0.2 + i * 0.18, SPRING.bouncy);
    pop(ctx, k, cx, cy, () => {
      ctx.beginPath(); ctx.arc(cx, cy, 112, 0, Math.PI * 2); ctx.fillStyle = C.white; ctx.fill();
      ctx.strokeStyle = C.line; ctx.lineWidth = 4; ctx.stroke();
      icon(ctx, ico, cx, cy, 104, C.accent, { lw: 1.8 });
      text(ctx, lab, cx, cy + 178, F(38, 800, UI), C.ink, 'center');
    }, { from: 0.4, rise: 30 });
  });
}

// s02 · Offline: no internet at all, data stays on the one device.
function offline(ctx, u) {
  bg(ctx, 'paper'); brand(ctx, u, TAG);
  const s = 's02';
  kick(ctx, 'نسخة', null, TOP + 60, C.muted);
  const tT = at(s, 'أوفلاين');
  title(ctx, u, 'Offline', 560, [tT - 0.15], { size: 170 });
  const kI = springU(u, tT, SPRING.bouncy);
  pop(ctx, kI, XL + 110, 500, () => badge(ctx, 'wifiOff', XL + 110, 500, 100, C.ink, C.lime, 2), { from: 0.3 });
  rows(ctx, u, [
    { at: at(s, 'بدون'), ico: 'wifiOff', label: 'بدون إنترنت', value: '100%', valueLtr: true },
    { at: at(s, 'وتبقى'), ico: 'monitor', label: 'على نفس الجهاز', sub: 'البيانات لا تغادر المحل' },
    { at: at(s, 'تناسبك'), ico: 'check', label: 'تناسب جهازًا واحدًا', tone: 'good' },
  ], 700);
}

// s03 · Online: saved in the cloud, sign in by email, the account can be recovered.
function online(ctx, u) {
  bg(ctx, 'blue'); brand(ctx, u, TAG, { dark: true });
  const s = 's03';
  kick(ctx, 'أما نسخة', null, TOP + 60, 'rgba(255,255,255,.75)');
  const tT = at(s, 'أونلاين');
  title(ctx, u, 'Online', 560, [tT - 0.15], { size: 170, color: C.white });
  const kI = springU(u, tT, SPRING.bouncy);
  pop(ctx, kI, XL + 110, 500, () => badge(ctx, 'cloud', XL + 110, 500, 100, C.white, C.accent, 2), { from: 0.3 });
  rows(ctx, u, [
    { at: at(s, 'سحابيًا'), ico: 'cloud', label: 'حفظ سحابي' },
    { at: at(s, 'بالإيميل'), ico: 'mail', label: 'دخول بالإيميل' },
    { at: at(s, 'استرجاع'), ico: 'key', label: 'استرجاع الحساب' },
  ], 700);
}

// s04 · Shop computer + your phone + the worker's phone: Online for three devices, kept in sync.
const DEV = [['monitor', 'حاسوب المحل', 'حاسوب'], ['phone', 'هاتفك', 'وهاتفك'], ['phone', 'هاتف العامل', 'وهاتف']];
function devices(ctx, u) {
  bg(ctx, 'paper'); brand(ctx, u, TAG);
  const s = 's04';
  title(ctx, u, 'أكثر من جهاز؟', 470, [S.SEC[s].beat - 0.4, at(s, 'أردت') - 0.1], { size: 104 });
  const tP = at(s, 'فخطة');
  const kp = springU(u, tP - 0.15, SPRING.bouncy);
  pop(ctx, kp, XR - 250, 560, () => {
    const f = F(44, 900), str = 'Online · 3 أجهزة';
    pill(ctx, XR, 528, 84, str, f, { bg: C.accent, fg: C.white, ico: 'cloud', pad: 30 });
  }, { from: 0.5 });
  // the cloud and the three devices
  const tSync = at(s, 'بالمزامنة');
  const kc = springU(u, tP, SPRING.bouncy);
  const ccx = CX, ccy = 760;
  const cw = 260, gap = 48, y0 = 950, ch = 280;
  DEV.forEach(([ico, lab, word], i) => {
    const x = XR - cw - i * (cw + gap) + 18, cx = x + cw / 2;
    const k = springU(u, at(s, word) - 0.2, SPRING.bouncy);
    // the link to the cloud draws on with "تربطها بالمزامنة"
    const pl = E.outCubic(prog(u, tSync - 0.6 + i * 0.12, tSync + 0.2 + i * 0.12));
    if (pl > 0) {
      ctx.save(); ctx.strokeStyle = C.accent; ctx.lineWidth = 5; ctx.setLineDash([14, 12]); ctx.lineDashOffset = -u * 30;
      ctx.beginPath(); ctx.moveTo(ccx, ccy + 70); ctx.lineTo(ccx + (cx - ccx) * pl, ccy + 70 + (y0 - ccy - 70) * pl); ctx.stroke(); ctx.restore();
    }
    pop(ctx, k, cx, y0 + ch / 2, () => {
      card(ctx, x, y0, cw, ch, 30, C.white, { stroke: C.line, shade: 0.16 });
      icon(ctx, ico, cx, y0 + 100, 96, C.accent, { lw: 1.8 });
      text(ctx, lab, cx, y0 + 222, F(36, 800, UI), C.ink, 'center');
    }, { from: 0.5, rise: 40 });
    stamp(ctx, springU(u, tSync + 0.2 + i * 0.15, SPRING.bouncy), x + cw - 26, y0 + 26, 28);
  });
  pop(ctx, kc, ccx, ccy, () => badge(ctx, 'sync', ccx, ccy, 82, C.accent, C.white, 2.2), { from: 0.3 });
}

// s05 · The rule: one device, no internet -> Offline; several devices or cloud backup -> Online.
function rule(ctx, u) {
  bg(ctx, 'mint'); brand(ctx, u, TAG);
  const s = 's05';
  kick(ctx, 'القاعدة بسيطة', 'check', TOP + 60, C.green);
  title(ctx, u, 'أيّهما تختار؟', 540, [S.SEC[s].beat - 0.3, at(s, 'بسيطة')], { size: 110 });
  const R2 = [
    { y: 640, lines: [['جهاز واحد', 'جهاز'], ['دون إنترنت', 'دون']], pick: 'Offline', pickAt: at(s, 'أوفلاين'), ico: 'wifiOff', dark: true },
    { y: 960, lines: [['أكثر من جهاز', 'أكثر'], ['أو حفظ سحابي', 'حفظ']], pick: 'Online', pickAt: at(s, 'أونلاين'), ico: 'cloud', dark: false },
  ];
  R2.forEach((r) => {
    const k = springU(u, at(s, r.lines[0][1]) - 0.3, SPRING.snappy);
    enter(ctx, k, () => card(ctx, XL, r.y, CW, 280, 34, C.white, { stroke: '#cfe9dc', shade: 0.14 }), { dy: 60 });
    if (k > 0.01) {
      r.lines.forEach(([str, word], j) => reveal(ctx, u, str, XR - 40, r.y + 108 + j * 92, F(58, 900), C.ink, [at(s, word) - 0.15]));
      arrowLeft(ctx, XL + 420, XL + 330, r.y + 140, C.muted, E.outCubic(prog(u, r.pickAt - 0.5, r.pickAt)), 6);
    }
    const kp = springU(u, r.pickAt - 0.15, SPRING.bouncy);
    pop(ctx, kp, XL + 170, r.y + 140, () => {
      rrect(ctx, XL + 30, r.y + 70, 290, 140, 30); ctx.fillStyle = r.dark ? C.ink : C.accent; ctx.fill();
      icon(ctx, r.ico, XL + 175, r.y + 112, 44, C.lime, { lw: 2.2 });
      ltr(ctx, r.pick, XL + 175, r.y + 186, F(50, 900), C.white, 'center');
    }, { from: 0.4 });
  });
}

const cta = ctaScene({ sid: 's06' });

short({
  n: 1,
  scenes: [hook, offline, online, devices, rule, cta, cta],
  hits: (H_) => {
    H_(K.at('s01', 'بياناتك') + 0.25, 'the question lands', 'pop', { gain: 0.35 });
    H_(K.at('s05', 'أوفلاين'), 'pick Offline', 'tick', { gain: 0.4 });
    H_(K.at('s05', 'أونلاين'), 'pick Online', 'tick', { gain: 0.4 });
    H_(K.at('s06', 'واتساب') - 0.15, 'WhatsApp card', 'pop', { gain: 0.35 });
  },
});
