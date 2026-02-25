import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const publicPaths = ["/auth", "/api/auth"];

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = publicPaths.some((p) => pathname.startsWith(p));

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const isAuthenticated = !!token;

  if (!isPublic && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    return NextResponse.redirect(url);
  }

  if (isPublic && isAuthenticated && pathname === "/auth") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
