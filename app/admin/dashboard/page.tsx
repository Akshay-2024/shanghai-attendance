"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import AttendanceTab from "@/components/admin/AttendanceTab";
import StudentsTab from "@/components/admin/StudentsTab";
import FeesTab from "@/components/admin/FeesTab";
import ReportsTab from "@/components/admin/ReportsTab";
import AuditTab from "@/components/admin/AuditTab";

function DashboardContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "attendance";

  return (
    <div className="animate-fade-in">
      {tab === "attendance" && <AttendanceTab />}
      {tab === "students" && <StudentsTab />}
      {tab === "fees" && <FeesTab />}
      {tab === "reports" && <ReportsTab />}
      {tab === "audit" && <AuditTab />}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div style={{ color: "#8888aa", padding: "2rem" }}>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
