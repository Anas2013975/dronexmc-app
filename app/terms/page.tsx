import { getLang } from "@/lib/i18n";
const T = {
  ar: { h: "شروط الخدمة", body: "يُستخدم هذا الموقع لتقديم طلبات الانضمام إلى فريق DronexMC Network. بتقديمك تؤكد أن المعلومات التي أدخلتها صحيحة، وقد تتم مراجعتها من فريق DronexMC. قرار القبول أو الرفض يعود للإدارة. يمكن للإدارة تعديل هذه الشروط." },
  en: { h: "Terms of Service", body: "This site is used to submit applications to the DronexMC Network team. By applying you confirm your answers are accurate, and they may be reviewed by the DronexMC team. Acceptance or rejection is at the staff's discretion. These terms may be updated by staff." },
};
export default function Page() { const s = T[getLang()]; return (<main className="max-w-2xl mx-auto p-6 space-y-3"><a href="/">←</a><h1 className="text-2xl font-bold">{s.h}</h1><p>{s.body}</p></main>); }
