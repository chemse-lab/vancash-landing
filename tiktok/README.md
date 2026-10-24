# VanCash ERP — 3 فيديوهات TikTok (9:16، 60 ثانية)

موشن غرافيك مبرمج بالكامل (كل إطار دالة للوقت)، تعليق صوتي بالدارجة الجزائرية مع كلمات فرنسية،
ترجمة عربية كلمة بكلمة، وموسيقى ومؤثرات صوتية مولّدة بالكود.

| الفيديو | الفكرة | الجمهور |
|---|---|---|
| `v1-imei` | «كل تيليفون بالـ IMEI تاعو»: الشراء، occasion، échange، البحث بالـ IMEI والباركود، البيع والفاتورة | أصحاب محلات الهواتف |
| `v2-credit` | «Le crédit»: بطاقة الزبون، سقف الدين، الباقي على الزبون، دفتر الديون 30/60/90، كشف الديون | كل التجار |
| `v3-patron` | «المحل في جيبك»: لوحة التحكم، المالية، 3 أجهزة متزامنة، صلاحيات العمال، التقارير، Offline | كل التجار وأصحاب الفرق |

## نص المنشور (Caption)

**الفيديو 1**
> زبون رجّعلك تيليفون وقالك ماشي هذا؟ 😅 مع VanCash ERP كل تيليفون بالـ IMEI تاعو، neuf ولا occasion.
> جرّب مجانًا 3 أيام — WhatsApp: 0655 97 00 64
> #محلات_الهواتف #الجزائر #dz #IMEI #تجارة #VanCash #ERP #caisse #gestion_de_stock

**الفيديو 2**
> شحال من دورو ضايعلك في كارني الكريدي؟ 📒 VanCash ERP يحسبلك الكريدي، الباقي، وديون les fournisseurs.
> جرّب مجانًا 3 أيام — WhatsApp: 0655 97 00 64
> #كريدي #ديون #تجار_الجزائر #dz #محلات #VanCash #ERP #gestion #commerce

**الفيديو 3**
> راك في الدار والخدّام في المحل؟ 📱 VanCash ERP: المحل في جيبك — dashboard، finance، 3 أجهزة وOffline.
> جرّب مجانًا 3 أيام — WhatsApp: 0655 97 00 64
> #تجارة #الجزائر #dz #مشروع #VanCash #ERP #dashboard #gestion #caisse

## البنية

```
shared/engine.js     أدوات الموشن غرافيك المشتركة (ترجمة RTL، بطاقات الواجهة، العدسة، الشعار، شاشة الدعوة)
shared/motion.js     محرّك الزمن (motion-reel)
shared/place_vo.py   يقطع التعليق الصوتي ويضع كل جملة على الإيقاع -> audio/vo.wav + vo_words.json
shared/shots/        لقطات حقيقية من VanCash ERP (مأخوذة من صفحة الهبوط)
shared/vo/           التعليق الصوتي (ElevenLabs، صوت Amin – Algerian Darija) + توقيت الكلمات
v1-imei/ v2-credit/ v3-patron/   كل فيلم: film.js + beats.json + audio/
exports/             الفيديوهات النهائية MP4
```

## إعادة التصيير

```sh
S=<motion-reel skill>
uv run $S/scripts/beats.py <film> --synth ...        # الموسيقى + شبكة الإيقاع
uv run shared/place_vo.py <film>                    # التعليق الصوتي على الإيقاع
node $S/scripts/render.mjs --film <film> --format 9x16 --hits && node $S/scripts/sfx.mjs <film>
node $S/scripts/render.mjs --film <film> --format 9x16 --video-only --fps 30
node $S/scripts/mix.mjs <film>                      # -14 LUFS + دمج الصوت -> out/<film>/final.mp4
```

## ملاحظة على اللقطات

اللقطات الحالية من نسخة سطح المكتب (أفقية) ومن حساب فارغ. اللقطات العمودية من وضع الهاتف
مع بيانات تجريبية تُضاف عند فتح الوصول إلى mobileposdz.com وتوفير حساب تجريبي.
