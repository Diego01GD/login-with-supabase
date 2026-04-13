"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

interface ChangePasswordFormProps {
  userId: string;
  userEmail?: string;
}

export function ChangePasswordForm({
  // userId,
  userEmail,
}: ChangePasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<
    "weak" | "fair" | "good" | "strong" | null
  >(null);

  // Requisitos individuales
  const [hasMinLength, setHasMinLength] = useState(false);
  const [hasUpper, setHasUpper] = useState(false);
  const [hasNum, setHasNum] = useState(false);
  const [hasSpecial, setHasSpecial] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  // Limpiar formulario cuando el componente se monta
  useEffect(() => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
    setMessage(null);
    setPasswordStrength(null);
    setHasMinLength(false);
    setHasUpper(false);
    setHasNum(false);
    setHasSpecial(false);
  }, []);

  const calculatePasswordStrength = (password: string) => {
    if (!password) return null;

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 1) return "weak";
    if (strength === 2) return "fair";
    if (strength === 3) return "good";
    return "strong";
  };

  const handlePasswordChange = (value: string) => {
    setNewPassword(value);
    setPasswordStrength(calculatePasswordStrength(value));

    // Actualizar requisitos individuales
    setHasMinLength(value.length >= 8);
    setHasUpper(/[A-Z]/.test(value));
    setHasNum(/[0-9]/.test(value));
    setHasSpecial(/[^A-Za-z0-9]/.test(value));
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case "weak":
        return "bg-red-500";
      case "fair":
        return "bg-orange-500";
      case "good":
        return "bg-yellow-500";
      case "strong":
        return "bg-green-500";
      default:
        return "bg-gray-200";
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case "weak":
        return "Contraseña débil";
      case "fair":
        return "Contraseña regular";
      case "good":
        return "Contraseña buena";
      case "strong":
        return "Contraseña fuerte";
      default:
        return "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validaciones
    if (!currentPassword) {
      setMessage({ type: "error", text: "Ingresa tu contraseña actual" });
      return;
    }

    if (!newPassword) {
      setMessage({ type: "error", text: "Ingresa una contraseña nueva" });
      return;
    }

    // Verificar que todos los requisitos estén cumplidos
    if (!hasMinLength || !hasUpper || !hasNum || !hasSpecial) {
      setMessage({
        type: "error",
        text: "La contraseña no cumple con todos los requisitos de seguridad.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({
        type: "error",
        text: "Las contraseñas nuevas no coinciden",
      });
      return;
    }

    if (currentPassword === newPassword) {
      setMessage({
        type: "error",
        text: "La contraseña nueva debe ser diferente a la actual",
      });
      return;
    }

    try {
      setIsLoading(true);

      // 1. Verificar contraseña actual con sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail || "",
        password: currentPassword,
      });

      if (signInError) {
        setMessage({
          type: "error",
          text: "La contraseña actual es incorrecta",
        });
        return;
      }

      // 2. Cambiar la contraseña
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setMessage({
          type: "error",
          text: "Error al cambiar la contraseña: " + updateError.message,
        });
        return;
      }

      // 3. Mostrar éxito
      setMessage({
        type: "success",
        text: "Contraseña cambiada correctamente. Cerrando sesión...",
      });

      // 4. Limpiar el formulario
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
      setPasswordStrength(null);
      setHasMinLength(false);
      setHasUpper(false);
      setHasNum(false);
      setHasSpecial(false);

      // 5. Logout
      await supabase.auth.signOut();

      // 6. Redirigir al login
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Error desconocido al cambiar contraseña",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {/* Mensajes */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Contraseña Actual */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-[#325e80]">
          Contraseña Actual *
        </label>
        <div className="relative">
          <input
            type={showCurrent ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-4 py-2 border border-[#cfe8fb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057cc] bg-[#eff6ff] text-[#114c5f]"
            placeholder="Ingresa tu contraseña actual"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowCurrent(!showCurrent)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#325e80] hover:text-[#0057cc]"
          >
            {showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      {/* Contraseña Nueva */}
      <div>
        <label className="block text-sm font-semibold text-[#325e80] mb-2">
          Nueva Contraseña *
        </label>
        <div className="relative">
          <input
            type={showNew ? "text" : "password"}
            value={newPassword}
            onChange={(e) => handlePasswordChange(e.target.value)}
            className="w-full px-4 py-2 border border-[#cfe8fb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057cc] bg-[#eff6ff] text-[#114c5f]"
            placeholder="Ingresa tu contraseña nueva"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#325e80] hover:text-[#0057cc]"
          >
            {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Indicador de fortaleza */}
        {passwordStrength && (
          <div className="mt-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getPasswordStrengthColor()} transition-all`}
                  style={{
                    width: `${
                      passwordStrength === "weak"
                        ? "25%"
                        : passwordStrength === "fair"
                          ? "50%"
                          : passwordStrength === "good"
                            ? "75%"
                            : "100%"
                    }`,
                  }}
                />
              </div>
              <span className="text-xs font-semibold text-[#325e80]">
                {getPasswordStrengthText()}
              </span>
            </div>
          </div>
        )}

        {/* Requisitos de Seguridad */}
        {newPassword && (
          <div className="bg-[#f8f9fa] rounded-lg p-4 space-y-2.5">
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
        )}
      </div>

      {/* Confirmar Contraseña */}
      <div>
        <label className="block text-sm font-semibold text-[#325e80] mb-2">
          Confirmar Nueva Contraseña *
        </label>
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border border-[#cfe8fb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057cc] bg-[#eff6ff] text-[#114c5f]"
            placeholder="Confirma tu contraseña nueva"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#325e80] hover:text-[#0057cc]"
          >
            {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {confirmPassword && newPassword !== confirmPassword && (
          <p className="text-sm text-red-600 mt-1">
            Las contraseñas no coinciden
          </p>
        )}
      </div>

      {/* Botones */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-[#0057cc] hover:bg-[#004499] disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-bold transition-colors"
        >
          {isLoading ? "Cambiando..." : "Cambiar Contraseña"}
        </button>
      </div>

      <p className="text-xs text-[#587a92]">
        Después de cambiar tu contraseña, serás desconectado y deberás iniciar
        sesión nuevamente.
      </p>
    </form>
  );
}
