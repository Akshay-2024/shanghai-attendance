"use client";
import { useEffect, useState, useCallback } from "react";
import { X, Save, IndianRupee, CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface FeeRow {
  id: string; month: string; status: "PAID" | "UNPAID" | "PARTIAL";
  amountDue: number; amountPaid: number; paymentMethod: string | null;
  paidOn: string | null; remarks?: string | null;
  student: { id: string; name: string; belt: string; photoUrl: string | null; monthlyFee: number };
}

const METHODS = ["CASH", "UPI", "ONLINE"];
const BELT_CLASS: Record<string, string> = {
  WHITE: "belt-white", YELLOW: "belt-yellow", ORANGE: "belt-orange",
  GREEN: "belt-green", BLUE: "belt-blue", MAROON: "belt-maroon",
  BROWN_IV: "belt-brown-iv", BROWN_III: "belt-brown-iii", BROWN_II: "belt-brown-ii",
  BROWN: "belt-brown", BLACK: "belt-black",
};

const BELT_LABELS: Record<string, string> = {
  WHITE: "White", YELLOW: "Yellow", ORANGE: "Orange",
  GREEN: "Green", BLUE: "Blue", MAROON: "Maroon",
  BROWN_IV: "Brown IV", BROWN_III: "Brown III", BROWN_II: "Brown II",
  BROWN: "Brown", BLACK: "Black",
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

export default function FeesTab() {
  const currMonth = new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState(currMonth);
  const [fees, setFees] = useState<FeeRow[]>([]);
  const [summary, setSummary] = useState({ totalDue: 0, totalPaid: 0, outstanding: 0 });
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<FeeRow | null>(null);

  // Form states
  const [payType, setPayType] = useState<"FULL" | "PARTIAL" | "UNPAID">("FULL");
  const [amountPaidInput, setAmountPaidInput] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paidOn, setPaidOn] = useState(new Date().toISOString().split("T")[0]);
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (m: string) => {
    setLoading(true);
    const r = await fetch(`/api/fees?month=${m}`);
    const data = await r.json();
    setFees(data.fees || []);
    setSummary(data.summary || { totalDue: 0, totalPaid: 0, outstanding: 0 });
    setLoading(false);
  }, []);

  useEffect(() => { load(month); }, [month, load]);

  function openModal(fee: FeeRow) {
    setModal(fee);
    const totalDue = fee.amountDue || fee.student.monthlyFee;
    const currentPaid = fee.amountPaid || 0;

    if (fee.status === "PAID") {
      setPayType("FULL");
      setAmountPaidInput(String(totalDue));
    } else if (fee.status === "PARTIAL" || (currentPaid > 0 && currentPaid < totalDue)) {
      setPayType("PARTIAL");
      setAmountPaidInput(String(currentPaid));
    } else {
      // Default to full, but user can click Partial
      setPayType("FULL");
      setAmountPaidInput(String(totalDue));
    }

    setPaymentMethod(fee.paymentMethod || "CASH");
    setPaidOn(fee.paidOn ? fee.paidOn.split("T")[0] : new Date().toISOString().split("T")[0]);
    setRemarks(fee.remarks || "");
  }

  function handleTypeChange(type: "FULL" | "PARTIAL" | "UNPAID") {
    if (!modal) return;
    setPayType(type);
    const totalDue = modal.amountDue || modal.student.monthlyFee;
    if (type === "FULL") {
      setAmountPaidInput(String(totalDue));
    } else if (type === "UNPAID") {
      setAmountPaidInput("0");
    } else {
      // Partial: if was full or 0, suggest half or leave empty/current
      if (amountPaidInput === String(totalDue) || amountPaidInput === "0" || !amountPaidInput) {
        setAmountPaidInput(String(Math.round(totalDue / 2)));
      }
    }
  }

  // Calculate live numbers
  const currentTotalDue = modal ? (modal.amountDue || modal.student.monthlyFee) : 0;
  const numericPaid = parseFloat(amountPaidInput) || 0;
  const remainingBalance = Math.max(0, currentTotalDue - numericPaid);
  const computedStatus = numericPaid >= currentTotalDue ? "PAID" : numericPaid > 0 ? "PARTIAL" : "UNPAID";

  async function savePayment() {
    if (!modal) return;
    setSaving(true);
    await fetch(`/api/fees/${modal.student.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        month,
        status: computedStatus,
        amountDue: currentTotalDue,
        amountPaid: numericPaid,
        paymentMethod: computedStatus === "UNPAID" ? null : paymentMethod,
        paidOn: computedStatus === "UNPAID" ? null : paidOn,
        remarks: remarks.trim() || null,
      }),
    });
    setSaving(false);
    setModal(null);
    load(month);
  }

  const pctCollected = summary.totalDue ? Math.round((summary.totalPaid / summary.totalDue) * 100) : 0;

  return (
    <div style={{ width: "100%", maxWidth: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#e8e8f0" }}>Fee Management</h2>
          <p style={{ color: "#8888aa", fontSize: "0.85rem", marginTop: "0.2rem" }}>
            Track full, partial, and outstanding fee payments (Admin only)
          </p>
        </div>
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
      </div>

      {/* Summary Cards */}
      <div className="fee-summary-grid">
        {[
          { label: "Total Due", value: `₹${summary.totalDue.toLocaleString("en-IN")}`, color: "#8888aa" },
          { label: "Collected", value: `₹${summary.totalPaid.toLocaleString("en-IN")}`, color: "#2ecc71" },
          { label: "Outstanding", value: `₹${summary.outstanding.toLocaleString("en-IN")}`, color: "#e74c3c" },
          { label: "Collected %", value: `${pctCollected}%`, color: pctCollected >= 80 ? "#2ecc71" : "#f39c12" },
        ].map(card => (
          <div key={card.label} className="glass" style={{ borderRadius: 14, padding: "1rem", textAlign: "center" }}>
            <div style={{ fontSize: "0.68rem", color: "#8888aa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.35rem" }}>{card.label}</div>
            <div style={{ fontSize: "1.3rem", fontWeight: 800, color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Collection bar */}
      <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, marginBottom: "1.25rem", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pctCollected}%`, background: "linear-gradient(90deg,#27ae60,#2ecc71)", transition: "width 0.6s ease", borderRadius: 3 }} />
      </div>

      {/* Fees Table */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 56, borderRadius: 10 }} />)}
        </div>
      ) : (
        <div className="glass" style={{ borderRadius: 16, overflow: "hidden", width: "100%", maxWidth: "100%" }}>
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", width: "100%", maxWidth: "100%" }}>
            <table className="dojo-table" style={{ minWidth: 680 }}>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Total Fee</th>
                  <th>Amount Paid</th>
                  <th>Balance Due</th>
                  <th>Status</th>
                  <th>Method</th>
                  <th>Paid Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {fees.map(fee => {
                  const balance = Math.max(0, fee.amountDue - fee.amountPaid);
                  return (
                    <tr key={fee.id} style={{ background: fee.status === "UNPAID" ? "rgba(192,57,43,0.03)" : fee.status === "PARTIAL" ? "rgba(243,156,18,0.03)" : "transparent" }}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <StudentAvatar name={fee.student.name} photoUrl={fee.student.photoUrl} size={36} />
                          <div>
                            <div style={{ fontWeight: 600, color: "#e8e8f0" }}>{fee.student.name}</div>
                            <span className={BELT_CLASS[fee.student.belt] || "belt-white"} style={{ fontSize: "0.65rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: 50, textTransform: "uppercase" }}>
                              {BELT_LABELS[fee.student.belt] || fee.student.belt}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: "#8888aa", fontWeight: 600 }}>₹{fee.amountDue}</td>
                      <td style={{ color: fee.status === "PAID" ? "#2ecc71" : fee.status === "PARTIAL" ? "#f39c12" : "#8888aa", fontWeight: 700 }}>
                        ₹{fee.amountPaid}
                      </td>
                      <td style={{ color: balance > 0 ? "#e74c3c" : "#2ecc71", fontWeight: 600 }}>
                        {balance > 0 ? `₹${balance}` : "₹0 (Cleared)"}
                      </td>
                      <td>
                        <span className={`fee-${fee.status.toLowerCase()}`} style={{ fontSize: "0.72rem", fontWeight: 700, padding: "0.22rem 0.65rem", borderRadius: 50, display: "inline-block" }}>
                          {fee.status === "PARTIAL" ? "PARTIAL" : fee.status}
                        </span>
                      </td>
                      <td style={{ color: "#8888aa", textTransform: "capitalize", fontSize: "0.82rem" }}>
                        {fee.paymentMethod ? fee.paymentMethod.toLowerCase() : "—"}
                      </td>
                      <td style={{ color: "#8888aa", fontSize: "0.82rem" }}>
                        {fee.paidOn ? new Date(fee.paidOn).toLocaleDateString("en-IN") : "—"}
                      </td>
                      <td>
                        <button
                          onClick={() => openModal(fee)}
                          style={{
                            background: fee.status === "PAID"
                              ? "rgba(255,255,255,0.06)"
                              : fee.status === "PARTIAL"
                              ? "rgba(243,156,18,0.15)"
                              : "rgba(39,174,96,0.15)",
                            border: `1px solid ${
                              fee.status === "PAID"
                                ? "rgba(255,255,255,0.12)"
                                : fee.status === "PARTIAL"
                                ? "rgba(243,156,18,0.3)"
                                : "rgba(39,174,96,0.3)"
                            }`,
                            color: fee.status === "PAID"
                              ? "#8888aa"
                              : fee.status === "PARTIAL"
                              ? "#f39c12"
                              : "#2ecc71",
                            padding: "0.35rem 0.8rem",
                            borderRadius: 8,
                            cursor: "pointer",
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: "0.35rem",
                          }}
                        >
                          <IndianRupee size={12} />
                          {fee.status === "PAID" ? "Edit" : fee.status === "PARTIAL" ? `Pay Bal (₹${balance})` : "Record Pay"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Recording Modal with Partial Support */}
      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)} style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: "0.85rem" }}>
          <div className="modal-box" style={{ maxWidth: 460, width: "100%" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h3 style={{ fontWeight: 800, fontSize: "1.1rem", color: "#e8e8f0" }}>Record / Update Payment</h3>
              <button onClick={() => setModal(null)} style={{ background: "none", border: "none", color: "#8888aa", cursor: "pointer" }}><X size={20} /></button>
            </div>

            {/* Student Info Card */}
            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "0.9rem", display: "flex", alignItems: "center", gap: "0.85rem", marginBottom: "1.25rem" }}>
              <StudentAvatar name={modal.student.name} photoUrl={modal.student.photoUrl} size={44} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: "#e8e8f0", fontSize: "0.95rem" }}>{modal.student.name}</div>
                <div style={{ fontSize: "0.78rem", color: "#8888aa", marginTop: "0.15rem" }}>
                  {new Date(month + "-01").toLocaleDateString("en-IN", { month: "long", year: "numeric" })} · Total Fee: <strong style={{ color: "#f39c12" }}>₹{currentTotalDue}</strong>
                </div>
              </div>
            </div>

            {/* Payment Mode Selector: Full / Partial / Unpaid */}
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#8888aa", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>
                Payment Type
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => handleTypeChange("FULL")}
                  style={{
                    padding: "0.6rem 0.5rem",
                    borderRadius: 10,
                    border: `1px solid ${payType === "FULL" ? "#2ecc71" : "rgba(255,255,255,0.1)"}`,
                    background: payType === "FULL" ? "rgba(39,174,96,0.15)" : "rgba(255,255,255,0.03)",
                    color: payType === "FULL" ? "#2ecc71" : "#8888aa",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                >
                  ⚡ Full (₹{currentTotalDue})
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange("PARTIAL")}
                  style={{
                    padding: "0.6rem 0.5rem",
                    borderRadius: 10,
                    border: `1px solid ${payType === "PARTIAL" ? "#f39c12" : "rgba(255,255,255,0.1)"}`,
                    background: payType === "PARTIAL" ? "rgba(243,156,18,0.15)" : "rgba(255,255,255,0.03)",
                    color: payType === "PARTIAL" ? "#f39c12" : "#8888aa",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                >
                  ✂️ Partial Pay
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange("UNPAID")}
                  style={{
                    padding: "0.6rem 0.5rem",
                    borderRadius: 10,
                    border: `1px solid ${payType === "UNPAID" ? "#e74c3c" : "rgba(255,255,255,0.1)"}`,
                    background: payType === "UNPAID" ? "rgba(192,57,43,0.15)" : "rgba(255,255,255,0.03)",
                    color: payType === "UNPAID" ? "#e74c3c" : "#8888aa",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                >
                  ❌ Unpaid
                </button>
              </div>
            </div>

            {/* Amount input & breakdown */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#8888aa", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Amount Paid (₹)
                  </label>
                  {payType === "PARTIAL" && (
                    <span style={{ fontSize: "0.75rem", color: "#f39c12" }}>
                      e.g. Total {currentTotalDue}, Enter 500
                    </span>
                  )}
                </div>
                <input
                  className="input-dojo"
                  type="number"
                  value={amountPaidInput}
                  onChange={e => {
                    const val = e.target.value;
                    setAmountPaidInput(val);
                    const num = parseFloat(val) || 0;
                    if (num >= currentTotalDue) setPayType("FULL");
                    else if (num > 0) setPayType("PARTIAL");
                    else setPayType("UNPAID");
                  }}
                  placeholder={String(currentTotalDue)}
                />
              </div>

              {/* Live Status & Balance Breakdown Box */}
              <div
                style={{
                  background: computedStatus === "PAID"
                    ? "rgba(39,174,96,0.08)"
                    : computedStatus === "PARTIAL"
                    ? "rgba(243,156,18,0.08)"
                    : "rgba(192,57,43,0.08)",
                  border: `1px solid ${
                    computedStatus === "PAID"
                      ? "rgba(39,174,96,0.25)"
                      : computedStatus === "PARTIAL"
                      ? "rgba(243,156,18,0.25)"
                      : "rgba(192,57,43,0.25)"
                  }`,
                  borderRadius: 10,
                  padding: "0.85rem",
                  fontSize: "0.85rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                  <span style={{ color: "#8888aa" }}>Total Fee Due:</span>
                  <span style={{ fontWeight: 600, color: "#e8e8f0" }}>₹{currentTotalDue}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                  <span style={{ color: "#8888aa" }}>Amount Paying / Paid:</span>
                  <span style={{ fontWeight: 700, color: computedStatus === "PAID" ? "#2ecc71" : computedStatus === "PARTIAL" ? "#f39c12" : "#8888aa" }}>
                    ₹{numericPaid}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "0.3rem", borderTop: "1px dashed rgba(255,255,255,0.1)" }}>
                  <span style={{ color: "#8888aa", fontWeight: 600 }}>Balance Remaining:</span>
                  <span style={{ fontWeight: 800, color: remainingBalance > 0 ? "#e74c3c" : "#2ecc71" }}>
                    ₹{remainingBalance} {remainingBalance === 0 ? "✓ Cleared" : "Due"}
                  </span>
                </div>
              </div>

              {/* Payment Method */}
              {computedStatus !== "UNPAID" && (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#8888aa", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>
                      Payment Method
                    </label>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      {METHODS.map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setPaymentMethod(m)}
                          style={{
                            flex: 1,
                            padding: "0.55rem",
                            borderRadius: 10,
                            border: `1px solid ${paymentMethod === m ? "rgba(192,57,43,0.5)" : "rgba(255,255,255,0.1)"}`,
                            background: paymentMethod === m ? "rgba(192,57,43,0.15)" : "rgba(255,255,255,0.03)",
                            color: paymentMethod === m ? "#e74c3c" : "#8888aa",
                            fontWeight: 600,
                            fontSize: "0.82rem",
                            cursor: "pointer",
                          }}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#8888aa", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>
                      Payment Date
                    </label>
                    <input className="input-dojo" type="date" value={paidOn} onChange={e => setPaidOn(e.target.value)} />
                  </div>
                </>
              )}

              {/* Remarks/Notes */}
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#8888aa", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>
                  Notes / Remarks (Optional)
                </label>
                <input
                  className="input-dojo"
                  placeholder="e.g. Paid 500 cash, balance 300 to be paid on 15th"
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
              <button onClick={() => setModal(null)} className="btn-ghost" style={{ flex: 1, justifyContent: "center" }}>Cancel</button>
              <button onClick={savePayment} className="btn-primary" style={{ flex: 1, justifyContent: "center" }} disabled={saving}>
                {saving ? "Saving..." : <><Save size={15} />Save Payment</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
