# حلقات يوتيوب: تشغيل VanCash ERP

سلسلة من 6 حلقات تتبع مراحل «دليل التشغيل» في الصفحة التعريفية (`index.html`):

| # | الحلقة | الحالة |
|---|--------|--------|
| 1 | جهّز محلّك واختر النسخة المناسبة | جاهزة للرفع: `ep01/publish/` (الفيديو، الصورة المصغّرة، الترجمة، العنوان والوصف) |
| 2 | أدخل المخزون | جاهزة للرفع: `ep02/publish/` |
| 3 | رتّب الحسابات | جاهزة للرفع: `ep03/publish/` |
| 4 | نفّذ أول بيع | جاهزة للرفع: `ep04/publish/` |
| 5 | تابع الحركات | جاهزة للرفع: `ep05/publish/` |
| 6 | راجع وراقب | جاهزة للرفع: `ep06/publish/` |

كل حلقة فيلم مرسوم بالكود: كل إطار دالة في الزمن (`window.seek(t)`) يُرسم على canvas ويُصدَّر إطارًا بإطار.
المشاهد مبنية فقط من اللقطات الحقيقية للبرنامج (`shared/shots/`، مأخوذة من الصفحة التعريفية)
ومن نصوص وأشكال بهوية الموقع (الأزرق #2457f5، الكحلي #0c234a، تظليل الليموني #c5f85c).

الحلقة 1 قائمة بذاتها (`ep01/`). الحلقات 2 إلى 6 تتشارك مجلد `shared/`:

```
shared/kit.js        الخطوط والأشكال والأيقونات والشاشات والانتقالات، والمشاهد المشتركة
                     (افتتاح السلسلة، نقطة التحقق، الحلقة القادمة، الشاشة النهائية)
shared/motion.js     محرّك الزمن (نسخة ep01/lib/motion.js)
shared/score.py      الموسيقى نفسها لكل الحلقات + تركيب التعليق على الإيقاع -> vo_timeline.json و vo_words.json
shared/captions.py   الترجمة العربية (.srt) وتوقيت الفصول من توقيت الكلمات
shared/scripts.json  نصوص الحلقات 2 إلى 6
tools/render_fast.mjs  نفس مُخرج المهارة، يقرأ الإطار من canvas مباشرة (أسرع 3 مرات تقريبًا، نفس البكسلات)
```

في `film.js` كل عنصر يظهر مع الكلمة التي تسمّيه: `cue('s04', 'هواتف جديدة')` تبحث عن الكلمات في توقيت Scribe.

## محتوى مجلد الحلقة

```
ep01/docs/script.md       النص المعتمد (مقاطع التعليق الصوتي)
ep01/docs/shotlist.md     خطة اللقطات
ep01/docs/critique.md     جولات المراجعة
ep01/audio/score.py       الموسيقى (lo-fi بـ88 BPM) + تركيب التعليق على شبكة الإيقاع
ep01/vo_timeline.json     أين يبدأ كل مقطع صوتي في الفيلم
ep01/film.js              المشاهد
ep01/publish/             العنوان والوصف والفصول والوسوم، والترجمة العربية (.srt)
```

ملفات الصوت (`audio/*.wav`، `audio/takes/`) والمخرجات (`out/`) لا تُرفع إلى المستودع.

## إعادة البناء

من داخل `youtube/`، مع `SK` = مجلد مهارة motion-reel:

```bash
npm install
MOTION_REEL_SKILL=$SK uv run ep01/audio/score.py          # music.wav, vo.wav, beats.json, vo_timeline.json
node $SK/scripts/render.mjs --film ep01 --contact --every 4 # contact sheets for review
node $SK/scripts/render.mjs --film ep01 --video-only --workers 4
node $SK/scripts/render.mjs --film ep01 --hits && node $SK/scripts/sfx.mjs ep01
node $SK/scripts/mix.mjs ep01 --music-db -6 --sfx-db -4    # -14 LUFS master -> out/ep01/final.mp4
node $SK/scripts/render.mjs --film ep01 --poster
python3 ep01/publish/captions.py                            # ep01/publish/ep01.ar.srt
```

`score.py` يقرأ مقاطع التعليق من `ep01/audio/takes/sNN_a.wav` (صوت «Mehdi VO» من ElevenLabs،
نموذج eleven_v4). النسخ الأصلية mp3 محفوظة في المستودع؛ حوّلها قبل التشغيل:

```bash
for f in ep01/audio/takes/*.mp3; do ffmpeg -v error -y -i "$f" -ar 48000 -ac 1 "${f%.mp3}.wav"; done
```

التوقيت الدقيق لكل كلمة مكتوب في `film.js` (ثوانٍ نسبةً لبداية كل مقطع).

### الحلقات 2 إلى 6

```bash
for f in ep02/audio/takes/*.mp3; do ffmpeg -v error -y -i "$f" -ar 48000 -ac 1 "${f%.mp3}.wav"; done
MOTION_REEL_SKILL=$SK uv run shared/score.py ep02
MOTION_REEL_SKILL=$SK node tools/render_fast.mjs --film ep02 --contact --every 4
MOTION_REEL_SKILL=$SK node tools/render_fast.mjs --film ep02 --video-only --workers 4
MOTION_REEL_SKILL=$SK node tools/render_fast.mjs --film ep02 --hits && node $SK/scripts/sfx.mjs ep02
node $SK/scripts/mix.mjs ep02 --music-db -6 --sfx-db -4
python3 shared/captions.py ep02
```

## حلقة جديدة

انسخ `ep02/index.html` وأنشئ `epNN/audio/plan.json` و`epNN/film.json`، ثم: النص (`shared/scripts.json`) ← توليد الصوت
(مقطع واحد لكل قسم، صوت «Mehdi VO»، eleven_v4) ← توقيت الكلمات (Scribe) في `epNN/audio/takes/sNN_words.json`
← `shared/score.py` ← المشاهد في `epNN/film.js` ← المراجعة بأوراق الإطارات ← الإخراج والمزج ← الترجمة.

# فيديوهات تيك توك (عمودية، دقيقة واحدة)

10 فيديوهات قصيرة بنفس الصوت والهوية، كل واحد فكرة واحدة من «دليل التشغيل»، والترجمة العربية مدمجة في الصورة.
كل فيديو جاهز للنشر في `ttNN/publish/`: الفيديو `vancash-ttNN.mp4` (1080×1920)، الغلاف `cover.jpg`،
ونص المنشور مع الوسوم في `tiktok.md`.

| # | الموضوع | العنوان |
|---|---------|---------|
| 1 | النسخ | Offline أم Online؟ |
| 2 | الهواتف | رقم IMEI لكل هاتف |
| 3 | المخزون | ابدأ بجرد حقيقي |
| 4 | الديون | الكريدي بدون فوضى |
| 5 | البيع | الدفع الجزئي بدون أخطاء |
| 6 | نقطة البيع | بيع هاتف في 4 خطوات |
| 7 | المصاريف | أين ذهب الربح؟ |
| 8 | التقارير | أرقام يومك في دقيقتين |
| 9 | الفريق | صلاحيات العمال |
| 10 | التجربة المجانية | 3 أيام تجربة: الخطة |

```
shorts/scripts.json  نصوص الفيديوهات العشرة (آخر قسم: دعوة للتجربة المجانية عبر واتساب)
shorts/split.py      يقطع التسجيل الكامل لكل فيديو إلى أقسام حسب توقيت الكلمات -> sNN_a.wav و sNN_words.json
shorts/kit9.js       التخطيط العمودي (هوامش آمنة لواجهة تيك توك)، الترجمة المدمجة، مشهد الدعوة الختامي
```

كل فيديو تسجيل واحد كامل (`ttNN/audio/takes/full.mp3` + `full_words.json` من Scribe)، يُقسَّم ثم يُركَّب على
الإيقاع نفسه. `gap` في `ttNN/audio/plan.json` يضبط المدة على 60 ثانية.

```bash
ffmpeg -v error -y -i tt01/audio/takes/full.mp3 -ar 48000 -ac 1 tt01/audio/takes/full.wav
uv run shorts/split.py tt01
MOTION_REEL_SKILL=$SK uv run shared/score.py tt01
MOTION_REEL_SKILL=$SK node tools/render_fast.mjs --film tt01 --format 9x16 --contact --every 4
MOTION_REEL_SKILL=$SK node tools/render_fast.mjs --film tt01 --format 9x16 --video-only --workers 4
MOTION_REEL_SKILL=$SK node tools/render_fast.mjs --film tt01 --format 9x16 --hits && node $SK/scripts/sfx.mjs tt01
node $SK/scripts/mix.mjs tt01 --music-db -6 --sfx-db -4
MOTION_REEL_SKILL=$SK node tools/render_fast.mjs --film tt01 --format 9x16 --poster
```
