// VanCash ERP · الحلقة 6: راجع وراقب. A pure function of time.
// The voice-over drives the cut (shared/score.py -> vo_timeline.json, vo_words.json); every element
// enters on the word that names it, looked up by its spoken text (cue/at in shared/kit.js).
// Screens are the real app screenshots from the landing page (shared/shots/). Counts, names and
// amounts on drawn cards are illustrations, labelled as examples.
import * as K from '../shared/kit.js';

const {
  M, W, E, prog, lerp, clamp, springU, SPRING, wobble, rrect, C, F, UI, R, L0, S, cue, at,
  lineLayout, text, ltr, reveal, marker, headline, card, pop, enter, pill, pillW, pillC, icon, badge, stamp, stepNo,
  arrowLeft, screen, cutout, ring, rings, camera, kicker, chipsRow, bg, hookHeader, textW, tagAt, bez, shadow,
  seriesScene, checkScene, endScene, episode, money, exampleTag, STAGES, logo,
} = K;

// ================================================================ scenes
// 01 · Hook: a full day; can you explain its numbers in two minutes?
const KPI = [['المبيعات', 'chart', 'المبيعات', 182000], ['المقبوض', 'cash', 'والمقبوض', 141500], ['الديون', 'wallet', 'والديون', 40500], ['المصاريف', 'receipt', 'والمصاريف', 6200]];
function hook(ctx, u) {
  bg(ctx, 'paper'); hookHeader(ctx, u);
  const s = 's01';
  reveal(ctx, u, 'يوم عمل كامل في المحل.', R, 300, F(60, 800), C.muted, [-0.3, ...cue(s, 'عمل كامل في المحل')]);
  headline(ctx, u, 'هل تستطيع أن تفسّر أرقامه في دقيقتين؟', R, 430, F(64, 900), C.ink, cue(s, 'هل تستطيع أن تفسّر أرقامه في دقيقتين'), [6, 6, at(s, 'دقيقتين') + 0.2]);
  // a two-minute clock
  const tC = at(s, 'دقيقتين'), kc = springU(u, tC - 0.3, SPRING.bouncy);
  const run = clamp((u - tC) / 14);
  const ccx = 300, ccy = 300, cr = 120;
  pop(ctx, kc, ccx, ccy, () => {
    ctx.beginPath(); ctx.arc(ccx, ccy, cr, 0, Math.PI * 2); ctx.fillStyle = C.white; ctx.fill();
    ctx.strokeStyle = C.line; ctx.lineWidth = 14; ctx.stroke();
    ctx.beginPath(); ctx.arc(ccx, ccy, cr, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - run)); ctx.strokeStyle = C.accent; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.stroke();
    const secs = Math.max(0, Math.round(120 * (1 - run)));
    ltr(ctx, `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`, ccx, ccy + 22, F(60, 900), C.ink, 'center');
  }, { from: 0.5 });
  // the four numbers of the day
  KPI.forEach(([lab, ico, word, n], i) => {
    const xr = R - i * 432, x = xr - 400, y = 560, t = at(s, word);
    const k = springU(u, t - 0.25, SPRING.bouncy);
    pop(ctx, k, x + 200, y + 150, () => {
      card(ctx, x, y, 400, 300, 28, C.white, { stroke: C.line });
      badge(ctx, ico, xr - 70, y + 70, 40, C.wash, C.accent, 1.8);
      text(ctx, lab, xr - 126, y + 84, F(40, 900), C.ink);
      money(ctx, n, xr - 40, y + 210, 60, i === 3 ? C.amber : C.accent, { k: E.outCubic(prog(u, t, t + 0.8)) });
    }, { from: 0.6, rise: 40 });
  });
  const kx = springU(u, at(s, 'المبيعات') - 0.3, SPRING.snappy);
  enter(ctx, kx, () => exampleTag(ctx, L0, 900), { dy: 10 });
}

// 02 · The series: the last episode.
const series = seriesScene({
  sid: 's02', leadText: 'الحلقة السادسة والأخيرة من سلسلة تشغيل', lead: 'الحلقة السادسة والأخيرة من سلسلة تشغيل', brand: 'فان كاش',
  done: 'نجعل نهاية اليوم', doneLine: 'نجعل نهاية اليوم نقطة مراجعة', recap: 'نجعل نهاية اليوم نقطة مراجعة،', today: 'ونجعل',
  goal: 'الوصول إلى المعلومات مناسب لدور كل مستخدم.', goalCue: '[ونجعل الوصول] إلى المعلومات مناسبًا لدور كل مستخدم',
});

// 03 · Reports: pick the report and the period.
const REP = [
  { lab: 'المبيعات', t: 'المبيعات', r: [873, 88, 135, 114] },
  { lab: 'الأرباح والخسائر', t: 'والأرباح', r: [730, 88, 135, 114] },
  { lab: 'الأكثر مبيعًا', t: 'والأكثر', r: [587, 88, 135, 114] },
  { lab: 'تقييم المخزون', t: 'وتقييم', r: [444, 88, 135, 114] },
  { lab: 'ديون العملاء والموردين', t: 'وديون', r: [158, 88, 278, 114] },
  { lab: 'المصاريف', t: 'والمصاريف', r: [15, 88, 135, 114] },
];
function reports(ctx, u) {
  bg(ctx, 'paper');
  const s = 's03';
  kicker(ctx, 'نهاية اليوم', 'chart');
  reveal(ctx, u, 'ابدأ بالتقارير', R, 230, F(90, 900), C.ink, cue(s, 'ابدأ بالتقارير'));
  const img = S.IMG.reports, x = L0, y = 290, cw = R - L0, ch = 690;
  const tP = at(s, 'والفترة');
  const [cx, cy, z] = camera(u, [[S.START[2] - 1, [0.5, 0.2, 1]], [tP - 0.4, [0.5, 0.75, 1]], [at(s, 'المبيعات') - 0.5, [0.5, 0.2, 1]]]);
  const k0 = springU(u, S.START[2] - 0.8, SPRING.gentle);
  enter(ctx, k0, () => {
    const map = screen(ctx, img, x, y, cw, ch, { zoom: z, cx, cy });
    ctx.save(); rrect(ctx, x, y, cw, ch, 18); ctx.clip();
    rings(ctx, u, map, [
      [15, 88, 993, 236, at(s, 'التقرير') - 0.15, tP - 0.2],
      [528, 452, 479, 44, tP - 0.15, at(s, 'المبيعات') - 0.3],
      ...REP.map((p, i) => [...p.r, at(s, p.t) - 0.15, i < REP.length - 1 ? at(s, REP[i + 1].t) - 0.2 : undefined]),
    ]);
    ctx.restore();
  }, { dy: 120 });
  [['التقرير', 'التقرير', 'file'], ['الفترة', 'والفترة', 'calendar'], ...REP.map((p) => [p.lab, p.t, 'chart'])].forEach(([lab, word, ico], i, arr) => {
    const t0 = at(s, word), t1 = i < arr.length - 1 ? at(s, arr[i + 1][1]) : undefined;
    tagAt(ctx, u, 960, 920, lab, t0 - 0.15, { ico, size: 36, h_: 72, off: t1 !== undefined ? t1 - 0.25 : undefined });
  });
}

// 04 · Match the reports against what you recorded; available reports depend on the plan.
const MATCH = [['المبيعات', 'المبيعات'], ['المبالغ المقبوضة', 'والمبالغ'], ['الديون', 'والديون'], ['المصاريف', 'والمصاريف']];
function compare(ctx, u) {
  bg(ctx, 'paper');
  const s = 's04';
  kicker(ctx, 'المطابقة', 'check');
  reveal(ctx, u, 'طابق النتائج', R, 230, F(90, 900), C.ink, [S.START[3] - 0.5, at(s, 'المبيعات') - 0.3]);
  // two columns: the report, and what you recorded
  const colX = [[R, 'التقرير', 'chart', S.START[3] - 0.6], [R - 880, 'العمليات التي سجلتها', 'list', at(s, 'العمليات') - 0.3]];
  colX.forEach(([xr, title, ico, t]) => {
    const k = springU(u, t, SPRING.snappy);
    enter(ctx, k, () => {
      card(ctx, xr - 820, 290, 820, 600, 30, C.white, { stroke: C.line });
      icon(ctx, ico, xr - 60, 360, 44, C.accent, { lw: 2 });
      text(ctx, title, xr - 110, 376, F(40, 900), C.ink);
    }, { dy: 50 });
  });
  MATCH.forEach(([lab, word], i) => {
    const t = at(s, word), y = 430 + i * 108, k = springU(u, t - 0.25, SPRING.snappy);
    enter(ctx, k, () => {
      rrect(ctx, R - 790, y, 760, 88, 16); ctx.fillStyle = '#f6f8fd'; ctx.fill();
      text(ctx, lab, R - 30 - 30, y + 56, F(34, 800), C.ink);
    }, { dx: 40, dy: 0 });
    const k2 = springU(u, at(s, 'العمليات') - 0.1 + i * 0.25, SPRING.snappy);
    enter(ctx, k2, () => {
      rrect(ctx, R - 880 - 790, y, 760, 88, 16); ctx.fillStyle = '#f6f8fd'; ctx.fill();
      text(ctx, lab, R - 880 - 60, y + 56, F(34, 800), C.ink);
      stamp(ctx, springU(u, at(s, 'سجلتها') + 0.2 + i * 0.25, SPRING.bouncy), R - 880 - 740, y + 44, 24);
    }, { dx: -40, dy: 0 });
    const ke = springU(u, at(s, 'سجلتها') + 0.2 + i * 0.25, SPRING.bouncy);
    pop(ctx, ke, R - 850, y + 44, () => text(ctx, '=', R - 850, y + 66, F(56, 900), C.green, 'center'), { from: 0.3 });
  });
  const kn = springU(u, at(s, 'والتقارير') - 0.2, SPRING.bouncy);
  pop(ctx, kn, 960, 960, () => pillC(ctx, 960, 925, 72, 'التقارير المتاحة تختلف حسب الخطة', F(34, 800), { bg: C.ink, fg: C.white, ico: 'shield', icoColor: C.lime }), { rise: 16 });
}

// 05 · Then the stock: a sample of phones, IMEIs and quantities; find the cause of a gap first.
function stock(ctx, u) {
  bg(ctx, 'paper');
  const s = 's05';
  kicker(ctx, 'المخزون', 'box');
  reveal(ctx, u, 'تحقق من المخزون', R, 230, F(90, 900), C.ink, cue(s, 'ثم تحقق من المخزون').slice(1));
  const x = L0 + 20, y = 290, cw = 1708;
  const k0 = springU(u, at(s, 'راجع') - 0.4, SPRING.snappy);
  enter(ctx, k0, () => {
    card(ctx, x, y, cw, 470, 30, C.white, { stroke: C.line });
    exampleTag(ctx, x + 30, y + 30);
    text(ctx, 'عيّنة', R - 50, y + 70, F(36, 900), C.ink);
    text(ctx, 'في البرنامج', 900, y + 70, F(28, 700, UI), C.faint, 'center');
    text(ctx, 'على الرف', 560, y + 70, F(28, 700, UI), C.faint, 'center');
  }, { dy: 50 });
  const ROWS = [
    { lab: 'Galaxy A15 · IMEI …3187', a: '✓', b: '✓', t: 'الهواتف', ok: true },
    { lab: 'Redmi 13C · IMEI …9046', a: '✓', b: '✓', t: 'وأرقام', ok: true },
    { lab: 'شاحن سريع 25W', a: '10', b: '9', t: 'والكميات', ok: false },
  ];
  ROWS.forEach((r, i) => {
    const t = at(s, r.t), ry = y + 110 + i * 112, k = springU(u, t - 0.25, SPRING.snappy);
    enter(ctx, k, () => {
      rrect(ctx, x + 30, ry, cw - 60, 96, 16); ctx.fillStyle = r.ok ? '#f6f8fd' : C.redWash; ctx.fill();
      text(ctx, r.lab, R - 50, ry + 62, F(34, 800), C.ink);
      text(ctx, r.a, 900, ry + 64, F(40, 900), r.ok ? C.green : C.ink, 'center');
      text(ctx, r.b, 560, ry + 64, F(40, 900), r.ok ? C.green : C.red, 'center');
    }, { dy: 20 });
    if (!r.ok) {
      const kd = springU(u, t + 0.6, SPRING.bouncy);
      pop(ctx, kd, 260, ry + 48, () => pillC(ctx, 260, ry + 18, 60, 'فرق: قطعة واحدة', F(28, 800), { bg: C.red, fg: C.white, ico: 'alert' }), { from: 0.5 });
    }
  });
  // find the cause, then correct
  const tF = at(s, 'وابحث'), tC = at(s, 'تصحيحه');
  const S2 = [['ابحث عن السبب', 'search', tF], ['ثم صحّح', 'check', tC]];
  S2.forEach(([lab, ico, t], i) => {
    const k = springU(u, t - 0.25, SPRING.bouncy), xr = R - i * 700;
    pop(ctx, k, xr - 300, 880, () => {
      card(ctx, xr - 600, 800, 600, 160, 28, i ? C.white : C.lime, { stroke: i ? C.line : null });
      icon(ctx, ico, xr - 70, 880, 56, i ? C.green : C.ink, { lw: 2.2 });
      text(ctx, lab, xr - 130, 896, F(46, 900), C.ink);
      text(ctx, String(i + 1), xr - 570, 846, F(30, 900), C.faint);
    }, { from: 0.6, rise: 40 });
  });
  arrowLeft(ctx, R - 612, R - 688, 880, C.faint, E.outCubic(prog(u, tC - 0.5, tC - 0.1)));
}

// 06 · Permissions: decide what each worker may view or edit; then test with the worker's account.
const MODS = [['المبيعات', 'cart'], ['المخزون', 'box'], ['المالية', 'wallet'], ['التقارير', 'chart']];
const PERM = [[1, 1], [1, 0], [0, 0], [0, 0]];
function permissions(ctx, u) {
  bg(ctx, 'paper');
  const s = 's06';
  kicker(ctx, 'الفريق', 'users');
  reveal(ctx, u, 'اضبط صلاحيات العمال', R, 230, F(90, 900), C.ink, cue(s, 'اضبط صلاحيات العمال'));
  const kp = springU(u, at(s, 'الخطط') - 0.2, SPRING.bouncy);
  pop(ctx, kp, 400, 205, () => pill(ctx, L0 + pillW(ctx, 'في الخطط الداعمة', F(28, 700, UI), 56, 'shield'), 178, 56, 'في الخطط الداعمة', F(28, 700, UI), { bg: C.wash, fg: C.accent, ico: 'shield' }), { rise: 12 });
  // the worker's permissions, as toggles
  const x = 900, y = 300, cw = R - x;
  const k0 = springU(u, at(s, 'حدّد') - 0.4, SPRING.snappy);
  enter(ctx, k0, () => {
    card(ctx, x, y, cw, 620, 30, C.white, { stroke: C.line });
    badge(ctx, 'user', R - 70, y + 66, 38, C.wash, C.accent, 2);
    text(ctx, 'العامل: سمير', R - 124, y + 80, F(40, 900), C.ink);
    exampleTag(ctx, x + 30, y + 40);
    text(ctx, 'مشاهدة', x + 330, y + 150, F(28, 700, UI), C.faint, 'center');
    text(ctx, 'تعديل', x + 140, y + 150, F(28, 700, UI), C.faint, 'center');
  }, { dy: 40 });
  const tV = at(s, 'مشاهدته'), tE = at(s, 'تعديله');
  MODS.forEach(([lab, ico], i) => {
    const ry = y + 180 + i * 104;
    enter(ctx, k0, () => {
      rrect(ctx, x + 30, ry, cw - 60, 88, 16); ctx.fillStyle = '#f6f8fd'; ctx.fill();
      badge(ctx, ico, R - 80, ry + 44, 28, C.wash, C.accent, 2);
      text(ctx, lab, R - 126, ry + 56, F(34, 800), C.ink);
    }, { dy: 40 });
    [[330, PERM[i][0], tV], [140, PERM[i][1], tE]].forEach(([dx, on, t], j) => {
      const p = on ? E.inOutCubic(prog(u, t + i * 0.15, t + i * 0.15 + 0.35)) : 0;
      if (k0 < 0.01) return;
      const tx = x + dx;
      rrect(ctx, tx - 40, ry + 24, 80, 40, 20); ctx.fillStyle = M.mix('#d6deec', j ? C.amber : C.green, p); ctx.fill();
      ctx.beginPath(); ctx.arc(tx - 20 + 40 * p, ry + 44, 16, 0, Math.PI * 2); ctx.fillStyle = C.white; ctx.fill();
    });
  });
  // then test with the worker's own account
  const tT = at(s, 'اختبر'), kt = springU(u, tT - 0.3, SPRING.snappy);
  pop(ctx, kt, 470, 600, () => {
    card(ctx, 250, 300, 440, 620, 46, C.ink, { shade: 0.3 });
    rrect(ctx, 266, 316, 408, 588, 36); ctx.fillStyle = '#f3f7ff'; ctx.fill();
    text(ctx, 'حساب العامل', 470, 380, F(30, 900), C.ink, 'center');
    MODS.forEach(([lab, ico], i) => {
      const ry = 420 + i * 112, vis = PERM[i][0];
      rrect(ctx, 290, ry, 360, 92, 16); ctx.fillStyle = vis ? C.white : '#e7ebf3'; ctx.fill();
      icon(ctx, vis ? ico : 'lock', 610, ry + 46, 34, vis ? C.accent : C.faint, { lw: 2 });
      text(ctx, lab, 575, ry + 58, F(30, 800), vis ? C.ink : C.faint);
    });
  }, { from: 0.85, rise: 60 });
  stamp(ctx, springU(u, at(s, 'إعدادها') + 0.3, SPRING.bouncy), 650, 330, 30);
}

// 07 · Saving and sync: Online for 3 devices; open the same data on each, online, and compare.
function sync(ctx, u) {
  bg(ctx, 'paper');
  const s = 's07';
  kicker(ctx, 'الحفظ', 'cloud');
  reveal(ctx, u, 'تحقق من الحفظ والمزامنة', R, 230, F(84, 900), C.ink, cue(s, 'وتحقق من الحفظ والمزامنة'));
  const kb = springU(u, at(s, 'أونلاين') - 0.2, SPRING.bouncy);
  pop(ctx, kb, 400, 205, () => pill(ctx, L0 + pillW(ctx, 'Online · 3 أجهزة', F(28, 800, UI), 56, 'cloud'), 178, 56, '3 أجهزة · Online', F(28, 800, UI), { bg: C.accent, fg: C.white, ico: 'cloud' }), { rise: 12 });
  // the cloud and three devices showing the same number
  const tO = at(s, 'افتح'), tM = at(s, 'تطابقها');
  icon(ctx, 'cloud', 960, 370, 170, C.accent, { lw: 1.3, p: clamp(springU(u, S.START[6] - 0.6, SPRING.gentle)) });
  const DEV = [{ x: 1500, ic: 'monitor', lab: 'حاسوب المحل' }, { x: 960, ic: 'phone', lab: 'هاتفك' }, { x: 420, ic: 'phone', lab: 'هاتف العامل' }];
  DEV.forEach((d, i) => {
    const k = springU(u, tO - 0.3 + i * 0.25, SPRING.bouncy);
    const p = E.outCubic(prog(u, tO + i * 0.25, tO + i * 0.25 + 0.8));
    ctx.save(); ctx.strokeStyle = '#b9cdf6'; ctx.lineWidth = 4; ctx.setLineDash([12, 10]); ctx.globalAlpha = clamp(p * 2);
    ctx.beginPath(); ctx.moveTo(d.x, 560); ctx.lineTo(lerp(d.x, 960, p * 0.8), lerp(560, 450, p)); ctx.stroke(); ctx.restore();
    pop(ctx, k, d.x, 720, () => {
      card(ctx, d.x - 210, 560, 420, 330, 28, C.white, { stroke: C.line });
      icon(ctx, d.ic, d.x, 640, 90, C.ink, { lw: 1.5 });
      text(ctx, d.lab, d.x, 730, F(32, 800), C.ink, 'center');
      text(ctx, 'مبيعات اليوم', d.x, 790, F(24, 600, UI), C.muted, 'center');
      money(ctx, 182000, d.x + 90, 850, 44, C.accent);
    }, { from: 0.6, rise: 40 });
    stamp(ctx, springU(u, tM + i * 0.2, SPRING.bouncy), d.x + 180, 590, 26);
  });
  const kw = springU(u, at(s, 'متصلة') - 0.2, SPRING.bouncy);
  pop(ctx, kw, 960, 470, () => cutout(ctx, S.IMG.dash, [149, 30, 115, 26], 960 - 115 * 1.4, 452, 2.8, { r: 18 }), { from: 0.5 });
  reveal(ctx, u, 'وتأكّد من تطابقها.', R, 980, F(46, 800), C.ink, cue(s, 'وتأكّد من تطابقها'));
}

// 08 · Offline: confirm backup and restore with support before moving or resetting the device.
function backup(ctx, u) {
  bg(ctx, 'navy');
  const s = 's08', wh = 'rgba(255,255,255,.78)';
  icon(ctx, 'wifiOff', R - 22, 108, 44, C.lime, { lw: 2.2 });
  text(ctx, 'نسخة Offline', R - 60, 122, F(34, 700, UI), C.lime);
  headline(ctx, u, 'النسخ الاحتياطي والاسترجاع', R, 280, F(92, 900), C.white, cue(s, 'طريقة النسخ الاحتياطي والاسترجاع').slice(1), [0, 1, at(s, 'الاحتياطي') + 0.2], { box: true });
  // device -> backup -> restore
  const STEP = [['الجهاز', 'monitor', S.START[7] - 0.4], ['نسخة احتياطية', 'backup', at(s, 'النسخ')], ['استرجاع', 'sync', at(s, 'والاسترجاع')]];
  STEP.forEach(([lab, ico, t], i) => {
    const xr = R - i * 600, k = springU(u, t - 0.2, SPRING.bouncy);
    pop(ctx, k, xr - 240, 520, () => {
      card(ctx, xr - 480, 410, 480, 220, 28, 'rgba(255,255,255,.08)', { shadow: false, stroke: 'rgba(255,255,255,.2)' });
      icon(ctx, ico, xr - 240, 490, 76, C.lime, { lw: 1.6 });
      text(ctx, lab, xr - 240, 590, F(40, 900), C.white, 'center');
    }, { from: 0.6, rise: 40 });
    if (i < 2) arrowLeft(ctx, xr - 492, xr - 588, 520, 'rgba(255,255,255,.5)', E.outCubic(prog(u, STEP[i + 1][2] - 0.5, STEP[i + 1][2] - 0.1)));
  });
  const ka = springU(u, at(s, 'أكّد') - 0.3, SPRING.snappy);
  enter(ctx, ka, () => { card(ctx, L0 + 20, 690, 1708, 140, 30, C.wa); icon(ctx, 'chat', R - 70, 760, 56, C.white, { lw: 2 }); }, { dy: 40 });
  reveal(ctx, u, 'أكّد الطريقة مع الدعم · واتساب 0655970064', R - 130, 778, F(42, 900), C.white, cue(s, 'أكّد مع الدعم [طريقة]'));
  const kw = springU(u, at(s, 'قبل') - 0.2, SPRING.bouncy);
  pop(ctx, kw, 960, 935, () => pillC(ctx, 960, 900, 72, 'قبل نقل الجهاز أو تهيئته', F(36, 900), { bg: C.lime, fg: C.ink, ico: 'alert' }), { rise: 16 });
}

// 09 · Once a week: stock, debts, expenses, team permissions; collect questions for support.
const WEEK = [['المخزون', 'box', 'المخزون'], ['الديون', 'wallet', 'والديون'], ['المصاريف', 'receipt', 'والمصاريف'], ['صلاحيات الفريق', 'users', 'وصلاحيات']];
const DAYS = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
function weekly(ctx, u) {
  bg(ctx, 'paper');
  const s = 's09';
  kicker(ctx, 'كل أسبوع', 'calendar');
  reveal(ctx, u, 'مراجعة أسبوعية', R, 230, F(90, 900), C.ink, [S.START[8] - 0.5, at(s, 'أسبوع') - 0.15]);
  // a week strip; one day lights up
  DAYS.forEach((d, i) => {
    const xr = R - i * 250, k = springU(u, S.START[8] - 0.8 + i * 0.08, SPRING.snappy);
    const on = i === 4 ? springU(u, at(s, 'أسبوع'), SPRING.bouncy) : 0;
    enter(ctx, k, () => {
      rrect(ctx, xr - 230, 290, 230, 90, 18); ctx.fillStyle = on > 0.05 ? M.mix('#ffffff', C.accent, clamp(on)) : C.white; ctx.fill();
      ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.stroke();
      text(ctx, d, xr - 115, 346, F(30, 800), on > 0.5 ? C.white : C.muted, 'center');
    }, { dy: 20 });
  });
  WEEK.forEach(([lab, ico, word], i) => {
    const t = at(s, word), xr = R - (i % 2) * 452, y = 430 + ((i / 2) | 0) * 140, k = springU(u, t - 0.25, SPRING.snappy);
    enter(ctx, k, () => {
      card(ctx, xr - 430, y, 430, 116, 22, C.white, { stroke: C.line, shade: 0.12 });
      badge(ctx, ico, xr - 64, y + 58, 34, C.wash, C.accent, 2);
      text(ctx, lab, xr - 112, y + 70, F(32, 900), C.ink);
    }, { dx: 40, dy: 0 });
    stamp(ctx, springU(u, t + 0.4, SPRING.bouncy), xr - 398, y + 58, 20);
  });
  // the notebook of questions
  const tQ = at(s, 'واجمع'), kq = springU(u, tQ - 0.3, SPRING.snappy);
  enter(ctx, kq, () => {
    card(ctx, L0 + 20, 430, 800, 520, 30, '#fffbe8', { stroke: '#f1e3a8' });
    icon(ctx, 'file', L0 + 760, 490, 44, C.amber, { lw: 2 });
    text(ctx, 'اختلافات وأسئلة', L0 + 720, 504, F(38, 900), C.ink);
    ['فرق في عدد الشواحن؟', 'كيف أعالج مرتجعًا؟', 'صلاحية عامل جديد'].forEach((q, i) => {
      const kk = springU(u, at(s, 'اختلافات') + i * 0.35, SPRING.snappy);
      ctx.save(); ctx.globalAlpha *= clamp(kk * 1.5);
      text(ctx, `• ${q}`, L0 + 760, 600 + i * 76, F(32, 700, UI), C.ink);
      ctx.restore();
    });
  }, { dx: -120, dy: 0 });
  const ks = springU(u, at(s, 'الدعم') - 0.2, SPRING.bouncy);
  pop(ctx, ks, 470, 900, () => pillC(ctx, 470, 868, 64, 'لمناقشتها مع الدعم', F(32, 800), { bg: C.wa, fg: C.white, ico: 'chat' }), { rise: 16 });
}

// 10 · The three-day trial plan.
const PLAN = [
  { d: 'اليوم الأول', w: 'الأول', items: ['التجهيز', 'دقة البيانات'], ico: 'box' },
  { d: 'اليوم الثاني', w: 'والثاني', items: ['البيع', 'الفاتورة', 'الدين'], ico: 'cart' },
  { d: 'اليوم الثالث', w: 'والثالث', items: ['المتابعة', 'اختيار الخطة'], ico: 'chart' },
];
function trial(ctx, u) {
  bg(ctx, 'paper');
  const s = 's10';
  kicker(ctx, 'إذا كنت في فترة التجربة', 'gift');
  reveal(ctx, u, 'خطة الأيام الثلاثة', R, 230, F(90, 900), C.ink, cue(s, 'فخطة الأيام الثلاثة'));
  PLAN.forEach((p, i) => {
    const xr = R - i * 588, x = xr - 552, y = 300, t = at(s, p.w);
    const k = springU(u, t - 0.3, SPRING.bouncy);
    pop(ctx, k, x + 276, y + 320, () => {
      card(ctx, x, y, 552, 640, 32, i === 2 ? C.accent : C.white, { stroke: i === 2 ? null : C.line });
      const fg = i === 2 ? C.white : C.ink;
      text(ctx, String(i + 1), xr - 60, y + 130, F(120, 900), i === 2 ? C.lime : C.accent);
      text(ctx, p.d, xr - 160, y + 100, F(44, 900), fg);
      icon(ctx, p.ico, x + 80, y + 90, 64, i === 2 ? C.lime : C.accent, { lw: 1.8 });
    }, { from: 0.7, rise: 50 });
    p.items.forEach((it, j) => {
      const kk = springU(u, t + 0.3 + j * 0.45, SPRING.snappy);
      enter(ctx, kk, () => {
        rrect(ctx, x + 30, y + 220 + j * 120, 492, 96, 18); ctx.fillStyle = i === 2 ? 'rgba(255,255,255,.14)' : '#f6f8fd'; ctx.fill();
        icon(ctx, 'check', xr - 70, y + 268 + j * 120, 36, i === 2 ? C.lime : C.green, { lw: 3 });
        text(ctx, it, xr - 116, y + 282 + j * 120, F(38, 800), i === 2 ? C.white : C.ink);
      }, { dx: 30, dy: 0 });
    });
  });
}

// 11 · Success: you can explain the day; each worker sees what fits the role; you know where your data lives.
const ROWS11 = [
  { str: 'يمكنك تفسير نتائج اليوم', cue: 'يمكنك تفسير نتائج اليوم' },
  { str: 'والعامل يرى ما يناسب دوره', cue: 'والعامل يرى ما يناسب دوره' },
  { str: 'ومكان حفظ بياناتك معروف', cue: 'ومكان حفظ بياناتك معروف' },
];
const check = checkScene({ sid: 's11', head: 'علامة النجاح', headCue: 'علامة النجاح', headSize: 100, rowsY: 340, rowGap: 170, rows: ROWS11 });

// 12 · The series is complete: try it for three days; apply the six stages step by step.
function finale(ctx, u) {
  bg(ctx, 'blue');
  const s = 's12', wh = 'rgba(255,255,255,.84)';
  text(ctx, 'نهاية السلسلة', R, 150, F(34, 700, UI), wh);
  reveal(ctx, u, 'اكتملت سلسلة التشغيل', R, 285, F(104, 900), C.white, [S.START[11] - 0.5, at(s, 'سلسلة') - 0.15, at(s, 'تشغيل') - 0.15], { colors: { 0: C.lime } });
  // the six stages, all done
  const cw = 268, gap = 24, cy0 = 360, chh = 110;
  STAGES.forEach((lab, i) => {
    const k = springU(u, at(s, 'تكتمل') + i * 0.18, SPRING.bouncy);
    const xr = R - i * (cw + gap);
    pop(ctx, k, xr - cw / 2, cy0 + chh / 2, () => {
      rrect(ctx, xr - cw, cy0, cw, chh, 20); ctx.fillStyle = '#0a8a5c'; ctx.fill();
      text(ctx, `0${i + 1}`, xr - 24, cy0 + 46, F(32, 900), C.lime);
      text(ctx, lab, xr - 24, cy0 + 90, F(30, 700, UI), C.white);
      icon(ctx, 'check', xr - cw + 40, cy0 + 40, 32, C.lime, { lw: 3.2 });
    }, { from: 0.5, rise: 30 });
  });
  reveal(ctx, u, 'طبّق المراحل الست خطوة بخطوة في محلّك', R, 570, F(48, 800), C.white, cue(s, 'وطبّق المراحل الست خطوة بخطوة في محلّك'), { colors: { 1: C.lime, 2: C.lime } });
  // ask 1: the 3-day trial on WhatsApp
  const ka = springU(u, at(s, 'اطلب') - 0.15, SPRING.bouncy);
  pop(ctx, ka, 1420, 730, () => {
    shadow(ctx, 1040, 650, 784, 160, 34, 0.35);
    rrect(ctx, 1040, 650, 784, 160, 34); ctx.fillStyle = C.wa; ctx.fill();
    icon(ctx, 'chat', R - 70, 730, 64, C.white, { lw: 2 });
    text(ctx, 'اطلب تجربتك المجانية · 3 أيام', R - 130, 720, F(46, 900), C.white);
    text(ctx, 'واتساب · 0655970064', R - 130, 775, F(34, 700, UI), 'rgba(255,255,255,.88)');
  }, { from: 0.6 });
  // ask 2: subscribe (after the last word)
  const tS = at(s, 'محلّك') + 0.6, kb = springU(u, tS, SPRING.bouncy);
  pop(ctx, kb, 1500, 905, () => {
    shadow(ctx, 1240, 850, 584, 110, 55, 0.3);
    rrect(ctx, 1240, 850, 584, 110, 55); ctx.fillStyle = C.white; ctx.fill();
    ctx.save(); ctx.translate(R - 62, 905); ctx.rotate(0.35 * wobble(u - tS - 0.6, 2.4, 4)); ctx.translate(-(R - 62), -905);
    icon(ctx, 'bell', R - 62, 905, 56, C.accent, { lw: 2.2 }); ctx.restore();
    text(ctx, 'اشترك في القناة', R - 118, 923, F(48, 900), C.ink);
  }, { from: 0.6 });
  // the series' screens, as a stack
  const kp = springU(u, S.START[11] - 0.4, SPRING.snappy);
  pop(ctx, kp, 500, 780, () => {
    ['pos', 'debts', 'dash'].forEach((k, i) => {
      ctx.save(); ctx.translate(500, 800); ctx.rotate(-0.06 + i * 0.05); ctx.translate(-500, -800);
      const img = S.IMG[k], ww = 620, hh = Math.min(380, Math.round(ww * img.height / img.width));
      screen(ctx, img, 190 + i * 30, 640 - i * 30, ww, hh, { shade: 0.35, cy: 0 });
      ctx.restore();
    });
  }, { from: 0.8, rise: 80 });
}
const endCard = endScene({ shot: 'dash', panelTitle: 'شاهد السلسلة من البداية', panelSub: 'الحلقة 1 · جهّز محلّك واختر النسخة المناسبة' });

episode({
  n: 6,
  scenes: [hook, series, reports, compare, stock, permissions, sync, backup, weekly, trial, check, finale, endCard],
  hits(H_) {
    H_(at('s01', 'دقيقتين') - 0.3, 'clock', 'bell', { pitch: 'A5', gain: 0.45 });
    KPI.forEach(([, , wd], i) => H_(at('s01', wd) - 0.25, `kpi ${wd}`, 'pop', { pitch: ['D5', 'F#5', 'A5', 'B5'][i], gain: 0.42 }));
    H_(cue('s02', 'فان كاش')[0], 'logo', 'bell', { pitch: 'D6', gain: 0.5 });
    H_(cue('s02', 'نجعل نهاية اليوم')[0], 'stages done', 'tick', { gain: 0.55 });
    H_(at('s02', 'ونجعل'), 'episode 6 chip', 'bell', { pitch: 'A5', gain: 0.5 });
    ['التقرير', 'والفترة', ...REP.map((p) => p.t)].forEach((wd) => H_(at('s03', wd) - 0.15, `report ${wd}`, 'click', { gain: 0.4 }));
    MATCH.forEach(([, wd], i) => H_(at('s04', 'سجلتها') + 0.2 + i * 0.25, `match ${wd}`, 'tick', { gain: 0.45 }));
    H_(at('s04', 'والتقارير') - 0.2, 'plan note', 'pop', { pitch: 'A5', gain: 0.4 });
    ['الهواتف', 'وأرقام', 'والكميات'].forEach((wd) => H_(at('s05', wd) - 0.25, `stock ${wd}`, 'pop', { pitch: 'D5', gain: 0.4 }));
    H_(at('s05', 'والكميات') + 0.6, 'gap', 'blip', { pitch: 'C5', gain: 0.5 });
    H_(at('s05', 'تصحيحه') - 0.25, 'correct', 'bell', { pitch: 'A5', gain: 0.45 });
    H_(at('s06', 'مشاهدته'), 'view on', 'click', { gain: 0.45 });
    H_(at('s06', 'تعديله'), 'edit on', 'click', { gain: 0.45 });
    H_(at('s06', 'إعدادها') + 0.3, 'tested', 'bell', { pitch: 'A5', gain: 0.5 });
    [0, 1, 2].forEach((i) => H_(at('s07', 'افتح') - 0.3 + i * 0.25, `device ${i + 1}`, 'pop', { pitch: ['D5', 'F#5', 'A5'][i], gain: 0.42 }));
    [0, 1, 2].forEach((i) => H_(at('s07', 'تطابقها') + i * 0.2, `same ${i + 1}`, 'tick', { gain: 0.45 }));
    H_(at('s08', 'النسخ') - 0.2, 'backup', 'pop', { pitch: 'D5', gain: 0.42 });
    H_(at('s08', 'والاسترجاع') - 0.2, 'restore', 'pop', { pitch: 'A5', gain: 0.42 });
    H_(at('s08', 'قبل') - 0.2, 'warning', 'blip', { pitch: 'E5', gain: 0.45 });
    H_(at('s09', 'أسبوع'), 'week day', 'bell', { pitch: 'D6', gain: 0.42 });
    WEEK.forEach(([, , wd]) => H_(at('s09', wd) + 0.4, `weekly ${wd}`, 'tick', { gain: 0.45 }));
    PLAN.forEach((p, i) => H_(at('s10', p.w) - 0.3, `day ${i + 1}`, 'pop', { pitch: ['D5', 'F#5', 'A5'][i], gain: 0.45 }));
    ROWS11.forEach((r, i) => H_(cue('s11', r.cue).at(-1) + 0.4, `check ${i + 1}`, 'bell', { pitch: ['A5', 'B5', 'D6'][i], gain: 0.55 }));
    STAGES.forEach((_, i) => H_(at('s12', 'تكتمل') + i * 0.18, `stage ${i + 1} done`, 'pop', { pitch: ['D5', 'E5', 'F#5', 'A5', 'B5', 'D6'][i], gain: 0.4 }));
    H_(at('s12', 'اطلب') - 0.15, 'cta trial', 'pop', { gain: 0.45 });
    H_(at('s12', 'محلّك') + 0.6, 'cta subscribe', 'bell', { pitch: 'D6', gain: 0.45 });
  },
});
