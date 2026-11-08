import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isDashboardRoute = req.nextUrl.pathname.startsWith("/admin/dashboard");
  if (isDashboardRoute && !req.auth) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/dashboard/:path*", "/admin/dashboard"],
};
