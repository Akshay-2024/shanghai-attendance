"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { 
  Search, Users, Calendar, Trophy, Shield, Flame, 
  ChevronRight, Award, Clock
} from "lucide-react";

const BELT_LABELS: Record<string, string> = {
  WHITE: "White",
  YELLOW: "Yellow",
  ORANGE: "Orange",
  GREEN: "Green",
  BLUE: "Blue",
  MAROON: "Maroon",
  BROWN_IV: "Brown IV",
  BROWN_III: "Brown III",
  BROWN_II: "Brown II",
  BROWN: "Brown",
  BLACK: "Black",
};

const BELT_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  WHITE: { label: "White", color: "#f8fafc", bg: "rgba(248,250,252,0.12)", border: "rgba(255,255,255,0.4)" },
  YELLOW: { label: "Yellow", color: "#facc15", bg: "rgba(250,204,21,0.15)", border: "rgba(250,204,21,0.5)" },
  ORANGE: { label: "Orange", color: "#fb923c", bg: "rgba(251,146,60,0.15)", border: "rgba(251,146,60,0.5)" },
  GREEN: { label: "Green", color: "#4ade80", bg: "rgba(74,222,128,0.15)", border: "rgba(74,222,128,0.5)" },
  BLUE: { label: "Blue", color: "#38bdf8", bg: "rgba(56,189,248,0.15)", border: "rgba(56,189,248,0.5)" },
  MAROON: { label: "Maroon", color: "#f43f5e", bg: "rgba(136,19,55,0.3)", border: "rgba(244,63,94,0.5)" },
  BROWN_IV: { label: "Brown IV", color: "#d97706", bg: "rgba(120,53,15,0.25)", border: "rgba(217,119,6,0.5)" },
  BROWN_III: { label: "Brown III", color: "#b45309", bg: "rgba(120,53,15,0.35)", border: "rgba(180,83,9,0.5)" },
  BROWN_II: { label: "Brown II", color: "#92400e", bg: "rgba(120,53,15,0.45)", border: "rgba(146,64,14,0.5)" },
  BROWN: { label: "Brown", color: "#78350f", bg: "rgba(120,53,15,0.55)", border: "rgba(120,53,15,0.6)" },
  BLACK: { label: "Black", color: "#fd0000", bg: "rgba(0,0,0,0.6)", border: "rgba(226,232,240,0.4)" },
};

interface Student {
  id: string;
  name: string;
  belt: string;
  phone: string;
  photoUrl: string | null;
  joinedOn: string;
  monthlyFee: number;
  _count: { attendance: number };
}

function Avatar({ name, photoUrl, size = 64 }: { name: string; photoUrl?: string | null; size?: number }) {
  if (photoUrl) {
    return (
      <img 
        src={photoUrl} 
        alt={name} 
        style={{ 
          width: size, 
          height: size, 
          borderRadius: "50%", 
          objectFit: "cover", 
          border: "2px solid rgba(192,57,43,0.4)" 
        }} 
      />
    );
  }
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div 
      style={{ 
        width: size, 
        height: size, 
        borderRadius: "50%", 
        background: "linear-gradient(135deg, #c0392b 0%, #1e1b4b 100%)", 
        border: "2px solid rgba(192,57,43,0.4)",
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        fontSize: size * 0.36, 
        fontWeight: 800, 
        color: "#fff", 
        flexShrink: 0,
        boxShadow: "0 0 16px rgba(192,57,43,0.3)"
      }}
    >
      {initials}
    </div>
  );
}

export default function HomePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [belt, setBelt] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const today = new Date().toLocaleDateString("en-IN", { 
    weekday: "short", 
    year: "numeric", 
    month: "short", 
    day: "numeric" 
  });

  useEffect(() => {
    fetch("/api/students")
      .then(r => r.json())
      .then(data => { 
        if (Array.isArray(data)) setStudents(data); 
        setLoading(false); 
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) &&
    (belt === "ALL" || s.belt === belt)
  );

  return (
    <div style={{ minHeight: "100vh", background: "#08080c", color: "#f1f1f6", overflowX: "hidden", fontFamily: "inherit" }}>
      <style>{`
        /* Global Mobile Polish */
        .nav-header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(8, 8, 12, 0.88);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding: 0 1.5rem;
        }
        .nav-inner {
          max-width: 1240px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 68px;
          gap: 0.75rem;
        }
        .nav-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          min-width: 0;
        }
        .nav-brand-title {
          font-weight: 800;
          font-size: 1.12rem;
          letter-spacing: 0.01em;
          color: #ffffff;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .nav-brand-sub {
          font-size: 0.7rem;
          color: #8e8ea6;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .nav-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          background: linear-gradient(135deg, #c0392b 0%, #96281b 100%);
          color: #ffffff;
          padding: 0.52rem 1.15rem;
          border-radius: 9px;
          font-size: 0.85rem;
          font-weight: 700;
          text-decoration: none;
          white-space: nowrap;
          box-shadow: 0 0 16px rgba(192, 57, 43, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.15);
          flex-shrink: 0;
        }
        .date-badge {
          display: none;
          color: #8e8ea6;
          font-size: 0.82rem;
          align-items: center;
          gap: 0.4rem;
          white-space: nowrap;
        }

        @media (min-width: 640px) {
          .date-badge {
            display: flex;
          }
        }

        /* Responsive Mobile Adjustments */
        @media (max-width: 640px) {
          .nav-header {
            padding: 0 0.85rem;
          }
          .nav-inner {
            height: 58px;
            gap: 0.5rem;
          }
          .nav-brand {
            gap: 0.55rem;
          }
          .nav-logo-box {
            width: 34px !important;
            height: 34px !important;
          }
          .nav-brand-title {
            font-size: 0.92rem;
          }
          .nav-brand-sub {
            font-size: 0.6rem;
            letter-spacing: 0.03em;
          }
          .nav-btn {
            padding: 0.42rem 0.75rem;
            font-size: 0.78rem;
            gap: 0.35rem;
          }

          /* Hero */
          .hero-wrap {
            padding: 2.5rem 1rem 1.75rem !important;
          }
          .hero-pill {
            font-size: 0.72rem !important;
            padding: 0.32rem 0.8rem !important;
            margin-bottom: 1.25rem !important;
          }
          .hero-pill-text {
            max-width: 200px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .hero-title {
            font-size: 1.85rem !important;
            line-height: 1.15 !important;
            margin-bottom: 0.85rem !important;
          }
          .hero-desc {
            font-size: 0.92rem !important;
            margin-bottom: 1.75rem !important;
          }
          .hero-stats-box {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.75rem !important;
            padding: 1rem !important;
          }
          .hero-stat-val {
            font-size: 1.35rem !important;
          }
          .hero-stat-label {
            font-size: 0.65rem !important;
          }

          /* Belt Ladder */
          .belt-ladder-wrap {
            padding: 0 0.85rem !important;
            margin: 0.5rem auto 1.5rem !important;
          }
          .belt-ladder-box {
            padding: 1rem !important;
          }

          /* Student Roster */
          .roster-wrap {
            padding: 1.25rem 0.85rem 3.5rem !important;
          }
          .roster-toolbar {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 0.85rem !important;
            margin-bottom: 1.5rem !important;
          }
          .roster-inputs {
            max-width: 100% !important;
            flex-direction: column !important;
            gap: 0.6rem !important;
          }
          .roster-input-search {
            min-width: 100% !important;
          }
          .roster-select-belt {
            width: 100% !important;
          }
          .student-cards-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
          /* Dojo Kun Mobile */
          .dojokun-wrap {
            margin: 0 auto 3.5rem !important;
            padding: 0 0.85rem !important;
          }
          .dojokun-box {
            padding: 2rem 1.15rem !important;
            border-radius: 18px !important;
          }
          .dojokun-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
          .dojokun-item {
            padding: 1.25rem 1rem !important;
            border-radius: 14px !important;
          }
          .dojokun-quote-box {
            margin-top: 1.75rem !important;
            padding: 1.15rem 1rem !important;
          }
          .dojokun-quote-text {
            font-size: 0.9rem !important;
          }
          .dojokun-quote-author {
            font-size: 0.72rem !important;
          }
          .footer-wrap {
            padding: 2.5rem 1rem 1.75rem !important;
          }
          .footer-inner {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 1.25rem !important;
          }
        }
      `}</style>

      {/* Dynamic Background Dojo Ambience */}
      <div 
        style={{ 
          position: "fixed", 
          inset: 0, 
          backgroundImage: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(192, 57, 43, 0.22), transparent 70%), radial-gradient(circle at 100% 40%, rgba(243, 156, 18, 0.08), transparent 50%), radial-gradient(circle at 0% 80%, rgba(192, 57, 43, 0.06), transparent 50%)", 
          pointerEvents: "none", 
          zIndex: 0 
        }} 
      />

      {/* Traditional Calligraphy Watermark in background */}
      <div 
        aria-hidden="true"
        style={{
          position: "fixed",
          top: "12%",
          right: "2%",
          fontSize: "clamp(6rem, 18vw, 20rem)",
          fontWeight: 900,
          color: "rgba(255,255,255,0.015)",
          userSelect: "none",
          pointerEvents: "none",
          zIndex: 0,
          lineHeight: 1,
          fontFamily: "serif"
        }}
      >
        空手道
      </div>

      {/* ================= NAVBAR ================= */}
      <header className="nav-header">
        <div className="nav-inner">
          {/* Dojo Brand */}
          <Link href="/" className="nav-brand">
            <div 
              className="nav-logo-box" 
              style={{ 
                position: "relative", 
                padding: 2, 
                background: "linear-gradient(135deg, #c0392b, #f39c12)", 
                borderRadius: 10,
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <Image 
                src="/logo.png" 
                alt="Shanghai Karate Logo" 
                width={36} 
                height={36} 
                style={{ borderRadius: 8, display: "block", objectFit: "cover", background: "#0a0a0f" }} 
              />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span className="nav-brand-title">
                  Shanghai Karate
                </span>
              </div>
              <div className="nav-brand-sub">
                Shotokan Karate Academy
              </div>
            </div>
          </Link>

          {/* Quick Info & Admin CTA */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexShrink: 0 }}>
            <div className="date-badge">
              <Calendar size={14} color="#c0392b" />
              <span>{today}</span>
            </div>
            
            <Link 
              href="/admin/login" 
              className="nav-btn"
            >
              <Shield size={14} />
              <span>Sensei Portal</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ================= HERO SECTION ================= */}
      <section className="hero-wrap" style={{ position: "relative", padding: "4.5rem 1.5rem 3rem", textAlign: "center", zIndex: 1 }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          
          {/* Top Dojo Pill */}
          <div 
            className="hero-pill"
            style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              gap: "0.55rem", 
              background: "rgba(192, 57, 43, 0.1)", 
              border: "1px solid rgba(192, 57, 43, 0.35)", 
              borderRadius: 50, 
              padding: "0.38rem 1.1rem", 
              marginBottom: "1.75rem", 
              fontSize: "0.82rem", 
              color: "#f87171",
              boxShadow: "0 0 25px rgba(192,57,43,0.2)" 
            }}
          >
            <Flame size={14} style={{ color: "#e74c3c", flexShrink: 0 }} />
            <span className="hero-pill-text" style={{ fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Traditional Shotokan Martial Arts
            </span>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e", flexShrink: 0 }} />
            <span style={{ color: "#86efac", fontSize: "0.75rem", fontWeight: 600, flexShrink: 0 }}>Dojo Active</span>
          </div>

          {/* Main Hero Header */}
          <h1 
            className="hero-title"
            style={{ 
              fontSize: "clamp(2.1rem, 6vw, 4.2rem)", 
              fontWeight: 900, 
              color: "#ffffff", 
              letterSpacing: "-0.03em", 
              lineHeight: 1.1, 
              marginBottom: "1.1rem",
              textTransform: "uppercase"
            }}
          >
            Master The Way <br />
            <span 
              style={{ 
                background: "linear-gradient(135deg, #ffffff 0%, #fca5a5 30%, #ef4444 70%, #f59e0b 100%)", 
                WebkitBackgroundClip: "text", 
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 2px 18px rgba(239,68,68,0.3))"
              }}
            >
              Honor • Discipline • Character
            </span>
          </h1>

          <p className="hero-desc" style={{ color: "#9aa0b8", fontSize: "clamp(0.95rem, 2vw, 1.15rem)", maxWidth: 640, margin: "0 auto 2.25rem", lineHeight: 1.6 }}>
            Official attendance &amp; belt rank tracking registry for Shanghai Karate. Honoring the spirit of Bushido through daily practice and relentless improvement.
          </p>

          {/* Quick Action Navigation */}
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap", marginBottom: "2.75rem" }}>
            <a 
              href="#student-roster" 
              style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                gap: "0.5rem", 
                background: "linear-gradient(135deg, #c0392b, #871f14)", 
                color: "#ffffff", 
                padding: "0.7rem 1.5rem", 
                borderRadius: 12, 
                fontWeight: 700, 
                fontSize: "0.92rem", 
                textDecoration: "none",
                boxShadow: "0 4px 20px rgba(192,57,43,0.35)",
                border: "1px solid rgba(255,255,255,0.15)",
                transition: "transform 0.2s"
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
            >
              <Users size={16} />
              <span>Explore Student Roster</span>
              <ChevronRight size={15} />
            </a>
          </div>

          {/* Stats Bar */}
          <div 
            className="hero-stats-box"
            style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", 
              gap: "1.25rem", 
              maxWidth: 820, 
              margin: "0 auto", 
              padding: "1.35rem", 
              background: "rgba(18, 18, 28, 0.7)", 
              border: "1px solid rgba(255, 255, 255, 0.08)", 
              borderRadius: 18,
              backdropFilter: "blur(12px)",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)"
            }}
          >
            {[
              { icon: <Users size={18} color="#f87171" />, count: students.length, label: "Enrolled Karateka" },
              { icon: <Trophy size={18} color="#fbbf24" />, count: 11, label: "Belt Ranks" },
              { icon: <Clock size={18} color="#60a5fa" />, count: "6 Days", label: "Weekly Training" },
              { icon: <Award size={18} color="#4ade80" />, count: "Shotokan", label: "Martial Tradition" },
            ].map((stat, idx) => (
              <div key={idx} style={{ textAlign: "center", padding: "0.4rem" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.3rem" }}>
                  {stat.icon}
                </div>
                <div className="hero-stat-val" style={{ fontSize: "1.55rem", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>
                  {stat.count}
                </div>
                <div className="hero-stat-label" style={{ fontSize: "0.7rem", color: "#8e8ea6", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ================= INTERACTIVE BELT PATH ================= */}
      <section className="belt-ladder-wrap" style={{ maxWidth: 1240, margin: "0.75rem auto 2.25rem", padding: "0 1.5rem", position: "relative", zIndex: 1 }}>
        <div 
          className="belt-ladder-box"
          style={{ 
            background: "linear-gradient(180deg, rgba(22, 22, 34, 0.8) 0%, rgba(14, 14, 22, 0.8) 100%)", 
            border: "1px solid rgba(255, 255, 255, 0.08)", 
            borderRadius: 18, 
            padding: "1.35rem",
            backdropFilter: "blur(12px)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1rem" }}>
            <div>
              <div style={{ fontSize: "0.72rem", color: "#e74c3c", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Rank Progression
              </div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#ffffff", margin: 0 }}>
                Interactive Belt Ladder
              </h2>
            </div>
            <div style={{ fontSize: "0.78rem", color: "#8e8ea6" }}>
              Filter by belt rank
            </div>
          </div>

          {/* Belt Ribbon Buttons */}
          <div style={{ display: "flex", gap: "0.55rem", overflowX: "auto", paddingBottom: "0.5rem", WebkitOverflowScrolling: "touch" }}>
            <button
              onClick={() => setBelt("ALL")}
              style={{
                flexShrink: 0,
                padding: "0.45rem 0.9rem",
                borderRadius: 9,
                fontSize: "0.78rem",
                fontWeight: 700,
                cursor: "pointer",
                background: belt === "ALL" ? "linear-gradient(135deg,#c0392b,#96281b)" : "rgba(255,255,255,0.05)",
                color: belt === "ALL" ? "#ffffff" : "#a1a1aa",
                border: belt === "ALL" ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(255,255,255,0.08)",
                transition: "all 0.2s"
              }}
            >
              All Belts ({students.length})
            </button>

            {Object.entries(BELT_META).map(([key, meta]) => {
              const count = students.filter(s => s.belt === key).length;
              const isSelected = belt === key;
              return (
                <button
                  key={key}
                  onClick={() => setBelt(key)}
                  style={{
                    flexShrink: 0,
                    padding: "0.45rem 0.85rem",
                    borderRadius: 9,
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    background: isSelected ? meta.bg : "rgba(255,255,255,0.04)",
                    color: isSelected ? meta.color : "#d4d4d8",
                    border: isSelected ? `2px solid ${meta.border}` : "1px solid rgba(255,255,255,0.08)",
                    boxShadow: isSelected ? `0 0 15px ${meta.bg}` : "none",
                    transition: "all 0.2s"
                  }}
                >
                  <span 
                    style={{ 
                      width: 9, 
                      height: 9, 
                      borderRadius: "50%", 
                      background: meta.color, 
                      display: "inline-block", 
                      boxShadow: `0 0 6px ${meta.color}` 
                    }} 
                  />
                  <span>{meta.label}</span>
                  <span style={{ fontSize: "0.68rem", opacity: 0.7 }}>({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= STUDENT ROSTER SECTION ================= */}
      <section id="student-roster" className="roster-wrap" style={{ maxWidth: 1240, margin: "0 auto", padding: "1.5rem 1.5rem 4rem", position: "relative", zIndex: 1 }}>
        
        {/* Search & Selector Toolbar */}
        <div 
          className="roster-toolbar"
          style={{ 
            display: "flex", 
            gap: "1rem", 
            flexWrap: "wrap", 
            alignItems: "center", 
            justifyContent: "space-between", 
            marginBottom: "1.75rem" 
          }}
        >
          <div>
            <h2 style={{ fontSize: "1.55rem", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>
              Student Directory
            </h2>
            <p style={{ color: "#8e8ea6", fontSize: "0.85rem", marginTop: "0.15rem" }}>
              Showing {filtered.length} student{filtered.length !== 1 ? "s" : ""}
              {belt !== "ALL" && ` in ${BELT_LABELS[belt]} Belt`}
            </p>
          </div>

          <div className="roster-inputs" style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", flex: 1, maxWidth: 520 }}>
            {/* Search Input */}
            <div className="roster-input-search" style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <Search 
                size={16} 
                style={{ 
                  position: "absolute", 
                  left: 14, 
                  top: "50%", 
                  transform: "translateY(-50%)", 
                  color: "#8e8ea6", 
                  pointerEvents: "none" 
                }} 
              />
              <input
                className="input-dojo"
                style={{ 
                  width: "100%", 
                  paddingLeft: "2.6rem", 
                  paddingRight: "1rem", 
                  background: "#141420", 
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 11,
                  height: 42,
                  fontSize: "0.86rem",
                  color: "#ffffff"
                }}
                placeholder="Search karateka by name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Dropdown Belt Selector */}
            <select
              className="input-dojo roster-select-belt"
              style={{
                width: "auto",
                minWidth: 150,
                backgroundColor: "#161624",
                color: "#ffffff",
                border: "1px solid rgba(255,255,255,0.18)",
                borderRadius: 11,
                height: 42,
                padding: "0 1rem",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.84rem"
              }}
              value={belt}
              onChange={e => setBelt(e.target.value)}
            >
              <option value="ALL" style={{ backgroundColor: "#181826", color: "#ffffff" }}>All Belts</option>
              {Object.entries(BELT_LABELS).map(([k, v]) => (
                <option key={k} value={k} style={{ backgroundColor: "#181826", color: "#ffffff" }}>
                  {v} Belt
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Student Cards Grid */}
        {loading ? (
          <div className="student-cards-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem" }}>
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className="skeleton" 
                style={{ height: 200, borderRadius: 18, background: "rgba(255,255,255,0.03)" }} 
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div 
            style={{ 
              textAlign: "center", 
              padding: "3.5rem 1.5rem", 
              background: "rgba(18, 18, 28, 0.5)", 
              border: "1px dashed rgba(255, 255, 255, 0.12)", 
              borderRadius: 18 
            }}
          >
            <Shield size={40} color="#8e8ea6" style={{ margin: "0 auto 0.75rem", opacity: 0.6 }} />
            <h3 style={{ fontSize: "1.1rem", color: "#ffffff", fontWeight: 700 }}>No Karateka Found</h3>
            <p style={{ color: "#8e8ea6", fontSize: "0.85rem", maxWidth: 360, margin: "0.5rem auto 1.25rem" }}>
              No students match your current search or belt filter.
            </p>
            <button
              onClick={() => { setSearch(""); setBelt("ALL"); }}
              style={{
                background: "rgba(192,57,43,0.2)",
                border: "1px solid rgba(192,57,43,0.4)",
                color: "#f87171",
                padding: "0.45rem 1.15rem",
                borderRadius: 9,
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="student-cards-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem" }}>
            {filtered.map((student) => {
              const meta = BELT_META[student.belt] || { label: student.belt, color: "#fff", bg: "rgba(255,255,255,0.1)", border: "rgba(255,255,255,0.2)" };
              return (
                <Link key={student.id} href={`/student/${student.id}`} style={{ textDecoration: "none" }}>
                  <div
                    style={{
                      background: "linear-gradient(180deg, rgba(24, 24, 36, 0.85) 0%, rgba(14, 14, 22, 0.95) 100%)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: 18,
                      padding: "1.25rem",
                      cursor: "pointer",
                      position: "relative",
                      overflow: "hidden",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.35)",
                      backdropFilter: "blur(10px)"
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.borderColor = "rgba(192, 57, 43, 0.5)";
                      e.currentTarget.style.boxShadow = "0 12px 30px rgba(192, 57, 43, 0.25)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                      e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.35)";
                    }}
                  >
                    {/* Top ambient color bar for the belt */}
                    <div 
                      style={{ 
                        position: "absolute", 
                        top: 0, 
                        left: 0, 
                        right: 0, 
                        height: 3, 
                        background: meta.color,
                        boxShadow: `0 0 10px ${meta.color}`
                      }} 
                    />

                    {/* Student Info Header */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", marginBottom: "1rem" }}>
                      <Avatar name={student.name} photoUrl={student.photoUrl} size={50} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div 
                          style={{ 
                            fontWeight: 800, 
                            fontSize: "1rem", 
                            color: "#ffffff", 
                            whiteSpace: "nowrap", 
                            overflow: "hidden", 
                            textOverflow: "ellipsis" 
                          }}
                        >
                          {student.name}
                        </div>
                        <div style={{ marginTop: "0.25rem" }}>
                          <span 
                            style={{ 
                              fontSize: "0.68rem", 
                              fontWeight: 800, 
                              padding: "0.2rem 0.65rem", 
                              borderRadius: 50, 
                              textTransform: "uppercase", 
                              letterSpacing: "0.07em",
                              color: meta.color,
                              background: meta.bg,
                              border: `1px solid ${meta.border}`,
                              boxShadow: `0 0 8px ${meta.bg}`
                            }}
                          >
                            {meta.label} Belt
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Attendance & Join Stat Blocks */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.55rem" }}>
                      <div 
                        style={{ 
                          background: "rgba(255, 255, 255, 0.03)", 
                          border: "1px solid rgba(255, 255, 255, 0.05)", 
                          borderRadius: 10, 
                          padding: "0.55rem 0.45rem", 
                          textAlign: "center" 
                        }}
                      >
                        <div style={{ fontSize: "0.62rem", color: "#8e8ea6", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
                          Attendance
                        </div>
                        <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#ffffff", marginTop: "0.05rem" }}>
                          {student._count.attendance} <span style={{ fontSize: "0.72rem", color: "#f87171" }}>days</span>
                        </div>
                      </div>

                      <div 
                        style={{ 
                          background: "rgba(255, 255, 255, 0.03)", 
                          border: "1px solid rgba(255, 255, 255, 0.05)", 
                          borderRadius: 10, 
                          padding: "0.55rem 0.45rem", 
                          textAlign: "center" 
                        }}
                      >
                        <div style={{ fontSize: "0.62rem", color: "#8e8ea6", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
                          Joined Dojo
                        </div>
                        <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#cbd5e1", marginTop: "0.2rem" }}>
                          {new Date(student.joinedOn).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Link Prompt */}
                    <div 
                      style={{ 
                        marginTop: "0.85rem", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "space-between", 
                        fontSize: "0.72rem", 
                        color: "#f87171", 
                        fontWeight: 700 
                      }}
                    >
                      <span>View Training History</span>
                      <ChevronRight size={13} />
                    </div>

                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ================= DOJO KUN & PHILOSOPHY SECTION ================= */}
      <section id="dojo-kun" className="dojokun-wrap" style={{ maxWidth: 1240, margin: "0 auto 5rem", padding: "0 1.5rem", position: "relative", zIndex: 1 }}>
        <div 
          className="dojokun-box"
          style={{ 
            background: "radial-gradient(ellipse at 50% 0%, rgba(192, 57, 43, 0.15) 0%, rgba(18, 18, 28, 0.92) 70%)", 
            border: "1px solid rgba(192, 57, 43, 0.25)", 
            borderRadius: 24, 
            padding: "3rem 2rem",
            boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
          }}
        >
          <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 2.75rem" }}>
            <span style={{ fontSize: "0.8rem", color: "#f87171", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase" }}>
              道場訓 • DOJO KUN
            </span>
            <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.35rem)", fontWeight: 900, color: "#ffffff", marginTop: "0.45rem", marginBottom: "0.75rem", letterSpacing: "-0.02em" }}>
              The 5 Pillars of Karatedo
            </h2>
            <p style={{ color: "#9aa0b8", fontSize: "0.92rem", lineHeight: 1.6 }}>
              Established by Master Gichin Funakoshi. Each precept begins with &quot;Hitotsu&quot; (First), signifying that all rules hold equal and paramount importance.
            </p>
          </div>

          <div className="dojokun-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
            {[
              {
                num: "01",
                kanji: "一、人格完成に努むること",
                en: "Seek Perfection of Character",
                desc: "Karate is not about defeating others, but about mastering yourself and building unshakeable integrity."
              },
              {
                num: "02",
                kanji: "一、誠の道を守ること",
                en: "Be Faithful & Sincere",
                desc: "Honor your word, respect your masters and peers, and practice with pure honesty in heart and technique."
              },
              {
                num: "03",
                kanji: "一、努力の精神を養うこと",
                en: "Endeavor & Strive",
                desc: "Perseverance in the face of exhaustion. True martial power comes from relentless repetition."
              },
              {
                num: "04",
                kanji: "一、礼儀を重んずること",
                en: "Respect Etiquette & Others",
                desc: "Karate begins and ends with courtesy. Respect toward everyone in and outside the dojo."
              },
              {
                num: "05",
                kanji: "一、血気の勇を戒むること",
                en: "Refrain from Violent Behavior",
                desc: "The highest victory is to resolve conflict without striking. Self-control is supreme strength."
              },
            ].map((pillar) => (
              <div 
                key={pillar.num}
                className="dojokun-item"
                style={{ 
                  background: "rgba(10, 10, 16, 0.65)", 
                  border: "1px solid rgba(255, 255, 255, 0.08)", 
                  borderRadius: 18, 
                  padding: "1.5rem",
                  transition: "all 0.25s ease",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.6rem" }}>
                  <div style={{ fontSize: "0.75rem", color: "#f59e0b", fontWeight: 700 }}>
                    {pillar.kanji}
                  </div>
                  <span style={{ fontSize: "0.65rem", fontWeight: 800, color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.05)", padding: "0.15rem 0.45rem", borderRadius: 4 }}>
                    {pillar.num}
                  </span>
                </div>
                <h3 style={{ fontSize: "1.08rem", fontWeight: 800, color: "#ffffff", marginBottom: "0.45rem", letterSpacing: "-0.01em" }}>
                  {pillar.en}
                </h3>
                <p style={{ fontSize: "0.85rem", color: "#8e8ea6", lineHeight: 1.55, margin: 0 }}>
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Master Quote Banner */}
          <div 
            className="dojokun-quote-box"
            style={{ 
              marginTop: "2.5rem", 
              padding: "1.5rem 1.75rem", 
              background: "rgba(192, 57, 43, 0.12)", 
              borderLeft: "4px solid #c0392b", 
              borderRadius: "0 16px 16px 0",
              textAlign: "center"
            }}
          >
            <p className="dojokun-quote-text" style={{ fontStyle: "italic", color: "#f1f1f6", fontSize: "0.98rem", margin: 0, lineHeight: 1.6 }}>
              &ldquo;The ultimate aim of Karate lies not in victory or defeat, but in the perfection of the character of its participants.&rdquo;
            </p>
            <div className="dojokun-quote-author" style={{ color: "#f87171", fontSize: "0.78rem", fontWeight: 700, marginTop: "0.55rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              — Gichin Funakoshi, Father of Modern Karate
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer 
        className="footer-wrap"
        style={{ 
          borderTop: "1px solid rgba(255, 255, 255, 0.07)", 
          background: "rgba(6, 6, 10, 0.95)", 
          padding: "3.25rem 1.5rem 2rem", 
          position: "relative", 
          zIndex: 1 
        }}
      >
        <div className="footer-inner" style={{ maxWidth: 1240, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            <Image src="/logo.png" alt="Shanghai Karate" width={42} height={42} style={{ borderRadius: 9 }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: "1rem", color: "#ffffff", letterSpacing: "0.02em" }}>
                Shanghai Karate Academy
              </div>
              <div style={{ color: "#8e8ea6", fontSize: "0.75rem", marginTop: 2 }}>
                Shotokan Karatedo • 松涛館 空手道
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", flexWrap: "wrap" }}>
            <Link href="/admin/login" style={{ color: "#f87171", textDecoration: "none", fontSize: "0.85rem", fontWeight: 700 }}>
              Sensei Login
            </Link>
            <a href="#student-roster" style={{ color: "#8e8ea6", textDecoration: "none", fontSize: "0.85rem", fontWeight: 600 }}>
              Student Directory
            </a>
            <a href="#dojo-kun" style={{ color: "#8e8ea6", textDecoration: "none", fontSize: "0.85rem", fontWeight: 600 }}>
              Dojo Kun
            </a>
          </div>
        </div>

        <div style={{ maxWidth: 1240, margin: "1.75rem auto 0", paddingTop: "1.25rem", borderTop: "1px solid rgba(255, 255, 255, 0.04)", textAlign: "center", color: "#64647a", fontSize: "0.75rem" }}>
          © {new Date().getFullYear()} Shanghai Karate Academy. All rights reserved. Built with pride for our karateka.
        </div>
      </footer>
    </div>
  );
}
