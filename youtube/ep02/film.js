// VanCash ERP · الحلقة 2: أدخل المخزون. A pure function of time.
// The voice-over drives the cut (shared/score.py -> vo_timeline.json, vo_words.json); every element
// enters on the word that names it, looked up by its spoken text (cue/at in shared/kit.js).
// Screens are the real app screenshots from the landing page (shared/shots/). Example values on
// drawn cards (a phone's IMEI, a stock count) are illustrations and are labelled as examples.
import * as K from '../shared/kit.js';

const {
  M, W, E, prog, lerp, clamp, springU, SPRING, rrect, C, F, UI, R, L0, S, cue, at, atEnd, w,
  lineLayout, text, ltr, reveal, marker, headline, card, pop, enter, pill, pillW, pillC, icon, badge, stamp, stepNo,
  arrowLeft, screen, cropCover, cutout, ring, rings, camera, kicker, chipsRow, field, bg, hookHeader, textW,
  seriesScene, checkScene, nextScene, endScene, episode,
} = K;

const IMEI_BOX = '356789104523187', IMEI_APP = '356789104523817', IMEI_COMMON = 12;

// ================================================================ drawn props
// A phone's retail box, front face: lid band, the phone printed on it, and the IMEI sticker.
function phoneBox(ctx, x, y, w_, h_, imei, { hi = 0, tint = '#ffffff', label = true, ico = 'phone' } = {}) {
  card(ctx, x, y, w_, h_, 22, tint, { stroke: C.line, shade: 0.22 });
  rrect(ctx, x, y, w_, h_ * 0.12, 22); ctx.fillStyle = '#e8eefb'; ctx.fill();
  ctx.fillStyle = tint; ctx.fillRect(x, y + h_ * 0.1, w_, h_ * 0.04);
  ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y + h_ * 0.12); ctx.lineTo(x + w_, y + h_ * 0.12); ctx.stroke();
  if (ico) icon(ctx, ico, x + w_ / 2, y + h_ * 0.42, h_ * 0.42, '#b7c6e3', { lw: 1.2 });
  if (!label) return;
  // the sticker: barcode bars and the IMEI under them
  const sx = x + w_ * 0.08, sy = y + h_ * 0.68, sw = w_ * 0.84, sh = h_ * 0.26;
  rrect(ctx, sx, sy, sw, sh, 10); ctx.fillStyle = C.white; ctx.fill(); ctx.strokeStyle = '#cdd8ee'; ctx.stroke();
  ctx.fillStyle = C.ink;
  let bx = sx + 16;
  for (let i = 0; bx < sx + sw - 18; i++) { const bw = 1.5 + 3 * M.hash01(i, 7); ctx.fillRect(bx, sy + 12, bw, sh * 0.42); bx += bw + 2 + 3 * M.hash01(i, 11); }
  imeiText(ctx, imei, sx + sw / 2, sy + sh - 14, Math.round(Math.min(sh * 0.26, sw / 12.5)), hi, 'center', 'IMEI ');
}
// An IMEI string with its differing tail highlighted (hi 0..1).
function imeiText(ctx, imei, x, y, size, hi, align = 'left', prefix = '') {
  const f = F(size, 700, UI), head = prefix + imei.slice(0, IMEI_COMMON), tail = imei.slice(IMEI_COMMON);
  const wh = textW(ctx, head, f), wt = textW(ctx, tail, f);
  const x0 = align === 'center' ? x - (wh + wt) / 2 : x;
  ltr(ctx, head, x0, y, f, C.ink);
  ltr(ctx, tail, x0 + wh, y, f, M.mix(C.ink, C.red, clamp(hi)));
  if (hi > 0.01) {
    ctx.save(); ctx.globalAlpha = clamp(hi); ctx.fillStyle = C.red;
    ctx.fillRect(x0 + wh, y + size * 0.18, wt * clamp(hi * 1.3), Math.max(3, size * 0.1)); ctx.restore();
  }
}
// A handset standing up, its screen showing an IMEI (as *#06# does).
function handset(ctx, cx, cy, h_, imei, { hi = 0, top = '*#06#' } = {}) {
  const w_ = h_ * 0.5;
  card(ctx, cx - w_ / 2, cy - h_ / 2, w_, h_, w_ * 0.16, C.ink, { shade: 0.3 });
  rrect(ctx, cx - w_ / 2 + 10, cy - h_ / 2 + 10, w_ - 20, h_ - 20, w_ * 0.12); ctx.fillStyle = '#f3f7ff'; ctx.fill();
  ctx.fillStyle = C.ink; rrect(ctx, cx - 26, cy - h_ / 2 + 18, 52, 10, 5); ctx.fill();
  ltr(ctx, top, cx, cy - h_ * 0.16, F(Math.round(h_ * 0.075), 800, UI), C.muted, 'center');
  ltr(ctx, 'IMEI', cx, cy + h_ * 0.02, F(Math.round(h_ * 0.06), 700, UI), C.accent, 'center');
  const half = Math.ceil(imei.length / 2);
  const f = F(Math.round(h_ * 0.068), 800, UI);
  ltr(ctx, imei.slice(0, half), cx, cy + h_ * 0.12, f, C.ink, 'center');
  ltr(ctx, imei.slice(half), cx, cy + h_ * 0.21, f, M.mix(C.ink, C.red, clamp(hi)), 'center');
}

// ================================================================ scenes
// 01 · Hook: the IMEI on the box is not the IMEI in the app.
function hook(ctx, u) {
  bg(ctx, 'paper'); hookHeader(ctx, u);
  const s = 's01';
  const dim = 1 - 0.55 * E.inOutCubic(prog(u, at(s, 'خطأ') - 0.6, at(s, 'خطأ')));
  reveal(ctx, u, 'هاتف في العلبة،', R, 320, F(64, 700), C.ink, [-0.3, ...cue(s, 'في العلبة')], { alpha: dim });
  const tDiff = at(s, 'مختلف');
  reveal(ctx, u, 'ورقم IMEI مختلف في البرنامج.', R, 420, F(64, 700), C.ink, cue(s, 'ورقم [آي إم إي آي] مختلف في البرنامج'),
    { alpha: dim, colors: { 2: C.red } });
  headline(ctx, u, 'خطأ صغير عند الإدخال،', R, 600, F(96, 900), C.ink, cue(s, 'خطأ صغير عند الإدخال'), [0, 1, at(s, 'صغير') + 0.2]);
  reveal(ctx, u, 'يتحوّل لاحقًا إلى:', R, 700, F(46, 700), C.muted, cue(s, 'يتحوّل لاحقًا إلى'));
  const kA = springU(u, at(s, 'بيع') - 0.2, SPRING.bouncy), kB = springU(u, at(s, 'وحساب') - 0.2, SPRING.bouncy);
  const f = F(40, 800);
  const wa = pillW(ctx, 'بيع خاطئ', f, 80, 'receipt');
  pop(ctx, kA, R - wa / 2, 790, () => pill(ctx, R, 750, 80, 'بيع خاطئ', f, { bg: C.redWash, fg: C.red, ico: 'receipt' }), { from: 0.5, rise: 20 });
  const wb = pillW(ctx, 'حساب لا يتطابق', f, 80, 'wallet');
  pop(ctx, kB, R - wa - 20 - wb / 2, 790, () => pill(ctx, R - wa - 20, 750, 80, 'حساب لا يتطابق', f, { bg: C.redWash, fg: C.red, ico: 'wallet' }), { from: 0.5, rise: 20 });

  // the box and the app's IMEI field, side by side; the tails disagree on "مختلف"
  const hi = E.outCubic(prog(u, tDiff, tDiff + 0.6));
  const kb = springU(u, -0.6, SPRING.gentle);
  ctx.save(); ctx.globalAlpha = clamp(kb * 1.5); ctx.translate(-(1 - kb) * 300, 0);
  ctx.translate(330, 520); ctx.rotate(-0.04 + 0.008 * K.wobble(u + 0.3, 1.2, 3)); ctx.translate(-330, -520);
  phoneBox(ctx, 130, 250, 400, 520, IMEI_BOX, { hi });
  ctx.restore();
  text(ctx, 'على العلبة', 330, 820, F(30, 700, UI), C.muted, 'center', clamp(kb * 1.5));
  const kf = springU(u, at(s, 'ورقم') - 0.4, SPRING.snappy);
  enter(ctx, kf, () => {
    card(ctx, 470, 470, 380, 230, 24, C.white, { stroke: C.line, shade: 0.28 });
    text(ctx, 'في البرنامج', 470 + 380 - 26, 520, F(28, 700, UI), C.accent);
    text(ctx, 'IMEI 1', 470 + 380 - 26, 572, F(24, 600, UI), C.muted);
    rrect(ctx, 494, 588, 332, 74, 12); ctx.fillStyle = C.white; ctx.fill();
    ctx.strokeStyle = M.mix(C.accent, C.red, hi); ctx.lineWidth = 3; ctx.stroke();
    const p = prog(u, at(s, 'ورقم'), at(s, 'مختلف') - 0.1);
    const n = Math.round(IMEI_APP.length * p);
    if (n > 0) {
      const sub = IMEI_APP.slice(0, n);
      ctx.save(); ctx.beginPath(); ctx.rect(494, 588, 332, 74); ctx.clip();
      if (n > IMEI_COMMON) imeiText(ctx, sub, 512, 637, 32, hi);
      else ltr(ctx, sub, 512, 637, F(32, 700, UI), C.ink);
      ctx.restore();
    }
  }, { dx: 120, dy: 0 });
  // the "not equal" badge between them
  const kn = springU(u, tDiff, SPRING.bouncy);
  pop(ctx, kn, 470, 410, () => {
    ctx.beginPath(); ctx.arc(470, 410, 44, 0, Math.PI * 2); ctx.fillStyle = C.red; ctx.fill();
    text(ctx, '≠', 470, 432, F(64, 900), C.white, 'center');
  }, { from: 0.3 });
}

// 02 · The series.
const series = seriesScene({
  sid: 's02', lead: 'الحلقة الثانية من سلسلة تشغيل', brand: 'فان كاش', done: 'اخترت النسخة وجهّزت بياناتك',
  recap: 'اخترت النسخة وجهّزت بياناتك', today: 'واليوم', goal: 'جرد حقيقي، ثم إدخال المنتجات', goalCue: 'جرد حقيقي ثم إدخال المنتجات',
});

// 03 · Count first: a real stock sheet before anything goes into the app.
const SHEET = [
  { ico: 'phone', lab: 'هواتف جديدة', n: 12 }, { ico: 'repeat', lab: 'هواتف مستعملة', n: 5 },
  { ico: 'sync', lab: 'شواحن', n: 30 }, { ico: 'bell', lab: 'سماعات', n: 18 }, { ico: 'shield', lab: 'أغطية حماية', n: 40 },
];
function count(ctx, u) {
  bg(ctx, 'paper');
  const s = 's03';
  kicker(ctx, 'قبل أي إدخال', 'list');
  headline(ctx, u, 'ابدأ بالجرد', R, 250, F(110, 900), C.ink, [S.START[2] - 0.5, at(s, 'بالجرد') - 0.15], [1, 1, at(s, 'بالجرد') + 0.3]);
  headline(ctx, u, 'رتّب ما هو موجود فعليًا في المحل', R, 350, F(46, 700), C.ink, cue(s, 'رتّب ما هو موجود فعليًا في المحل'), [4, 4, at(s, 'فعليًا') + 0.1]);
  // the sheet, counted row by row while the voice says what is really there
  const k0 = springU(u, S.START[2] - 1, SPRING.gentle);
  const x = 150, y = 190, cw = 640, ch = 720;
  enter(ctx, k0, () => {
    card(ctx, x, y, cw, ch, 26, C.white, { stroke: C.line });
    rrect(ctx, x + cw / 2 - 90, y - 26, 180, 52, 14); ctx.fillStyle = C.ink; ctx.fill();
    text(ctx, 'ورقة الجرد', x + cw - 40, y + 78, F(44, 900), C.ink);
    pill(ctx, x + 40 + pillW(ctx, 'مثال', F(24, 700, UI), 40, null, 16), y + 46, 40, 'مثال', F(24, 700, UI), { bg: C.wash, fg: C.accent, pad: 16 });
  }, { dx: -200, dy: 0 });
  const t0 = at(s, 'رتّب'), t1 = at(s, 'قبل');
  SHEET.forEach((r, i) => {
    const ry = y + 130 + i * 112;
    const tk = lerp(t0, t1, i / SHEET.length);
    enter(ctx, k0, () => {
      ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 30, ry + 96); ctx.lineTo(x + cw - 30, ry + 96); ctx.stroke();
      badge(ctx, r.ico, x + cw - 70, ry + 46, 34, C.wash, C.accent, 2);
      text(ctx, r.lab, x + cw - 124, ry + 60, F(38, 800), C.ink);
      const c = Math.round(r.n * E.outCubic(prog(u, tk, tk + 0.8)));
      ltr(ctx, String(c), x + 170, ry + 62, F(46, 900), c ? C.accent : C.line, 'right');
    }, { dx: -200, dy: 0 });
    stamp(ctx, springU(u, tk + 0.8, SPRING.bouncy), x + 60, ry + 46, 22);
  });
  // first the count, then the app
  const tB = at(s, 'قبل');
  const kA = springU(u, tB - 0.3, SPRING.snappy), kB = springU(u, at(s, 'تسجّل') - 0.2, SPRING.snappy);
  const by = 430;
  pop(ctx, kA, 1600, by + 110, () => {
    card(ctx, 1380, by, 444, 220, 26, C.white, { stroke: C.line });
    stepNo(ctx, 1, R - 54, by + 56, 1, 30);
    text(ctx, 'الجرد الفعلي', R - 100, by + 68, F(40, 800), C.ink);
    text(ctx, 'ما هو موجود في المحل', R - 34, by + 140, F(28, 500, UI), C.muted);
    stamp(ctx, springU(u, tB + 0.3, SPRING.bouncy), 1430, by + 170, 26);
  }, { from: 0.8, rise: 40 });
  arrowLeft(ctx, 1360, 1290, by + 110, C.faint, E.outCubic(prog(u, at(s, 'تسجّل') - 0.4, at(s, 'تسجّل'))));
  pop(ctx, kB, 1050, by + 110, () => {
    card(ctx, 826, by, 444, 220, 26, C.white, { stroke: C.line });
    stepNo(ctx, 1, 1270 - 54, by + 56, 2, 30);
    text(ctx, 'الإدخال في البرنامج', 1270 - 100, by + 68, F(40, 800), C.ink);
    cropCover(ctx, S.IMG.products, [0, 0, 1008, 160], 850, by + 100, 396, 100, 10);
  }, { from: 0.8, rise: 40 });
  reveal(ctx, u, 'قبل أن تسجّل أي شيء.', R, 740, F(44, 700), C.muted, cue(s, 'قبل أن تسجّل أي شيء'));
  headline(ctx, u, 'دقّة البداية تجعل المبيعات والتقارير أوضح لاحقًا.', R, 960, F(46, 800), C.ink,
    cue(s, 'دقّة البداية تجعل المبيعات والتقارير أوضح لاحقًا'), [5, 5, at(s, 'أوضح') + 0.1]);
}

// 04 · Split the products, then the screen that keeps them apart.
const CATS = [
  { lab: 'هواتف جديدة', ico: 'phone', t: 'هواتف جديدة' },
  { lab: 'هواتف مستعملة', ico: 'repeat', t: 'وهواتف مستعملة' },
  { lab: 'الإكسسوارات', ico: 'box', t: 'الإكسسوارات' },
];
function split(ctx, u) {
  bg(ctx, 'paper');
  const s = 's04';
  stepNo(ctx, springU(u, at(s, 'أولًا') - 0.4, SPRING.bouncy), R - 44, 222, 1, 44);
  reveal(ctx, u, 'قسّم المنتجات', R - 112, 260, F(100, 900), C.ink, cue(s, 'قسّم المنتجات'));
  const tS = at(s, 'وفي'), q = E.inOutCubic(prog(u, tS - 0.3, tS + 0.5));
  // phase A: three big category cards
  if (q < 1) {
    ctx.save(); ctx.globalAlpha = 1 - q; ctx.translate(0, -q * 60);
    CATS.forEach((c, i) => {
      const xr = R - i * 576, x = xr - 540, y = 360;
      const k = springU(u, cue(s, c.t)[0] - 0.2, SPRING.bouncy);
      pop(ctx, k, x + 270, y + 200, () => {
        card(ctx, x, y, 540, i === 2 ? 470 : 400, 30, C.white, { stroke: C.line });
        badge(ctx, c.ico, xr - 90, y + 96, 56, C.wash, C.accent, 1.8);
        text(ctx, c.lab, xr - 40, y + 230, F(56, 900), C.ink);
        if (i === 1) pill(ctx, xr - 40, y + 270, 50, 'لكل هاتف حالته', F(26, 700, UI), { bg: C.wash, fg: C.accent, pad: 18 });
        if (i === 0) pill(ctx, xr - 40, y + 270, 50, 'في العلبة', F(26, 700, UI), { bg: C.wash, fg: C.accent, pad: 18 });
      }, { from: 0.7, rise: 60 });
      if (i === 2) {
        const items = [['الشواحن', at(s, 'الشواحن') - 0.15], ['السماعات', at(s, 'والسماعات') - 0.15], ['أغطية الحماية', at(s, 'وأغطية') - 0.15]];
        items.forEach(([lab, t], j) => {
          const kk = springU(u, t, SPRING.bouncy);
          const xx = xr - 40 - [0, 170, 0][j], yy = y + 270 + (j === 2 ? 76 : 0);
          pop(ctx, kk, xx - 80, yy + 28, () => pill(ctx, xx, yy, 56, lab, F(28, 700, UI), { bg: C.white, fg: C.ink, stroke: C.line, ico: 'check' }), { from: 0.5, rise: 16 });
        });
      }
    });
    ctx.restore();
  }
  // phase B: the real "products and stock" screen; search, categories, each product's state
  if (q > 0) {
    chipsRow(ctx, u, CATS.map((c, i) => [c.lab, tS - 0.1 + i * 0.12, c.ico]), 222, 1030, { h_: 58, size: 28, bg: C.wash, fg: C.accent, stroke: null });
    const img = S.IMG.products, x = 200, y = 340, cw = 1520, ch = Math.round(cw * img.height / img.width);
    enter(ctx, q, () => {
      const map = screen(ctx, img, x, y, cw, ch, { shade: 0.22 });
      rings(ctx, u, map, [
        [718, 180, 290, 52, at(s, 'البحث') - 0.1, at(s, 'والفئات') - 0.1],
        [462, 180, 248, 52, at(s, 'والفئات') - 0.1, at(s, 'وحالة') - 0.1],
        [60, 318, 110, 30, at(s, 'وحالة') - 0.1],
        [254, 68, 500, 82, at(s, 'وحالة') + 0.2],
      ]);
    }, { dy: 200 });
    const tags = [['البحث', 'search', at(s, 'البحث'), at(s, 'والفئات')], ['الفئات', 'list', at(s, 'والفئات'), at(s, 'وحالة')], ['حالة كل منتج', 'box', at(s, 'وحالة')]];
    tags.forEach(([lab, ico, t0, t1]) => K.tagAt(ctx, u, 960, 940, lab, t0 - 0.1, { ico, off: t1 !== undefined ? t1 - 0.2 : undefined, size: 34, h_: 68 }));
  }
}

// 05 · One record per phone: brand, model, capacity, condition, then the IMEI; then the real form.
function identity(ctx, u) {
  bg(ctx, 'paper');
  const s = 's05';
  stepNo(ctx, springU(u, at(s, 'ثانيًا') - 0.4, SPRING.bouncy), R - 44, 222, 2, 44);
  reveal(ctx, u, 'ميّز كل هاتف', R - 112, 260, F(100, 900), C.ink, cue(s, 'ميّز كل هاتف'));
  const tS = at(s, 'في'), q = E.inOutCubic(prog(u, tS - 0.3, tS + 0.5));
  const tI = at(s, 'رقم');
  if (q < 1) {
    ctx.save(); ctx.globalAlpha = 1 - q; ctx.translate(0, -q * 60);
    // the record, filled in as each detail is named
    const x = 980, cw = R - x;
    const k0 = springU(u, at(s, 'سجّل') - 0.4, SPRING.snappy);
    enter(ctx, k0, () => {
      card(ctx, x, 352, cw, 628, 30, C.white, { stroke: C.line });
      text(ctx, 'سجل الهاتف', R - 40, 418, F(40, 900), C.ink);
      pill(ctx, x + 40 + pillW(ctx, 'مثال', F(24, 700, UI), 40, null, 16), 386, 40, 'مثال', F(24, 700, UI), { bg: C.wash, fg: C.accent, pad: 16 });
    });
    const FLDS = [
      ['الماركة', 'Samsung', 'الماركة', true], ['الموديل', 'Galaxy A15', 'والموديل', true],
      ['السعة', '128GB', 'والسعة', true], ['الحالة', 'جديد', 'والحالة', false],
    ];
    FLDS.forEach(([lab, val, word, isLtr], i) => {
      const col = i % 2, row = (i / 2) | 0;
      const fx = col === 0 ? R - 40 - 370 : R - 40 - 370 - 24 - 370, fy = 490 + row * 140;
      const t = at(s, word);
      const kf = springU(u, t - 0.3, SPRING.snappy);
      enter(ctx, kf, () => field(ctx, fx, fy, 370, lab, val, prog(u, t, t + 0.5), { ltrValue: isLtr, focus: 1 - prog(u, t + 0.5, t + 1) }), { dy: 30 });
    });
    const ki = springU(u, tI - 0.3, SPRING.snappy);
    enter(ctx, ki, () => {
      field(ctx, R - 40 - 764, 800, 764, 'IMEI', IMEI_BOX, prog(u, at(s, 'آي'), at(s, 'آي') + 1.0), { ltrValue: true, size: 44, h_: 92, focus: 1 });
      marker(ctx, u, lineLayout(ctx, 'IMEI', F(26, 600, UI)), R - 40, 786, 26, 0, 0, tI + 0.2);
      text(ctx, 'IMEI', R - 40, 786, F(26, 600, UI), C.ink);
    }, { dy: 30 });
    reveal(ctx, u, 'الماركة، الموديل، السعة، الحالة، ثم IMEI', R, 322, F(34, 600, UI), C.muted, cue(s, 'الماركة والموديل والسعة والحالة ثم [رقم آي إم إي آي]'));
    // the handset itself: *#06# shows the IMEI to copy
    const kh = springU(u, tI - 0.5, SPRING.gentle);
    pop(ctx, kh, 520, 640, () => handset(ctx, 520, 640, 560, IMEI_BOX), { from: 0.85, rise: 80 });
    const kt = springU(u, tI + 0.8, SPRING.bouncy);
    pop(ctx, kt, 520, 960, () => pillC(ctx, 520, 930, 60, 'اطلب ‎*#06#‎ لعرض IMEI على الهاتف', F(28, 700, UI), { bg: C.ink, fg: C.white, ico: 'phone', icoColor: C.lime }), { rise: 16 });
    ctx.restore();
  }
  if (q > 0) {
    // the real phones screen; the camera walks the form as the voice names each pair of fields
    const img = S.IMG.imei, x = L0, y = 330, cw = R - L0, ch = 660;
    const [cx, cy, z] = camera(u, [[tS - 1, [0.5, 0.55, 1]], [at(s, 'آي', 2) - 0.6, [0.5, 0.86, 1]]]);
    enter(ctx, q, () => {
      const map = screen(ctx, img, x, y, cw, ch, { zoom: z, cx, cy, shade: 0.22 });
      ctx.save(); rrect(ctx, x, y, cw, ch, 18); ctx.clip();
      rings(ctx, u, map, [
        [325, 452, 182, 42, at(s, 'الأول') - 0.15, at(s, 'واللون') - 0.2],
        [45, 452, 228, 42, at(s, 'والثاني') - 0.15, at(s, 'واللون') - 0.2],
        [517, 502, 226, 42, at(s, 'واللون') - 0.15, at(s, 'وسعر') - 0.2],
        [282, 502, 226, 42, at(s, 'والتخزين') - 0.15, at(s, 'وسعر') - 0.2],
        [752, 552, 240, 42, at(s, 'الشراء') - 0.15],
        [517, 552, 226, 42, at(s, 'البيع') - 0.15],
      ]);
      ctx.restore();
    }, { dy: 200 });
    const caps = [
      ['IMEI الأول والثاني', at(s, 'الأول'), at(s, 'واللون')],
      ['اللون والتخزين', at(s, 'واللون'), at(s, 'وسعر')],
      ['سعر الشراء وسعر البيع المقترح', at(s, 'وسعر')],
    ];
    caps.forEach(([lab, t0, t1]) => K.tagAt(ctx, u, L0, 196, lab, t0 - 0.2, { align: 'left', size: 34, h_: 68, off: t1 !== undefined ? t1 - 0.25 : undefined }));
    reveal(ctx, u, 'في شاشة الهواتف', 1060, 255, F(48, 800), C.accent, cue(s, 'في شاشة الهواتف'));
  }
}

// 06 · Match the identifier to the device itself, not to the box.
function match(ctx, u) {
  bg(ctx, 'navy');
  const s = 's06';
  const fT = F(84, 900);
  const LT = lineLayout(ctx, 'طابق المعرّف مع الجهاز نفسه،', fT);
  marker(ctx, u, LT, R, 230, 84, 3, 4, at(s, 'الجهاز') + 0.1, C.lime, 1, true);
  const kInk = prog(u, at(s, 'الجهاز') + 0.25, at(s, 'الجهاز') + 0.6);
  reveal(ctx, u, 'طابق المعرّف مع الجهاز نفسه،', R, 230, fT, C.white, [S.START[5] - 0.5, ...cue(s, 'المعرّف مع الجهاز نفسه')],
    { colors: kInk > 0 ? { 3: C.ink, 4: C.ink } : {} });
  reveal(ctx, u, 'لا مع العلبة فقط.', R, 330, F(54, 700), 'rgba(255,255,255,.72)', cue(s, 'لا مع العلبة فقط'));
  // two identical boxes; the phones inside are not the same phone
  const tBox = at(s, 'علبتان'), tOpen = at(s, 'تعنيان');
  const open = E.inOutCubic(prog(u, tOpen - 0.2, tOpen + 0.9));
  const IM = [IMEI_BOX, '356789104523195'];
  [1240, 560].forEach((cx, i) => {
    const k = springU(u, tBox - 0.3 + i * 0.3, SPRING.bouncy);
    pop(ctx, k, cx, 700, () => {
      if (open < 1) {
        ctx.save(); ctx.translate(0, open * 420); ctx.globalAlpha *= 1 - open;
        phoneBox(ctx, cx - 190, 430, 380, 470, '', { label: false });
        ctx.restore();
      }
      if (open > 0) {
        ctx.save(); ctx.globalAlpha *= clamp(open * 2);
        handset(ctx, cx, 680 - open * 60, 470, IM[i], { hi: i === 1 ? open : 0 });
        ctx.restore();
      }
    }, { from: 0.6, rise: 60 });
  });
  // = becomes ≠
  const ke = springU(u, at(s, 'متشابهتان'), SPRING.bouncy);
  pop(ctx, ke, 900, 660, () => {
    ctx.beginPath(); ctx.arc(900, 660, 58, 0, Math.PI * 2); ctx.fillStyle = M.mix('#ffffff', C.red, open); ctx.fill();
    text(ctx, open > 0.5 ? '≠' : '=', 900, 690, F(84, 900), open > 0.5 ? C.white : C.ink, 'center');
  }, { from: 0.3 });
  ctx.save(); ctx.beginPath(); ctx.rect(0, 905, W, 200); ctx.clip();
  reveal(ctx, u, 'علبتان متشابهتان لا تعنيان هاتفين متطابقين', R, 985, F(50, 800), C.white, cue(s, 'علبتان متشابهتان لا تعنيان هاتفين متطابقين'), { colors: { 2: C.lime, 3: C.lime } });
  ctx.restore();
}

// 07 · An accessory's product card: name, category, barcode (scan it), then four prices.
const ACC = [
  { lab: 'الاسم', ico: 'tag', t: 'الاسم', r: [537, 130, 454, 46] },
  { lab: 'الفئة', ico: 'list', t: 'والفئة', r: [580, 210, 410, 48] },
  { lab: 'الباركود', ico: 'barcode', t: 'والباركود', r: [622, 290, 370, 42] },
  { lab: 'مسح بالكاميرا', ico: 'camera', t: 'بالكاميرا', r: [538, 292, 76, 40] },
];
const PRICES = [
  { lab: 'التكلفة', ico: 'cash', t: 'التكلفة', r: [265, 128, 222, 46] },
  { lab: 'سعر التجزئة', ico: 'tag', t: 'التجزئة', r: [32, 128, 222, 46] },
  { lab: 'سعر الجملة', ico: 'box', t: 'الجملة', r: [265, 208, 222, 44] },
  { lab: 'السعر الأدنى', ico: 'alert', t: 'الأدنى', r: [32, 208, 222, 44] },
];
function accessory(ctx, u) {
  bg(ctx, 'paper');
  const s = 's07';
  kicker(ctx, 'المنتجات الأخرى', 'box');
  reveal(ctx, u, 'بطاقة الإكسسوار', R, 230, F(90, 900), C.ink, [S.START[6] - 0.5, at(s, 'الإكسسوار') - 0.15]);
  const tP = at(s, 'الأسعار');
  const img = S.IMG.addp, x = L0, y = 290, cw = 1160, ch = Math.round(cw * img.height / img.width);
  const [cx, cy, z] = camera(u, [[S.START[6] - 1, [0.5, 0.5, 1]], [tP - 0.5, [0.25, 0.28, 1.3]]]);
  const k0 = springU(u, S.START[6] - 0.8, SPRING.gentle);
  enter(ctx, k0, () => {
    const map = screen(ctx, img, x, y, cw, ch, { zoom: z, cx, cy });
    ctx.save(); rrect(ctx, x, y, cw, ch, 18); ctx.clip();
    const list = [...ACC, ...PRICES].map((a, i, arr) => {
      const t0 = at(s, a.t) - 0.15, nxt = arr[i + 1];
      const off = i < 3 ? at(s, ACC[i + 1].t) - 0.2 : i === 3 ? tP - 0.3 : nxt ? at(s, nxt.t) - 0.2 : undefined;
      return [...a.r, t0, off];
    });
    rings(ctx, u, map, list);
    const kc = springU(u, tP - 0.15, SPRING.snappy) * (1 - prog(u, at(s, 'التكلفة') - 0.3, at(s, 'التكلفة')));
    const [rx, ry, rs] = map(15, 60);
    ring(ctx, rx, ry, 488 * rs, 208 * rs, kc);
    ctx.restore();
  }, { dx: -160, dy: 0 });
  // the checklist at the right, built as the voice names each part
  const lx = R, f = F(34, 700, UI);
  text(ctx, 'بطاقة المنتج', lx, 345, F(30, 700, UI), C.muted, 'right', clamp(prog(u, at(s, 'بطاقة'), at(s, 'بطاقة') + 0.4)));
  ACC.forEach((a, i) => {
    const k = springU(u, at(s, a.t) - 0.2, SPRING.bouncy);
    pop(ctx, k, lx - 120, 395 + i * 72, () => pill(ctx, lx, 368 + i * 72, 58, a.lab, f, { bg: C.white, fg: C.ink, ico: a.ico, stroke: C.line, icoColor: C.accent }), { from: 0.5, rise: 12 });
  });
  text(ctx, 'الأسعار', lx, 690, F(30, 700, UI), C.muted, 'right', clamp(prog(u, tP, tP + 0.4)));
  PRICES.forEach((a, i) => {
    const k = springU(u, at(s, a.t) - 0.2, SPRING.bouncy);
    pop(ctx, k, lx - 120, 740 + i * 72, () => pill(ctx, lx, 713 + i * 72, 58, a.lab, f, { bg: C.accent, fg: C.white, ico: a.ico }), { from: 0.5, rise: 12 });
  });
}

// 08 · Price and quantity; one record per phone.
const PQ = [
  { lab: 'تكلفة الشراء', ico: 'cash', t: 'تكلفة' },
  { lab: 'سعر البيع', ico: 'tag', t: 'البيع' },
  { lab: 'الكميات المتاحة', ico: 'box', t: 'والكميات' },
];
function priceQty(ctx, u) {
  bg(ctx, 'paper');
  const s = 's08';
  stepNo(ctx, springU(u, at(s, 'ثالثًا') - 0.4, SPRING.bouncy), R - 44, 222, 3, 44);
  reveal(ctx, u, 'أدخل السعر والكمية', R - 112, 260, F(100, 900), C.ink, cue(s, 'أدخل السعر والكمية'));
  PQ.forEach((p, i) => {
    const xr = R - i * 576, x = xr - 540, y = 330;
    const k = springU(u, at(s, p.t) - 0.25, SPRING.bouncy);
    pop(ctx, k, x + 270, y + 110, () => {
      card(ctx, x, y, 540, 220, 28, C.white, { stroke: C.line });
      badge(ctx, p.ico, xr - 86, y + 110, 54, C.wash, C.accent, 1.8);
      text(ctx, p.lab, xr - 166, y + 128, F(52, 900), C.ink);
    }, { from: 0.7, rise: 40 });
  });
  // one record per phone: the app's own words
  reveal(ctx, u, 'وراجع عدد الأجهزة ذات المعرّفات الفردية،', R, 660, F(42, 700), C.muted, cue(s, 'وراجع عدد الأجهزة ذات المعرّفات الفردية'));
  const IM = [IMEI_BOX, '356789104523195', '356789104523203'];
  IM.forEach((im, i) => {
    const k = springU(u, at(s, 'المعرّفات') - 0.3 + i * 0.3, SPRING.bouncy);
    const y = 610 + i * 124;
    pop(ctx, k, 500, y + 54, () => {
      card(ctx, L0, y, 820, 108, 22, C.white, { stroke: C.line });
      badge(ctx, 'phone', L0 + 820 - 58, y + 54, 34, C.wash, C.accent, 2);
      text(ctx, `هاتف ${i + 1}`, L0 + 820 - 108, y + 68, F(38, 800), C.ink);
      ltr(ctx, `IMEI ${im}`, L0 + 32, y + 66, F(34, 700, UI), C.muted);
    }, { from: 0.7, rise: 30 });
  });
  const kc = springU(u, at(s, 'فكل') - 0.3, SPRING.snappy);
  pop(ctx, kc, 1500, 780, () => cutout(ctx, S.IMG.imei, [606, 364, 402, 44], R - 402 * 2, 735, 2), { from: 0.8, rise: 30 });
  const fL = F(60, 900);
  marker(ctx, u, lineLayout(ctx, 'فكل هاتف له سجل مستقل.', fL), R, 930, 60, 3, 4, at(s, 'سجل') + 0.1);
  reveal(ctx, u, 'فكل هاتف له سجل مستقل.', R, 930, fL, C.ink, cue(s, 'فكل هاتف له سجل مستقل'));
}

// 09 · The stock screen after entry: totals, low stock, out of stock, stock value; receive goods, new product.
function stockScreen(ctx, u) {
  bg(ctx, 'paper');
  const s = 's09';
  kicker(ctx, 'بعد الإدخال', 'grid');
  reveal(ctx, u, 'شاشة المخزون', R, 230, F(90, 900), C.ink, [S.START[8] - 0.5, at(s, 'المخزون') - 0.15]);
  const img = S.IMG.products, x = L0, y = 290, cw = R - L0, ch = 700;
  const tB = at(s, 'وفيها');
  const [cx, cy, z] = camera(u, [[S.START[8] - 1, [0.5, 0.5, 1]], [tB - 0.4, [0.25, 0.47, 1.55]]]);
  const k0 = springU(u, S.START[8] - 0.8, SPRING.gentle);
  enter(ctx, k0, () => {
    const map = screen(ctx, img, x, y, cw, ch, { zoom: z, cx, cy });
    ctx.save(); rrect(ctx, x, y, cw, ch, 18); ctx.clip();
    rings(ctx, u, map, [
      [762, 68, 246, 82, at(s, 'كل') - 0.15, tB - 0.3],
      [508, 68, 246, 82, at(s, 'والمخزون') - 0.15, tB - 0.3],
      [254, 68, 246, 82, at(s, 'نفد') - 0.15, tB - 0.3],
      [0, 38, 136, 26, at(s, 'قيمة') - 0.15, tB - 0.3],
      [326, 186, 128, 40, at(s, 'استلام') - 0.15],
      [12, 182, 124, 46, at(s, 'منتج') - 0.15],
    ], C.accent);
    ctx.restore();
  }, { dy: 120 });
  const T = [['كل المنتجات', 'كل', 'grid'], ['المخزون المنخفض', 'والمخزون', 'alert'], ['ما نفد من المخزون', 'نفد', 'x'], ['قيمة المخزون', 'قيمة', 'cash'],
    ['استلام بضاعة', 'استلام', 'inbox'], ['منتج جديد', 'منتج', 'plus']];
  T.forEach(([lab, word, ico], i) => {
    const t0 = at(s, word), t1 = i < 5 ? at(s, T[i + 1][1]) : undefined;
    K.tagAt(ctx, u, 960, 920, lab, t0 - 0.15, { ico, size: 36, h_: 72, off: t1 !== undefined ? t1 - 0.25 : undefined });
  });
}

// 10 · Check a sample: search a phone by IMEI, an accessory by name or barcode; match what's in front of you.
const BARCODE = '2001054105480';
function sample(ctx, u) {
  bg(ctx, 'paper');
  const s = 's10';
  stepNo(ctx, springU(u, S.START[9] - 0.4, SPRING.bouncy), R - 44, 222, 4, 44);
  reveal(ctx, u, 'راجع عيّنة', R - 112, 260, F(100, 900), C.ink, [S.START[9] - 0.2, at(s, 'عيّنة') - 0.15]);
  // the search field (the app's placeholder), typing three searches in turn
  const x = 720, y = 330, sw = R - x, sh = 96;
  const k0 = springU(u, S.START[9] - 0.6, SPRING.snappy);
  const Q = [
    { q: IMEI_BOX, ltr: true, t0: at(s, 'برقم'), t1: at(s, 'آي', 1) + 0.3, lab: 'هاتف برقم IMEI' },
    { q: 'شاحن سريع', ltr: false, t0: at(s, 'باسمه'), t1: at(s, 'باسمه') + 0.5, lab: 'إكسسوار باسمه' },
    { q: BARCODE, ltr: true, t0: at(s, 'بالباركود'), t1: at(s, 'بالباركود') + 0.8, lab: 'أو بالباركود' },
  ];
  let qi = -1;
  Q.forEach((qq, i) => { if (u >= qq.t0 - 0.2) qi = i; });
  enter(ctx, k0, () => {
    card(ctx, x, y, sw, sh, 18, C.white, { stroke: C.accent, lw: 3 });
    icon(ctx, 'search', R - 50, y + sh / 2, 40, C.accent, { lw: 2.2 });
    if (qi < 0) text(ctx, 'بحث بالاسم / الباركود / SKU...', R - 96, y + sh / 2 + 14, F(36, 500, UI), C.faint);
    else {
      const qq = Q[qi], n = Math.round(qq.q.length * prog(u, qq.t0, qq.t1));
      const str = qq.q.slice(0, n);
      if (qq.ltr) ltr(ctx, str, R - 96, y + sh / 2 + 15, F(42, 700, UI), C.ink, 'right');
      else text(ctx, str, R - 96, y + sh / 2 + 15, F(42, 700, UI), C.ink);
    }
  });
  Q.forEach((qq, i) => K.tagAt(ctx, u, x, 450, qq.lab, qq.t0 - 0.3, { align: 'left', ico: i ? (i === 2 ? 'barcode' : 'tag') : 'phone', size: 30, h_: 60, off: i < 2 ? Q[i + 1].t0 - 0.4 : undefined }));
  // results
  const kr1 = springU(u, Q[0].t1, SPRING.snappy) * (1 - prog(u, Q[1].t0 - 0.4, Q[1].t0));
  enter(ctx, kr1, () => {
    card(ctx, x, 560, sw, 130, 22, C.white, { stroke: C.line });
    badge(ctx, 'phone', R - 66, 625, 40, C.wash, C.accent, 2);
    text(ctx, 'Samsung Galaxy A15 · 128GB · جديد', R - 130, 612, F(36, 800), C.ink);
    ltr(ctx, `IMEI ${IMEI_BOX}`, R - 130, 660, F(30, 700, UI), C.muted, 'right');
    text(ctx, 'مثال', x + 70, 636, F(26, 700, UI), C.accent, 'center');
  }, { dy: 30 });
  const kr2 = springU(u, Q[1].t1, SPRING.snappy);
  enter(ctx, kr2, () => {
    const s_ = sw / 628;
    cutout(ctx, S.IMG.products, [380, 304, 628, 58], x, 560, s_);
    const kb = springU(u, Q[2].t1, SPRING.snappy);
    ring(ctx, x + (470 - 380) * s_, 560 + 10 * s_, 140 * s_, 38 * s_, kb);
  }, { dy: 30 });
  // what's in front of you: the charger itself, matched
  const tM = at(s, 'طابق'), kp = springU(u, tM - 0.4, SPRING.bouncy);
  pop(ctx, kp, 380, 700, () => {
    phoneBox(ctx, 200, 470, 360, 420, '', { label: false, ico: null });
    rrect(ctx, 230, 760, 300, 104, 10); ctx.fillStyle = C.white; ctx.fill(); ctx.strokeStyle = '#cdd8ee'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = C.ink;
    let bx = 250;
    for (let i = 0; bx < 510; i++) { const bw = 1.5 + 3 * M.hash01(i, 5); ctx.fillRect(bx, 772, bw, 44); bx += bw + 2 + 3 * M.hash01(i, 9); }
    ltr(ctx, BARCODE, 380, 850, F(26, 700, UI), C.ink, 'center');
    text(ctx, 'شاحن سريع 25W', 380, 660, F(40, 900), C.ink, 'center');
    text(ctx, 'أمامك', 380, 935, F(30, 700, UI), C.muted, 'center');
  }, { from: 0.7, rise: 50 });
  const km = springU(u, at(s, 'النتيجة'), SPRING.bouncy);
  pop(ctx, km, 640, 625, () => {
    ctx.save(); ctx.setLineDash([10, 10]); ctx.strokeStyle = C.green; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(560, 625); ctx.lineTo(x - 10, 625); ctx.stroke(); ctx.restore();
  }, { from: 0.4 });
  stamp(ctx, springU(u, at(s, 'أمامك') - 0.1, SPRING.bouncy), 640, 625, 40);
  reveal(ctx, u, 'ثم طابق النتيجة مع الموجود أمامك.', R, 820, F(50, 800), C.ink, cue(s, 'ثم طابق النتيجة مع الموجود أمامك'));
}

// 11 · Checkpoint: five varied products in, then prices, quantities and phone identifiers checked.
const FIVE = [
  { lab: 'هاتف جديد', ico: 'phone', t: 'هاتفًا' }, { lab: 'هاتف مستعمل', ico: 'repeat', t: 'وهاتفًا' },
  { lab: 'شاحن', ico: 'sync', t: 'وثلاثة' }, { lab: 'سماعة', ico: 'bell', t: 'وثلاثة', d: 0.25 }, { lab: 'غطاء حماية', ico: 'shield', t: 'وثلاثة', d: 0.5 },
];
const ROWS11 = [
  { str: 'الأسعار', cue: 'الأسعار' },
  { str: 'الكميات', cue: 'والكميات' },
  { str: 'معرّفات الهواتف', cue: 'ومعرّفات الهواتف' },
];
const check = checkScene({
  sid: 's11', head: 'جرّب إدخال 5 منتجات متنوعة', headCue: 'جرّب إدخال [خمسة] منتجات متنوعة', headSize: 80,
  rowsL: 1060, rowsY: 400, rowGap: 150,
  rows: ROWS11,
  body(ctx, u) {
    const s = 's11';
    text(ctx, 'ثم تحقق من:', R, 365, F(36, 700, UI), C.green, 'right', clamp(prog(u, at(s, 'تحقق') - 0.2, at(s, 'تحقق') + 0.3)));
    FIVE.forEach((p, i) => {
      const row = i < 2 ? 0 : 1, col = i < 2 ? i : i - 2;
      const tw_ = row === 0 ? 420 : 276, gap = 24;
      const xr = 1000 - col * (tw_ + gap), x = xr - tw_, y = 340 + row * 270;
      const k = springU(u, at(s, p.t) - 0.25 + (p.d || 0), SPRING.bouncy);
      pop(ctx, k, x + tw_ / 2, y + 120, () => {
        card(ctx, x, y, tw_, 240, 24, C.white, { stroke: '#cfe9dc', shade: 0.12 });
        badge(ctx, p.ico, x + tw_ / 2, y + 90, 48, C.mint, C.green, 1.8);
        text(ctx, p.lab, x + tw_ / 2, y + 196, F(36, 800), C.ink, 'center');
      }, { from: 0.6, rise: 40 });
    });
  },
});

// 12 · Next episode and the two asks.
const next = nextScene({
  sid: 's12', sub: 'الزبائن والموردون والديون', subCue: 'الزبائن والموردين والديون', shots: ['customer', 'debts'],
  shotCues: ['الزبائن', 'والديون'], trialCue: 'اطلب تجربتك', subscribeCue: 'واشترك', tail: 'لتتابع بقية الحلقات', tailCue: 'لتتابع بقية الحلقات',
});
const endCard = endScene({ shot: 'debts', panelTitle: 'الحلقة 3 · رتّب الحسابات' });

episode({
  n: 2,
  scenes: [hook, series, count, split, identity, match, accessory, priceQty, stockScreen, sample, check, next, endCard],
  hits(H_) {
    H_(at('s01', 'مختلف'), 'imei mismatch', 'blip', { pitch: 'E5', gain: 0.5 });
    H_(at('s01', 'بيع') - 0.2, 'wrong sale', 'pop', { pitch: 'D5', gain: 0.45 });
    H_(at('s01', 'وحساب') - 0.2, 'books off', 'pop', { pitch: 'A4', gain: 0.45 });
    H_(cue('s02', 'فان كاش')[0], 'logo', 'bell', { pitch: 'D6', gain: 0.5 });
    H_(cue('s02', 'اخترت النسخة وجهّزت بياناتك')[0], 'stage 1 done', 'tick', { gain: 0.55 });
    H_(at('s02', 'واليوم'), 'episode 2 chip', 'bell', { pitch: 'A5', gain: 0.5 });
    const t0 = at('s03', 'رتّب'), t1 = at('s03', 'قبل');
    SHEET.forEach((_, i) => H_(lerp(t0, t1, i / SHEET.length) + 0.8, 'counted', 'tick', { gain: 0.5 }));
    H_(at('s03', 'تسجّل') - 0.2, 'then the app', 'pop', { gain: 0.4 });
    H_(at('s04', 'أولًا') - 0.4, 'step 1', 'pop', { pitch: 'D5', gain: 0.45 });
    CATS.forEach((c, i) => H_(cue('s04', c.t)[0] - 0.2, `category ${i + 1}`, 'pop', { pitch: ['D5', 'F#5', 'A5'][i], gain: 0.4 }));
    ['البحث', 'والفئات', 'وحالة'].forEach((wd) => H_(at('s04', wd) - 0.1, `ring ${wd}`, 'click', { gain: 0.45 }));
    H_(at('s05', 'ثانيًا') - 0.4, 'step 2', 'pop', { pitch: 'E5', gain: 0.45 });
    ['الماركة', 'والموديل', 'والسعة', 'والحالة'].forEach((wd) => H_(at('s05', wd), `field ${wd}`, 'tick', { gain: 0.4 }));
    H_(at('s05', 'آي'), 'imei types', 'type', { len: 1.0, gain: 0.45 });
    ['الأول', 'واللون', 'وسعر'].forEach((wd) => H_(at('s05', wd) - 0.15, `form ${wd}`, 'click', { gain: 0.45 }));
    H_(at('s06', 'متشابهتان'), 'equal', 'blip', { pitch: 'A5', gain: 0.45 });
    H_(at('s06', 'تعنيان'), 'not equal', 'blip', { pitch: 'E5', gain: 0.55 });
    [...ACC, ...PRICES].forEach((a) => H_(at('s07', a.t) - 0.2, `field ${a.lab}`, 'click', { gain: 0.4 }));
    H_(at('s08', 'ثالثًا') - 0.4, 'step 3', 'pop', { pitch: 'F#5', gain: 0.45 });
    PQ.forEach((p, i) => H_(at('s08', p.t) - 0.25, p.lab, 'pop', { pitch: ['D5', 'F#5', 'A5'][i], gain: 0.4 }));
    H_(at('s08', 'سجل') + 0.1, 'one record each', 'bell', { pitch: 'D6', gain: 0.4 });
    ['كل', 'والمخزون', 'نفد', 'قيمة', 'استلام', 'منتج'].forEach((wd) => H_(at('s09', wd) - 0.15, `stock ${wd}`, 'click', { gain: 0.45 }));
    H_(S.START[9] - 0.4, 'step 4', 'pop', { pitch: 'A5', gain: 0.45 });
    H_(at('s10', 'برقم'), 'search imei', 'type', { len: 1.0, gain: 0.45 });
    H_(at('s10', 'باسمه'), 'search name', 'type', { len: 0.5, gain: 0.45 });
    H_(at('s10', 'بالباركود'), 'search barcode', 'type', { len: 0.8, gain: 0.45 });
    H_(at('s10', 'أمامك') - 0.1, 'matched', 'bell', { pitch: 'A5', gain: 0.55 });
    FIVE.forEach((p, i) => H_(at('s11', p.t) - 0.25 + (p.d || 0), `product ${i + 1}`, 'pop', { pitch: ['D5', 'E5', 'F#5', 'A5', 'B5'][i], gain: 0.4 }));
    ROWS11.forEach((r, i) => H_(cue('s11', r.cue).at(-1) + 0.4, `check ${r.str}`, 'bell', { pitch: ['A5', 'B5', 'D6'][i], gain: 0.55 }));
    H_(cue('s12', 'اطلب تجربتك')[0] - 0.15, 'cta trial', 'pop', { gain: 0.45 });
    H_(cue('s12', 'واشترك')[0] - 0.15, 'cta subscribe', 'bell', { pitch: 'D6', gain: 0.45 });
  },
});
