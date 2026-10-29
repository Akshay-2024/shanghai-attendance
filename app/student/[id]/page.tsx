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

function Avatar({ name, photoUrl, size = 80 }: { name: string; photoUrl?: string | null; size?: number }) {
  if (photoUrl) return <img src={photoUrl} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: "3px solid rgba(192,57,43,0.4)" }} />;
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "linear-gradient(135deg,#c0392b,#96281b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 700, color: "#fff", border: "3px solid rgba(192,57,43,0.4)" }}>
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
    fetch(`/api/students/${id}`).then(r => r.json()).then(d => { setStudent(d); setLoading(false); });
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        {[0,1,2].map(i => <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: "#c0392b", animation: `pulse 1s ${i * 0.2}s infinite` }} />)}
      </div>
    </div>
  );
  if (!student) return <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", color: "#8888aa" }}>Student not found</div>;

  const totalClasses = student.attendance.length;
  const presentCount = student.attendance.filter(a => a.present).length;
  const attendancePct = totalClasses ? Math.round((presentCount / totalClasses) * 100) : 0;

  // Build calendar for selected month
  const [cy, cm] = calMonth.split("-").map(Number);
  const daysInMonth = new Date(cy, cm, 0).getDate();
  const firstDayOfWeek = new Date(cy, cm - 1, 1).getDay();
  const attendanceMap = Object.fromEntries(student.attendance.map(a => [a.date, a.present]));

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f" }}>
      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(10,10,15,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 1.5rem" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#8888aa", textDecoration: "none", fontSize: "0.9rem", transition: "color 0.2s" }}>
            <ArrowLeft size={16} /> Back to Roster
          </Link>
          <Image src="/logo.png" alt="Shanghai Karate" width={32} height={32} style={{ borderRadius: 6 }} />
        </div>
      </nav>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem 1.5rem" }}>
        {/* Profile Card */}
        <div className="glass animate-slide-up" style={{ borderRadius: 20, padding: "2rem", marginBottom: "1.5rem", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: 300, height: 300, background: "radial-gradient(ellipse, rgba(192,57,43,0.08) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
            <Avatar name={student.name} photoUrl={student.photoUrl} size={90} />
            <div style={{ flex: 1, minWidth: 200 }}>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#e8e8f0", letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>{student.name}</h1>
              <span className={BELT_CLASS[student.belt]} style={{ fontSize: "0.75rem", fontWeight: 700, padding: "0.25rem 0.75rem", borderRadius: 50, textTransform: "uppercase", letterSpacing: "0.06em", display: "inline-block", marginBottom: "0.75rem" }}>
                {BELT_LABELS[student.belt]} Belt
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                {student.phone && <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#8888aa", fontSize: "0.85rem" }}><Phone size={14} />{student.phone}</div>}
                {student.dob && <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#8888aa", fontSize: "0.85rem" }}><Calendar size={14} />DOB: {student.dob}</div>}
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#8888aa", fontSize: "0.85rem" }}><Award size={14} />Joined: {new Date(student.joinedOn).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</div>
              </div>
            </div>
            {/* Dojo Member Badge */}
            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: "1.25rem", minWidth: 160, textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.4rem" }}>
                <ShieldCheck size={26} color="#2ecc71" />
              </div>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#2ecc71", marginBottom: "0.2rem" }}>Active Member</div>
              <div style={{ fontSize: "0.72rem", color: "#8888aa" }}>Shanghai Karate Dojo</div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
          {[
            { icon: <TrendingUp size={18} />, label: "Attendance", value: `${attendancePct}%`, color: attendancePct >= 75 ? "#2ecc71" : attendancePct >= 50 ? "#f39c12" : "#e74c3c" },
            { icon: <CheckCircle2 size={18} />, label: "Present", value: presentCount, color: "#2ecc71" },
            { icon: <XCircle size={18} />, label: "Absent", value: totalClasses - presentCount, color: "#e74c3c" },
            { icon: <Award size={18} />, label: "Total Sessions", value: totalClasses, color: "#3498db" },
          ].map(stat => (
            <div key={stat.label} className="glass" style={{ borderRadius: 14, padding: "1.25rem", textAlign: "center" }}>
              <div style={{ color: stat.color, marginBottom: "0.5rem", display: "flex", justifyContent: "center" }}>{stat.icon}</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: "0.72rem", color: "#8888aa", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "0.2rem" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Attendance Progress Bar */}
        <div className="glass" style={{ borderRadius: 14, padding: "1.25rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#e8e8f0" }}>Attendance Rate</span>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: attendancePct >= 75 ? "#2ecc71" : "#f39c12" }}>{attendancePct}%</span>
          </div>
          <div style={{ height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${attendancePct}%`, background: `linear-gradient(90deg, ${attendancePct >= 75 ? "#27ae60,#2ecc71" : attendancePct >= 50 ? "#f39c12,#f1c40f" : "#c0392b,#e74c3c"})`, borderRadius: 4, transition: "width 1s ease" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.4rem", fontSize: "0.72rem", color: "#8888aa" }}>
            <span>0%</span><span style={{ color: "#8888aa" }}>75% target</span><span>100%</span>
          </div>
        </div>

        {/* Calendar */}
        <div className="glass" style={{ borderRadius: 14, padding: "1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#e8e8f0" }}>Attendance Calendar</h2>
            <input type="month" value={calMonth} onChange={e => setCalMonth(e.target.value)} className="input-dojo" style={{ width: "auto" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "0.3rem", textAlign: "center" }}>
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
              <div key={d} style={{ fontSize: "0.7rem", color: "#8888aa", fontWeight: 600, textTransform: "uppercase", padding: "0.3rem 0" }}>{d}</div>
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
                  padding: "0.4rem 0.2rem",
                  borderRadius: 8,
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  background: hasRecord ? (present ? "rgba(39,174,96,0.15)" : "rgba(192,57,43,0.15)") : "rgba(255,255,255,0.03)",
                  color: hasRecord ? (present ? "#2ecc71" : "#e74c3c") : "#8888aa",
                  border: isToday ? "1px solid rgba(192,57,43,0.5)" : "1px solid transparent",
                  transition: "all 0.2s",
                }}>
                  {day}
                  {hasRecord && <div style={{ fontSize: "0.55rem", marginTop: 1 }}>{present ? "✓" : "✗"}</div>}
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", fontSize: "0.75rem", color: "#8888aa" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}><span style={{ width: 10, height: 10, borderRadius: 3, background: "rgba(39,174,96,0.5)", display: "inline-block" }} />Present</span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}><span style={{ width: 10, height: 10, borderRadius: 3, background: "rgba(192,57,43,0.5)", display: "inline-block" }} />Absent</span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}><span style={{ width: 10, height: 10, borderRadius: 3, background: "rgba(255,255,255,0.08)", display: "inline-block" }} />No record</span>
          </div>
        </div>
      </div>
    </div>
  );
}
