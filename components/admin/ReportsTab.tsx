"use client";
import { useEffect, useState, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";
import { Download } from "lucide-react";

interface Student {
  id: string; name: string; belt: string;
  attendance: { date: string; present: boolean }[];
  fees: { month: string; status: string; amountDue: number; amountPaid: number }[];
}

export default function ReportsTab() {
  const currMonth = new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState(currMonth);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (m: string) => {
    setLoading(true);
    try {
      const r = await fetch(`/api/reports?month=${m}`);
      const data = await r.json();
      setStudents(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(month); }, [month, load]);

  const attendanceData = students.map(s => {
    const monthRecords = s.attendance.filter(a => a.date.startsWith(month));
    const total = monthRecords.length;
    const present = monthRecords.filter(a => a.present).length;
    return { name: s.name.split(" ")[0], pct: total ? Math.round((present / total) * 100) : 0, present, total };
  }).sort((a, b) => b.pct - a.pct);

  const feeData = (() => {
    let paid = 0, unpaid = 0, partial = 0;
    students.forEach(s => {
      const fee = s.fees.find(f => f.month === month);
      if (!fee || fee.status === "UNPAID") unpaid++;
      else if (fee.status === "PAID") paid++;
      else partial++;
    });
    return [
      { name: "Paid", value: paid, color: "#27ae60" },
      { name: "Unpaid", value: unpaid, color: "#c0392b" },
      { name: "Partial", value: partial, color: "#f39c12" },
    ].filter(d => d.value > 0);
  })();

  function exportCSV() {
    const rows = [["Name", "Belt", "Month", "Present Days", "Total Days", "Attendance %", "Fee Status", "Amount Paid (₹)"]];
    students.forEach(s => {
      const monthRecords = s.attendance.filter(a => a.date.startsWith(month));
      const total = monthRecords.length;
      const present = monthRecords.filter(a => a.present).length;
      const fee = s.fees.find(f => f.month === month);
      rows.push([
        s.name, 
        s.belt, 
        month, 
        String(present), 
        String(total), 
        total ? `${Math.round((present/total)*100)}%` : "0%", 
        fee?.status || "N/A", 
        fee ? String(fee.amountPaid) : "0"
      ]);
    });

    // Helper to escape CSV fields
    const escapeCSV = (field: string) => {
      if (field.includes(",") || field.includes('"') || field.includes("\n")) {
        return `"${field.replace(/"/g, '""')}"`;
      }
      return field;
    };

    // Prepend UTF-8 BOM (\uFEFF) so Microsoft Excel opens Unicode (₹) properly without garbling
    const csvContent = "\uFEFF" + rows.map(r => r.map(escapeCSV).join(",")).join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `karate-report-${month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const COLORS = ["#c0392b","#e74c3c","#f39c12","#2ecc71","#3498db","#9b59b6","#1abc9c"];

  return (
    <div style={{ width: "100%", maxWidth: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem", width: "100%" }}>
        <div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#e8e8f0" }}>Reports</h2>
          <p style={{ color: "#8888aa", fontSize: "0.85rem", marginTop: "0.2rem" }}>Monthly attendance and fee analytics</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          <input 
            type="month" 
            value={month} 
            onChange={e => setMonth(e.target.value)} 
            onClick={(e) => {
              try {
                e.currentTarget.showPicker();
              } catch {}
            }}
            className="input-dojo" 
            style={{ width: "auto", cursor: "pointer", fontWeight: 600 }} 
          />
          <button onClick={exportCSV} className="btn-ghost"><Download size={15} />Export CSV</button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", width: "100%" }}>
          {[...Array(2)].map((_,i) => <div key={i} className="skeleton" style={{ height: 340, borderRadius: 16 }} />)}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.25rem", width: "100%" }}>
          {/* Attendance Chart */}
          <div className="glass" style={{ borderRadius: 16, padding: "1.5rem", width: "100%" }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", color: "#e8e8f0", marginBottom: "1.25rem" }}>Attendance % by Student</h3>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <XAxis 
                  dataKey="name" 
                  interval={0} 
                  tick={{ fill: "#8888aa", fontSize: 11 }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis tick={{ fill: "#8888aa", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                <Tooltip
                  contentStyle={{ background: "#1a1a26", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: 10, color: "#ffffff" }}
                  itemStyle={{ color: "#ffffff", fontWeight: 600 }}
                  labelStyle={{ color: "#ffffff", fontWeight: 700, marginBottom: "0.25rem" }}
                  formatter={(v: any) => [`${v}%`, "Attendance"]}
                />
                <Bar dataKey="pct" radius={[6, 6, 0, 0]}>
                  {attendanceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Fee Pie Chart */}
          <div className="glass" style={{ borderRadius: 16, padding: "1.5rem", width: "100%" }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", color: "#e8e8f0", marginBottom: "1.25rem" }}>Fee Collection Status</h3>
            {feeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie data={feeData} cx="50%" cy="50%" innerRadius={75} outerRadius={120} paddingAngle={4} dataKey="value">
                    {feeData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: "#1a1a26", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, color: "#ffffff" }} 
                    itemStyle={{ color: "#ffffff", fontWeight: 600 }}
                    labelStyle={{ color: "#ffffff", fontWeight: 700 }}
                  />
                  <Legend wrapperStyle={{ color: "#8888aa", fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 320, display: "flex", alignItems: "center", justifyContent: "center", color: "#8888aa" }}>No fee data for this month</div>
            )}
          </div>

          {/* Detailed Table */}
          <div className="glass" style={{ borderRadius: 16, padding: "1.5rem", gridColumn: "1 / -1", width: "100%", maxWidth: "100%", overflow: "hidden" }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", color: "#e8e8f0", marginBottom: "1.25rem" }}>Student Summary</h3>
            <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", width: "100%", maxWidth: "100%" }}>
              <table className="dojo-table" style={{ width: "100%", minWidth: 600 }}>
                <thead>
                  <tr><th>Student</th><th>Present</th><th>Total</th><th>Attendance %</th><th>Fee Status</th><th>Paid</th></tr>
                </thead>
                <tbody>
                  {students.map(s => {
                    const monthRecords = s.attendance.filter(a => a.date.startsWith(month));
                    const total = monthRecords.length;
                    const present = monthRecords.filter(a => a.present).length;
                    const pct = total ? Math.round((present / total) * 100) : 0;
                    const fee = s.fees.find(f => f.month === month);
                    return (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 600, color: "#e8e8f0" }}>{s.name}</td>
                        <td style={{ color: "#2ecc71" }}>{present}</td>
                        <td style={{ color: "#8888aa" }}>{total}</td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <div style={{ width: 60, height: 5, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${pct}%`, background: pct >= 75 ? "#27ae60" : pct >= 50 ? "#f39c12" : "#c0392b", borderRadius: 3 }} />
                            </div>
                            <span style={{ color: pct >= 75 ? "#2ecc71" : pct >= 50 ? "#f39c12" : "#e74c3c", fontWeight: 600, fontSize: "0.85rem" }}>{pct}%</span>
                          </div>
                        </td>
                        <td>{fee ? <span className={`fee-${fee.status.toLowerCase()}`} style={{ fontSize: "0.72rem", fontWeight: 700, padding: "0.18rem 0.55rem", borderRadius: 50, display: "inline-block" }}>{fee.status}</span> : <span style={{ color: "#8888aa" }}>—</span>}</td>
                        <td style={{ color: fee?.status === "PAID" ? "#2ecc71" : "#8888aa" }}>₹{fee?.amountPaid || 0}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
