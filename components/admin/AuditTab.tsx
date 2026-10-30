"use client";
import { useEffect, useState, useCallback } from "react";
import { ShieldCheck, Clock, UserCheck, RefreshCw, Download, Laptop, History, Activity, AlertTriangle } from "lucide-react";

interface LoginRecord {
  id: string;
  username: string;
  loginTime: string;
  ipAddress: string | null;
  userAgent: string | null;
}

interface ActivityRecord {
  id: string;
  username: string;
  action: string;
  details: string;
  ipAddress: string | null;
  createdAt: string;
}

interface AdminRecord {
  id: string;
  username: string;
  createdAt: string;
}

export default function AuditTab() {
  const [loginLogs, setLoginLogs] = useState<LoginRecord[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityRecord[]>([]);
  const [admins, setAdmins] = useState<AdminRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"logins" | "activities">("logins");
  const [filterUser, setFilterUser] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setUnauthorized(false);
    try {
      const res = await fetch("/api/admin/audit");
      if (res.status === 403) {
        setUnauthorized(true);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setLoginLogs(data.loginLogs || []);
      setActivityLogs(data.activityLogs || []);
      setAdmins(data.admins || []);
    } catch (err) {
      console.error("Failed to load audit logs", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (unauthorized) {
    return (
      <div className="glass" style={{ borderRadius: 16, padding: "3rem 1.5rem", textAlign: "center", maxWidth: 600, margin: "2rem auto" }}>
        <AlertTriangle size={48} color="#e74c3c" style={{ margin: "0 auto 1rem" }} />
        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#e8e8f0", marginBottom: "0.5rem" }}>
          Access Restricted
        </h2>
        <p style={{ color: "#8888aa", fontSize: "0.9rem" }}>
          Only master administrator (<strong style={{ color: "#e74c3c" }}>sensei</strong>) is authorized to view login history and system changes.
        </p>
      </div>
    );
  }

  // Filter logins
  const filteredLogins = loginLogs.filter(log => {
    const matchesUser = filterUser === "ALL" || log.username === filterUser;
    const matchesSearch =
      log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.ipAddress && log.ipAddress.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.userAgent && log.userAgent.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesUser && matchesSearch;
  });

  // Filter activities
  const filteredActivities = activityLogs.filter(act => {
    const matchesUser = filterUser === "ALL" || act.username === filterUser;
    const matchesSearch =
      act.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.details.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesUser && matchesSearch;
  });

  function exportCSV() {
    if (activeSubTab === "logins") {
      const rows = [["Username", "Login Date & Time", "IP Address", "Browser / Device"]];
      filteredLogins.forEach(l => {
        rows.push([
          l.username,
          new Date(l.loginTime).toLocaleString("en-IN"),
          l.ipAddress || "Unknown",
          (l.userAgent || "Unknown").replace(/,/g, " "),
        ]);
      });
      const csv = rows.map(r => r.join(",")).join("\n");
      const a = document.createElement("a");
      a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
      a.download = `shanghai-karate-login-audit-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
    } else {
      const rows = [["User", "Action", "Details", "Date & Time", "IP Address"]];
      filteredActivities.forEach(act => {
        rows.push([
          act.username,
          act.action,
          `"${act.details.replace(/"/g, '""')}"`,
          new Date(act.createdAt).toLocaleString("en-IN"),
          act.ipAddress || "Unknown",
        ]);
      });
      const csv = rows.map(r => r.join(",")).join("\n");
      const a = document.createElement("a");
      a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
      a.download = `shanghai-karate-activity-audit-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
    }
  }

  function parseDevice(ua: string | null) {
    if (!ua) return "Unknown Device";
    if (ua.includes("Windows")) return "Windows PC";
    if (ua.includes("iPhone")) return "Apple iPhone";
    if (ua.includes("iPad")) return "Apple iPad";
    if (ua.includes("Android")) return "Android Device";
    if (ua.includes("Mac")) return "macOS Device";
    if (ua.includes("Linux")) return "Linux Device";
    return "Web Browser";
  }

  return (
    <div style={{ width: "100%", maxWidth: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#e8e8f0" }}>Master Audit & Activity Log</h2>
            <span style={{ background: "rgba(192,57,43,0.2)", border: "1px solid rgba(192,57,43,0.4)", color: "#e74c3c", fontSize: "0.7rem", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: 50, display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
              <ShieldCheck size={12} /> Sensei Only
            </span>
          </div>
          <p style={{ color: "#8888aa", fontSize: "0.85rem", marginTop: "0.2rem" }}>
            Track login timestamps, IP addresses, devices, and all system changes made by any user.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          <button onClick={loadData} className="btn-ghost" style={{ fontSize: "0.82rem" }} title="Refresh logs">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button onClick={exportCSV} className="btn-ghost" style={{ fontSize: "0.82rem" }}>
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        <div className="glass" style={{ borderRadius: 14, padding: "1.1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#8888aa", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>
            <History size={14} color="#e74c3c" /> Total Logins
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#e8e8f0" }}>{loginLogs.length}</div>
          <div style={{ fontSize: "0.75rem", color: "#8888aa", marginTop: "0.2rem" }}>Across all administrators</div>
        </div>

        <div className="glass" style={{ borderRadius: 14, padding: "1.1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#8888aa", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>
            <Activity size={14} color="#f39c12" /> System Changes
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#f39c12" }}>{activityLogs.length}</div>
          <div style={{ fontSize: "0.75rem", color: "#8888aa", marginTop: "0.2rem" }}>Modifications logged</div>
        </div>

        <div className="glass" style={{ borderRadius: 14, padding: "1.1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#8888aa", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>
            <UserCheck size={14} color="#2ecc71" /> Registered Admins
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#2ecc71" }}>{admins.length}</div>
          <div style={{ fontSize: "0.75rem", color: "#8888aa", marginTop: "0.2rem" }}>{admins.map(a => a.username).join(", ")}</div>
        </div>

        <div className="glass" style={{ borderRadius: 14, padding: "1.1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#8888aa", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>
            <Clock size={14} color="#3498db" /> Last Login
          </div>
          <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#e8e8f0" }}>
            {loginLogs[0] ? new Date(loginLogs[0].loginTime).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "None"}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#8888aa", marginTop: "0.2rem" }}>By {loginLogs[0]?.username || "—"}</div>
        </div>
      </div>

      {/* Tabs & Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.25rem" }}>
        {/* Sub-tab pills */}
        <div style={{ display: "flex", gap: "0.5rem", background: "rgba(255,255,255,0.04)", padding: "0.3rem", borderRadius: 12 }}>
          <button
            onClick={() => setActiveSubTab("logins")}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.85rem",
              background: activeSubTab === "logins" ? "linear-gradient(135deg,#c0392b,#96281b)" : "transparent",
              color: activeSubTab === "logins" ? "#ffffff" : "#8888aa",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <History size={14} /> Logins ({loginLogs.length})
          </button>
          <button
            onClick={() => setActiveSubTab("activities")}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.85rem",
              background: activeSubTab === "activities" ? "linear-gradient(135deg,#c0392b,#96281b)" : "transparent",
              color: activeSubTab === "activities" ? "#ffffff" : "#8888aa",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <Activity size={14} /> Changes & Activity ({activityLogs.length})
          </button>
        </div>

        {/* Filter controls */}
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          <select
            className="input-dojo"
            style={{ width: "auto", minWidth: 130, padding: "0.5rem 0.8rem", fontSize: "0.82rem" }}
            value={filterUser}
            onChange={e => setFilterUser(e.target.value)}
          >
            <option value="ALL">All Users</option>
            {admins.map(a => <option key={a.id} value={a.username}>{a.username}</option>)}
          </select>

          <input
            className="input-dojo"
            placeholder="Search details / IP..."
            style={{ width: "auto", minWidth: 180, padding: "0.5rem 0.8rem", fontSize: "0.82rem" }}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table Content */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 56, borderRadius: 10 }} />)}
        </div>
      ) : activeSubTab === "logins" ? (
        /* Login History Table */
        <div className="glass" style={{ borderRadius: 16, overflow: "hidden", width: "100%", maxWidth: "100%" }}>
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", width: "100%", maxWidth: "100%" }}>
            <table className="dojo-table" style={{ minWidth: 600 }}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Date & Time</th>
                  <th>IP Address</th>
                  <th>Device / Browser</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogins.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", color: "#8888aa", padding: "2rem" }}>
                      No login records found matching criteria
                    </td>
                  </tr>
                ) : (
                  filteredLogins.map(log => (
                    <tr key={log.id}>
                      <td>
                        <span
                          style={{
                            fontWeight: 700,
                            padding: "0.25rem 0.65rem",
                            borderRadius: 6,
                            fontSize: "0.8rem",
                            background: log.username === "sensei" ? "rgba(192,57,43,0.18)" : "rgba(52,152,219,0.18)",
                            color: log.username === "sensei" ? "#e74c3c" : "#3498db",
                            border: `1px solid ${log.username === "sensei" ? "rgba(192,57,43,0.3)" : "rgba(52,152,219,0.3)"}`,
                          }}
                        >
                          {log.username}
                        </span>
                      </td>
                      <td style={{ color: "#e8e8f0", fontWeight: 600 }}>
                        {new Date(log.loginTime).toLocaleString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>
                      <td style={{ color: "#8888aa", fontFamily: "monospace", fontSize: "0.82rem" }}>
                        {log.ipAddress || "—"}
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#8888aa", fontSize: "0.82rem" }}>
                          <Laptop size={14} color="#8888aa" />
                          <span>{parseDevice(log.userAgent)}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ color: "#2ecc71", fontSize: "0.75rem", fontWeight: 700, background: "rgba(39,174,96,0.12)", border: "1px solid rgba(39,174,96,0.25)", padding: "0.2rem 0.6rem", borderRadius: 50 }}>
                          ✓ Successful Login
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Activity & Changes Table */
        <div className="glass" style={{ borderRadius: 16, overflow: "hidden", width: "100%", maxWidth: "100%" }}>
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", width: "100%", maxWidth: "100%" }}>
            <table className="dojo-table" style={{ minWidth: 640 }}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Action Type</th>
                  <th>Description & Changes</th>
                  <th>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivities.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", color: "#8888aa", padding: "2rem" }}>
                      No activity changes recorded yet
                    </td>
                  </tr>
                ) : (
                  filteredActivities.map(act => (
                    <tr key={act.id}>
                      <td>
                        <span
                          style={{
                            fontWeight: 700,
                            padding: "0.25rem 0.65rem",
                            borderRadius: 6,
                            fontSize: "0.8rem",
                            background: act.username === "sensei" ? "rgba(192,57,43,0.18)" : "rgba(52,152,219,0.18)",
                            color: act.username === "sensei" ? "#e74c3c" : "#3498db",
                            border: `1px solid ${act.username === "sensei" ? "rgba(192,57,43,0.3)" : "rgba(52,152,219,0.3)"}`,
                          }}
                        >
                          {act.username}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            padding: "0.2rem 0.6rem",
                            borderRadius: 50,
                            display: "inline-block",
                            background:
                              act.action === "FEE_PAYMENT"
                                ? "rgba(46,204,113,0.15)"
                                : act.action === "MARK_ATTENDANCE"
                                ? "rgba(243,156,18,0.15)"
                                : act.action === "ADD_STUDENT"
                                ? "rgba(52,152,219,0.15)"
                                : "rgba(255,255,255,0.06)",
                            color:
                              act.action === "FEE_PAYMENT"
                                ? "#2ecc71"
                                : act.action === "MARK_ATTENDANCE"
                                ? "#f39c12"
                                : act.action === "ADD_STUDENT"
                                ? "#3498db"
                                : "#e8e8f0",
                            border: `1px solid ${
                              act.action === "FEE_PAYMENT"
                                ? "rgba(46,204,113,0.3)"
                                : act.action === "MARK_ATTENDANCE"
                                ? "rgba(243,156,18,0.3)"
                                : act.action === "ADD_STUDENT"
                                ? "rgba(52,152,219,0.3)"
                                : "rgba(255,255,255,0.1)"
                            }`,
                          }}
                        >
                          {act.action.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td style={{ color: "#e8e8f0", fontSize: "0.85rem", maxWidth: 400 }}>
                        {act.details}
                      </td>
                      <td style={{ color: "#8888aa", fontSize: "0.82rem", whiteSpace: "nowrap" }}>
                        {new Date(act.createdAt).toLocaleString("en-IN", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
