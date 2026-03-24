"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpAction } from "@/app/actions";
import logoImage from "@/public/images/logo.png"; // Asegúrate de tener tu logo aquí

export default function SignUp() {
  return (
    <div className="min-h-screen bg-[#f2e6cf] font-gentium flex flex-col items-center py-12 px-4">
      {/* Header con Logo y Volver */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-10">
        <Link href="/" className="flex items-center gap-2.5">
          <Image 
            src={logoImage} 
            alt="Logo de SkillSwap"
            width={44}
            height={44}
            className="rounded-full shadow-sm"
          />
          <span className="text-2xl font-bold tracking-tight text-[#114c5f]">SkillSwap</span>
        </Link>
        <Link href="/" className="text-[#114c5f] underline text-sm font-medium tracking-tight hover:opacity-80 transition-opacity">
          &lt; volver al inicio
        </Link>
      </div>

      {/* Contenedor del Formulario (Tarjeta Blanca Personalizada) */}
      <div className="bg-white rounded-[2.5rem] p-12 shadow-lg w-full max-w-5xl border border-[#9cd2d3]/20">
        <h1 className="text-4xl font-extrabold text-center text-[#1a1a1a] mb-3">Registrar nueva cuenta</h1>
        <p className="text-center text-[#4a4a4a] mb-12 text-base font-semibold max-w-md mx-auto leading-relaxed">
          Completa toda la información necesaria para el registro.
        </p>

        <form action={signUpAction} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-7">
          {/* Nombre y Carrera */}
          <div className="space-y-2.5">
            <Label htmlFor="full_name" className="text-[#4a4a4a] text-xs font-bold uppercase tracking-wider">Nombre completo *</Label>
            <Input name="full_name" required className="bg-[#eff6ff] border-none rounded-2xl h-12 px-5 text-base" />
          </div>
          <div className="space-y-2.5">
            <Label htmlFor="career" className="text-[#4a4a4a] text-xs font-bold uppercase tracking-wider">Carrera *</Label>
            <Input name="career" required className="bg-[#eff6ff] border-none rounded-2xl h-12 px-5 text-base" />
          </div>

          {/* Matrícula y Semestre */}
          <div className="space-y-2.5">
            <Label htmlFor="student_id" className="text-[#4a4a4a] text-xs font-bold uppercase tracking-wider">Matrícula *</Label>
            <Input name="student_id" required className="bg-[#eff6ff] border-none rounded-2xl h-12 px-5 text-base" />
          </div>
          <div className="space-y-2.5 relative">
            <Label htmlFor="semester" className="text-[#4a4a4a] text-xs font-bold uppercase tracking-wider">Semestre actual *</Label>
            <select name="semester" required className="w-full bg-[#eff6ff] border-none rounded-2xl h-12 px-5 text-base text-gray-600 appearance-none cursor-pointer">
              <option value="">Selecciona semestre</option>
              {[1,2,3,4,5,6,7,8,9,10].map(s => <option key={s} value={s}>{s}° Semestre</option>)}
            </select>
            {/* Icono de flecha personalizado para el select */}
            <div className="absolute right-5 top-[44px] pointer-events-none text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>

          {/* Intereses - Checkboxes */}
          <div className="md:col-span-2 py-6">
            <Label className="text-[#4a4a4a] text-xs font-bold uppercase tracking-wider mb-5 block">Intereses academicos o personales</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 px-2">
              {[
                "Programación", "Idiomas", "Diseño", 
                "Música", "Matemáticas", "Comunicación", 
                "Deportes", "Herramientas digitales"
              ].map((int) => (
                <div key={int} className="flex items-center gap-3">
                  <input type="checkbox" name="interests" value={int} className="w-5 h-5 border-[#9cd2d3] rounded shadow-sm accent-[#0057cc] cursor-pointer" />
                  <span className="text-base text-[#4a4a4a] font-medium">{int}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Correo Institucional */}
          <div className="md:col-span-2 space-y-2.5">
            <Label htmlFor="email" className="text-[#4a4a4a] text-xs font-bold uppercase tracking-wider">Correo electronico institucional *</Label>
            <Input name="email" type="email" required placeholder="tu.correo@universidad.edu" className="bg-[#eff6ff] border-none rounded-2xl h-12 px-5 text-base placeholder:text-gray-400" />
          </div>

          {/* Password (Oculto en tu imagen, pero necesario) */}
          <div className="md:col-span-2 space-y-2.5">
            <Label htmlFor="password" className="text-[#4a4a4a] text-xs font-bold uppercase tracking-wider">Contraseña *</Label>
            <Input name="password" type="password" required className="bg-[#eff6ff] border-none rounded-2xl h-12 px-5 text-base" />
          </div>

          {/* Botón y Switch */}
          <div className="md:col-span-2 flex flex-col items-center gap-5 pt-10">
            <Button type="submit" className="bg-[#0057cc] hover:bg-[#004bb3] w-full max-w-md h-14 rounded-2xl font-bold text-lg text-white shadow-lg shadow-[#0057cc]/20 transition-all">
              Registrarse
            </Button>
            <p className="text-base text-[#4a4a4a]">
              Ya tengo cuenta - <Link href="/auth/login" className="font-bold underline text-[#0057cc] hover:text-[#004bb3]">Iniciar sesión</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}