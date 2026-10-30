"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Phone, Calendar, Award, TrendingUp, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";

const BELT_LABELS: Record<string, string> = {
  WHITE: "White", YELLOW: "Yellow", ORANGE: "Orange",
  GREEN: "Green", BLUE: "Blue", MAROON: "Maroon",
  BROWN_IV: "Brown IV", BROWN_III: "Brown III", BROWN_II: "Brown II",
  BROWN: "Brown", BLACK: "Black"
};

const BELT_CLASS: Record<string, string> = {
  WHITE: "belt-white", YELLOW: "belt-yellow", ORANGE: "belt-orange",
  GREEN: "belt-green", BLUE: "belt-blue", MAROON: "belt-maroon",
  BROWN_IV: "belt-brown-iv", BROWN_III: "belt-brown-iii", BROWN_II: "belt-brown-ii",
  BROWN: "belt-brown", BLACK: "belt-black"
};

const BELT_COLORS: Record<string, string> = {
  WHITE: "#f8fafc", YELLOW: "#facc15", ORANGE: "#fb923c",
  GREEN: "#4ade80", BLUE: "#38bdf8", MAROON: "#f43f5e",
  BROWN_IV: "#d97706", BROWN_III: "#b45309", BROWN_II: "#92400e",
  BROWN: "#78350f", BLACK: "#e2e8f0"
};

function Avatar({ name, photoUrl, size = 80 }: { name: string; photoUrl?: string | null; size?: number }) {
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
          border: "3px solid rgba(192,57,43,0.4)",
          flexShrink: 0
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
        background: "linear-gradient(135deg,#c0392b,#96281b)", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        fontSize: size * 0.36, 
        fontWeight: 800, 
        color: "#fff", 
        border: "3px solid rgba(192,57,43,0.4)",
        flexShrink: 0
      }}
    >
      {initials}
    </div>
  );
}

interface AttendanceRecord { date: string; present: boolean; }

interface Student {
  id: string; name: string; belt: string; dob: string | null; phone: string | null;
  photoUrl: string | null; joinedOn: string;
  attendance: AttendanceRecord[];
}

export default function StudentDetailPage() {
  const { id } = useParams();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [calMonth, setCalMonth] = useState(() => new Date().toISOString().slice(0, 7));

  useEffect(() => {
    fetch(`/api/students/${id}`)
      .then(r => r.json())
      .then(d => { setStudent(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        {[0,1,2].map(i => <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: "#c0392b", animation: `pulse 1s ${i * 0.2}s infinite` }} />)}
      </div>
    </div>
  );

  if (!student) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", color: "#8888aa", padding: "1.5rem" }}>
      <div style={{ fontSize: "1.2rem", color: "#e8e8f0", fontWeight: 700 }}>Karateka Not Found</div>
      <Link href="/" style={{ color: "#e74c3c", textDecoration: "none", fontSize: "0.9rem", fontWeight: 600 }}>← Back to Roster</Link>
    </div>
  );

  const totalClasses = student.attendance.length;
  const presentCount = student.attendance.filter(a => a.present).length;
  const attendancePct = totalClasses ? Math.round((presentCount / totalClasses) * 100) : 0;
  const beltColor = BELT_COLORS[student.belt] || "#ffffff";

  // Build calendar for selected month
  const [cy, cm] = calMonth.split("-").map(Number);
  const daysInMonth = new Date(cy, cm, 0).getDate();
  const firstDayOfWeek = new Date(cy, cm - 1, 1).getDay();
  const attendanceMap = Object.fromEntries(student.attendance.map(a => [a.date, a.present]));

  return (
    <div style={{ minHeight: "100vh", background: "#08080c", color: "#e8e8f0", overflowX: "hidden" }}>
      <style>{`
        .student-nav {
          position: sticky;
          top: 0;
          z-index: 40;
          background: rgba(8, 8, 12, 0.88);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding: 0 1.5rem;
        }
        .student-nav-inner {
          max-width: 1000px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 60px;
        }
        .student-main-wrap {
          max-width: 1000px;
          margin: 0 auto;
          padding: 2rem 1.5rem 4rem;
        }
        .profile-card {
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 1.5rem;
          position: relative;
          overflow: hidden;
        }
        .profile-content {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }
        .profile-name {
          font-size: 1.75rem;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.02em;
          margin-bottom: 0.4rem;
        }
        .dojo-badge-box {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 1.15rem;
          min-width: 150px;
          text-align: center;
        }
        .stats-grid-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .cal-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        @media (max-width: 640px) {
          .student-nav {
            padding: 0 0.85rem;
          }
          .student-nav-inner {
            height: 54px;
          }
          .student-main-wrap {
            padding: 1rem 0.85rem 3.5rem;
          }
          .profile-card {
            padding: 1.25rem 1rem;
            border-radius: 16px;
            margin-bottom: 1rem;
          }
          .profile-content {
            gap: 1rem;
          }
          .profile-name {
            font-size: 1.35rem;
            margin-bottom: 0.25rem;
          }
          .dojo-badge-box {
            width: 100%;
            padding: 0.75rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            text-align: left;
          }
          .dojo-badge-box div {
            margin-bottom: 0 !important;
          }
          .stats-grid-row {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.65rem !important;
            margin-bottom: 1rem !important;
          }
          .stats-card-item {
            padding: 0.9rem 0.5rem !important;
            border-radius: 12px !important;
          }
          .stats-card-val {
            font-size: 1.35rem !important;
          }
          .cal-card-box {
            padding: 1.15rem 0.75rem !important;
            border-radius: 14px !important;
          }
          .cal-header-row {
            flex-direction: column;
            align-items: stretch;
            gap: 0.6rem;
          }
          .cal-month-picker {
            width: 100% !important;
          }
          .cal-legend-row {
            flex-wrap: wrap;
            gap: 0.75rem !important;
          }
        }
      `}</style>

      {/* Nav */}
      <nav className="student-nav">
        <div className="student-nav-inner">
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.45rem", color: "#8e8ea6", textDecoration: "none", fontSize: "0.85rem", fontWeight: 600 }}>
            <ArrowLeft size={16} /> <span>Back to Roster</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Image src="/logo.png" alt="Shanghai Karate" width={30} height={30} style={{ borderRadius: 6 }} />
            <span style={{ fontWeight: 800, fontSize: "0.85rem", color: "#ffffff", letterSpacing: "0.02em" }}>SHANGHAI KARATE</span>
          </div>
        </div>
      </nav>

      <div className="student-main-wrap">
        {/* Profile Card */}
        <div className="glass animate-slide-up profile-card">
          {/* Subtle top belt color stripe */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: beltColor, boxShadow: `0 0 10px ${beltColor}` }} />
          <div style={{ position: "absolute", top: 0, right: 0, width: 250, height: 250, background: "radial-gradient(ellipse, rgba(192,57,43,0.08) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
          
          <div className="profile-content">
            <Avatar name={student.name} photoUrl={student.photoUrl} size={78} />
            <div style={{ flex: 1, minWidth: 180 }}>
              <h1 className="profile-name">{student.name}</h1>
              <div style={{ marginBottom: "0.75rem" }}>
                <span className={BELT_CLASS[student.belt] || "belt-white"} style={{ fontSize: "0.72rem", fontWeight: 800, padding: "0.22rem 0.65rem", borderRadius: 50, textTransform: "uppercase", letterSpacing: "0.06em", display: "inline-block" }}>
                  {BELT_LABELS[student.belt] || student.belt} Belt
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                {student.phone && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#8e8ea6", fontSize: "0.82rem" }}>
                    <Phone size={13} color="#e74c3c" />
                    <span>{student.phone}</span>
                  </div>
                )}
                {student.dob && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#8e8ea6", fontSize: "0.82rem" }}>
                    <Calendar size={13} color="#f39c12" />
                    <span>DOB: {student.dob}</span>
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#8e8ea6", fontSize: "0.82rem" }}>
                  <Award size={13} color="#3498db" />
                  <span>Joined: {new Date(student.joinedOn).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}</span>
                </div>
              </div>
            </div>

            {/* Dojo Member Badge */}
            <div className="dojo-badge-box">
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.35rem" }}>
                <ShieldCheck size={24} color="#2ecc71" />
              </div>
              <div>
                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#2ecc71", marginBottom: "0.15rem" }}>Active Member</div>
                <div style={{ fontSize: "0.68rem", color: "#8e8ea6" }}>Shanghai Karate Dojo</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="stats-grid-row">
          {[
            { icon: <TrendingUp size={16} />, label: "Attendance", value: `${attendancePct}%`, color: attendancePct >= 75 ? "#2ecc71" : attendancePct >= 50 ? "#f39c12" : "#e74c3c" },
            { icon: <CheckCircle2 size={16} />, label: "Present", value: `${presentCount} d`, color: "#2ecc71" },
            { icon: <XCircle size={16} />, label: "Absent", value: `${totalClasses - presentCount} d`, color: "#e74c3c" },
            { icon: <Award size={16} />, label: "Total Sessions", value: totalClasses, color: "#3498db" },
          ].map(stat => (
            <div key={stat.label} className="glass stats-card-item" style={{ borderRadius: 14, padding: "1.1rem 0.75rem", textAlign: "center" }}>
              <div style={{ color: stat.color, marginBottom: "0.4rem", display: "flex", justifyContent: "center" }}>{stat.icon}</div>
              <div className="stats-card-val" style={{ fontSize: "1.45rem", fontWeight: 800, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: "0.68rem", color: "#8e8ea6", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "0.15rem", fontWeight: 600 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Attendance Progress Bar */}
        <div className="glass" style={{ borderRadius: 14, padding: "1.15rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.6rem" }}>
            <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#e8e8f0" }}>Attendance Rate</span>
            <span style={{ fontSize: "0.82rem", fontWeight: 800, color: attendancePct >= 75 ? "#2ecc71" : "#f39c12" }}>{attendancePct}%</span>
          </div>
          <div style={{ height: 7, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${attendancePct}%`, background: `linear-gradient(90deg, ${attendancePct >= 75 ? "#27ae60,#2ecc71" : attendancePct >= 50 ? "#f39c12,#f1c40f" : "#c0392b,#e74c3c"})`, borderRadius: 4, transition: "width 1s ease" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.35rem", fontSize: "0.68rem", color: "#8e8ea6" }}>
            <span>0%</span><span style={{ color: "#8e8ea6" }}>75% Target</span><span>100%</span>
          </div>
        </div>

        {/* Calendar */}
        <div className="glass cal-card-box" style={{ borderRadius: 16, padding: "1.35rem", marginBottom: "1.5rem" }}>
          <div className="cal-header-row">
            <div>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#e8e8f0", margin: 0 }}>Attendance Calendar</h2>
              <p style={{ fontSize: "0.75rem", color: "#8e8ea6", margin: "0.15rem 0 0" }}>Daily attendance history</p>
            </div>
            <input type="month" value={calMonth} onChange={e => setCalMonth(e.target.value)} className="input-dojo cal-month-picker" style={{ width: "auto", minWidth: 150, padding: "0.45rem 0.8rem", fontSize: "0.84rem" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "0.25rem", textAlign: "center" }}>
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
              <div key={d} style={{ fontSize: "0.68rem", color: "#8e8ea6", fontWeight: 700, textTransform: "uppercase", padding: "0.3rem 0" }}>{d}</div>
            ))}
            {[...Array(firstDayOfWeek)].map((_, i) => <div key={`e${i}`} />)}
            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1;
              const dateStr = `${calMonth}-${String(day).padStart(2,"0")}`;
              const present = attendanceMap[dateStr];
              const hasRecord = dateStr in attendanceMap;
              const isToday = dateStr === new Date().toISOString().split("T")[0];
              return (
                <div key={day} style={{
                  padding: "0.45rem 0.15rem",
                  borderRadius: 7,
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  background: hasRecord ? (present ? "rgba(39,174,96,0.18)" : "rgba(192,57,43,0.18)") : "rgba(255,255,255,0.03)",
                  color: hasRecord ? (present ? "#2ecc71" : "#e74c3c") : "#8888aa",
                  border: isToday ? "1px solid rgba(192,57,43,0.6)" : "1px solid transparent",
                  transition: "all 0.2s",
                }}>
                  {day}
                  {hasRecord && <div style={{ fontSize: "0.6rem", marginTop: 1, fontWeight: 800 }}>{present ? "✓" : "✗"}</div>}
                </div>
              );
            })}
          </div>

          <div className="cal-legend-row" style={{ display: "flex", gap: "1.2rem", marginTop: "1rem", fontSize: "0.72rem", color: "#8e8ea6" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}><span style={{ width: 9, height: 9, borderRadius: 2, background: "rgba(39,174,96,0.5)", display: "inline-block" }} />Present</span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}><span style={{ width: 9, height: 9, borderRadius: 2, background: "rgba(192,57,43,0.5)", display: "inline-block" }} />Absent</span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}><span style={{ width: 9, height: 9, borderRadius: 2, background: "rgba(255,255,255,0.08)", display: "inline-block" }} />No session</span>
          </div>
        </div>
      </div>
    </div>
  );
}
