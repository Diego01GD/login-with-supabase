"use client"

import { useFormStatus } from "react-dom";
import { useState, useMemo, useActionState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Check, X, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpAction } from "@/app/actions";
import logoImage from "@/public/images/logo.png";

// Componente pequeño para el botón con carga
function SubmitButton({ disabled, strength }: { disabled: boolean; strength: string }) {
  const { pending } = useFormStatus();
  
  return (
    <Button 
      type="submit" 
      disabled={disabled || pending}
      className={`${disabled || pending ? "bg-slate-300 cursor-not-allowed text-black" : "bg-[#3780a1] hover:bg-[#2c6681] text-white"} w-full max-w-md h-14 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2`}
    >
      {pending ? (
        <>
          <Loader2 className="animate-spin" size={20} />
          Registrando...
        </>
      ) : (
        strength !== "Fuerte" ? "Contraseña insuficiente" : "Registrarse"
      )}
    </Button>
  );
}

export default function SignUp() {
  const [state, formAction] = useActionState(signUpAction, { error: "" });

  useEffect(() => {
    if (state?.error) {
      window.scrollTo({
        top: 0,
        behavior: "smooth", // Movimiento fluido en lugar de un salto brusco
      });
    }
  }, [state?.error])

  // Estados para persistencia manual de campos
  const [fullName, setFullName] = useState("");
  const [career, setCareer] = useState("");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordStats = useMemo(() => {
    const requirements = [
      { met: password.length >= 8, label: "Mínimo 8 caracteres" },
      { met: /[A-Z]/.test(password), label: "Una mayúscula" },
      { met: /[0-9]/.test(password), label: "Un número" },
      { met: /[^A-Za-z0-9]/.test(password), label: "Un carácter especial" },
    ];
    const metCount = requirements.filter(r => r.met).length;
    let strength = "Débil", color = "text-red-500";
    if (metCount === 4) { strength = "Fuerte"; color = "text-green-600"; }
    else if (metCount >= 2) { strength = "Media"; color = "text-yellow-600"; }
    return { requirements, metCount, strength, color };
  }, [password]);

  const canSubmit = passwordStats.metCount === 4 && password === confirmPassword && password !== "";

  return (
    <div className="min-h-screen bg-[#f7f3e7] font-gentium flex flex-col items-center pb-4">
      <div className="w-full flex justify-between items-center mb-10 bg-white px-12 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src={logoImage} alt="Logo" className="rounded-full w-40 mr-3" />
          <span className="text-2xl font-bold text-[#114c5f]">SkillSwap</span>
        </Link>
        <Link href="/" className="text-slate-700 text-lg font-semibold hover:text-[#0799b6] transition-colors">
          &lt; volver al inicio
        </Link>
      </div>

      <div className="bg-white rounded-[2.5rem] p-12 shadow-lg w-full max-w-5xl border border-[#9cd2d3]/20 relative">
        {state?.error && (
          <div className="mb-8 flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl animate-in fade-in slide-in-from-top-4">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="flex-1 font-bold text-lg">{state.error}</p>
          </div>
        )}

        <h1 className="text-4xl font-extrabold text-center text-[#1a1a1a] mb-3 text-balance">Registrar nueva cuenta</h1>
        <form action={formAction} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-7">
          <div className="space-y-2.5">
            <Label className="text-[#114c5f] text-base font-bold uppercase">Nombre completo *</Label>
            <Input name="full_name" value={fullName} onChange={(e)=>setFullName(e.target.value)} required className="bg-[#3c86a4]/20 border-none rounded-2xl h-12 px-5 text-black" />
          </div>
          <div className="space-y-2.5">
            <Label className="text-[#114c5f] text-base font-bold uppercase">Carrera *</Label>
            <Input name="career" value={career} onChange={(e)=>setCareer(e.target.value)} required className="bg-[#3c86a4]/20 border-none rounded-2xl h-12 px-5 text-black" />
          </div>
          <div className="space-y-2.5">
            <Label className="text-[#114c5f] text-base font-bold uppercase">Matrícula *</Label>
            <Input name="student_id" value={studentId} onChange={(e)=>setStudentId(e.target.value)} required className="bg-[#3c86a4]/20 border-none rounded-2xl h-12 px-5 text-black" />
          </div>
          <div className="space-y-2.5 relative">
            <Label className="text-[#114c5f] text-base font-bold uppercase">Semestre actual *</Label>
            <select name="semester" required className="w-full bg-[#3c86a4]/20 border-none rounded-2xl h-12 px-5 md:text-lg text-gray-600 appearance-none">
              <option value="">Selecciona semestre</option>
              {[1,2,3,4,5,6,7,8,9,10].map(s => <option key={s} value={s}>{s}° Semestre</option>)}
            </select>
          </div>

          <div className="md:col-span-2 space-y-2.5">
            <Label className="text-[#114c5f] text-base font-bold uppercase">Correo institucional *</Label>
            <Input name="email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required className="bg-[#3c86a4]/20 border-none rounded-2xl h-12 px-5 text-black" />
          </div>

          {/* Password Section */}
          <div className="md:col-span-2 space-y-2.5 relative">
            <Label className="text-[#114c5f] text-base font-bold uppercase tracking-wider">Contraseña *</Label>
            <div className="relative">
              <Input name="password" type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="bg-[#3c86a4]/20 border-none rounded-2xl h-12 px-5 pr-12 text-black" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mt-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-bold text-[#114c5f]">Fuerza:</span>
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

          <div className="md:col-span-2 space-y-2.5">
            <Label className="text-[#114c5f] text-base font-bold uppercase">Confirmar Contraseña *</Label>
            <div className="relative">
              <Input type={showConfirmPassword ? "text" : "password"} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`bg-[#3c86a4]/20 border-2 rounded-2xl h-12 px-5 text-black ${confirmPassword && password !== confirmPassword ? "border-red-400" : "border-transparent"}`} />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
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
              {["Programación", "Idiomas", "Diseño", "Música", "Matemáticas", "Comunicación", "Deportes", "Herramientas digitales"].map((int) => (
                <div key={int} className="flex items-center gap-3">
                  <input type="checkbox" name="interests" value={int} className="w-5 h-5 border-[#9cd2d3] rounded shadow-sm accent-[#0057cc] cursor-pointer" />
                  <span className="md:text-lg text-[#114c5f] font-medium">{int}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 flex flex-col items-center gap-5 pt-10">
            <SubmitButton disabled={!canSubmit} strength={passwordStats.strength} />
            <p className="text-base text-[#4a4a4a]">
              Ya tengo cuenta - <Link href="/auth/login" className="font-bold underline text-[#0057cc]">Iniciar sesión</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}