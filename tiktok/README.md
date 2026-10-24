# VanCash ERP — 3 فيديوهات TikTok (9:16، 60 ثانية)

موشن غرافيك مبرمج بالكامل (كل إطار دالة للوقت)، تعليق صوتي بالدارجة الجزائرية مع كلمات فرنسية،
ترجمة عربية كلمة بكلمة، وموسيقى ومؤثرات صوتية مولّدة بالكود.

| الفيديو | الفكرة | الجمهور |
|---|---|---|
| `v1-imei` | «كل تيليفون بالـ IMEI تاعو»: الشراء، occasion، échange، البحث بالـ IMEI والباركود، البيع والفاتورة | أصحاب محلات الهواتف |
| `v2-credit` | «Le crédit»: بطاقة الزبون، سقف الدين، الباقي على الزبون، دفتر الديون 30/60/90، كشف الديون | كل التجار |
| `v3-patron` | «المحل في جيبك»: لوحة التحكم، المالية، 3 أجهزة متزامنة، صلاحيات العمال، التقارير، Offline | كل التجار وأصحاب الفرق |

## العناوين والوصف

### الفيديو 1 — IMEI

العنوان: زبون رجّعلك تيليفون؟ 📱 كل IMEI مسجّل
بدائل: «كل تيليفون عندو la carte d'identité تاعو» · «Neuf ولا occasion… الـ IMEI ما يضيعش»

```
زبون رجّعلك تيليفون وقالك «ماشي هذا اللي بعتهولي»؟ 😅
مع VanCash ERP كل تيليفون يتسجّل بالـ IMEI 1 و IMEI 2، الماركة، الموديل، le stockage، سعر الشرا والبيع.
✅ Neuf، occasion و échange
✅ l'historique تاع كل IMEI
✅ تحوّس بالـ IMEI ولا بالـ code-barre
✅ تبيع cash ولا crédit مع la facture
🎁 جرّب مجانًا 3 أيام
📲 WhatsApp: 0655 97 00 64
#محلات_الهواتف #IMEI #الجزائر #dz #algerie #تيليفونات #VanCash #ERP #pourtoi
```

### الفيديو 2 — Le crédit

العنوان: شحال ضايعلك في كارني الكريدي؟ 📒
بدائل: «Bye bye الكارني 👋 الكريدي يتحسب وحدو» · «الزبون يقولك خلّصتك… وانت ما تتفكّرش؟»

```
الزبون يقولك «خلّصتك» وانت ما تتفكّرش؟ 🤔
VanCash ERP يحفظلك الكريدي بلا ما تحفظ:
✅ Fiche client مع le plafond تاع الكريدي
✅ بعت بـ 75,000 وقبضت 50,000؟ يحسبلك الباقي 25,000 automatique
✅ ديون الزبائن و les fournisseurs: 30، 60، 90 يوم
✅ تطبع le relevé للزبون
🎁 جرّب مجانًا 3 أيام
📲 WhatsApp: 0655 97 00 64
#كريدي #ديون #تجار_الجزائر #الجزائر #dz #commerce #VanCash #ERP #pourtoi
```

### الفيديو 3 — المحل في جيبك

العنوان: راك في الدار والخدّام في المحل؟ 👀
بدائل: «المحل في جيبك 📱» · «la caisse ما تعطيش في الليل؟»

```
تحسب la caisse في الليل وما تعطيش؟ 😩
مع VanCash ERP المحل في جيبك:
✅ Dashboard: les ventes، la caisse والـ tendance
✅ Finance: le solde، المداخيل، les dépenses والربح
✅ PC المحل + تيليفونك + تيليفون الخدّام (Online 3 أجهزة)
✅ انت تقرّر واش يشوف الخدّام وواش يبدّل
✅ Offline بلا internet 100%
🎁 جرّب مجانًا 3 أيام
📲 WhatsApp: 0655 97 00 64
#تجارة #مشروع #الجزائر #dz #gestion #caisse #VanCash #ERP #pourtoi
```

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
