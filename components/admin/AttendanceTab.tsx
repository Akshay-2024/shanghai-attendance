"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { CheckCircle2, XCircle, Save, ChevronLeft, ChevronRight } from "lucide-react";

interface Student { id: string; name: string; belt: string; photoUrl: string | null; }
interface AttendanceRecord { studentId: string; present: boolean; }

const BELT_CLASS: Record<string, string> = {
  WHITE: "belt-white", YELLOW: "belt-yellow", ORANGE: "belt-orange",
  GREEN: "belt-green", BLUE: "belt-blue", MAROON: "belt-maroon",
  BROWN_IV: "belt-brown-iv", BROWN_III: "belt-brown-iii", BROWN_II: "belt-brown-ii",
  BROWN: "belt-brown", BLACK: "belt-black"
};

const BELT_LABELS: Record<string, string> = {
  WHITE: "White", YELLOW: "Yellow", ORANGE: "Orange",
  GREEN: "Green", BLUE: "Blue", MAROON: "Maroon",
  BROWN_IV: "Brown IV", BROWN_III: "Brown III", BROWN_II: "Brown II",
  BROWN: "Brown", BLACK: "Black"
};

function Avatar({ name, photoUrl, size = 40 }: { name: string; photoUrl?: string | null; size?: number }) {
  if (photoUrl) {
    return <img src={photoUrl} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid rgba(255,255,255,0.15)" }} />;
  }
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  return <div style={{ width: size, height: size, borderRadius: "50%", background: "linear-gradient(135deg,#c0392b,#96281b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{initials}</div>;
}

export default function AttendanceTab() {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const studentsLoadedRef = useRef(false);

  // Load students once
  useEffect(() => {
    async function initStudents() {
      try {
        const sRes = await fetch("/api/students");
        const s = await sRes.json();
        setStudents(s);
        studentsLoadedRef.current = true;
      } catch (err) {
        console.error("Failed to load students", err);
      }
    }
    initStudents();
  }, []);

  // Load attendance for the date
  const loadAttendance = useCallback(async (d: string) => {
    setLoading(true);
    try {
      const aRes = await fetch(`/api/attendance?date=${d}`);
      const a: { studentId: string; present: boolean }[] = await aRes.json();
      const map: Record<string, boolean> = {};
      if (Array.isArray(a)) {
        a.forEach(r => { map[r.studentId] = r.present; });
      }
      setRecords(map);
    } catch (err) {
      console.error("Failed to load attendance", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAttendance(date);
  }, [date, loadAttendance]);

  function changeDate(delta: number) {
    const d = new Date(date);
    d.setDate(d.getDate() + delta);
    setDate(d.toISOString().split("T")[0]);
  }

  function toggleStudent(id: string) {
    setRecords(r => ({ ...r, [id]: !r[id] }));
  }

  function markAll(present: boolean) {
    setRecords(() => {
      const map: Record<string, boolean> = {};
      students.forEach(s => { map[s.id] = present; });
      return map;
    });
  }

  async function saveAttendance() {
    setSaving(true);
    const payload = {
      date,
      records: students.map(s => ({
        studentId: s.id,
        present: records[s.id] ?? false,
      })),
    };
    await fetch("/api/attendance/mark", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const presentCount = students.filter(s => records[s.id]).length;
  const total = students.length;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#e8e8f0", marginBottom: "0.5rem" }}>Mark Attendance</h2>
      <p style={{ color: "#8888aa", fontSize: "0.85rem", marginBottom: "1.5rem" }}>Check students who attended class on the selected date.</p>

      {/* Date Picker */}
      <div className="glass" style={{ borderRadius: 14, padding: "1.25rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <button onClick={() => changeDate(-1)} className="btn-ghost" style={{ padding: "0.5rem 0.75rem" }}><ChevronLeft size={16} /></button>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-dojo" style={{ width: "auto", flex: 1, minWidth: 160 }} max={today} />
        <button onClick={() => changeDate(1)} className="btn-ghost" style={{ padding: "0.5rem 0.75rem" }} disabled={date >= today}><ChevronRight size={16} /></button>
        <div style={{ marginLeft: "auto", display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ color: "#8888aa", fontSize: "0.85rem" }}>{presentCount}/{total} present</span>
          <button onClick={() => markAll(true)} className="btn-ghost" style={{ fontSize: "0.8rem", padding: "0.4rem 0.75rem" }}><CheckCircle2 size={14} />All Present</button>
          <button onClick={() => markAll(false)} className="btn-ghost" style={{ fontSize: "0.8rem", padding: "0.4rem 0.75rem" }}><XCircle size={14} />Clear All</button>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, marginBottom: "1.25rem", overflow: "hidden" }}>
        <div style={{ height: "100%", width: total ? `${(presentCount / total) * 100}%` : "0%", background: "linear-gradient(90deg,#c0392b,#f39c12)", borderRadius: 2, transition: "width 0.3s ease" }} />
      </div>

      {/* Student List */}
      {loading && students.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 12 }} />)}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {students.map(student => {
            const present = records[student.id] ?? false;
            return (
              <div
                key={student.id}
                onClick={() => toggleStudent(student.id)}
                className="glass"
                style={{
                  borderRadius: 12, padding: "0.875rem 1.125rem", display: "flex", alignItems: "center", gap: "1rem",
                  cursor: "pointer", transition: "all 0.2s",
                  background: present ? "rgba(39,174,96,0.08)" : "rgba(255,255,255,0.03)",
                  borderColor: present ? "rgba(39,174,96,0.25)" : "rgba(255,255,255,0.06)",
                }}
              >
                <Avatar name={student.name} photoUrl={student.photoUrl} size={40} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.95rem", color: "#e8e8f0" }}>{student.name}</div>
                  <span className={BELT_CLASS[student.belt] || "belt-white"} style={{ fontSize: "0.65rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: 50, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {BELT_LABELS[student.belt] || student.belt}
                  </span>
                </div>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                  background: present ? "#27ae60" : "rgba(255,255,255,0.06)",
                  border: present ? "none" : "2px solid rgba(255,255,255,0.12)",
                  transition: "all 0.2s", flexShrink: 0,
                }}>
                  {present && <CheckCircle2 size={18} color="#fff" />}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Save Button */}
      <div style={{ position: "sticky", bottom: "1.5rem", marginTop: "1.5rem", display: "flex", justifyContent: "center" }}>
        <button onClick={saveAttendance} className="btn-primary" style={{ padding: "0.875rem 2.5rem", fontSize: "1rem", boxShadow: "0 8px 32px rgba(192,57,43,0.4)" }} disabled={saving}>
          {saving ? "Saving..." : saved ? "✓ Saved!" : <><Save size={16} />Save Attendance</>}
        </button>
      </div>
    </div>
  );
}
