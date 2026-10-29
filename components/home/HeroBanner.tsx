// HeroBanner component for the premium homepage
"use client";
import Image from "next/image";
import { Users, Calendar, Trophy } from "lucide-react";

interface Props {
  studentCount: number;
}

export default function HeroBanner({ studentCount }: Props) {
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return (
    <div style={{ position: "relative", padding: "5rem 1.5rem 3rem", textAlign: "center", overflow: "hidden" }}>
      {/* Background gradients */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(192,57,43,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 600,
          height: 600,
          background: "radial-gradient(ellipse, rgba(192,57,43,0.08) 0%, transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Active badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "rgba(192,57,43,0.12)",
            border: "1px solid rgba(192,57,43,0.25)",
            borderRadius: 50,
            padding: "0.35rem 1rem",
            marginBottom: "1.5rem",
            fontSize: "0.8rem",
            color: "#e74c3c",
          }}
        >
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#e74c3c", animation: "pulse 2s infinite" }} />
          Active Dojo
        </div>
        <h1
          style={{
            fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
            fontWeight: 800,
            color: "#e8e8f0",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            marginBottom: "1rem",
          }}
        >
          Shanghai Karate<br />
          <span
            style={{
              background: "linear-gradient(135deg,#c0392b,#f39c12)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Student Portal
          </span>
        </h1>
        <p
          style={{
            color: "#8888aa",
            fontSize: "1.05rem",
            maxWidth: 500,
            margin: "0 auto 2.5rem",
          }}
        >
          Track attendance and belt progress for every member of our dojo.
        </p>
        {/* Stats */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "2rem",
            flexWrap: "wrap",
            marginBottom: "2rem",
          }}
        >
          {[
            { icon: <Users size={18} />, label: "Students", value: studentCount },
            { icon: <Calendar size={18} />, label: "Classes Today", value: "Active" },
            { icon: <Trophy size={18} />, label: "Belt Levels", value: 11 },
          ].map((stat) => (
            <div key={stat.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#c0392b" }}>{stat.icon}</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#e8e8f0" }}>{stat.value}</div>
              <div style={{ fontSize: "0.75rem", color: "#8888aa", textTransform: "uppercase", letterSpacing: "0.08em" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
