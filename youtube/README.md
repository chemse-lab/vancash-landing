# حلقات يوتيوب: تشغيل VanCash ERP

سلسلة من 6 حلقات تتبع مراحل «دليل التشغيل» في الصفحة التعريفية (`index.html`):

| # | الحلقة | الحالة |
|---|--------|--------|
| 1 | جهّز محلّك واختر النسخة المناسبة | جاهزة للرفع: `ep01/publish/` (الفيديو، الصورة المصغّرة، الترجمة، العنوان والوصف) |
| 2 | أدخل المخزون | لم تبدأ |
| 3 | رتّب الحسابات | لم تبدأ |
| 4 | نفّذ أول بيع | لم تبدأ |
| 5 | تابع الحركات | لم تبدأ |
| 6 | راجع وراقب | لم تبدأ |

كل حلقة فيلم مرسوم بالكود: كل إطار دالة في الزمن (`window.seek(t)`) يُرسم على canvas ويُصدَّر إطارًا بإطار.
المشاهد مبنية فقط من اللقطات الحقيقية للبرنامج (`ep01/assets/shots/`، مأخوذة من الصفحة التعريفية)
ومن نصوص وأشكال بهوية الموقع (الأزرق #2457f5، الكحلي #0c234a، تظليل الليموني #c5f85c).

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

## الحلقة التالية

انسخ بنية `ep01/` إلى `ep02/` (المرحلة 02 في الدليل: الجرد، تقسيم المنتجات، IMEI، الأسعار والكميات،
مراجعة عيّنة)، ثم: النص ← موافقة ← توليد الصوت ← `score.py` ← المشاهد ← المراجعة ← الإخراج.
