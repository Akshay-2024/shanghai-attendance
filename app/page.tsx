"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { 
  Search, Users, Calendar, Trophy, Shield, Flame, 
  ChevronRight, Award, Sparkles, CheckCircle2, Clock
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
  BLACK: { label: "Black", color: "#e2e8f0", bg: "rgba(0,0,0,0.6)", border: "rgba(226,232,240,0.4)" },
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
    weekday: "long", 
    year: "numeric", 
    month: "long", 
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

      {/* Decorative Traditional Japanese Calligraphy Watermark in background */}
      <div 
        aria-hidden="true"
        style={{
          position: "fixed",
          top: "12%",
          right: "2%",
          fontSize: "clamp(8rem, 20vw, 22rem)",
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
      <header 
        style={{ 
          position: "sticky", 
          top: 0, 
          zIndex: 50, 
          background: "rgba(8, 8, 12, 0.8)", 
          backdropFilter: "blur(16px)", 
          borderBottom: "1px solid rgba(255, 255, 255, 0.07)", 
          padding: "0 1.5rem" 
        }}
      >
        <div style={{ maxWidth: 1240, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 72 }}>
          {/* Dojo Brand */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.85rem", textDecoration: "none" }}>
            <div style={{ position: "relative", padding: 2, background: "linear-gradient(135deg, #c0392b, #f39c12)", borderRadius: 12 }}>
              <Image 
                src="/logo.png" 
                alt="Shanghai Karate Logo" 
                width={42} 
                height={42} 
                style={{ borderRadius: 10, display: "block", objectFit: "cover", background: "#0a0a0f" }} 
              />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontWeight: 800, fontSize: "1.15rem", letterSpacing: "0.02em", color: "#ffffff", textTransform: "uppercase" }}>
                  Shanghai Karate
                </span>
                <span style={{ fontSize: "0.65rem", background: "rgba(192,57,43,0.25)", border: "1px solid rgba(192,57,43,0.5)", color: "#f87171", padding: "0.15rem 0.45rem", borderRadius: 4, fontWeight: 700 }}>
                  松涛館
                </span>
              </div>
              <div style={{ fontSize: "0.72rem", color: "#8e8ea6", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Shotokan Karate Academy
              </div>
            </div>
          </Link>

          {/* Quick Info & Admin CTA */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
            <div style={{ display: "none", color: "#8e8ea6", fontSize: "0.82rem", alignItems: "center", gap: "0.4rem" }} className="date-badge">
              <Calendar size={14} color="#c0392b" />
              <span>{today}</span>
            </div>
            <style>{`
              @media (min-width: 640px) {
                .date-badge { display: flex !important; }
              }
            `}</style>
            
            <Link 
              href="/admin/login" 
              style={{ 
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "linear-gradient(135deg, #c0392b 0%, #96281b 100%)", 
                color: "#ffffff", 
                padding: "0.55rem 1.25rem", 
                borderRadius: 10, 
                fontSize: "0.85rem", 
                fontWeight: 700, 
                textDecoration: "none", 
                boxShadow: "0 0 20px rgba(192, 57, 43, 0.4)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                transition: "all 0.25s ease"
              }}
            >
              <Shield size={15} />
              <span>Sensei Portal</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ================= HERO SECTION ================= */}
      <section style={{ position: "relative", padding: "4.5rem 1.5rem 3.5rem", textAlign: "center", zIndex: 1 }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          
          {/* Top Dojo Pill */}
          <div 
            style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              gap: "0.6rem", 
              background: "rgba(192, 57, 43, 0.1)", 
              border: "1px solid rgba(192, 57, 43, 0.35)", 
              borderRadius: 50, 
              padding: "0.4rem 1.1rem", 
              marginBottom: "1.75rem", 
              fontSize: "0.82rem", 
              color: "#f87171",
              boxShadow: "0 0 25px rgba(192,57,43,0.2)" 
            }}
          >
            <Flame size={15} style={{ color: "#e74c3c" }} />
            <span style={{ fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Traditional Shotokan Martial Arts
            </span>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e" }} />
            <span style={{ color: "#86efac", fontSize: "0.75rem", fontWeight: 600 }}>Dojo Active</span>
          </div>

          {/* Main Hero Header */}
          <h1 
            style={{ 
              fontSize: "clamp(2.3rem, 6vw, 4.2rem)", 
              fontWeight: 900, 
              color: "#ffffff", 
              letterSpacing: "-0.03em", 
              lineHeight: 1.1, 
              marginBottom: "1.25rem",
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

          <p style={{ color: "#9aa0b8", fontSize: "clamp(1rem, 2vw, 1.18rem)", maxWidth: 640, margin: "0 auto 2.5rem", lineHeight: 1.6 }}>
            Official attendance &amp; belt rank tracking registry for Shanghai Karate. Honoring the spirit of Bushido through daily practice and relentless improvement.
          </p>

          {/* Quick Action Navigation */}
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap", marginBottom: "3rem" }}>
            <a 
              href="#student-roster" 
              style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                gap: "0.5rem", 
                background: "linear-gradient(135deg, #c0392b, #871f14)", 
                color: "#ffffff", 
                padding: "0.75rem 1.6rem", 
                borderRadius: 12, 
                fontWeight: 700, 
                fontSize: "0.95rem", 
                textDecoration: "none",
                boxShadow: "0 4px 20px rgba(192,57,43,0.35)",
                border: "1px solid rgba(255,255,255,0.15)",
                transition: "transform 0.2s"
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
            >
              <Users size={17} />
              <span>Explore Student Chart</span>
              <ChevronRight size={16} />
            </a>
          </div>

          {/* Stats Bar */}
          <div 
            style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", 
              gap: "1.25rem", 
              maxWidth: 820, 
              margin: "0 auto", 
              padding: "1.5rem", 
              background: "rgba(18, 18, 28, 0.7)", 
              border: "1px solid rgba(255, 255, 255, 0.08)", 
              borderRadius: 20,
              backdropFilter: "blur(12px)",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)"
            }}
          >
            {[
              { icon: <Users size={20} color="#f87171" />, count: students.length, label: "Enrolled Karateka" },
              { icon: <Trophy size={20} color="#fbbf24" />, count: 11, label: "Belt Ranks" },
              { icon: <Clock size={20} color="#60a5fa" />, count: "2 Days", label: "Weekly Training" },
              { icon: <Award size={20} color="#4ade80" />, count: "Shotokan", label: "Martial Tradition" },
            ].map((stat, idx) => (
              <div key={idx} style={{ textAlign: "center", padding: "0.5rem" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.35rem" }}>
                  {stat.icon}
                </div>
                <div style={{ fontSize: "1.65rem", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>
                  {stat.count}
                </div>
                <div style={{ fontSize: "0.72rem", color: "#8e8ea6", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ================= INTERACTIVE BELT PATH ================= */}
      <section style={{ maxWidth: 1240, margin: "1rem auto 2.5rem", padding: "0 1.5rem", position: "relative", zIndex: 1 }}>
        <div style={{ 
          background: "linear-gradient(180deg, rgba(22, 22, 34, 0.8) 0%, rgba(14, 14, 22, 0.8) 100%)", 
          border: "1px solid rgba(255, 255, 255, 0.08)", 
          borderRadius: 20, 
          padding: "1.5rem",
          backdropFilter: "blur(12px)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.2rem" }}>
            <div>
              <div style={{ fontSize: "0.75rem", color: "#e74c3c", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Rank Progression
              </div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#ffffff", margin: 0 }}>
                Interactive Belt Ladder
              </h2>
            </div>
            <div style={{ fontSize: "0.8rem", color: "#8e8ea6" }}>
              Click any belt rank below to filter students
            </div>
          </div>

          {/* Belt Ribbon Buttons */}
          <div style={{ display: "flex", gap: "0.6rem", overflowX: "auto", paddingBottom: "0.6rem" }}>
            <button
              onClick={() => setBelt("ALL")}
              style={{
                flexShrink: 0,
                padding: "0.5rem 1rem",
                borderRadius: 10,
                fontSize: "0.8rem",
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
                    padding: "0.5rem 0.95rem",
                    borderRadius: 10,
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.45rem",
                    background: isSelected ? meta.bg : "rgba(255,255,255,0.04)",
                    color: isSelected ? meta.color : "#d4d4d8",
                    border: isSelected ? `2px solid ${meta.border}` : "1px solid rgba(255,255,255,0.08)",
                    boxShadow: isSelected ? `0 0 15px ${meta.bg}` : "none",
                    transition: "all 0.2s"
                  }}
                >
                  <span 
                    style={{ 
                      width: 10, 
                      height: 10, 
                      borderRadius: "50%", 
                      background: meta.color, 
                      display: "inline-block", 
                      boxShadow: `0 0 6px ${meta.color}` 
                    }} 
                  />
                  <span>{meta.label}</span>
                  <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= STUDENT ROSTER SECTION ================= */}
      <section id="student-roster" style={{ maxWidth: 1240, margin: "0 auto", padding: "2rem 1.5rem 4rem", position: "relative", zIndex: 1 }}>
        
        {/* Search & Selector Toolbar */}
        <div 
          style={{ 
            display: "flex", 
            gap: "1rem", 
            flexWrap: "wrap", 
            alignItems: "center", 
            justifyContent: "space-between", 
            marginBottom: "2rem" 
          }}
        >
          <div>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>
              Student Directory
            </h2>
            <p style={{ color: "#8e8ea6", fontSize: "0.88rem", marginTop: "0.2rem" }}>
              Showing {filtered.length} student{filtered.length !== 1 ? "s" : ""}
              {belt !== "ALL" && ` in ${BELT_LABELS[belt]} Belt`}
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", flex: 1, maxWidth: 520 }}>
            {/* Search Input */}
            <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
              <Search 
                size={17} 
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
                  paddingLeft: "2.75rem", 
                  paddingRight: "1rem", 
                  background: "#141420", 
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 12,
                  height: 44,
                  fontSize: "0.88rem",
                  color: "#ffffff"
                }}
                placeholder="Search karateka by name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Dropdown Belt Selector */}
            <select
              className="input-dojo"
              style={{
                width: "auto",
                minWidth: 160,
                backgroundColor: "#161624",
                color: "#ffffff",
                border: "1px solid rgba(255,255,255,0.18)",
                borderRadius: 12,
                height: 44,
                padding: "0 1rem",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.85rem"
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: "1.5rem" }}>
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className="skeleton" 
                style={{ height: 210, borderRadius: 20, background: "rgba(255,255,255,0.03)" }} 
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div 
            style={{ 
              textAlign: "center", 
              padding: "4rem 2rem", 
              background: "rgba(18, 18, 28, 0.5)", 
              border: "1px dashed rgba(255, 255, 255, 0.12)", 
              borderRadius: 20 
            }}
          >
            <Shield size={44} color="#8e8ea6" style={{ margin: "0 auto 1rem", opacity: 0.6 }} />
            <h3 style={{ fontSize: "1.2rem", color: "#ffffff", fontWeight: 700 }}>No Karateka Found</h3>
            <p style={{ color: "#8e8ea6", fontSize: "0.9rem", maxWidth: 400, margin: "0.5rem auto 1.5rem" }}>
              No students match your current search or belt filter.
            </p>
            <button
              onClick={() => { setSearch(""); setBelt("ALL"); }}
              style={{
                background: "rgba(192,57,43,0.2)",
                border: "1px solid rgba(192,57,43,0.4)",
                color: "#f87171",
                padding: "0.5rem 1.25rem",
                borderRadius: 10,
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: "1.5rem" }}>
            {filtered.map((student, i) => {
              const meta = BELT_META[student.belt] || { label: student.belt, color: "#fff", bg: "rgba(255,255,255,0.1)", border: "rgba(255,255,255,0.2)" };
              return (
                <Link key={student.id} href={`/student/${student.id}`} style={{ textDecoration: "none" }}>
                  <div
                    style={{
                      background: "linear-gradient(180deg, rgba(24, 24, 36, 0.85) 0%, rgba(14, 14, 22, 0.95) 100%)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: 20,
                      padding: "1.4rem",
                      cursor: "pointer",
                      position: "relative",
                      overflow: "hidden",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.35)",
                      backdropFilter: "blur(10px)"
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = "translateY(-6px)";
                      e.currentTarget.style.borderColor = "rgba(192, 57, 43, 0.5)";
                      e.currentTarget.style.boxShadow = "0 14px 35px rgba(192, 57, 43, 0.25)";
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
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.2rem" }}>
                      <Avatar name={student.name} photoUrl={student.photoUrl} size={56} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div 
                          style={{ 
                            fontWeight: 800, 
                            fontSize: "1.05rem", 
                            color: "#ffffff", 
                            whiteSpace: "nowrap", 
                            overflow: "hidden", 
                            textOverflow: "ellipsis" 
                          }}
                        >
                          {student.name}
                        </div>
                        <div style={{ marginTop: "0.35rem" }}>
                          <span 
                            style={{ 
                              fontSize: "0.72rem", 
                              fontWeight: 800, 
                              padding: "0.25rem 0.7rem", 
                              borderRadius: 50, 
                              textTransform: "uppercase", 
                              letterSpacing: "0.07em",
                              color: meta.color,
                              background: meta.bg,
                              border: `1px solid ${meta.border}`,
                              boxShadow: `0 0 10px ${meta.bg}`
                            }}
                          >
                            {meta.label} Belt
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Attendance & Join Stat Blocks */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
                      <div 
                        style={{ 
                          background: "rgba(255, 255, 255, 0.03)", 
                          border: "1px solid rgba(255, 255, 255, 0.05)", 
                          borderRadius: 12, 
                          padding: "0.65rem 0.5rem", 
                          textAlign: "center" 
                        }}
                      >
                        <div style={{ fontSize: "0.65rem", color: "#8e8ea6", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
                          Attendance
                        </div>
                        <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#ffffff", marginTop: "0.1rem" }}>
                          {student._count.attendance} <span style={{ fontSize: "0.75rem", color: "#f87171" }}>days</span>
                        </div>
                      </div>

                      <div 
                        style={{ 
                          background: "rgba(255, 255, 255, 0.03)", 
                          border: "1px solid rgba(255, 255, 255, 0.05)", 
                          borderRadius: 12, 
                          padding: "0.65rem 0.5rem", 
                          textAlign: "center" 
                        }}
                      >
                        <div style={{ fontSize: "0.65rem", color: "#8e8ea6", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
                          Joined Dojo
                        </div>
                        <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#cbd5e1", marginTop: "0.25rem" }}>
                          {new Date(student.joinedOn).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Link Prompt */}
                    <div 
                      style={{ 
                        marginTop: "1rem", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "space-between", 
                        fontSize: "0.75rem", 
                        color: "#f87171", 
                        fontWeight: 700 
                      }}
                    >
                      <span>View Training History</span>
                      <ChevronRight size={14} />
                    </div>

                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ================= FOOTER ================= */}
      <footer 
        style={{ 
          borderTop: "1px solid rgba(255, 255, 255, 0.07)", 
          background: "rgba(6, 6, 10, 0.95)", 
          padding: "3.5rem 1.5rem 2rem", 
          position: "relative", 
          zIndex: 1 
        }}
      >
        <div style={{ maxWidth: 1240, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Image src="/logo.png" alt="Shanghai Karate" width={48} height={48} style={{ borderRadius: 10 }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "#ffffff", letterSpacing: "0.02em" }}>
                Shanghai Karate Academy
              </div>
              <div style={{ color: "#8e8ea6", fontSize: "0.8rem", marginTop: 2 }}>
                Shotokan Karate • 松涛館 空手道
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", flexWrap: "wrap" }}>
            <Link href="/admin/login" style={{ color: "#f87171", textDecoration: "none", fontSize: "0.88rem", fontWeight: 700 }}>
              Sensei Login
            </Link>
            <a href="#student-roster" style={{ color: "#8e8ea6", textDecoration: "none", fontSize: "0.88rem", fontWeight: 600 }}>
              Students
            </a>
          </div>
        </div>

        <div style={{ maxWidth: 1240, margin: "2rem auto 0", paddingTop: "1.5rem", borderTop: "1px solid rgba(255, 255, 255, 0.04)", textAlign: "center", color: "#64647a", fontSize: "0.78rem" }}>
          © {new Date().getFullYear()} Shanghai Karate Academy. All rights reserved. Built with pride for our karateka.
        </div>
      </footer>
    </div>
  );
}
