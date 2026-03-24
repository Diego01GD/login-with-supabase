"use client";

import Link from "next/link";
import Image from "next/image";
import { MailCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoImage from "@/public/images/logo.png";

export default function SignUpSuccess() {
  return (
    <div className="min-h-screen bg-[#f7f3e7] font-gentium flex flex-col items-center justify-center p-6">
      {/* Tarjeta de Éxito Personalizada */}
      <div className="bg-white rounded-[2.5rem] p-10 md:p-16 shadow-xl w-full max-w-2xl border border-[#9cd2d3]/20 text-center relative overflow-hidden">
        
        {/* Decoración sutil de fondo */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#eff6ff] rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#f2e6cf] rounded-full blur-3xl opacity-50" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Logo arriba */}
          <div className="mb-8 flex flex-col items-center gap-2">
            <Link href="/">
              <Image 
                src={logoImage} 
                alt="SkillSwap Logo" 
                className="rounded-full shadow-md w-28"
              />
            </Link>
            <span className="text-xl font-bold text-[#114c5f]">SkillSwap</span>
          </div>

          {/* Icono de Verificación */}
          <div className="bg-[#eff6ff] p-6 rounded-full mb-6">
            <MailCheck className="text-[#0057cc] w-16 h-16 animate-bounce" />
          </div>

          <h1 className="text-4xl font-extrabold text-[#114c5f] mb-4">
            ¡Ya casi eres parte de la comunidad!
          </h1>
          
          <p className="text-xl text-[#4a4a4a] font-medium mb-8 leading-relaxed max-w-md mx-auto">
            Hemos enviado un enlace de confirmación a tu correo institucional. 
            <span className="block mt-2 font-bold text-[#0057cc]">Revísalo para activar tu cuenta.</span>
          </p>

          <div className="w-full h-px bg-slate-100 mb-8" />

          {/* Acciones */}
          <div className="flex flex-col gap-4 w-full max-w-xs">
            <Button asChild className="bg-[#0057cc] hover:bg-[#004bb3] text-white h-14 rounded-2xl font-bold text-lg shadow-lg shadow-[#0057cc]/20 transition-all active:scale-95">
              <Link href="https://mail.google.com/" target="_blank">
                Ir a mi correo <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            
            <p className="text-sm text-slate-500">
              ¿No recibiste nada? Revisa tu carpeta de spam.
            </p>
          </div>

          <div className="mt-12">
            <Link 
              href="/auth/login" 
              className="text-[#114c5f] font-bold flex items-center gap-2 hover:opacity-70 transition-opacity"
            >
              <span>←</span> Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}