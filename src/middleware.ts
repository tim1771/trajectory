import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Dashboard/auth/API behavior is handled in client components and route
  // handlers. Running Supabase session refresh middleware on every dashboard
  // navigation makes local/demo users wait on a paused or stale Supabase
  // project, which can turn sidebar clicks into 20-second stalls.
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Only keep Supabase cookie refresh around the OAuth callback path where the
  // server-side session exchange may need cookie plumbing.
  if (pathname.startsWith("/auth/callback")) {
    return await updateSession(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$).*)",
  ],
};
