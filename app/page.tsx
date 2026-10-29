"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Search, Users, Calendar, Trophy } from "lucide-react";
import HeroBanner from "@/components/home/HeroBanner";

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
const BELT_CLASS: Record<string, string> = {
  WHITE: "belt-white",
  YELLOW: "belt-yellow",
  ORANGE: "belt-orange",
  GREEN: "belt-green",
  BLUE: "belt-blue",
  MAROON: "belt-maroon",
  BROWN_IV: "belt-brown-iv",
  BROWN_III: "belt-brown-iii",
  BROWN_II: "belt-brown-ii",
  BROWN: "belt-brown",
  BLACK: "belt-black",
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
  if (photoUrl) return <img src={photoUrl} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }} />;
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "linear-gradient(135deg,#c0392b,#96281b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
      {initials}
    </div>
  );
}

export default function HomePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [belt, setBelt] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  useEffect(() => {
    fetch("/api/students").then(r => r.json()).then(data => { setStudents(data); setLoading(false); });
  }, []);

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) &&
    (belt === "ALL" || s.belt === belt)
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f" }}>
      {/* Navbar */}
      <nav style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(10,10,15,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 1.5rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Image src="/logo.png" alt="Shanghai Karate" width={40} height={40} style={{ borderRadius: 8 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: "1rem", color: "#e8e8f0", letterSpacing: "-0.01em" }}>Shanghai Karate</div>
              <div style={{ fontSize: "0.7rem", color: "#8888aa", marginTop: -2 }}>松涛館 空手道</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <span style={{ color: "#8888aa", fontSize: "0.8rem" }}>{today}</span>
            <Link href="/admin/login" style={{ background: "linear-gradient(135deg,#c0392b,#96281b)", color: "#fff", padding: "0.45rem 1.1rem", borderRadius: 8, fontSize: "0.85rem", fontWeight: 600, textDecoration: "none", transition: "all 0.2s" }}>Admin</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ display: "none", position: "relative", padding: "5rem 1.5rem 3rem", textAlign: "center", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(192,57,43,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)", width: 600, height: 600, background: "radial-gradient(ellipse, rgba(192,57,43,0.08) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(192,57,43,0.12)", border: "1px solid rgba(192,57,43,0.25)", borderRadius: 50, padding: "0.35rem 1rem", marginBottom: "1.5rem", fontSize: "0.8rem", color: "#e74c3c" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#e74c3c", animation: "pulse 2s infinite" }} />
            Active Dojo
          </div>
          <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.5rem)", fontWeight: 800, color: "#e8e8f0", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "1rem" }}>
            Shanghai Karate<br />
            <span style={{ background: "linear-gradient(135deg,#c0392b,#f39c12)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Student Portal</span>
          </h1>
          <p style={{ color: "#8888aa", fontSize: "1.05rem", maxWidth: 500, margin: "0 auto 2.5rem" }}>
            Track attendance and belt progress for every member of our dojo.
          </p>
          {/* Stats */}
          <div style={{ display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap", marginBottom: "2rem" }}>
            {[
              { icon: <Users size={18} />, label: "Students", value: students.length },
              { icon: <Calendar size={18} />, label: "Classes Today", value: "Active" },
              { icon: <Trophy size={18} />, label: "Belt Levels", value: 11 },
            ].map(stat => (
              <div key={stat.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#c0392b" }}>{stat.icon}</div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#e8e8f0" }}>{stat.value}</div>
                <div style={{ fontSize: "0.75rem", color: "#8888aa", textTransform: "uppercase", letterSpacing: "0.08em" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem 2rem" }}>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#8888aa" }} />
            <input
              className="input-dojo"
              style={{ paddingLeft: "2.5rem" }}
              placeholder="Search students..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input-dojo"
            style={{
              width: "auto",
              minWidth: 150,
              backgroundColor: "#161624",
              color: "#ffffff",
              border: "1px solid rgba(255,255,255,0.18)",
              cursor: "pointer",
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

        {/* Student Cards */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem" }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 180, borderRadius: 16 }} />
            ))}
          </div>
        ) : (
          <>
            <p style={{ color: "#8888aa", fontSize: "0.85rem", marginBottom: "1rem" }}>{filtered.length} student{filtered.length !== 1 ? "s" : ""}</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem" }}>
              {filtered.map((student, i) => (
                <Link key={student.id} href={`/student/${student.id}`} style={{ textDecoration: "none" }}>
                  <div
                    className="glass"
                    style={{
                      borderRadius: 16, padding: "1.25rem", cursor: "pointer",
                      transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
                      animation: `slideUp 0.4s ease-out ${i * 0.05}s both`,
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 30px rgba(192,57,43,0.25)"; (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(192,57,43,0.3)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ""; (e.currentTarget as HTMLDivElement).style.boxShadow = ""; (e.currentTarget as HTMLDivElement).style.borderColor = ""; }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginBottom: "0.875rem" }}>
                      <Avatar name={student.name} photoUrl={student.photoUrl} size={52} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: "1rem", color: "#e8e8f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{student.name}</div>
                        <div style={{ marginTop: "0.2rem" }}>
                          <span className={BELT_CLASS[student.belt]} style={{ fontSize: "0.7rem", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: 50, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            {BELT_LABELS[student.belt]} Belt
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "0.5rem", textAlign: "center" }}>
                        <div style={{ fontSize: "0.65rem", color: "#8888aa", textTransform: "uppercase", letterSpacing: "0.06em" }}>Classes Attended</div>
                        <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#e8e8f0" }}>{student._count.attendance}</div>
                      </div>
                      <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "0.5rem", textAlign: "center" }}>
                        <div style={{ fontSize: "0.65rem", color: "#8888aa", textTransform: "uppercase", letterSpacing: "0.06em" }}>Joined</div>
                        <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#8888aa", marginTop: "0.15rem" }}>
                          {new Date(student.joinedOn).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "2rem 1.5rem", textAlign: "center", marginTop: "3rem" }}>
        <Image src="/logo.png" alt="Shanghai Karate" width={36} height={36} style={{ borderRadius: 6, marginBottom: "0.75rem" }} />
        <div style={{ color: "#8888aa", fontSize: "0.8rem" }}>© {new Date().getFullYear()} Shanghai Karate · 松涛館 空手道</div>
      </footer>
    </div>
  );
}
