"use client";
import "./globals.css";
import ActiveSidebar, { MobileNav } from "./ActiveSidebar";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const PUBLIC_ROUTES = ["/studio-login", "/student", "/register"];

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}

function LayoutShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  const isPublic = PUBLIC_ROUTES.some(r => pathname.startsWith(r));

  useEffect(() => {
    if (!isPublic) {
      const studioId = typeof window !== "undefined" ? localStorage.getItem("studioId") : null;
      if (!studioId) {
        router.push("/studio-login");
      }
    }
    setChecked(true);
  }, [pathname]);

  if (!checked) return null;

  return (
    <div className="app-shell">
      <ActiveSidebar />
      <div className="content-area">
        <main className="main">{children}</main>
        <MobileNav />
      </div>
    </div>
  );
}
