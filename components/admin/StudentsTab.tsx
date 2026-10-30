"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { 
  Plus, Pencil, Trash2, X, Save, UserCheck, UserMinus, UserX, 
  RotateCcw, Upload, Image as ImageIcon, Loader2, Search, Users, AlertCircle, ShieldCheck 
} from "lucide-react";

interface Student {
  id: string;
  name: string;
  belt: string;
  dob: string | null;
  phone: string | null;
  photoUrl: string | null;
  monthlyFee: number;
  joinedOn: string;
  active: boolean;
}

const BELTS = [
  "WHITE",
  "YELLOW",
  "ORANGE",
  "GREEN",
  "BLUE",
  "MAROON",
  "BROWN_IV",
  "BROWN_III",
  "BROWN_II",
  "BROWN",
  "BLACK",
];

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

const emptyForm = {
  name: "",
  belt: "WHITE",
  dob: "",
  phone: "",
  photoUrl: "",
  monthlyFee: "",
  joinedOn: new Date().toISOString().split("T")[0],
  active: true,
};

function StudentAvatar({ name, photoUrl, size = 36 }: { name: string; photoUrl?: string | null; size?: number }) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid rgba(255,255,255,0.15)" }}
      />
    );
  }
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "linear-gradient(135deg,#c0392b,#96281b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.38, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
      {initials}
    </div>
  );
}

export default function StudentsTab() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [isSensei, setIsSensei] = useState(false);
  
  // Status filter: "ACTIVE" (In Class), "LEFT" (Left Class), or "ALL"
  const [statusFilter, setStatusFilter] = useState<"ACTIVE" | "LEFT" | "ALL">("ACTIVE");
  const [search, setSearch] = useState("");
  const [beltFilter, setBeltFilter] = useState("ALL");

  // Status toggle confirmation modal
  const [statusModal, setStatusModal] = useState<{ student: Student; action: "leave" | "re-enroll" } | null>(null);
  
  // Sensei Permanent Delete Modal
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [saving, setSaving] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/students?includeInactive=true");
      const data = await r.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load students", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    load(); 
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(data => {
        if (data.isSensei || data.user?.name === "sensei") {
          setIsSensei(true);
        }
      })
      .catch(console.error);
  }, [load]);

  function openAdd() {
    setForm({ 
      ...emptyForm, 
      joinedOn: new Date().toISOString().split("T")[0],
      active: true 
    });
    setUploadError(null);
    setModal("add");
  }

  function openEdit(s: Student) {
    setForm({
      name: s.name,
      belt: s.belt,
      dob: s.dob || "",
      phone: s.phone || "",
      photoUrl: s.photoUrl || "",
      monthlyFee: String(s.monthlyFee),
      joinedOn: s.joinedOn ? s.joinedOn.split("T")[0] : new Date().toISOString().split("T")[0],
      active: s.active,
    });
    setUploadError(null);
    setEditId(s.id);
    setModal("edit");
  }

  async function handleImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image size must be less than 5MB.");
      return;
    }

    setUploadError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Failed to upload");
      }

      setForm(f => ({ ...f, photoUrl: data.url }));
    } catch (err: any) {
      setUploadError(err.message || "Upload failed. Try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removePhoto() {
    setForm(f => ({ ...f, photoUrl: "" }));
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function saveStudent() {
    setSaving(true);
    try {
      if (modal === "add") {
        await fetch("/api/students", { 
          method: "POST", 
          headers: { "Content-Type": "application/json" }, 
          body: JSON.stringify(form) 
        });
      } else {
        await fetch(`/api/students/${editId}`, { 
          method: "PUT", 
          headers: { "Content-Type": "application/json" }, 
          body: JSON.stringify(form) 
        });
      }
      setModal(null);
      await load();
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  }

  // Toggle student between In Class and Left Class
  async function confirmStatusChange() {
    if (!statusModal) return;
    setStatusSaving(true);
    const newActive = statusModal.action === "re-enroll";
    try {
      await fetch(`/api/students/${statusModal.student.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: newActive }),
      });
      setStatusModal(null);
      await load();
    } catch (err) {
      console.error("Status toggle error:", err);
    } finally {
      setStatusSaving(false);
    }
  }

  // Sensei Master Action: Permanent Delete Student & All Records
  async function confirmPermanentDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/students/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete student record");
        return;
      }
      setDeleteTarget(null);
      await load();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting student data");
    } finally {
      setDeleting(false);
    }
  }

  const activeCount = students.filter(s => s.active).length;
  const leftCount = students.filter(s => !s.active).length;
  const totalCount = students.length;

  const displayed = students.filter(s => {
    // Status Filter
    if (statusFilter === "ACTIVE" && !s.active) return false;
    if (statusFilter === "LEFT" && s.active) return false;

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchPhone = s.phone && s.phone.includes(q);
      if (!matchName && !matchPhone) return false;
    }

    // Belt Rank
    if (beltFilter !== "ALL" && s.belt !== beltFilter) return false;

    return true;
  });

  return (
    <div style={{ width: "100%", maxWidth: "100%" }}>
      {/* Page Title & Add Button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.85rem", marginBottom: "1.25rem", width: "100%" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#e8e8f0" }}>Manage Students</h2>
            {isSensei && (
              <span style={{ 
                background: "rgba(243,156,18,0.15)", 
                border: "1px solid rgba(243,156,18,0.35)", 
                color: "#f39c12", 
                fontSize: "0.7rem", 
                fontWeight: 700, 
                padding: "0.15rem 0.55rem", 
                borderRadius: 50, 
                display: "inline-flex", 
                alignItems: "center", 
                gap: "0.3rem" 
              }}>
                <ShieldCheck size={12} /> Sensei Master Mode
              </span>
            )}
          </div>
          <p style={{ color: "#8888aa", fontSize: "0.82rem", marginTop: "0.15rem" }}>
            Track active karateka in class and manage left / discontinued students
          </p>
        </div>
        <button 
          className="btn-primary" 
          onClick={openAdd} 
          style={{ padding: "0.55rem 1.15rem", fontSize: "0.85rem" }}
        >
          <Plus size={15} /> Add Student
        </button>
      </div>

      {/* Status Segmented Tabs (In Class vs Left Students vs All) */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <button
          onClick={() => setStatusFilter("ACTIVE")}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: 10,
            fontSize: "0.84rem",
            fontWeight: 700,
            cursor: "pointer",
            border: statusFilter === "ACTIVE" ? "1px solid rgba(46,204,113,0.5)" : "1px solid rgba(255,255,255,0.08)",
            background: statusFilter === "ACTIVE" ? "rgba(46,204,113,0.15)" : "rgba(255,255,255,0.03)",
            color: statusFilter === "ACTIVE" ? "#2ecc71" : "#8888aa",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.45rem",
            transition: "all 0.2s"
          }}
        >
          <UserCheck size={15} />
          <span>In Class ({activeCount})</span>
        </button>

        <button
          onClick={() => setStatusFilter("LEFT")}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: 10,
            fontSize: "0.84rem",
            fontWeight: 700,
            cursor: "pointer",
            border: statusFilter === "LEFT" ? "1px solid rgba(231,76,60,0.5)" : "1px solid rgba(255,255,255,0.08)",
            background: statusFilter === "LEFT" ? "rgba(192,57,43,0.2)" : "rgba(255,255,255,0.03)",
            color: statusFilter === "LEFT" ? "#f87171" : "#8888aa",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.45rem",
            transition: "all 0.2s"
          }}
        >
          <UserX size={15} />
          <span>Left Class ({leftCount})</span>
        </button>

        <button
          onClick={() => setStatusFilter("ALL")}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: 10,
            fontSize: "0.84rem",
            fontWeight: 700,
            cursor: "pointer",
            border: statusFilter === "ALL" ? "1px solid rgba(255,255,255,0.3)" : "1px solid rgba(255,255,255,0.08)",
            background: statusFilter === "ALL" ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.03)",
            color: statusFilter === "ALL" ? "#ffffff" : "#8888aa",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.45rem",
            transition: "all 0.2s"
          }}
        >
          <Users size={15} />
          <span>All Students ({totalCount})</span>
        </button>
      </div>

      {/* Search & Belt Filters */}
      <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#8888aa" }} />
          <input
            type="text"
            placeholder="Search by student name or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-dojo"
            style={{ width: "100%", paddingLeft: "2.3rem", height: 40, fontSize: "0.85rem" }}
          />
        </div>
        <select
          value={beltFilter}
          onChange={e => setBeltFilter(e.target.value)}
          className="input-dojo"
          style={{ width: "auto", minWidth: 140, height: 40, fontSize: "0.84rem", backgroundColor: "#141420", color: "#fff" }}
        >
          <option value="ALL">All Belts</option>
          {BELTS.map(b => (
            <option key={b} value={b}>{BELT_LABELS[b] || b} Belt</option>
          ))}
        </select>
      </div>

      {/* Info Banner when viewing Left Students */}
      {statusFilter === "LEFT" && (
        <div style={{ 
          background: "rgba(192,57,43,0.1)", 
          border: "1px solid rgba(192,57,43,0.25)", 
          borderRadius: 12, 
          padding: "0.75rem 1rem", 
          marginBottom: "1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          fontSize: "0.82rem",
          color: "#f87171"
        }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>
            These students have left the class or discontinued training. They are hidden from daily attendance sheets, but their complete training history & fees are preserved.
          </span>
        </div>
      )}

      {/* Student Table */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 64, borderRadius: 12 }} />)}
        </div>
      ) : displayed.length === 0 ? (
        <div className="glass" style={{ borderRadius: 16, padding: "3rem 1.5rem", textAlign: "center" }}>
          <Users size={36} color="#8888aa" style={{ margin: "0 auto 0.75rem", opacity: 0.6 }} />
          <h3 style={{ fontSize: "1.1rem", color: "#e8e8f0", fontWeight: 700 }}>
            {statusFilter === "LEFT" ? "No Left / Discontinued Students" : "No Students Found"}
          </h3>
          <p style={{ color: "#8888aa", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            {statusFilter === "LEFT" 
              ? "All enrolled karateka are currently active in class." 
              : "No students match the current search or filters."}
          </p>
        </div>
      ) : (
        <div className="glass" style={{ borderRadius: 16, overflow: "hidden", width: "100%", maxWidth: "100%" }}>
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", width: "100%", maxWidth: "100%" }}>
            <table className="dojo-table" style={{ minWidth: 680 }}>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Belt</th>
                  <th>Class Status</th>
                  <th>Phone</th>
                  <th>Monthly Fee</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map(s => (
                  <tr key={s.id} style={{ opacity: s.active ? 1 : 0.65, background: s.active ? "transparent" : "rgba(192,57,43,0.03)" }}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <StudentAvatar name={s.name} photoUrl={s.photoUrl} size={38} />
                        <div>
                          <span style={{ fontWeight: 600, color: "#e8e8f0", display: "block" }}>{s.name}</span>
                          {!s.active && (
                            <span style={{ fontSize: "0.68rem", color: "#f87171", fontWeight: 600 }}>Left Class</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={BELT_CLASS[s.belt] || "belt-white"} style={{ fontSize: "0.7rem", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: 50, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {BELT_LABELS[s.belt] || s.belt}
                      </span>
                    </td>
                    <td>
                      {s.active ? (
                        <span style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.35rem",
                          background: "rgba(46,204,113,0.12)",
                          color: "#2ecc71",
                          border: "1px solid rgba(46,204,113,0.28)",
                          padding: "0.2rem 0.6rem",
                          borderRadius: 50,
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          whiteSpace: "nowrap"
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2ecc71" }} />
                          In Class
                        </span>
                      ) : (
                        <span style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.35rem",
                          background: "rgba(231,76,60,0.14)",
                          color: "#f87171",
                          border: "1px solid rgba(231,76,60,0.3)",
                          padding: "0.2rem 0.6rem",
                          borderRadius: 50,
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          whiteSpace: "nowrap"
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#e74c3c" }} />
                          Left Class
                        </span>
                      )}
                    </td>
                    <td style={{ color: "#8888aa" }}>{s.phone || "—"}</td>
                    <td style={{ color: "#f39c12", fontWeight: 600 }}>₹{s.monthlyFee}</td>
                    <td style={{ color: "#8888aa" }}>
                      {new Date(s.joinedOn).toLocaleDateString("en-IN", { year: "numeric", month: "short" })}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
                        {/* Edit Button */}
                        <button 
                          onClick={() => openEdit(s)} 
                          style={{ 
                            background: "rgba(255,255,255,0.06)", 
                            border: "1px solid rgba(255,255,255,0.1)", 
                            color: "#e8e8f0", 
                            padding: "0.35rem 0.65rem", 
                            borderRadius: 8, 
                            cursor: "pointer", 
                            display: "inline-flex", 
                            alignItems: "center", 
                            gap: "0.35rem", 
                            fontSize: "0.78rem" 
                          }}
                        >
                          <Pencil size={12} /> Edit
                        </button>

                        {/* Active: Option to Mark as Left */}
                        {s.active ? (
                          <button 
                            onClick={() => setStatusModal({ student: s, action: "leave" })} 
                            style={{ 
                              background: "rgba(192,57,43,0.12)", 
                              border: "1px solid rgba(192,57,43,0.28)", 
                              color: "#e74c3c", 
                              padding: "0.35rem 0.65rem", 
                              borderRadius: 8, 
                              cursor: "pointer", 
                              display: "inline-flex", 
                              alignItems: "center", 
                              gap: "0.35rem", 
                              fontSize: "0.78rem",
                              fontWeight: 600
                            }}
                            title="Mark student as left class or discontinued"
                          >
                            <UserMinus size={13} /> Mark as Left
                          </button>
                        ) : (
                          /* Inactive: Option to Re-enroll / Re-admit */
                          <button 
                            onClick={() => setStatusModal({ student: s, action: "re-enroll" })} 
                            style={{ 
                              background: "rgba(46,204,113,0.14)", 
                              border: "1px solid rgba(46,204,113,0.32)", 
                              color: "#2ecc71", 
                              padding: "0.35rem 0.65rem", 
                              borderRadius: 8, 
                              cursor: "pointer", 
                              display: "inline-flex", 
                              alignItems: "center", 
                              gap: "0.35rem", 
                              fontSize: "0.78rem",
                              fontWeight: 600
                            }}
                            title="Re-enroll this student back to active training"
                          >
                            <RotateCcw size={12} /> Re-enroll
                          </button>
                        )}

                        {/* SENSEI MASTER PRIVILEGE: Permanent Delete Student Data */}
                        {isSensei && (
                          <button 
                            onClick={() => setDeleteTarget(s)} 
                            style={{ 
                              background: "rgba(192,57,43,0.18)", 
                              border: "1px solid rgba(192,57,43,0.4)", 
                              color: "#f87171", 
                              padding: "0.35rem 0.65rem", 
                              borderRadius: 8, 
                              cursor: "pointer", 
                              display: "inline-flex", 
                              alignItems: "center", 
                              gap: "0.35rem", 
                              fontSize: "0.78rem",
                              fontWeight: 700,
                              transition: "all 0.2s"
                            }}
                            title="Sensei Master Privilege: Permanently delete student and records"
                          >
                            <Trash2 size={12} color="#f87171" />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Student Modal */}
      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)} style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: "0.85rem" }}>
          <div className="modal-box" style={{ maxWidth: 460, width: "100%" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h3 style={{ fontWeight: 800, fontSize: "1.1rem", color: "#e8e8f0" }}>
                {modal === "add" ? "Add New Student" : "Edit Student Details"}
              </h3>
              <button onClick={() => setModal(null)} style={{ background: "none", border: "none", color: "#8888aa", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Photo Upload Section */}
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: "1rem", border: "1px dashed rgba(255,255,255,0.15)", display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ position: "relative" }}>
                  {form.photoUrl ? (
                    <img
                      src={form.photoUrl}
                      alt="Student preview"
                      style={{ width: 68, height: 68, borderRadius: "50%", objectFit: "cover", border: "2px solid #c0392b" }}
                    />
                  ) : (
                    <div style={{ width: 68, height: 68, borderRadius: "50%", background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", color: "#8888aa", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <ImageIcon size={28} />
                    </div>
                  )}
                  {uploading && (
                    <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Loader2 size={24} className="animate-spin" color="#e74c3c" />
                    </div>
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#e8e8f0", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.3rem" }}>
                    Student Photo
                  </label>
                  <p style={{ color: "#8888aa", fontSize: "0.75rem", marginBottom: "0.6rem" }}>
                    Upload image from device (JPG, PNG, WebP · Max 5MB)
                  </p>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageFileChange}
                      accept="image/*"
                      style={{ display: "none" }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      style={{
                        background: "rgba(192,57,43,0.15)",
                        border: "1px solid rgba(192,57,43,0.35)",
                        color: "#e74c3c",
                        padding: "0.35rem 0.8rem",
                        borderRadius: 8,
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                      }}
                    >
                      <Upload size={14} />
                      {uploading ? "Uploading..." : form.photoUrl ? "Change Photo" : "Upload Photo"}
                    </button>
                    {form.photoUrl && (
                      <button
                        type="button"
                        onClick={removePhoto}
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "#8888aa",
                          padding: "0.35rem 0.7rem",
                          borderRadius: 8,
                          fontSize: "0.8rem",
                          cursor: "pointer",
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {uploadError && (
                    <div style={{ color: "#e74c3c", fontSize: "0.75rem", marginTop: "0.4rem" }}>
                      {uploadError}
                    </div>
                  )}
                </div>
              </div>

              {/* Class Status Selector (In Class vs Left Class) */}
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#e8e8f0", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>
                  Class Enrollment Status
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, active: true }))}
                    style={{
                      padding: "0.6rem 0.5rem",
                      borderRadius: 10,
                      border: `1px solid ${form.active ? "#2ecc71" : "rgba(255,255,255,0.1)"}`,
                      background: form.active ? "rgba(46,204,113,0.15)" : "rgba(255,255,255,0.03)",
                      color: form.active ? "#2ecc71" : "#8888aa",
                      fontWeight: 700,
                      fontSize: "0.82rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.35rem"
                    }}
                  >
                    <UserCheck size={14} /> In Class (Active)
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, active: false }))}
                    style={{
                      padding: "0.6rem 0.5rem",
                      borderRadius: 10,
                      border: `1px solid ${!form.active ? "#e74c3c" : "rgba(255,255,255,0.1)"}`,
                      background: !form.active ? "rgba(192,57,43,0.18)" : "rgba(255,255,255,0.03)",
                      color: !form.active ? "#f87171" : "#8888aa",
                      fontWeight: 700,
                      fontSize: "0.82rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.35rem"
                    }}
                  >
                    <UserX size={14} /> Left Class
                  </button>
                </div>
              </div>

              {/* Text Fields */}
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#8888aa", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>Full Name *</label>
                <input className="input-dojo" placeholder="Arjun Sharma" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#8888aa", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>Phone</label>
                  <input className="input-dojo" placeholder="9876543210" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#8888aa", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>Date of Birth</label>
                  <input className="input-dojo" type="date" value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#8888aa", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>Joining Date *</label>
                  <input className="input-dojo" type="date" value={form.joinedOn} onChange={e => setForm(f => ({ ...f, joinedOn: e.target.value }))} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#8888aa", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>Monthly Fee (₹)</label>
                  <input className="input-dojo" type="number" placeholder="800" value={form.monthlyFee} onChange={e => setForm(f => ({ ...f, monthlyFee: e.target.value }))} />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#8888aa", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>Belt Rank</label>
                <select
                  className="input-dojo"
                  style={{
                    backgroundColor: "#161624",
                    color: "#ffffff",
                    border: "1px solid rgba(255,255,255,0.18)",
                    cursor: "pointer",
                  }}
                  value={form.belt}
                  onChange={e => setForm(f => ({ ...f, belt: e.target.value }))}
                >
                  {BELTS.map(b => (
                    <option
                      key={b}
                      value={b}
                      style={{
                        backgroundColor: "#181826",
                        color: "#ffffff",
                        padding: "10px 14px",
                      }}
                    >
                      {BELT_LABELS[b] || b} Belt
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
              <button onClick={() => setModal(null)} className="btn-ghost" style={{ flex: 1, justifyContent: "center" }}>
                Cancel
              </button>
              <button 
                onClick={saveStudent} 
                className="btn-primary" 
                style={{ flex: 1, justifyContent: "center" }} 
                disabled={saving || uploading || !form.name.trim()}
              >
                {saving ? "Saving..." : <><Save size={15} />{modal === "add" ? "Add Student" : "Save Changes"}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Marking as Left OR Re-enrolling */}
      {statusModal && (
        <div className="modal-backdrop" onClick={() => setStatusModal(null)} style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: "0.85rem" }}>
          <div className="modal-box" style={{ maxWidth: 420, width: "100%" }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <div style={{ 
                width: 54, 
                height: 54, 
                borderRadius: "50%", 
                background: statusModal.action === "leave" ? "rgba(192,57,43,0.15)" : "rgba(46,204,113,0.15)", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                margin: "0 auto 1rem" 
              }}>
                {statusModal.action === "leave" ? (
                  <UserMinus size={24} color="#e74c3c" />
                ) : (
                  <RotateCcw size={24} color="#2ecc71" />
                )}
              </div>

              <h3 style={{ fontWeight: 800, fontSize: "1.15rem", color: "#e8e8f0", marginBottom: "0.5rem" }}>
                {statusModal.action === "leave" ? "Mark Student as Left Class?" : "Re-enroll Student to Class?"}
              </h3>

              <p style={{ color: "#8888aa", fontSize: "0.85rem", lineHeight: 1.55 }}>
                {statusModal.action === "leave" ? (
                  <>
                    <strong style={{ color: "#e8e8f0" }}>{statusModal.student.name}</strong> will be moved to the <strong style={{ color: "#f87171" }}>Left Students</strong> list and removed from daily attendance sheets. All previous attendance history and fees remain safely kept.
                  </>
                ) : (
                  <>
                    <strong style={{ color: "#e8e8f0" }}>{statusModal.student.name}</strong> will be restored to active training status and will immediately reappear on daily attendance sheets.
                  </>
                )}
              </p>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button 
                onClick={() => setStatusModal(null)} 
                className="btn-ghost" 
                style={{ flex: 1, justifyContent: "center" }}
                disabled={statusSaving}
              >
                Cancel
              </button>
              
              <button 
                onClick={confirmStatusChange} 
                style={{ 
                  flex: 1, 
                  justifyContent: "center", 
                  background: statusModal.action === "leave" ? "linear-gradient(135deg,#c0392b,#96281b)" : "linear-gradient(135deg,#27ae60,#2ecc71)", 
                  color: "#fff", 
                  border: "none", 
                  borderRadius: 10, 
                  padding: "0.625rem", 
                  fontWeight: 700, 
                  fontSize: "0.85rem",
                  cursor: "pointer", 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "0.45rem",
                  boxShadow: statusModal.action === "leave" ? "0 4px 15px rgba(192,57,43,0.35)" : "0 4px 15px rgba(39,174,96,0.35)"
                }}
                disabled={statusSaving}
              >
                {statusSaving ? (
                  "Updating..."
                ) : statusModal.action === "leave" ? (
                  <><UserMinus size={15} /> Mark as Left</>
                ) : (
                  <><RotateCcw size={15} /> Re-enroll</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sensei Master Permanent Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="modal-backdrop" onClick={() => !deleting && setDeleteTarget(null)} style={{ position: "fixed", inset: 0, zIndex: 65, display: "flex", alignItems: "center", justifyContent: "center", padding: "0.85rem" }}>
          <div className="modal-box" style={{ maxWidth: 440, width: "100%", border: "1px solid rgba(192,57,43,0.4)" }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
              <div style={{ 
                width: 56, 
                height: 56, 
                borderRadius: "50%", 
                background: "rgba(192,57,43,0.18)", 
                border: "2px solid rgba(192,57,43,0.4)",
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                margin: "0 auto 1rem" 
              }}>
                <Trash2 size={26} color="#e74c3c" />
              </div>

              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", color: "#f39c12", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.35rem" }}>
                <ShieldCheck size={14} /> Sensei Master Action
              </div>

              <h3 style={{ fontWeight: 800, fontSize: "1.2rem", color: "#ffffff", marginBottom: "0.5rem" }}>
                Permanently Delete Student?
              </h3>

              <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "0.85rem", margin: "1rem 0", display: "flex", alignItems: "center", gap: "0.75rem", textAlign: "left" }}>
                <StudentAvatar name={deleteTarget.name} photoUrl={deleteTarget.photoUrl} size={42} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: "#ffffff", fontSize: "0.95rem" }}>{deleteTarget.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "#8888aa", marginTop: 2 }}>
                    {BELT_LABELS[deleteTarget.belt] || deleteTarget.belt} Belt · Joined {new Date(deleteTarget.joinedOn).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                  </div>
                </div>
              </div>

              <div style={{ 
                background: "rgba(192,57,43,0.12)", 
                border: "1px solid rgba(192,57,43,0.3)", 
                borderRadius: 10, 
                padding: "0.75rem 0.9rem", 
                textAlign: "left",
                fontSize: "0.8rem",
                color: "#fca5a5",
                lineHeight: 1.5
              }}>
                <strong>Warning:</strong> You are about to permanently erase <strong>{deleteTarget.name}</strong> from the database along with all past attendance logs and fee payment records. This action cannot be undone.
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button 
                onClick={() => setDeleteTarget(null)} 
                className="btn-ghost" 
                style={{ flex: 1, justifyContent: "center" }}
                disabled={deleting}
              >
                Cancel
              </button>
              
              <button 
                onClick={confirmPermanentDelete} 
                style={{ 
                  flex: 1, 
                  justifyContent: "center", 
                  background: "linear-gradient(135deg,#c0392b,#96281b)", 
                  color: "#fff", 
                  border: "none", 
                  borderRadius: 10, 
                  padding: "0.65rem", 
                  fontWeight: 700, 
                  fontSize: "0.85rem",
                  cursor: "pointer", 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "0.45rem",
                  boxShadow: "0 4px 18px rgba(192,57,43,0.45)"
                }}
                disabled={deleting}
              >
                <Trash2 size={14} />
                {deleting ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
