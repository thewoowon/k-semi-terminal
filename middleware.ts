import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { env, secretEquals } from "@/lib/env";

/**
 * Gate the internal admin surface (/admin/*) behind HTTP Basic Auth using
 * ADMIN_SECRET. This covers both page loads AND Server Action POSTs (they post
 * to the same /admin/* path), so a visitor who guesses the URL can't generate
 * reports, send mail, or edit prices. The browser caches the credentials and
 * replays them on subsequent action requests for the same origin.
 *
 * Username is ignored; the password must equal ADMIN_SECRET. If ADMIN_SECRET is
 * unset, access is denied (fail closed) rather than left open.
 */
function unauthorized(): NextResponse {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="K-Semi Admin", charset="UTF-8"',
    },
  });
}

export function middleware(req: NextRequest) {
  const header = req.headers.get("authorization") ?? "";
  if (!header.startsWith("Basic ")) return unauthorized();

  let password = "";
  try {
    const decoded = atob(header.slice(6)); // "user:password"
    password = decoded.slice(decoded.indexOf(":") + 1);
  } catch {
    return unauthorized();
  }

  if (!secretEquals(password, env.adminSecret)) return unauthorized();
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
