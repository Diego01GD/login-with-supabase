"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Eye,
  MessageSquare,
  RefreshCw,
  History as HistoryIcon,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { UserDetailModal } from "./user-detail-modal";
import { NotificationCard } from "./notification-card";

interface SwapTabsContentProps {
  userId: string;
  onActiveExchangesChange?: (count: number) => void;
  onPendingReceivedChange?: (count: number) => void;
}

export function SwapTabsContent({
  userId,
  onActiveExchangesChange,
  onPendingReceivedChange,
}: SwapTabsContentProps) {
  const [activeTab, setActiveTab] = useState<
    "received" | "sent" | "active" | "history"
  >("received");
  const [exchanges, setExchanges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCount, setActiveCount] = useState(0);
  const [pendingReceivedCount, setPendingReceivedCount] = useState(0);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [selectedUserModal, setSelectedUserModal] = useState<any>({
    isOpen: false,
    userId: "",
    userName: "",
    userAvatar: "",
    career: "",
    gpa: 0,
    skills: [],
    availability: [],
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Cargar solicitudes según el tab
      const res = await fetch(`/api/skill-exchanges?type=${activeTab}`);
      const json = await res.json();

      // Filtrado estricto en el frontend para asegurar la limpieza de pestañas
      let filtered = json.data || [];

      if (activeTab === "received") {
        // Solo pendientes que te enviaron a ti
        filtered = filtered.filter((ex: any) => ex.status === "pending");
      } else if (activeTab === "sent") {
        // Solo enviadas que NO han terminado (pendientes o aceptadas)
        filtered = filtered.filter((ex: any) =>
          ["pending", "accepted"].includes(ex.status),
        );
      } else if (activeTab === "active") {
        // Todas las aceptadas desde ambas perspectivas
        filtered = filtered.filter((ex: any) => ex.status === "accepted");
      } else if (activeTab === "history") {
        // Solo lo que ya terminó (sin importar si tú enviaste o recibiste)
        filtered = filtered.filter((ex: any) =>
          ["rejected", "completed", "expired"].includes(ex.status),
        );
      }

      setExchanges(filtered);

      // 2. Actualizar contador de activos (status = 'accepted')
      const resActive = await fetch(`/api/skill-exchanges?type=active`);
      const jsonActive = await resActive.json();
      const count = (jsonActive.data || []).filter(
        (e: any) => e.status === "accepted",
      ).length;

      setActiveCount(count);
      onActiveExchangesChange?.(count);

      // 3. Obtener contador de solicitudes pendientes recibidas
      const recRes = await fetch(`/api/skill-exchanges?type=received`);
      const recJson = await recRes.json();
      const pendingCount = (recJson.data || []).filter(
        (e: any) => e.status === "pending",
      ).length;
      setPendingReceivedCount(pendingCount);
      onPendingReceivedChange?.(pendingCount);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, onActiveExchangesChange, onPendingReceivedChange]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdateStatus = async (exchangeId: string, newStatus: string) => {
    try {
      const response = await fetch("/api/skill-exchanges", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exchangeId, newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({
          type: "error",
          text: data.error || "Error al actualizar",
        });
        return;
      }

      let successMessage = "Estado actualizado";
      if (newStatus === "rejected") {
        successMessage = "Solicitud movida al historial";
      } else if (newStatus === "completed") {
        successMessage = "¡Intercambio completado! Movido al historial";
      }

      setMessage({
        type: "success",
        text: successMessage,
      });

      // Recargar datos para que desaparezca de la pestaña actual y se mueva si es necesario
      loadData();
    } catch (error) {
      setMessage({ type: "error", text: "Error de conexión" });
    }
  };

  const handleOpenDetails = async (profileId: string) => {
    const supabase = createClient();
    const { data: profile, error } = await supabase
      .from("profiles")
      .select(
        `
        id, full_name, avatar_url, career, gpa,
        user_skills ( level, skills ( name ) ),
        user_availability ( day, time_slots ( range ) )
      `,
      )
      .eq("id", profileId)
      .single();

    if (error || !profile) {
      setMessage({ type: "error", text: "No se pudo cargar la información" });
      return;
    }

    const availabilityByDay = new Map<string, string[]>();
    profile.user_availability?.forEach((ua: any) => {
      if (ua.time_slots?.range) {
        if (!availabilityByDay.has(ua.day)) availabilityByDay.set(ua.day, []);
        availabilityByDay.get(ua.day)!.push(ua.time_slots.range);
      }
    });

    setSelectedUserModal({
      isOpen: true,
      userId: profile.id,
      userName: profile.full_name,
      userAvatar: profile.avatar_url,
      career: profile.career || "Carrera no especificada",
      gpa: profile.gpa || 0,
      skills:
        profile.user_skills?.map((s: any) => ({
          name: s.skills?.name,
          level: s.level,
        })) || [],
      availability: Array.from(availabilityByDay, ([day, timeSlots]) => ({
        day,
        timeSlots,
      })),
    });
  };

  const ExchangeCard = ({ exchange }: { exchange: any }) => {
    const profile = exchange.profiles;
    if (!profile) return null;

    const isHistory = activeTab === "history";
    const isActive = activeTab === "active";
    const isSender = exchange.sender_id === userId;

    return (
      <div className="bg-white rounded-2xl p-6 flex items-center justify-between shadow-sm border border-gray-100 mb-4 transition-all hover:shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-[#dce7f4] flex-shrink-0">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt="Avatar"
                width={64}
                height={64}
                className="object-cover h-full w-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#134f78] font-bold text-xl">
                {profile.full_name?.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#114c5f]">
              {profile.full_name}
            </h3>
            <p className="text-[#0057cc] font-semibold text-sm">
              {profile.career}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  exchange.status === "accepted"
                    ? "bg-green-100 text-green-700"
                    : exchange.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-600"
                }`}
              >
                {exchange.status.toUpperCase()}
              </span>
              <p className="text-gray-400 text-xs italic">
                {new Date(exchange.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 min-w-[140px]">
          {activeTab === "received" && exchange.status === "pending" && (
            <>
              <button
                onClick={() => handleUpdateStatus(exchange.id, "accepted")}
                className="bg-[#0057cc] text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors"
              >
                Aceptar
              </button>
              <button
                onClick={() => handleUpdateStatus(exchange.id, "rejected")}
                className="bg-[#eef6ff] text-[#0057cc] px-6 py-2 rounded-lg font-bold hover:bg-blue-50 transition-colors"
              >
                Ignorar
              </button>
            </>
          )}

          {(activeTab === "sent" || isHistory) && (
            <>
              <button
                onClick={() => handleOpenDetails(profile.id)}
                className="bg-[#eef6ff] text-[#0057cc] px-6 py-2 rounded-lg font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
              >
                <Eye size={16} /> Detalles
              </button>

              {exchange.status === "pending" && activeTab === "sent" && (
                <button
                  onClick={() => handleUpdateStatus(exchange.id, "rejected")}
                  className="bg-red-50 text-red-600 px-6 py-2 rounded-lg font-bold hover:bg-red-100 transition-colors"
                >
                  Cancelar
                </button>
              )}

              {exchange.status === "accepted" && activeTab === "sent" && (
                <Link
                  href="/protected/messages"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold text-center hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare size={16} /> Contactar
                </Link>
              )}
            </>
          )}

          {isActive && (
            <>
              <button
                onClick={() => handleOpenDetails(profile.id)}
                className="bg-[#eef6ff] text-[#0057cc] px-6 py-2 rounded-lg font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
              >
                <Eye size={16} /> Detalles
              </button>
              <Link
                href="/protected/messages"
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold text-center hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <MessageSquare size={16} /> Contactar
              </Link>
              {isSender && (
                <button
                  onClick={() => handleUpdateStatus(exchange.id, "completed")}
                  className="bg-[#0057cc] text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                >
                  Completar
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
      {message && (
        <NotificationCard
          type={message.type}
          title={message.text}
          onClose={() => setMessage(null)}
        />
      )}

      <UserDetailModal
        isOpen={selectedUserModal.isOpen}
        onClose={() =>
          setSelectedUserModal({ ...selectedUserModal, isOpen: false })
        }
        name={selectedUserModal.userName}
        userId={selectedUserModal.userId}
        currentUserId={userId}
        avatarUrl={selectedUserModal.userAvatar}
        skills={selectedUserModal.skills}
        availability={selectedUserModal.availability}
        academicInfo={{
          gpa: selectedUserModal.gpa,
          career: selectedUserModal.career,
        }}
      />

      <div className="lg:col-span-8">
        <div className="flex gap-8 mb-8 border-b border-gray-100 overflow-x-auto">
          {[
            { id: "received", label: "Solicitudes recibidas" },
            { id: "sent", label: "Enviadas" },
            { id: "active", label: "Activos" },
            { id: "history", label: "Historial" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-4 text-lg font-semibold transition-all relative whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-black"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black rounded-full" />
              )}
            </button>
          ))}
        </div>

        <div className="min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <RefreshCw className="w-10 h-10 animate-spin text-[#9cd2d3] mb-4" />
              <p className="text-gray-500">Actualizando...</p>
            </div>
          ) : exchanges.length > 0 ? (
            exchanges.map((ex) => <ExchangeCard key={ex.id} exchange={ex} />)
          ) : (
            <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-gray-100">
              <HistoryIcon className="w-12 h-12 mx-auto text-gray-200 mb-4" />
              <p className="text-gray-400 text-lg font-medium">
                No hay registros aquí
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50 flex flex-col items-center">
          <h4 className="text-[#114c5f] font-bold text-lg mb-8 text-center">
            Límite de matches
          </h4>
          <div className="relative w-40 h-40">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-gray-100"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={282.7}
                strokeDashoffset={282.7 - 282.7 * (activeCount / 5)}
                strokeLinecap="round"
                className="text-[#0057cc] transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-[#114c5f]">
                {activeCount}/5
              </span>
            </div>
          </div>
          <p className="text-gray-500 font-medium mt-6">
            Activos {activeCount} de 5
          </p>
        </div>
        <div className="bg-[#0b1219] p-8 rounded-[2rem] text-white">
          <h4 className="font-bold text-xl mb-6">Sugerencias rápidas</h4>
          <ul className="space-y-4">
            {[
              "Programación Web",
              "Diseño Gráfico (UI/UX)",
              "Marketing Digital",
              "Inglés Conversacional",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 group cursor-pointer"
              >
                <div className="w-2 h-2 bg-[#0057cc] rounded-full group-hover:scale-125 transition-transform" />
                <span className="text-gray-300 group-hover:text-white transition-colors">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
