import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export default async function proxy(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

  if (!supabaseUrl || !supabaseKey) return NextResponse.next();

  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) { return request.cookies.get(name)?.value },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options })
        response = NextResponse.next({ request: { headers: request.headers } })
        response.cookies.set({ name, value, ...options })
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: '', ...options })
        response = NextResponse.next({ request: { headers: request.headers } })
        response.cookies.set({ name, value: '', ...options })
      },
    },
  })

  const { data: { user } } = await supabase.auth.getUser()

  console.log(`Middleware ejecutado para: ${request.nextUrl.pathname} | Usuario: ${user?.email || 'No autenticado'}`);

  // --- LÓGICA DE REDIRECCIÓN PARA SKILLSWAP ---
  if (user) {
    // 1. Consultar el perfil
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_complete')
      .eq('id', user.id)
      .maybeSingle(); // Usamos maybeSingle para evitar errores si el perfil no existe aún

    // DEBUG: Revisa tu terminal para ver este valor
    console.log(`Usuario: ${user.email} | Completo: ${profile?.is_complete} | Perfil existe: ${!!profile}`);

    const isComplete = profile?.is_complete === true;
    const isTryingProtected = request.nextUrl.pathname.startsWith('/protected');
    const isTryingOnboarding = request.nextUrl.pathname.startsWith('/auth/complete-profile');

    console.log(`isComplete: ${isComplete} | isTryingProtected: ${isTryingProtected} | isTryingOnboarding: ${isTryingOnboarding}`);

    // REGLA A: Si intenta ir al Dashboard pero NO está completo -> Al Formulario
    if (isTryingProtected && !isComplete) {
      console.log('Redirigiendo a /auth/complete-profile');
      return NextResponse.redirect(new URL('/auth/complete-profile', request.url));
    }

    // REGLA B: Si YA está completo pero intenta ir al Formulario -> Al Dashboard
    if (isTryingOnboarding && isComplete) {
      console.log('Redirigiendo a /protected');
      return NextResponse.redirect(new URL('/protected', request.url));
    }
  } else {
    // Si no hay usuario y trata de entrar a rutas privadas
    if (request.nextUrl.pathname.startsWith('/protected')) {
      console.log('Redirigiendo a /auth/login');
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}