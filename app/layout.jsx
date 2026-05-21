"use client";
import "./globals.css";
import ActiveSidebar from "./ActiveSidebar";
import { usePathname } from "next/navigation";

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
  return (
    <div className="app-shell">
      <ActiveSidebar />
      <div className="content-area">
        <main className="main">{children}</main>
      </div>
    </div>
  );
}
