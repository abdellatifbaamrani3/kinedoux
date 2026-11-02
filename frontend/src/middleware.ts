import { NextResponse, type NextRequest } from "next/server";

function hasPublicLocale(pathname: string) {
  return pathname === "/fr" || pathname.startsWith("/fr/") || pathname === "/en" || pathname.startsWith("/en/");
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/ar" || pathname.startsWith("/ar/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/ar/, "") || "/";
    return NextResponse.redirect(url);
  }

  if (hasPublicLocale(pathname)) return NextResponse.next();

  const cookie = request.cookies.get("kd-lang")?.value;
  if (cookie === "fr" || cookie === "en") {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? `/${cookie}` : `/${cookie}${pathname}`;
    return NextResponse.redirect(url);
  }

  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? "/ar" : `/ar${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|images/|api/|favicon.ico|icon.svg|.*\\..*).*)"],
};
