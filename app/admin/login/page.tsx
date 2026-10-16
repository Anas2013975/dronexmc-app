import { getLang } from "@/lib/i18n";
import JsonForm from "@/components/JsonForm";
export default function AdminLogin() { const ar = getLang() === "ar";
  return (<main className="grid place-items-center flex-1 p-4"><div className="card p-6 space-y-3"><h1 className="text-xl font-bold">{ar ? "دخول الإدارة" : "Admin sign-in"}</h1>
    <JsonForm action="/api/admin/login" redirect="/admin" submit={ar ? "دخول" : "Sign in"} fields={[{ name: "username", label: ar ? "اسم المستخدم" : "Username" }, { name: "password", label: ar ? "كلمة المرور" : "Password", type: "password" }, { name: "token", label: ar ? "رمز الإعداد الأولي (عند الحاجة)" : "Setup token (first setup only)", type: "password" }]} /></div></main>); }
