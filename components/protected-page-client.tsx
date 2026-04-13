"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import LogoSS from "@/public/images/logo.png";
import { UserDropdownMenu } from "@/components/user-dropdown-menu";
import { DiscoveryContent } from "@/components/discovery-content";
import { MessageSquare, Repeat } from "lucide-react";

interface Profile {
  id: string;
  full_name: string;
  career: string;
  student_id: string;
  semester: string;
  interests: string[];
  gpa: number;
  avatar_url?: string;
  is_complete: boolean;
}

interface MatchedUser {
  id: string;
  name: string;
  avatarUrl?: string;
  career: string;
  gpa: number;
  skill: string;
  level: string;
  schedule: string;
  matchScore: "perfect" | "good" | "fair";
  shift: string;
  availability: Array<{ day: string; timeSlots: string[] }>;
}

interface Skill {
  id: string;
  name: string;
  category: string;
}

interface ProtectedPageClientProps {
  profile: Profile;
  userId: string;
  activeExchangesCount: number;
  pendingReceivedCount: number;
  matches: MatchedUser[];
  fallbackUsers: MatchedUser[];
  allCategories: string[];
  allShifts: string[];
  skillMap: Record<string, Skill>;
}

export function ProtectedPageClient({
  profile,
  userId,
  activeExchangesCount: initialActiveCount,
  pendingReceivedCount: initialPendingCount,
  matches,
  fallbackUsers,
  allCategories,
  allShifts,
  skillMap,
}: ProtectedPageClientProps) {
  const [activeCount, setActiveCount] = useState(initialActiveCount);
  const [pendingCount, setPendingCount] = useState(initialPendingCount);

  // Actualizar contadores cada 3 segundos
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        // Obtener intercambios activos
        const activeRes = await fetch(`/api/skill-exchanges?type=active`);
        const activeJson = await activeRes.json();
        const count = (activeJson.data || []).filter(
          (e: any) => e.status === "accepted",
        ).length;
        setActiveCount(count);

        // Obtener solicitudes pendientes recibidas
        const recRes = await fetch(`/api/skill-exchanges?type=received`);
        const recJson = await recRes.json();
        const pendingCount = (recJson.data || []).filter(
          (e: any) => e.status === "pending",
        ).length;
        setPendingCount(pendingCount);
      } catch (error) {
        console.error("Error actualizando contadores:", error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const firstName = profile.full_name?.split(" ")[0] ?? "User";

  return (
    <main className="min-h-screen flex flex-col items-center bg-[#f7f3e7]">
      <div className="w-full">
        <nav className="flex items-center justify-between px-12 py-4 bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-[#9cd2d3]/20">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex items-center hover:opacity-90 transition-opacity"
            >
              <Image
                src={LogoSS}
                alt="SkillSwap"
                className="rounded-full shadow-sm w-32 mr-3"
              />

              <span className="text-xl font-bold tracking-tight text-[#114c5f]">
                SkillSwap
              </span>
            </Link>
          </div>

          <div className="md:text-xl text-[#114c5f] font-bold flex items-center gap-10">
            <div className="flex gap-8">
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
              <Link href="/protected/messages" className="">
                <MessageSquare
                  className="hover:scale-110 transition-transform cursor-pointer hover:text-[#0057cc]"
                  size={26}
                />
              </Link>
            </div>
            <UserDropdownMenu
              avatarUrl={profile.avatar_url}
              firstName={firstName}
            />
          </div>
        </nav>
      </div>

      {/* Contenido Principal */}
      <div className="w-full max-w-7xl px-6 py-12">
        <DiscoveryContent
          matches={matches}
          fallbackUsers={fallbackUsers}
          allCategories={allCategories}
          allShifts={allShifts}
          matchCount={matches.length}
          currentUserId={userId}
          skillMap={skillMap}
          activeExchangesCount={activeCount}
          pendingReceivedCount={pendingCount}
        />
      </div>
    </main>
  );
}
