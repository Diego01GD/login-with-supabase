"use client";

import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";
import logoImage from "@/public/images/logo.png";
import { Eye, EyeOff } from "lucide-react";

export function UpdatePasswordForm() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Validación de requisitos de contraseña
  const hasUpper = /[A-Z]/.test(password);
  const hasNum = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const hasMinLength = password.length >= 8;

  const allRequirementsMet = hasUpper && hasNum && hasSpecial && hasMinLength;

  // Calcular fuerza de contraseña
  const getPasswordStrength = () => {
    let strength = 0;
    if (hasMinLength) strength += 25;
    if (hasUpper) strength += 25;
    if (hasNum) strength += 25;
    if (hasSpecial) strength += 25;
    return strength;
  };

  const getStrengthColor = () => {
    const strength = getPasswordStrength();
    if (strength < 50) return "bg-red-500";
    if (strength < 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    const strength = getPasswordStrength();
    if (strength < 50) return "Débil";
    if (strength < 75) return "Media";
    return "Fuerte";
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!allRequirementsMet) {
      setError(
        "La contraseña no cumple con todos los requisitos de seguridad.",
      );
      return;
    }

    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      if (updateError) {
        // Convertir el error "Auth session missing!" a mensaje amigable
        const errorMessage =
          updateError.message === "Auth session missing!"
            ? "Token de recuperación vencido, solicita otro."
            : updateError.message;
        throw new Error(errorMessage);
      }

      // Redirigir a login en lugar de iniciar sesión automáticamente
      router.push("/auth/login");
    } catch (error: unknown) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : "Ocurrió un error al actualizar la contraseña";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f2e6cf] font-gentium flex flex-col items-center py-8 px-4">
      {/* Header con Logo */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-10">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src={logoImage}
            alt="Logo de SkillSwap"
            className="rounded-full shadow-sm w-32"
          />
          <span className="text-2xl font-bold tracking-tight text-[#114c5f]">
            SkillSwap
          </span>
        </Link>
      </div>

      {/* Contenedor del Formulario */}
      <div className="bg-white rounded-[2.5rem] p-12 shadow-lg w-full max-w-2xl  border border-[#9cd2d3]/20">
        <h1 className="text-3xl font-extrabold text-center text-[#1a1a1a] mb-2">
          Restablecer contraseña
        </h1>
        <p className="text-center text-[#4a4a4a] mb-8 text-sm font-medium">
          Ingresa tu nueva contraseña. Recuerda que debe cumplir con todos los
          requisitos de seguridad.
        </p>

        <form onSubmit={handleUpdatePassword} className="space-y-6">
          {/* Campo de Contraseña */}
          <div className="space-y-3">
            <Label
              htmlFor="password"
              className="text-[#4a4a4a] text-xs font-bold uppercase tracking-wider"
            >
              Nueva contraseña *
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Ingresa tu nueva contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#eff6ff] border-none rounded-2xl h-12 px-5 pr-12 md:text-base text-[#114c5f] placeholder:text-[#114c5f]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#114c5f] hover:opacity-70 transition-opacity"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Indicador de Fuerza */}
            {password && (
              <div className="space-y-2">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getStrengthColor()} transition-all duration-300`}
                    style={{ width: `${getPasswordStrength()}%` }}
                  />
                </div>
                <p
                  className={`text-xs font-semibold ${
                    getPasswordStrength() < 50
                      ? "text-red-500"
                      : getPasswordStrength() < 75
                        ? "text-yellow-500"
                        : "text-green-500"
                  }`}
                >
                  Fuerza: {getStrengthText()}
                </p>
              </div>
            )}
          </div>

          {/* Requisitos de Contraseña */}
          <div className="bg-[#f8f9fa] rounded-2xl p-4 space-y-2.5">
            <p className="text-xs font-bold text-[#4a4a4a] uppercase tracking-wider">
              Requisitos de seguridad:
            </p>

            <div className="space-y-2">
              <div
                className={`flex items-center gap-2.5 text-sm ${hasMinLength ? "text-green-600" : "text-[#4a4a4a]"}`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    hasMinLength ? "bg-green-600 text-white" : "bg-gray-300"
                  }`}
                >
                  {hasMinLength ? "✓" : "○"}
                </span>
                <span className={hasMinLength ? "font-semibold" : ""}>
                  Mínimo 8 caracteres
                </span>
              </div>

              <div
                className={`flex items-center gap-2.5 text-sm ${hasUpper ? "text-green-600" : "text-[#4a4a4a]"}`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    hasUpper ? "bg-green-600 text-white" : "bg-gray-300"
                  }`}
                >
                  {hasUpper ? "✓" : "○"}
                </span>
                <span className={hasUpper ? "font-semibold" : ""}>
                  Una letra mayúscula
                </span>
              </div>

              <div
                className={`flex items-center gap-2.5 text-sm ${hasNum ? "text-green-600" : "text-[#4a4a4a]"}`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    hasNum ? "bg-green-600 text-white" : "bg-gray-300"
                  }`}
                >
                  {hasNum ? "✓" : "○"}
                </span>
                <span className={hasNum ? "font-semibold" : ""}>Un número</span>
              </div>

              <div
                className={`flex items-center gap-2.5 text-sm ${hasSpecial ? "text-green-600" : "text-[#4a4a4a]"}`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    hasSpecial ? "bg-green-600 text-white" : "bg-gray-300"
                  }`}
                >
                  {hasSpecial ? "✓" : "○"}
                </span>
                <span className={hasSpecial ? "font-semibold" : ""}>
                  Un carácter especial (!@#$%^&*)
                </span>
              </div>
            </div>
          </div>

          {/* Mensaje de Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* Botón de Envío */}
          <Button
            type="submit"
            disabled={isLoading || !allRequirementsMet}
            className="w-full bg-[#0057cc] hover:bg-[#004bb3] disabled:bg-gray-300 disabled:cursor-not-allowed h-12 rounded-2xl font-bold text-white shadow-lg shadow-[#0057cc]/20 transition-all"
          >
            {isLoading ? "Actualizando..." : "Actualizar contraseña"}
          </Button>

          {/* Link a Login */}
          <p className="text-center text-sm text-[#4a4a4a]">
            <Link
              href="/auth/login"
              className="font-bold underline text-[#0057cc] hover:text-[#004bb3]"
            >
              Volver a inicio de sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
