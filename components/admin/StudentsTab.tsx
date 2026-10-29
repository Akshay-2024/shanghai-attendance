"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { Plus, Pencil, Trash2, X, Save, UserCheck, Upload, Image as ImageIcon, Loader2 } from "lucide-react";

interface Student {
  id: string; name: string; belt: string; dob: string | null;
  phone: string | null; photoUrl: string | null; monthlyFee: number;
  joinedOn: string; active: boolean;
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
  const [modal, setModal] = useState<"add"|"edit"|null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string|null>(null);
  const [deleteId, setDeleteId] = useState<string|null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string|null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const r = await fetch("/api/students");
    const data = await r.json();
    setStudents(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openAdd() {
    setForm({ ...emptyForm, joinedOn: new Date().toISOString().split("T")[0] });
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
    if (modal === "add") {
      await fetch("/api/students", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    } else {
      await fetch(`/api/students/${editId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    }
    setSaving(false); setModal(null); load();
  }

  async function confirmDelete() {
    if (!deleteId) return;
    await fetch(`/api/students/${deleteId}`, { method: "DELETE" });
    setDeleteId(null); load();
  }

  const displayed = students.filter(s => showInactive ? true : s.active);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#e8e8f0" }}>Manage Students</h2>
          <p style={{ color: "#8888aa", fontSize: "0.85rem", marginTop: "0.2rem" }}>{students.length} total students</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#8888aa", fontSize: "0.82rem", cursor: "pointer" }}>
            <input type="checkbox" checked={showInactive} onChange={e => setShowInactive(e.target.checked)} style={{ accentColor: "#c0392b" }} />
            Show inactive
          </label>
          <button className="btn-primary" onClick={openAdd}><Plus size={16} />Add Student</button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {[...Array(6)].map((_,i) => <div key={i} className="skeleton" style={{ height: 64, borderRadius: 12 }} />)}
        </div>
      ) : (
        <div className="glass" style={{ borderRadius: 16, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="dojo-table">
              <thead>
                <tr>
                  <th>Student</th><th>Belt</th><th>Phone</th><th>Monthly Fee</th><th>Joined</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map(s => (
                  <tr key={s.id} style={{ opacity: s.active ? 1 : 0.4 }}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <StudentAvatar name={s.name} photoUrl={s.photoUrl} size={38} />
                        <span style={{ fontWeight: 600, color: "#e8e8f0" }}>{s.name}</span>
                      </div>
                    </td>
                    <td><span className={BELT_CLASS[s.belt] || "belt-white"} style={{ fontSize: "0.7rem", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: 50, textTransform: "uppercase", letterSpacing: "0.05em" }}>{BELT_LABELS[s.belt] || s.belt}</span></td>
                    <td style={{ color: "#8888aa" }}>{s.phone || "—"}</td>
                    <td style={{ color: "#f39c12", fontWeight: 600 }}>₹{s.monthlyFee}</td>
                    <td style={{ color: "#8888aa" }}>{new Date(s.joinedOn).toLocaleDateString("en-IN", { year: "numeric", month: "short" })}</td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button onClick={() => openEdit(s)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#e8e8f0", padding: "0.35rem 0.75rem", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8rem" }}><Pencil size={13} />Edit</button>
                        {s.active && <button onClick={() => setDeleteId(s.id)} style={{ background: "rgba(192,57,43,0.1)", border: "1px solid rgba(192,57,43,0.2)", color: "#e74c3c", padding: "0.35rem 0.75rem", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8rem" }}><Trash2 size={13} />Delete</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal-box" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h3 style={{ fontWeight: 800, fontSize: "1.1rem", color: "#e8e8f0" }}>{modal === "add" ? "Add New Student" : "Edit Student"}</h3>
              <button onClick={() => setModal(null)} style={{ background: "none", border: "none", color: "#8888aa", cursor: "pointer" }}><X size={20} /></button>
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

              {/* Text Fields */}
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#8888aa", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>Full Name *</label>
                <input className="input-dojo" placeholder="Arjun Sharma" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#8888aa", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>Phone</label>
                  <input className="input-dojo" placeholder="9876543210" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#8888aa", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>Date of Birth</label>
                  <input className="input-dojo" type="date" value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
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
              <button onClick={() => setModal(null)} className="btn-ghost" style={{ flex: 1, justifyContent: "center" }}>Cancel</button>
              <button onClick={saveStudent} className="btn-primary" style={{ flex: 1, justifyContent: "center" }} disabled={saving || uploading || !form.name.trim()}>
                {saving ? "Saving..." : <><Save size={15} />{modal === "add" ? "Add Student" : "Save Changes"}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="modal-backdrop" onClick={() => setDeleteId(null)}>
          <div className="modal-box" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(192,57,43,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}><Trash2 size={22} color="#e74c3c" /></div>
              <h3 style={{ fontWeight: 800, fontSize: "1.1rem", color: "#e8e8f0", marginBottom: "0.5rem" }}>Remove Student?</h3>
              <p style={{ color: "#8888aa", fontSize: "0.85rem" }}>
                <strong style={{ color: "#e8e8f0" }}>{students.find(s => s.id === deleteId)?.name}</strong> will be deactivated. Their records will be preserved.
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={() => setDeleteId(null)} className="btn-ghost" style={{ flex: 1, justifyContent: "center" }}>Cancel</button>
              <button onClick={confirmDelete} style={{ flex: 1, justifyContent: "center", background: "linear-gradient(135deg,#c0392b,#96281b)", color: "#fff", border: "none", borderRadius: 10, padding: "0.625rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <UserCheck size={15} />Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
