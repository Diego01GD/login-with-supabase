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

const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const BLOCK_DURATION_MS = 30 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const STORAGE_KEY = "login-attempts";

interface AttemptState {
  attempts: number[];
  blockedUntil?: number;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function loadAttemptState(): Record<string, AttemptState> {
  if (typeof window === "undefined") return {};

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveAttemptState(state: Record<string, AttemptState>) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage failures
  }
}

function getAttemptInfo(email: string): AttemptState {
  const state = loadAttemptState();
  return state[normalizeEmail(email)] ?? { attempts: [] };
}

function getRemainingBlock(email: string): number | null {
  const info = getAttemptInfo(email);
  if (!info.blockedUntil) return null;
  return info.blockedUntil > Date.now() ? info.blockedUntil : null;
}

function registerAttempt(email: string): AttemptState {
  const normalized = normalizeEmail(email);
  const now = Date.now();
  const state = loadAttemptState();
  const existing = state[normalized] ?? { attempts: [] };

  const recentAttempts = existing.attempts.filter(
    (timestamp) => now - timestamp <= ATTEMPT_WINDOW_MS,
  );

  recentAttempts.push(now);

  if (recentAttempts.length >= MAX_ATTEMPTS) {
    state[normalized] = {
      attempts: [],
      blockedUntil: now + BLOCK_DURATION_MS,
    };
  } else {
    state[normalized] = {
      attempts: recentAttempts,
      blockedUntil: undefined,
    };
  }

  saveAttemptState(state);
  return state[normalized];
}

function clearAttempts(email: string) {
  const normalized = normalizeEmail(email);
  if (!normalized || typeof window === "undefined") return;

  const state = loadAttemptState();
  if (!state[normalized]) return;

  delete state[normalized];
  saveAttemptState(state);
}

function formatCountdown(milliseconds: number) {
  const totalSeconds = Math.max(Math.ceil(milliseconds / 1000), 0);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null);
  const [countdown, setCountdown] = useState("");
  const router = useRouter();

  // Limpieza de campos por seguridad al entrar a la ventana
  useEffect(() => {
    setEmail("");
    setPassword("");
    setError(null);
  }, []);

  useEffect(() => {
    setBlockedUntil(getRemainingBlock(email));
  }, [email]);

  useEffect(() => {
    if (!blockedUntil) {
      setCountdown("");
      return;
    }

    const tick = () => {
      const remaining = blockedUntil - Date.now();
      if (remaining <= 0) {
        setBlockedUntil(null);
        setCountdown("");
        setError(null);
        return;
      }
      setCountdown(formatCountdown(remaining));
    };

    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [blockedUntil]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      setError("Ingresa un correo válido.");
      return;
    }

    const activeBlock = getRemainingBlock(normalizedEmail);
    if (activeBlock) {
      setBlockedUntil(activeBlock);
      setError(
        `Has excedido el número de intentos. Intenta de nuevo en ${formatCountdown(activeBlock - Date.now())} minutos.`,
      );
      return;
    }

    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

      if (signInError) {
        const info = registerAttempt(normalizedEmail);
        if (info.blockedUntil) {
          setBlockedUntil(info.blockedUntil);
          setError(
            `Excediste ${MAX_ATTEMPTS} intentos en ${ATTEMPT_WINDOW_MS / 60000} minutos. Vuelve a intentarlo en ${formatCountdown(info.blockedUntil - Date.now())} minutos.`,
          );
          return;
        }

        if (signInError.message === "Invalid login credentials") {
          setError("Credenciales de inicio de sesión Incorrectos");
          return;
        }

        throw signInError;
      }

      clearAttempts(normalizedEmail);

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
              disabled={isLoading || Boolean(blockedUntil)}
              className="w-full h-12 bg-[#4a7c92] hover:bg-[#3d6678] text-white font-bold rounded-xl text-xl shadow-md transition-all"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : "Entrar"}
            </Button>

            {blockedUntil && countdown && (
              <p className="text-sm text-[#114c5f] bg-[#d9f3ff] p-3 rounded-lg font-semibold text-center">
                Tiempo de bloqueo: {countdown}
              </p>
            )}

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
