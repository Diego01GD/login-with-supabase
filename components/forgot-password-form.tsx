"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const BLOCK_DURATION_MS = 20 * 60 * 1000;
const MAX_ATTEMPTS = 3;
const STORAGE_KEY = "forgot-password-attempts";

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

function formatCountdown(milliseconds: number) {
  const totalSeconds = Math.max(Math.ceil(milliseconds / 1000), 0);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null);
  const [countdown, setCountdown] = useState("");

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

  const handleForgotPassword = async (e: React.FormEvent) => {
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
        `Has excedido el número de solicitudes. Intenta de nuevo en ${formatCountdown(activeBlock - Date.now())}.`,
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const verifyResponse = await fetch("/api/forgot-password/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      let verifyData: unknown;
      try {
        verifyData = await verifyResponse.json();
      } catch {
        const text = await verifyResponse.text();
        throw new Error(
          text || "No se pudo verificar el correo. Intenta más tarde.",
        );
      }

      const verification =
        typeof verifyData === "object" && verifyData !== null
          ? (verifyData as { error?: string; exists?: boolean })
          : { error: "No se pudo verificar el correo." };

      if (!verifyResponse.ok) {
        throw new Error(
          verification.error || "No se pudo verificar el correo.",
        );
      }

      if (!verification.exists) {
        setError("Este correo no tiene una cuenta registrada.");
        return;
      }

      const info = registerAttempt(normalizedEmail);
      if (info.blockedUntil) {
        setBlockedUntil(info.blockedUntil);
        setError(
          `Excediste ${MAX_ATTEMPTS} solicitudes en ${ATTEMPT_WINDOW_MS / 60000} minutos. Vuelve a intentarlo en ${formatCountdown(info.blockedUntil - Date.now())}.`,
        );
        return;
      }

      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        normalizedEmail,
        {
          redirectTo: `${window.location.origin}/auth/update-password`,
        },
      );

      if (resetError) {
        throw resetError;
      }

      setSuccess(true);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No pudimos enviar el correo. Verifica tu dirección.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="bg-white rounded-[2.5rem] shadow-xl p-8 md:p-12 border border-[#9cd2d3]/30">
        {success ? (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="bg-[#eff6ff] p-4 rounded-full">
                <CheckCircle2 className="w-12 h-12 text-[#0799b6] animate-in zoom-in" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-[#114c5f]">
                Revisa tu correo
              </h2>
              <p className="text-[#4a4a4a] text-lg">
                Hemos enviado las instrucciones para restablecer tu contraseña a{" "}
                <strong>{email}</strong>.
              </p>
            </div>
            <Button
              asChild
              className="w-full bg-[#114c5f] hover:bg-[#0799b6] h-12 rounded-xl font-bold text-white"
            >
              <Link href="/auth/login">Volver al inicio de sesión</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-[#114c5f]">
                ¿Olvidaste tu contraseña?
              </h1>
              <p className="text-[#4a4a4a] text-lg font-medium">
                Introduce tu correo institucional para recibir un enlace de
                recuperación.
              </p>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-[#114c5f] font-bold text-lg"
                >
                  Correo Universitario
                </Label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#114c5f]"
                    size={20}
                  />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nombre@merida.tecnm.mx"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 rounded-xl bg-[#eff6ff] border-none text-[#114c5f] md:text-base placeholder:text-[#114c5f]"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 font-bold bg-red-50 p-3 rounded-lg flex items-center gap-2">
                  {error}
                </p>
              )}

              {blockedUntil && countdown && (
                <p className="text-sm text-[#114c5f] bg-[#d9f3ff] p-3 rounded-lg font-semibold">
                  Tiempo de bloqueo: {countdown}
                </p>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-[#0799b6] hover:bg-[#0688a1] text-white font-bold rounded-xl text-xl shadow-md transition-all active:scale-[0.98]"
                disabled={isLoading || Boolean(blockedUntil)}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin mr-2" />
                ) : (
                  "Enviar enlace"
                )}
              </Button>
            </form>

            <div className="text-center pt-4">
              <Link
                href="/auth/login"
                className="text-[#114c5f] font-bold text-lg flex items-center justify-center gap-2 hover:opacity-70 transition-opacity"
              >
                <ArrowLeft size={18} />
                Volver al inicio de sesión
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
