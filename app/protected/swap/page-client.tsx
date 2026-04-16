"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import LogoSS from "@/public/images/logo.png";
import { UserDropdownMenu } from "@/components/user-dropdown-menu";
import { SwapTabsContent } from "@/components/swap-tabs-content";
import { MessageSquare, Repeat } from "lucide-react";

interface SwapPageClientProps {
  userId: string;
  userName: string;
  avatarUrl: string;
  initialActiveCount: number;
  pendingReceivedCount: number;
}

export default function SwapPageClient({
  userId,
  userName,
  avatarUrl,
  initialActiveCount,
  pendingReceivedCount,
}: SwapPageClientProps) {
  const [activeCount, setActiveCount] = useState(initialActiveCount);
  const [pendingCount, setPendingCount] = useState(pendingReceivedCount);

  // Verificación de seguridad para evitar el error 'split of undefined'
  const firstName = userName ? userName.split(" ")[0] : "Usuario";

  return (
    <main className="min-h-screen flex flex-col bg-[#f9f7f2]">
      {/* NAVBAR: Diseño limpio con tus iconos funcionales */}
      <nav className="flex items-center justify-between px-12 py-4 bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-[#9cd2d3]/20">
        <div className="flex items-center gap-2">
          <Link
            href="/protected"
            className="flex items-center gap-3 hover:opacity-90 transition-opacity"
          >
            <Image src={LogoSS} alt="SkillSwap" className="rounded-lg w-32" />
            <span className="text-2xl font-bold tracking-tight text-[#114c5f]">
              SkillSwap
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-10">
          {/* ICONOS DE NAVEGACIÓN: Repeat y MessageSquare */}
          <div className="flex gap-8 text-[#114c5f]">
            <Link
              href="/protected/swap"
              title="Gestión de Intercambios"
              className="relative"
            >
              <Repeat
                className="hover:scale-110 transition-transform cursor-pointer hover:text-[#0057cc]"
                size={26}
              />
              {pendingCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {pendingCount > 99 ? "99+" : pendingCount}
                </span>
              )}
            </Link>
            <Link href="/protected/messages" title="Mensajes">
              <MessageSquare
                className="hover:scale-110 transition-transform cursor-pointer hover:text-[#0057cc]"
                size={26}
              />
            </Link>
          </div>

          {/* PERFIL: Se renderiza con los datos obtenidos del Server Component */}
          <div className="flex items-center gap-3 border-l border-gray-100 pl-8 text-[#114c5f] font-bold">
            <UserDropdownMenu avatarUrl={avatarUrl} firstName={firstName} />
          </div>
        </div>
      </nav>

      {/* CUERPO DE LA PÁGINA: Título principal según la imagen */}
      <div className="w-full max-w-7xl mx-auto px-12 py-12">
        <div className="w-full text-right">
          <Link
            href="/protected/"
            className="text-[#0057cc] hover:text-[#004499] font-semibold mb-8 inline-block"
          >
            ← Volver a la ventana principal
          </Link>
        </div>
        <div className="mb-10">
          <h1 className="text-5xl font-black text-[#1a1a1a] tracking-tight">
            Gestión de solicitudes
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            Administra tus intercambios y conecta con otros estudiantes del
            Tecnológico.
          </p>
        </div>

        {/* Componente que maneja los Tabs y el Sidebar (8/4) */}
        <SwapTabsContent
          userId={userId}
          onActiveExchangesChange={setActiveCount}
          onPendingReceivedChange={setPendingCount}
        />
      </div>
    </main>
  );
}
