import { type NextRequest, NextResponse } from "next/server";

/**
 * TEMPORARY: middleware auth protection is disabled while we debug
 * the post-signin freeze. Re-enable the gating logic after the flow
 * is verified end-to-end.
 */
export async function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
