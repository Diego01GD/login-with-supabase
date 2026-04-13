"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SwapTabsContent } from "@/components/swap-tabs-content";

export default function SwapPage() {
  const [activeExchanges, setActiveExchanges] = useState(0);
  const [userId, setUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // En una aplicación real, esto vendría del servidor
    // Por ahora, obtenemos el userId desde sessionStorage o similar
    // Si estamos aquí, significa que el servidor ya validó que estamos autenticados
    const initUser = async () => {
      try {
        // Obtener del servidor
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUserId(data.id);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initUser();
  }, []);

  if (isLoading) {
    return (
      <main className="flex-1 flex flex-col items-center w-full bg-[#f7f3e7] min-h-screen">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-4 border-[#9cd2d3] border-t-[#0057cc] animate-spin mx-auto mb-4" />
            <p className="text-[#4a4a4a]">Cargando...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col items-center w-full bg-[#f7f3e7] min-h-screen">
      {/* Header */}
      <div className="w-full bg-white border-b border-[#9cd2d3]/30 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link
            href="/protected"
            className="flex items-center gap-2 text-[#0057cc] hover:text-[#004bb3] font-semibold mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver a Descubrir
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-[#114c5f] mb-1">
                Gestión de Solicitudes
              </h1>
              <p className="text-[#4a4a4a]">
                Administra tus intercambios de habilidades
              </p>
            </div>

            {/* Contador */}
            <div className="flex flex-col items-center">
              <p className="text-sm text-[#4a4a4a] font-semibold mb-2">
                Intercambios Activos
              </p>
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#0057cc] text-white font-bold text-xl shadow-md">
                {activeExchanges}/5
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="w-full max-w-7xl px-6 py-8">
        {userId && (
          <SwapTabsContent
            userId={userId}
            onActiveExchangesChange={setActiveExchanges}
          />
        )}
      </div>
    </main>
  );
}
