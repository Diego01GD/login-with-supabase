"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react"; // Añadido useEffect
import { Mail, Eye, EyeOff, Loader2 } from "lucide-react";
import ImgP from "@/public/images/login-illustration.png";
import logoImage from "@/public/images/logo.png";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Limpieza de campos por seguridad al entrar a la ventana
  useEffect(() => {
    setEmail("");
    setPassword("");
    setError(null);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      const user = data.user;
      if (!user) {
        setError("No se pudo obtener el usuario tras iniciar sesión.");
        return;
      }

      // Elegir ruta basado en estado de complete profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("is_complete")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      const isComplete = profileData?.is_complete === true;
      const destination = isComplete ? "/protected" : "/auth/complete-profile";
      router.replace(destination);
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Correo o contraseña incorrectos";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-8 md:p-12 border border-[#9cd2d3]/20">
      <div className="w-full px-0 py-0 flex items-center justify-between bg-transparent mb-8 -mt-3">
        {/* Logo SkillSwap */}
        <Link href="/" className="flex items-center gap-2">
          <Image src={logoImage} alt="SkillSwap Logo" className="w-32" />
          <span className="text-2xl font-bold text-[#114c5f]">SkillSwap</span>
        </Link>

        {/* Botón Registrarse */}
        <Link
          href="/auth/sign-up"
          className="bg-[#4a7c92] hover:bg-[#3d6678] text-white px-6 py-2 rounded-lg font-medium text-lg transition-colors shadow-sm"
        >
          Registrarse
        </Link>
      </div>
      <h1 className="text-4xl md:text-5xl font-bold text-[#114c5f] text-center mb-12">
        Iniciar Sesión en SkillSwap
      </h1>

      <div className="flex flex-col md:flex-row gap-12 items-center">
        <div className="w-full md:w-1/2 flex flex-col">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-[#114c5f] font-bold text-lg"
              >
                Correo Universitario
              </Label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <Input
                  id="email"
                  type="email"
                  placeholder="nombre@universidad.edu"
                  autoComplete="off" // Refuerzo de seguridad
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 rounded-xl bg-[#eff6ff] border-none text-[#114c5f] md:text-lg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-[#114c5f] font-bold text-lg"
              >
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl bg-[#eff6ff] border-none pr-10 text-[#114c5f] md:text-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              {error && (
                <p className="text-lg text-red-600 font-bold mb-3">{error}</p>
              )}
              <Link
                href="/auth/forgot-password"
                className="text-lg text-[#114c5f] font-bold underline decoration-2 underline-offset-4"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#4a7c92] hover:bg-[#3d6678] text-white font-bold rounded-xl text-xl shadow-md transition-all"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : "Entrar"}
            </Button>

            <div className="text-center pt-2">
              <Link
                href="/"
                className="text-[#114c5f] font-bold text-base flex items-center justify-center gap-1"
              >
                <span>←</span> Volver a la página principal
              </Link>
            </div>
          </form>
        </div>

        <div className="hidden md:block w-1/2">
          <Image
            src={ImgP}
            alt="Estudiantes compartiendo conocimientos"
            width={500}
            height={400}
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}
