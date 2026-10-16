import { cookies } from "next/headers";
export type Lang = "ar" | "en";
export const getLang = (): Lang => (cookies().get("dx_lang")?.value === "en" ? "en" : "ar");
export const getTheme = () => (cookies().get("dx_theme")?.value === "light" ? "light" : "dark");
export const t = {
  ar: { signIn:"تسجيل الدخول إلى DronexMC", need:"تحتاج حساب Discord للتقديم. نقرأ فقط اسم المستخدم والصورة.", cont:"المتابعة عبر Discord",
        terms:"شروط الخدمة", privacy:"سياسة الخصوصية", apps:"التقديمات", open:"مفتوح", closed:"مغلق", apply:"قدّم الآن", logout:"تسجيل الخروج",
        empty:"لا توجد نماذج متاحة حاليًا.", server:"السيرفر", store:"المتجر", cancelled:"تم إلغاء تسجيل الدخول.", failed:"فشل تسجيل الدخول، حاول مجددًا." },
  en: { signIn:"Sign in to DronexMC", need:"You need a Discord account to apply. We only read your username and avatar.", cont:"Continue with Discord",
        terms:"Terms of Service", privacy:"Privacy Policy", apps:"Applications", open:"Open", closed:"Closed", apply:"Apply now", logout:"Log out",
        empty:"No forms are available right now.", server:"Server", store:"Store", cancelled:"Sign-in was cancelled.", failed:"Sign-in failed, please try again." },
};
