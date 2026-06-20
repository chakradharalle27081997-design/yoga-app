"use client";
import "./globals.css";
import ActiveSidebar, { MobileNav } from "./ActiveSidebar";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const PUBLIC_ROUTES = ["/studio-login", "/student", "/register"];

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="application-name" content="Indira Yoga" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Indira Yoga" />
        <meta name="theme-color" content="#1D9E75" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
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
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
  }, []);

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
