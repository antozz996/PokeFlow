// middleware.ts — Protezione rotte admin

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options: any }[]) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Proteggi /admin (tranne /admin/login)
  if (
    request.nextUrl.pathname.startsWith("/admin") &&
    !request.nextUrl.pathname.startsWith("/admin/login") &&
    !user
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    const redirectResponse = NextResponse.redirect(url);
    // Preserva i cookie eventualmente aggiornati dal middleware
    supabaseResponse.cookies.getAll().forEach((c) => {
      redirectResponse.cookies.set(c.name, c.value, { ...c } as any);
    });
    return redirectResponse;
  }

  // Se già loggato e va su /admin/login, redirect ad /admin
  if (request.nextUrl.pathname === "/admin/login" && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    const redirectResponse = NextResponse.redirect(url);
    // Preserva i cookie eventualmente aggiornati dal middleware
    supabaseResponse.cookies.getAll().forEach((c) => {
      redirectResponse.cookies.set(c.name, c.value, { ...c } as any);
    });
    return redirectResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*"],
};
