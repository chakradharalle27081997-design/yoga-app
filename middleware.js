import { NextResponse } from "next/server";

export function middleware(request) {
  // Allow these paths without auth
  const publicPaths = ["/tester-access", "/admin", "/api/testers", "/api/admin"];
  const path = request.nextUrl.pathname;
  
  if (publicPaths.some(p => path.startsWith(p))) {
    return NextResponse.next();
  }
  
  return NextResponse.next();
}
