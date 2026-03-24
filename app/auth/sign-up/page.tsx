"use client"

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useState, useMemo } from "react";
import { Eye, EyeOff, Check, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpAction } from "@/app/actions";
import logoImage from "@/public/images/logo.png"; // Asegúrate de tener tu logo aquí

export default function SignUp() {

  const searchParams = useSearchParams();
  const errorMsg = searchParams.get("error");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordStats = useMemo(() => {
    const requirements = [
      { met: password.length >= 8, label: "Mínimo 8 caracteres" },
      { met: /[A-Z]/.test(password), label: "Una mayúscula" },
      { met: /[0-9]/.test(password), label: "Un número" },
      { met: /[^A-Za-z0-9]/.test(password), label: "Un carácter especial" },
    ];

    
    const metCount = requirements.filter(r => r.met).length;
    let strength = "Débil";
    let color = "text-red-500";
    
    if (metCount === 4) {
      strength = "Fuerte";
      color = "text-green-600";
    } else if (metCount >= 2) {
      strength = "Media";
      color = "text-yellow-600";
    }

    return { requirements, metCount, strength, color };
  }, [password]);

  const canSubmit = passwordStats.metCount === 4 && password === confirmPassword && password !== "";

  return (
    <div className="min-h-screen bg-[#f7f3e7] font-gentium flex flex-col items-center pb-4">
      {/* Header con Logo y Volver */}
      <div className="w-full flex justify-between items-center mb-10 bg-white px-12 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Image 
            src={logoImage} 
            alt="Logo de SkillSwap"
            className="rounded-full shadow-sm w-40 mr-3"
          />
          <span className="text-2xl font-bold tracking-tight text-[#114c5f]">SkillSwap</span>
        </Link>
        <Link href="/" className="text-slate-700 text-lg font-semibold hover:text-[#0799b6] transition-colors">
          &lt; volver al inicio
        </Link>
      </div>

      {/* Contenedor del Formulario (Tarjeta Blanca Personalizada) */}
      <div className="bg-white rounded-[2.5rem] p-12 shadow-lg w-full max-w-5xl border border-[#9cd2d3]/20 relative">

        {errorMsg && (
          <div className="mb-8 flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl animate-in fade-in slide-in-from-top-4">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="flex-1 font-bold text-lg">
              {decodeURIComponent(errorMsg)}
            </p>
            <Link href="/auth/sign-up" className="p-1 hover:bg-red-100 rounded-full transition-colors">
              <X className="h-4 w-4" />
            </Link>
          </div>
        )}

        <h1 className="text-4xl font-extrabold text-center text-[#1a1a1a] mb-3">Registrar nueva cuenta</h1>
        <p className="text-center text-[#4a4a4a] mb-12 text-lg font-semibold max-w-lg mx-auto leading-relaxed">
          Completa toda la información necesaria para el registro.
        </p>

        <form action={signUpAction} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-7">
          {/* Nombre y Carrera */}
          <div className="space-y-2.5">
            <Label htmlFor="full_name" className="text-[#114c5f] text-base font-bold uppercase tracking-wider">Nombre completo *</Label>
            <Input name="full_name" required className="bg-[#3c86a4]/20 border-none rounded-2xl h-12 px-5 md:text-lg text-black" />
          </div>
          <div className="space-y-2.5">
            <Label htmlFor="career" className="text-[#114c5f] text-base font-bold uppercase tracking-wider">Carrera *</Label>
            <Input name="career" required className="bg-[#3c86a4]/20 border-none rounded-2xl h-12 px-5 md:text-lg text-black" />
          </div>

          {/* Matrícula y Semestre */}
          <div className="space-y-2.5">
            <Label htmlFor="student_id" className="text-[#114c5f] text-base font-bold uppercase tracking-wider">Matrícula *</Label>
            <Input name="student_id" required className="bg-[#3c86a4]/20 border-none rounded-2xl h-12 px-5 md:text-lg text-black" />
          </div>
          <div className="space-y-2.5 relative">
            <Label htmlFor="semester" className="text-[#114c5f] text-base font-bold uppercase tracking-wider">Semestre actual *</Label>
            <select name="semester" required className="w-full bg-[#3c86a4]/20 border-none rounded-2xl h-12 px-5 md:text-lg text-gray-600 appearance-none cursor-pointer">
              <option value="">Selecciona semestre</option>
              {[1,2,3,4,5,6,7,8,9,10].map(s => <option key={s} value={s}>{s}° Semestre</option>)}
            </select>
            {/* Icono de flecha personalizado para el select */}
            <div className="absolute right-5 top-[44px] pointer-events-none text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>

          {/* Correo Institucional */}
          <div className="md:col-span-2 space-y-2.5">
            <Label htmlFor="email" className={`text-base font-bold uppercase ${errorMsg?.includes("correo") ? "text-red-600" : "text-[#114c5f]"}`}>Correo electronico institucional *</Label>
            <Input name="email" type="email" required placeholder="tu.correo@universidad.edu" className={`bg-[#3c86a4]/20 border-none rounded-2xl h-12 px-5 text-black ${errorMsg?.includes("correo") ? "ring-2 ring-red-500" : ""}`} />
          </div>

          
          
          {/* Password (Oculto en tu imagen, pero necesario) */}
          <div className="md:col-span-2 space-y-2.5 relative">
            <Label htmlFor="password" className="text-[#114c5f] text-base font-bold uppercase tracking-wider">Contraseña *</Label>
            <div className="relative">
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#3c86a4]/20 border-none rounded-2xl h-12 px-5 pr-12 md:text-lg placeholder:text-gray-500 text-black"
                placeholder="Minimo 8 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#0057cc] transition-colors"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar Contraseña"}
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>


            {/* INDICADOR DE FUERZA */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mt-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-bold text-[#114c5f]">Fuerza de contraseña:</span>
                <span className={`text-sm font-black uppercase ${passwordStats.color}`}>{passwordStats.strength}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {passwordStats.requirements.map((req, i) => (
                  <div key={i} className="flex items-center gap-2 text-base">
                    {req.met ? <Check size={14} className="text-green-600" /> : <X size={14} className="text-red-400" />}
                    <span className={req.met ? "text-green-700" : "text-slate-500"}>{req.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>


          {/* CONFIRMAR PASSWORD */}
          <div className="md:col-span-2 space-y-2.5">
            <Label className="text-[#114c5f] text-base font-bold uppercase">Confirmar Contraseña *</Label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`bg-[#3c86a4]/20 border-2 rounded-2xl h-12 px-5 text-black transition-all md:text-lg ${
                  confirmPassword && password !== confirmPassword ? "border-red-400" : "border-transparent"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#3780a1] transition-colors"
                aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-red-500 text-lg font-bold">Las contraseñas no coinciden</p>
            )}
          </div>
          

          {/* Intereses - Checkboxes */}
          <div className="md:col-span-2 py-6">
            <Label className="text-[#114c5f] text-base font-bold uppercase tracking-wider mb-5 block">Intereses academicos o personales</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 px-2">
              {[
                "Programación", "Idiomas", "Diseño", 
                "Música", "Matemáticas", "Comunicación", 
                "Deportes", "Herramientas digitales"
              ].map((int) => (
                <div key={int} className="flex items-center gap-3">
                  <input type="checkbox" name="interests" value={int} className="w-5 h-5 border-[#9cd2d3] rounded shadow-sm accent-[#0057cc] cursor-pointer" />
                  <span className="md:text-lg text-[#114c5f] font-medium">{int}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Botón y Switch */}
          <div className="md:col-span-2 flex flex-col items-center gap-5 pt-10">
            <Button 
              type="submit" 
              disabled={!canSubmit}
              className={`${canSubmit ? "bg-[#3780a1] hover:bg-[#2c6681] text-white" : "bg-slate-300 cursor-not-allowed text-black"} w-full max-w-md h-14 rounded-2xl font-bold text-lg transition-all`}
            >
              {passwordStats.strength !== "Fuerte" ? "Contraseña insuficiente" : "Registrarse"}
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