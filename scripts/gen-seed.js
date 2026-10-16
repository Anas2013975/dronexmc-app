// Generates supabase/seed.sql with the 3 default bilingual forms. Run: node scripts/gen-seed.js
const fs = require("fs");
const S = "s", L = "l", N = "n", R = "r";
const name = ["ما اسمك الحقيقي؟", "What is your real name?"], age = ["كم عمرك؟", "How old are you?"],
  country = ["من أي دولة أنت؟", "Which country are you from?"], mc = ["ما اسم حسابك في ماينكرافت؟", "What is your Minecraft username?"];
const about = ["عرّفنا بنفسك، وتحدث عن شخصيتك واهتماماتك.", "Introduce yourself and tell us about your personality and interests."];
const forms = [
 { slug: "general-administration", prefix: "ADM", ar: "الإدارة العامة", en: "General Administration", dar: "انضم إلى فريق الإدارة العامة", den: "Join the general administration team", icon: "shield", color: "#00d4ff", sort: 1,
  qs: [[S,...name],[N,...age],[S,...country],[S,...mc],
  [R,"هل حسابك في ماينكرافت أصلي أم غير أصلي؟","Is your Minecraft account premium or non-premium?",[["premium","أصلي","Premium"],["non_premium","غير أصلي","Non-premium"]]],
  [L,...about],
  [L,"لماذا تريد الانضمام إلى فريق DronexMC Network؟","Why do you want to join the DronexMC Network team?"],
  [L,"ما الذي يجعلك مناسبًا للانضمام إلى الفريق؟","What makes you a good fit for the team?"],
  [L,"ما المهارات التي تمتلكها وتعتقد أنها ستميزك عن بقية المتقدمين؟","What skills do you have that you believe set you apart from other applicants?"],
  [S,"كم ساعة تستطيع تخصيصها يوميًا للتواجد في السيرفر ومتابعة مسؤولياتك؟","How many hours per day can you dedicate to being on the server and handling your duties?"],
  [L,"كيف تتعامل مع الآخرين عند حدوث خلاف أو سوء تفاهم؟","How do you deal with others when a conflict or misunderstanding occurs?"],
  [L,"ما رأيك في تطبيق القوانين على جميع الأعضاء دون استثناء؟ ولماذا؟","What do you think about enforcing the rules on all members without exception? Why?"],
  [L,"موقف عملي: طلب منك صديقك تجاهل مخالفة ارتكبها داخل السيرفر، رغم أنه يستحق العقوبة. كيف ستتصرف؟","Scenario: your friend asks you to ignore a violation he committed on the server, though he deserves a penalty. What will you do?"],
  [L,"موقف عملي: بدأ لاعبان في تبادل الإهانات داخل المحادثة، وأصبح الخلاف يؤثر على بقية الأعضاء. كيف ستتعامل مع الموقف؟","Scenario: two players start trading insults in chat and the dispute is affecting other members. How will you handle it?"],
  [L,"موقف عملي: اشتبهت في أن لاعبًا يستخدم الغش داخل ماينكرافت، لكنك لا تملك دليلًا واضحًا. ما الخطوات التي ستتخذها للتأكد من الأمر؟","Scenario: you suspect a player is cheating in Minecraft but have no clear proof. What steps will you take to verify?"],
  [L,"موقف عملي: لاحظت أن أحد أعضاء الفريق يتعامل بطريقة غير مناسبة مع اللاعبين. كيف ستتصرف في هذه الحالة؟","Scenario: you notice a team member treating players inappropriately. How will you act?"],
  [L,"موقف عملي: واجهت مشكلة لا تعرف كيفية حلها، ولم يكن أي مسؤول متاحًا في تلك اللحظة. ماذا ستفعل؟","Scenario: you face a problem you don't know how to solve and no staff member is available. What will you do?"],
  [L,"إذا انشغلت بالدراسة أو بظروفك الشخصية لفترة، كيف ستتعامل مع مسؤولياتك والتزاماتك تجاه الفريق؟","If you become busy with studies or personal circumstances for a while, how will you handle your responsibilities to the team?"],
  [L,"إذا لاحظت وجود مشكلة متكررة داخل السيرفر تؤثر على تجربة اللاعبين، ماذا ستفعل للمساعدة في حلها؟","If you notice a recurring server problem affecting players' experience, what will you do to help solve it?"],
  [L,"ما الذي تتمنى تحقيقه داخل DronexMC Network، وما الإضافة التي تستطيع تقديمها للمجتمع؟","What do you hope to achieve within DronexMC Network, and what can you add to the community?"]] },
 { slug: "media-editing", prefix: "MED", ar: "الميديا والإيديتور", en: "Media & Editing", dar: "انضم إلى فريق الميديا", den: "Join the media team", icon: "video", color: "#a855f7", sort: 2,
  qs: [[S,...name],[N,...age],[S,...country],[S,...mc],
  [R,"ما التخصص الذي تريد الانضمام إليه؟","Which specialty do you want to join?",[["video","إيديتور فيديوهات","Video editor"],["design","مصمم صور وثمبنيلات","Image & thumbnail designer"],["creator","صانع محتوى وتصوير داخل ماينكرافت","Content creator & in-game filming"],["publisher","مسؤول نشر وميديا للسيرفر","Server publishing & media manager"],["multi","أكثر من تخصص","More than one specialty"]]],
  [L,...about],
  [L,"لماذا تريد الانضمام إلى فريق الميديا في DronexMC Network؟","Why do you want to join the DronexMC Network media team?"],
  [L,"ما الذي يميزك عن بقية المتقدمين، وما الإضافة التي تستطيع تقديمها للفريق؟","What sets you apart from other applicants, and what can you add to the team?"],
  [L,"ما البرامج أو الأدوات التي تستخدمها في تخصصك؟ وإذا كنت مبتدئًا، فما الأدوات التي ترغب في تعلمها؟","Which software or tools do you use in your specialty? If you're a beginner, which tools do you want to learn?"],
  [S,"كم ساعة تستطيع تخصيصها يوميًا للعمل على مهام الميديا ومتابعة مسؤولياتك؟","How many hours per day can you dedicate to media tasks and your duties?"],
  [L,"كيف تصف مستوى مهارتك في التخصص الذي اخترته، وما الذي تحتاج إلى تطويره؟","How do you describe your skill level in your chosen specialty, and what do you need to improve?"],
  [R,"هل لديك نماذج من أعمالك السابقة تستطيع مشاركتها معنا؟","Do you have samples of previous work you can share with us?",[["yes","نعم، لدي أعمال جاهزة","Yes, I have finished work"],["willing","ليس لدي أعمال حاليًا لكنني مستعد لإثبات مهاراتي","No work right now, but I'm ready to prove my skills"],["beginner","أنا مبتدئ وأرغب في التعلم والتطور","I'm a beginner and want to learn and grow"]]],
  [L,"موقف عملي: طلبت منك الإدارة تصميم صورة إعلانية لتحديث جديد، لكن الموعد النهائي قريب جدًا. كيف ستنظم وقتك وتتعامل مع المهمة؟","Scenario: management asks for an announcement graphic for a new update, but the deadline is very close. How will you organize your time and handle it?"],
  [L,"موقف عملي: أنهيت مونتاج فيديو، لكن الإدارة طلبت منك تعديلات كثيرة لم تكن تتوقعها. كيف ستتعامل مع الملاحظات، وماذا ستفعل إذا اختلفت مع أحد التعديلات؟","Scenario: you finished a video edit but management requests many unexpected changes. How will you handle the feedback, and what if you disagree with one?"],
  [L,"موقف عملي: نشرت محتوى يحتوي على معلومة خاطئة عن السيرفر، وبدأ اللاعبون في تداولها. كيف ستتعامل مع الموقف وتمنع تكراره؟","Scenario: you published content with wrong information about the server and players are spreading it. How will you handle it and prevent a repeat?"],
  [L,"موقف عملي: طلب منك أحد أعضاء الفريق استخدام صورة أو مقطع لا تملك إذنًا باستخدامه. ماذا ستفعل، وما البديل الذي ستقترحه؟","Scenario: a team member asks you to use an image or clip you have no permission to use. What will you do, and what alternative will you suggest?"],
  [L,"موقف عملي: لاحظت أن منشورات السيرفر لا تحقق تفاعلًا جيدًا، وأن عدد المشاهدات منخفض. ما الأفكار التي ستقترحها لتحسين المحتوى وزيادة التفاعل؟","Scenario: you notice server posts get poor engagement and low views. What ideas will you propose to improve content and boost engagement?"],
  [L,"كيف تتعامل مع ضغط المهام عندما يكون لديك أكثر من طلب في الوقت نفسه؟","How do you handle task pressure when you have more than one request at the same time?"],
  [L,"إذا واجهت مشكلة تقنية أثناء المونتاج أو التصميم أو التصوير، ولم تعرف طريقة حلها، فماذا ستفعل؟","If you hit a technical problem while editing, designing or filming and don't know how to solve it, what will you do?"],
  [L,"ما خطتك لتطوير محتوى DronexMC Network، وما الأفكار التي تتمنى تنفيذها إذا تم قبولك؟","What is your plan to develop DronexMC Network content, and which ideas would you like to implement if accepted?"]] },
 { slug: "developers", prefix: "DEV", ar: "المبرمجون والمطورون", en: "Developers", dar: "انضم إلى فريق التطوير", den: "Join the development team", icon: "code", color: "#00d4ff", sort: 3,
  qs: [[S,...name],[N,...age],[S,...mc],
  [S,"ما لغة البرمجة التي تعتمد عليها بشكل أساسي؟","Which programming language do you mainly rely on?"],
  [L,"ما مدى معرفتك ببرمجة إضافات ماينكرافت باستخدام Java؟","How well do you know Minecraft plugin development with Java?"],
  [L,"ما نوع إضافات ماينكرافت التي تستطيع برمجتها؟","What kinds of Minecraft plugins can you develop?"],
  [L,"ما مدى معرفتك بالتعامل مع Paper وSpigot؟","How well do you know Paper and Spigot?"],
  [L,"كيف تتعامل مع خطأ برمجي يظهر أثناء تشغيل إحدى إضافات ماينكرافت؟","How do you handle a bug that appears while running a Minecraft plugin?"],
  [L,"كيف تحاول اكتشاف سبب استهلاك إحدى الإضافات لموارد السيرفر بشكل مرتفع؟","How do you try to find why a plugin uses high server resources?"],
  [L,"كيف تتأكد من أن الإضافة التي طورتها لن تتسبب في مشاكل عند تشغيلها على السيرفر؟","How do you make sure a plugin you developed won't cause problems on the server?"],
  [L,"ما مدى معرفتك ببرمجة بوتات ديسكورد باستخدام Python أو JavaScript؟","How well do you know Discord bot development with Python or JavaScript?"],
  [L,"ما نوع أنظمة بوتات ديسكورد التي تستطيع برمجتها؟","What kinds of Discord bot systems can you develop?"],
  [L,"موقف عملي: كيف ستتعامل مع ثغرة تسمح للاعب باستغلال إحدى إضافات السيرفر للحصول على صلاحيات أو مكافآت غير مستحقة؟","Scenario: how would you handle an exploit letting a player abuse a server plugin to gain unearned permissions or rewards?"],
  [L,"هل لديك مشاريع برمجية سابقة تستطيع مشاركتها معنا؟","Do you have previous programming projects you can share with us?",null,false],
  [L,"ما النظام الذي ترغب في تطويره داخل DronexMC Network لإضافة ميزة جديدة أو تحسين تجربة اللاعبين؟","What system would you like to develop within DronexMC Network to add a feature or improve the player experience?"]] }];
const esc = (s) => s.replace(/'/g, "''");
let sql = "-- Generated by scripts/gen-seed.js. Run after schema.sql. Safe to re-run (skips existing slugs).\n";
for (const f of forms) {
  const qs = f.qs.map(([t, ar, en, o, req], i) => ({ id: "q" + (i + 1), type: { s: "short", l: "long", n: "number", r: "single" }[t],
    required: req !== false, enabled: true, label_ar: ar, label_en: en, ...(o ? { options: o.map(([value, a, e]) => ({ value, ar: a, en: e })) } : {}),
    ...(t === "n" ? { min: 0, max: 3 } : {}) }));
  sql += `\nwith f as (insert into forms(slug,prefix,name_ar,name_en,description_ar,description_en,icon,color,sort_order,is_open) values ('${f.slug}','${f.prefix}','${esc(f.ar)}','${esc(f.en)}','${esc(f.dar)}','${esc(f.den)}','${f.icon}','${f.color}',${f.sort},true) on conflict (slug) do nothing returning id)\ninsert into form_versions(form_id,version,questions) select id,1,'${esc(JSON.stringify(qs))}'::jsonb from f;\n`;
}
fs.writeFileSync("supabase/seed.sql", sql);
console.log("questions:", forms.map((f) => f.slug + "=" + f.qs.length).join(" "));
