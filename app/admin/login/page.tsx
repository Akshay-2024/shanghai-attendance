"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, User, LogIn, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", { username, password, redirect: false });
    setLoading(false);
    if (res?.error) setError("Invalid username or password");
    else router.push("/admin/dashboard");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", position: "relative", overflow: "hidden" }}>
      {/* Background */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 30%, rgba(192,57,43,0.12) 0%, transparent 60%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "15%", left: "10%", width: 300, height: 300, background: "rgba(192,57,43,0.04)", borderRadius: "50%", filter: "blur(60px)" }} />
      <div style={{ position: "absolute", bottom: "15%", right: "10%", width: 250, height: 250, background: "rgba(243,156,18,0.04)", borderRadius: "50%", filter: "blur(60px)" }} />

      <div className="glass animate-slide-up" style={{ width: "100%", maxWidth: 420, borderRadius: 20, padding: "2.5rem", position: "relative" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <Image src="/logo.png" alt="Shanghai Karate" width={72} height={72} style={{ borderRadius: 14, marginBottom: "1rem", boxShadow: "0 0 30px rgba(192,57,43,0.3)" }} />
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#e8e8f0", letterSpacing: "-0.02em" }}>Admin Login</h1>
          <p style={{ color: "#8888aa", fontSize: "0.85rem", marginTop: "0.3rem" }}>Shanghai Karate Management</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#8888aa", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>Username</label>
            <div style={{ position: "relative" }}>
              <User size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#8888aa" }} />
              <input className="input-dojo" style={{ paddingLeft: "2.3rem" }} placeholder="sensei" value={username} onChange={e => setUsername(e.target.value)} required autoComplete="username" />
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#8888aa", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#8888aa" }} />
              <input className="input-dojo" style={{ paddingLeft: "2.3rem" }} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
            </div>
          </div>

          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(192,57,43,0.12)", border: "1px solid rgba(192,57,43,0.25)", borderRadius: 10, padding: "0.75rem 1rem", color: "#e74c3c", fontSize: "0.85rem" }}>
              <AlertCircle size={15} />{error}
            </div>
          )}

          <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem", padding: "0.75rem" }} disabled={loading}>
            {loading ? <span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> : <><LogIn size={16} />Sign In</>}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.5rem", color: "#8888aa", fontSize: "0.78rem" }}>
          <a href="/" style={{ color: "#c0392b", textDecoration: "none" }}>← Back to student portal</a>
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
