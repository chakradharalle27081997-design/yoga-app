"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ActiveSidebar() {
  const pathname = usePathname();
  const [isStudio, setIsStudio] = useState(false);

  useEffect(() => {
    setIsStudio(!!localStorage.getItem("studioId"));
  }, [pathname]);

  if (pathname.startsWith("/student")) return null;
  if (pathname.startsWith("/studio-login")) return null;

  function isActive(href) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  function logout() {
    localStorage.removeItem("studioId");
    localStorage.removeItem("studioName");
    localStorage.removeItem("studioEmail");
    window.location.href = "/studio-login";
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <svg width="56" height="56" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="22" cy="22" r="21" fill="#FFF8F0" stroke="#C17F3A" strokeWidth="0.8"/>
          <ellipse cx="22" cy="14" rx="5" ry="10" fill="#E8F5E0" stroke="#4A7C35" strokeWidth="0.4"/>
          <ellipse cx="22" cy="14" rx="5" ry="10" fill="#E8F5E0" stroke="#4A7C35" strokeWidth="0.4" transform="rotate(60 22 22)"/>
          <ellipse cx="22" cy="14" rx="5" ry="10" fill="#E8F5E0" stroke="#4A7C35" strokeWidth="0.4" transform="rotate(120 22 22)"/>
          <ellipse cx="22" cy="14" rx="5" ry="10" fill="#E8F5E0" stroke="#4A7C35" strokeWidth="0.4" transform="rotate(180 22 22)"/>
          <ellipse cx="22" cy="14" rx="5" ry="10" fill="#E8F5E0" stroke="#4A7C35" strokeWidth="0.4" transform="rotate(240 22 22)"/>
          <ellipse cx="22" cy="14" rx="5" ry="10" fill="#E8F5E0" stroke="#4A7C35" strokeWidth="0.4" transform="rotate(300 22 22)"/>
          <circle cx="22" cy="22" r="8" fill="#FDFCF8" stroke="#C17F3A" strokeWidth="0.6"/>
          <circle cx="22" cy="17" r="3.5" fill="#2D5A1B"/>
          <circle cx="22" cy="13" r="1" fill="#C17F3A"/>
          <ellipse cx="22" cy="23" rx="4" ry="4.5" fill="#2D5A1B"/>
          <path d="M18 21.5 Q15 25 16.5 27" fill="none" stroke="#2D5A1B" strokeWidth="1.2" strokeLinecap="round"/>
          <path d="M26 21.5 Q29 25 27.5 27" fill="none" stroke="#2D5A1B" strokeWidth="1.2" strokeLinecap="round"/>
          <path d="M18 26.5 Q15.5 30 19 31 Q22 32 25 31 Q28.5 30 26 26.5" fill="#2D5A1B"/>
        </svg>
        <div className="logo-text">
          <span className="logo-name">IRA</span>
          <span className="logo-sub">Yoga Studio</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        <p className="sidebar-section">Navigation</p>
        <Link href="/" className={"sidebar-link" + (isActive("/") ? " active" : "")}>
          <span className="sidebar-icon">🏠</span> Dashboard
        </Link>
        <Link href="/clients" className={"sidebar-link" + (isActive("/clients") ? " active" : "")}>
          <span className="sidebar-icon">👥</span> My Students
        </Link>
        <Link href="/attendance" className={"sidebar-link" + (isActive("/attendance") ? " active" : "")}>
          <span className="sidebar-icon">📊</span> Attendance Report
        </Link>
        {!isStudio && (
          <Link href="/admin" className={"sidebar-link" + (isActive("/admin") ? " active" : "")}>
            <span className="sidebar-icon">🔐</span> Admin Panel
          </Link>
        )}
        {isStudio && (
          <button onClick={logout} style={{ background: "none", border: "none", cursor: "pointer", padding: "10px 16px", color: "#c0392b", fontSize: "14px", textAlign: "left", width: "100%", display: "flex", alignItems: "center", gap: "8px" }}>
            🚪 Logout
          </button>
        )}
      </nav>
      <div className="sidebar-footer">
        ✦ Wellness · Balance · Growth ✦
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const [isStudio, setIsStudio] = useState(false);
  useEffect(() => { setIsStudio(!!localStorage.getItem("studioId")); }, [pathname]);
  if (pathname.startsWith("/student")) return null;
  if (pathname.startsWith("/studio-login")) return null;
  function isActive(href) { if (href === "/") return pathname === "/"; return pathname.startsWith(href); }
  function logout() { localStorage.removeItem("studioId"); localStorage.removeItem("studioName"); localStorage.removeItem("studioEmail"); window.location.href = "/studio-login"; }
  return (
    <nav className="mobile-nav" style={{ display: "none" }}>
      <Link href="/" className={isActive("/") ? "active" : ""}><span className="icon">🏠</span>Dashboard</Link>
      <Link href="/clients" className={isActive("/clients") ? "active" : ""}><span className="icon">👥</span>Students</Link>
      <Link href="/attendance" className={isActive("/attendance") ? "active" : ""}><span className="icon">📊</span>Attendance</Link>
      {!isStudio && <Link href="/admin" className={isActive("/admin") ? "active" : ""}><span className="icon">🔐</span>Admin</Link>}
      {isStudio && <button onClick={logout}><span className="icon">🚪</span>Logout</button>}
    </nav>
  );
}
