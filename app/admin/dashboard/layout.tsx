"use client";
import { useEffect, useState, Suspense } from "react";
import { signOut } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ClipboardList, Users, IndianRupee, BarChart2, LogOut, Menu, X, ShieldCheck } from "lucide-react";

const BASE_NAV = [
  { id: "attendance", label: "Mark Attendance", icon: ClipboardList },
  { id: "students", label: "Students", icon: Users },
  { id: "fees", label: "Fee Management", icon: IndianRupee },
  { id: "reports", label: "Reports", icon: BarChart2 },
];

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "attendance";
  const [active, setActive] = useState(currentTab);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; id: string } | null>(null);
  const [isSensei, setIsSensei] = useState(false);

  useEffect(() => {
    setActive(currentTab);
  }, [currentTab]);

  useEffect(() => {
    setMounted(true);
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(data => {
        if (data.user) {
          setCurrentUser(data.user);
          setIsSensei(data.isSensei || data.user.name === "sensei");
        }
      })
      .catch(console.error);
  }, []);

  if (!mounted) return null;

  // Build nav list dynamically: only add Sensei Logs if user is sensei
  const navItems = isSensei
    ? [...BASE_NAV, { id: "audit", label: "Sensei Audit Logs", icon: ShieldCheck }]
    : BASE_NAV;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", width: "100%", maxWidth: "100vw", overflowX: "hidden" }}>
      {/* Mobile overlay */}
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 40 }} />}

      {/* Sidebar */}
      <aside style={{
        width: 240, flexShrink: 0, background: "#12121a", borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex", flexDirection: "column", position: "fixed", top: 0, bottom: 0, left: 0,
        zIndex: 50, transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)", transition: "transform 0.3s ease",
      }} className="md-sidebar">
        <style>{`
          @media (min-width: 768px) {
            .md-sidebar { transform: translateX(0) !important; }
            .md-main { margin-left: 240px !important; }
            .menu-toggle-btn { display: none !important; }
          }
          @media (max-width: 767px) {
            .md-main { width: 100% !important; max-width: 100vw !important; min-width: 0 !important; overflow-x: hidden !important; margin-left: 0 !important; }
            .admin-topbar { padding: 0 0.85rem !important; height: 56px !important; }
            .admin-content-area { padding: 1rem 0.75rem 3rem !important; min-width: 0 !important; max-width: 100vw !important; overflow-x: hidden !important; }
            .admin-top-title { font-size: 0.92rem !important; max-width: 140px; }
            .sensei-top-btn { padding: 0.35rem 0.65rem !important; font-size: 0.75rem !important; }
            .sensei-btn-full { display: none !important; }
            .sensei-btn-short { display: inline !important; }
          }
          @media (min-width: 768px) {
            .sensei-btn-short { display: none !important; }
            .sensei-btn-full { display: inline !important; }
          }
        `}</style>

        {/* Logo */}
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Image src="/logo.png" alt="Shanghai Karate" width={36} height={36} style={{ borderRadius: 8 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#e8e8f0" }}>Admin Panel</div>
            <div style={{ fontSize: "0.68rem", color: "#8888aa" }}>Shanghai Karate</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: "1rem 0.75rem", flex: 1 }}>
          {navItems.map(({ id, label, icon: Icon }) => (
            <Link
              key={id}
              href={`/admin/dashboard?tab=${id}`}
              onClick={() => { setActive(id); setSidebarOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: "0.75rem",
                padding: "0.7rem 0.875rem", borderRadius: 10, marginBottom: "0.25rem",
                textDecoration: "none", fontWeight: 600, fontSize: "0.875rem",
                background: active === id
                  ? id === "audit"
                    ? "rgba(243,156,18,0.15)"
                    : "rgba(192,57,43,0.15)"
                  : "transparent",
                color: active === id
                  ? id === "audit"
                    ? "#f39c12"
                    : "#e74c3c"
                  : id === "audit"
                  ? "#f39c12"
                  : "#8888aa",
                border: active === id
                  ? `1px solid ${id === "audit" ? "rgba(243,156,18,0.3)" : "rgba(192,57,43,0.2)"}`
                  : "1px solid transparent",
                transition: "all 0.2s",
              }}
            >
              <Icon size={17} />
              <span>{label}</span>
              {id === "audit" && (
                <span style={{ marginLeft: "auto", fontSize: "0.6rem", background: "rgba(243,156,18,0.2)", color: "#f39c12", padding: "0.1rem 0.35rem", borderRadius: 4, fontWeight: 700 }}>
                  MASTER
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* User Identity & Logout */}
        <div style={{ padding: "1rem 0.75rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ padding: "0.4rem 0.5rem 0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: isSensei ? "#f39c12" : "#2ecc71" }} />
            <div style={{ fontSize: "0.75rem", color: "#8888aa" }}>
              Signed in as: <strong style={{ color: isSensei ? "#f39c12" : "#e8e8f0" }}>{currentUser?.name || "Admin"}</strong>
            </div>
          </div>

          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem 0.875rem", borderRadius: 10, color: "#8888aa", textDecoration: "none", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
            ← Student Portal
          </Link>
          <button 
            onClick={async () => {
              await signOut({ redirect: false });
              window.location.href = "/admin/login";
            }} 
            style={{ display: "flex", alignItems: "center", gap: "0.75rem", width: "100%", padding: "0.6rem 0.875rem", borderRadius: 10, background: "rgba(192,57,43,0.1)", border: "1px solid rgba(192,57,43,0.2)", color: "#e74c3c", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }}
          >
            <LogOut size={15} />Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="md-main" style={{ flex: 1, minHeight: "100vh", minWidth: 0, width: "100%", maxWidth: "100vw", overflowX: "hidden" }}>
        {/* Top bar */}
        <div className="admin-topbar" style={{ position: "sticky", top: 0, zIndex: 30, background: "rgba(10,10,15,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, gap: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", minWidth: 0, gap: "0.5rem" }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="menu-toggle-btn"
              style={{
                background: "none",
                border: "none",
                color: "#8888aa",
                cursor: "pointer",
                padding: "0.25rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="admin-top-title" style={{ fontWeight: 700, fontSize: "1rem", color: "#e8e8f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {active === "audit" ? "Master Audit Log" : navItems.find(n => n.id === active)?.label || "Dashboard"}
            </div>
          </div>

          {/* Sensei Special Button in Top Bar (Only visible to Sensei!) */}
          {isSensei && (
            <Link
              href="/admin/dashboard?tab=audit"
              onClick={() => setActive("audit")}
              className="sensei-top-btn"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.45rem",
                background: active === "audit" ? "linear-gradient(135deg,#c0392b,#96281b)" : "rgba(243,156,18,0.12)",
                border: `1px solid ${active === "audit" ? "rgba(192,57,43,0.4)" : "rgba(243,156,18,0.3)"}`,
                color: active === "audit" ? "#ffffff" : "#f39c12",
                padding: "0.4rem 0.9rem",
                borderRadius: 8,
                fontSize: "0.8rem",
                fontWeight: 700,
                textDecoration: "none",
                whiteSpace: "nowrap",
                flexShrink: 0,
                transition: "all 0.2s",
              }}
            >
              <ShieldCheck size={15} />
              <span className="sensei-btn-full">Sensei Audit Logs</span>
              <span className="sensei-btn-short">Audit Logs</span>
            </Link>
          )}
        </div>

        <div className="admin-content-area" style={{ padding: "1.5rem", width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
          {children}
        </div>
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", color: "#8888aa" }}>Loading Admin Dashboard...</div>}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
}
