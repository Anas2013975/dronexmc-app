# دليل الإعداد والنشر (خطوة بخطوة)

> ملاحظة صريحة: الكود لم يُبنَ ولم يُختبر في بيئة الكتابة (لا إنترنت هناك). نفّذ الخطوة 2 أولًا وأصلح أي خطأ قبل النشر.

## 1) Node.js
ثبّت Node.js بإصدار 20 أو أحدث من nodejs.org ثم تحقق: `node -v`.

## 2) تثبيت الحزم وفحص المشروع
```
cd dronexmc-app
npm install
npm run typecheck
npm test
npm run build
```
أي خطأ يظهر أرسله كما هو للمصلح.

## 3) مشروع Supabase
أنشئ مشروعًا جديدًا على supabase.com. من Project Settings → API انسخ: `Project URL` و`service_role key` (سري: للخادم فقط، لا تضعه في المتصفح أو Git).

## 4) تنفيذ ملفات SQL
في SQL Editor نفّذ بالترتيب: `supabase/schema.sql` ثم `supabase/seed.sql`. (النماذج الثلاثة تُنشأ مفتوحة.)
إن كنت نفّذت نسخة قديمة من schema، نفّذ بدلًا من إعادة الإنشاء:
```
alter table webhook_deliveries add column if not exists sent_parts int not null default 0;
alter table forms add column if not exists draft_questions jsonb;
```
سياسة RLS: كل الجداول مقفلة أمام anon/authenticated، والموقع يصل لها فقط عبر مفتاح الخادم.

## 5) تطبيق Discord
في discord.com/developers/applications أنشئ تطبيقًا. من OAuth2 انسخ Client ID وClient Secret.

## 6) Redirect URI
أضف في OAuth2 → Redirects بالضبط: `https://dronex-eight.vercel.app/callback` (مسار واحد فقط، ولا تستخدم `/api/...`). يجب أن يطابق `DISCORD_REDIRECT_URI` حرفيًا. للتجربة المحلية أضف أيضًا `http://localhost:3000/callback`.

## 7) متغيرات البيئة
انسخ `.env.example` إلى `.env.local` للتشغيل المحلي، وأدخلها في Vercel للإنتاج:
| المتغير | الوصف |
|---|---|
| DISCORD_CLIENT_ID / DISCORD_CLIENT_SECRET | من الخطوة 5 |
| DISCORD_REDIRECT_URI | رابط الخطوة 6 |
| SESSION_SECRET | نص عشوائي طويل: `openssl rand -base64 32` |
| SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY | من الخطوة 3 |
| ADMIN_SETUP_TOKEN | رمز عشوائي لأول دخول للإدارة في الإنتاج |
| CRON_SECRET | رمز عشوائي لحماية مسار الـ Cron |

## 8) رابط الموقع بعد النشر
بعد أول نشر ستحصل على رابط Vercel. إن اختلف عن `dronex-eight.vercel.app` فحدّث `DISCORD_REDIRECT_URI` وRedirect في Discord ثم أعد النشر. ثم من `/admin/settings` ضع رابط السيرفر والمتجر والموقع.

## 9) النشر على Vercel
ارفع المشروع إلى GitHub (لا ترفع `.env`) ثم Import في Vercel، أضف المتغيرات، ثم Deploy. الـ Cron في `vercel.json` يعمل يوميًا (حد الخطة المجانية).

## 10) كلمة مرور الإدارة الأولى
افتح الموقع واضغط `DronexMC` في الفوتر (أو `/admin/login`). سجّل بـ `admin` / `admin` ومعها `ADMIN_SETUP_TOKEN` (في خانة رمز الإعداد). سيُجبرك على صفحة تغيير الاسم وكلمة المرور (10 أحرف فأكثر) ولا تعمل اللوحة قبلها. بعد التغيير لا يعود `admin/admin` صالحًا.

## 11) Webhooks
في Discord: Channel → Edit → Integrations → Webhooks → New → Copy URL. في `/admin/webhooks` ضع الـ slug (مثل `general-administration`) والرابط واحفظ، ثم اضغط "اختبار". لكل نموذج رابط مستقل.

## 12) اختبار شامل
سجّل الدخول بـ Discord ← افتح نموذجًا ← راجع وأرسل ← تأكد من ظهور الرقم ووصول رسالة Discord ← حاول التقديم ثانية (يجب أن يُرفض) ← من الإدارة غيّر الحالة وتأكد من رسائل المتقدم ← احذف الطلب وتأكد أنه يستطيع التقديم مجددًا ← أنشئ نموذجًا جديدًا وانشره وتأكد أنه يظهر في الرئيسية ← أغلقه وتأكد أن الإرسال يُرفض.
