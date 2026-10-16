import "./globals.css";
import { getLang, getTheme } from "@/lib/i18n";
export const metadata = { title: "DronexMC Network Applications" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = getLang();
  return (<html lang={lang} dir={lang === "ar" ? "rtl" : "ltr"} data-theme={getTheme()}><body className="min-h-screen flex flex-col">{children}</body></html>);
}
