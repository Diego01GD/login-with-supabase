import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import LogoSS from "@/public/images/logo.png";

export default async function SkillSwapLanding() {
  return (
    <div className="min-h-screen bg-[#f7f3e7] font-gentium text-[#114c5f]">
      {/* --- Navbar --- */}
      <nav className="flex items-center justify-between px-12 py-4 bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-[#9cd2d3]/20">
        <div className="flex items-center gap-2">
          {/* Logo Placeholder */}
          <Link
            href="/"
            className="flex items-center hover:opacity-90 transition-opacity"
          >
            <Image
              src={LogoSS}
              alt="SkillSwap"
              className="rounded-full shadow-sm w-40 mr-3"
            />

            <span className="text-xl font-bold tracking-tight ">SkillSwap</span>
          </Link>
        </div>

        <div className="flex items-center gap-8">
          <Suspense
            fallback={
              <div className="text-[#3983A6] font-bold">Cargando sesión...</div>
            }
          >
            <AuthStatus />
          </Suspense>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-16">
        {/* --- Hero Section (El cuadro azul claro) --- */}
        <section className="bg-white rounded-[3rem] py-24 px-12 text-center  mx-4 shadow-2xl">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-8 text-[#1a1a1a]">
            Intercambia conocimientos,
            <br />
            potencia tu carrera
          </h1>
          <p className="text-xl text-[#4a4a4a] max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
            La plataforma exclusiva para estudiantes donde enseñas lo que amas y
            aprendes lo que necesitas
          </p>
          <Button
            asChild
            className="bg-[#3983A6] hover:bg-[#4aaad7] text-white text-lg py-7 px-10 rounded-lg shadow-md font-bold"
          >
            <Link href="/auth/sign-up">Unete con tu correo universitario</Link>
          </Button>
        </section>

        {/* --- ¿Cómo funciona? --- */}
        <section className="py-28">
          <h2 className="text-5xl font-extrabold text-center mb-20 text-[#1a1a1a]">
            ¿Cómo funciona SkillSwap?
          </h2>
          <div className="grid md:grid-cols-3 gap-16 px-10">
            {[
              {
                n: "1",
                t: "Crea tu Perfil",
                d: "Registrate con tu correo institucional y define tus intereses",
              },
              {
                n: "2",
                t: "Publica y busca",
                d: "Di que habilidades ofrece(s)\nQue quieres aprender",
              },
              {
                n: "3",
                t: "Haz Match",
                d: "El sistema encontrara a alguien con disponibilidad horaria complatible para que empiezen el intercambio",
              },
            ].map((step) => (
              <div
                key={step.n}
                className="flex flex-col items-center text-left border-black}"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-6xl font-black text-[#0057cc]">
                    {step.n}
                  </span>
                  <h3 className="text-2xl font-extrabold text-[#1a1a1a] ml-2 mt-1">
                    {step.t}
                  </h3>
                </div>
                <p className="text-[#4a4a4a] text-lg leading-snug whitespace-pre-line text-center">
                  {step.d}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* --- Categorías --- */}
        <section className="pb-32">
          <h2 className="text-5xl font-extrabold text-center mb-14 text-[#1a1a1a]">
            Categorías destacadas
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {["Programacion", "Idiomas", "Musica", "Matematicas"].map((cat) => (
              <div
                key={cat}
                className="bg-[#eff6ff] border-2 border-[#0057cc]/30 py-6 rounded-xl text-center hover:bg-[#e0eeff] hover:border-[#0057cc] transition-all cursor-pointer shadow-sm"
              >
                <span className="font-bold text-[#0057cc] text-lg">{cat}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* --- Footer --- */}
      <footer className="bg-white/40 border-t border-[#9cd2d3]/30 py-16 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <p className="text-[#4a4a4a] font-semibold mb-1">
            Comunidad 100% segura y verificada.
          </p>
          <p className="text-[#666] text-sm mb-12">
            Solo para la comunidad universitaria. Acceso valido por matricula
          </p>
          <p className="text-[#4a4a4a] text-xs font-bold tracking-widest uppercase">
            © 2026 SkillSwap. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

async function AuthStatus() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    // Si el token está caducado o la sesión no existe, se muestran botones de login/signup.
    return (
      <>
        <Link
          href="/auth/login"
          className="text-lg font-semibold hover:text-[#0799b6] transition-colors"
        >
          Iniciar Sesión
        </Link>
        <Button
          asChild
          className="bg-[#3983A6] hover:bg-[#4aaad7] text-white px-8 h-10 rounded-md font-bold text-lg transition-all"
        >
          <Link href="/auth/sign-up">Registrarse</Link>
        </Button>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Link
          href="/auth/login"
          className="text-lg font-semibold hover:text-[#0799b6] transition-colors"
        >
          Iniciar Sesión
        </Link>
        <Button
          asChild
          className="bg-[#3983A6] hover:bg-[#4aaad7] text-white px-8 h-10 rounded-md font-bold text-lg transition-all"
        >
          <Link href="/auth/sign-up">Registrarse</Link>
        </Button>
      </>
    );
  }

  return (
    <Button
      asChild
      className="bg-[#114c5f] hover:bg-[#0799b6] text-white px-8 h-10 rounded-md font-bold text-lg shadow-lg transition-all"
    >
      <Link href="/protected">Ir a mi Dashboard</Link>
    </Button>
  );
}
