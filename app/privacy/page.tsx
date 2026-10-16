import { getLang } from "@/lib/i18n";
const T = {
  ar: { h: "سياسة الخصوصية", body: "نجمع بيانات حساب Discord الأساسية (الاسم والصورة والمعرّف) والإجابات التي ترسلها لغرض مراجعة طلبك فقط. قد يراجع فريق DronexMC طلبك. لا نطلب صلاحيات تتجاوز identify. لطلب حذف بياناتك تواصل مع الدعم في سيرفر Discord." },
  en: { h: "Privacy Policy", body: "We collect basic Discord account data (username, avatar, ID) and the answers you submit, solely to review your application. The DronexMC team may review it. We request no scope beyond identify. To request deletion of your data, contact support on our Discord server." },
};
export default function Page() { const s = T[getLang()]; return (<main className="max-w-2xl mx-auto p-6 space-y-3"><a href="/">←</a><h1 className="text-2xl font-bold">{s.h}</h1><p>{s.body}</p></main>); }
