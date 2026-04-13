"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Check,
  X,
  History,
  Eye,
  MessageSquare,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { UserDetailModal } from "./user-detail-modal";
import { NotificationCard } from "./notification-card";

interface ExchangeData {
  id: string;
  created_at: string;
  updated_at?: string;
  status: string;
  sender_id?: string;
  receiver_id?: string;
}

interface ExchangeWithProfile extends ExchangeData {
  profiles?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    career: string;
  };
}

interface SwapTabsContentProps {
  userId: string;
  onActiveExchangesChange?: (count: number) => void;
  isLoading?: boolean;
}

export function SwapTabsContent({
  userId,
  onActiveExchangesChange,
  isLoading = false,
}: SwapTabsContentProps) {
  const [activeTab, setActiveTab] = useState<"received" | "sent" | "history">(
    "received",
  );
  const [receivedExchanges, setReceivedExchanges] = useState<
    ExchangeWithProfile[]
  >([]);
  const [sentExchanges, setSentExchanges] = useState<ExchangeWithProfile[]>([]);
  const [historyExchanges, setHistoryExchanges] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [selectedUserModal, setSelectedUserModal] = useState<{
    isOpen: boolean;
    userId?: string;
    userName?: string;
    userAvatar?: string;
    career?: string;
    gpa?: number;
    skills?: any[];
    availability?: any[];
  }>({
    isOpen: false,
  });

  // Cargar datos
  const loadData = async () => {
    setDataLoading(true);
    try {
      // Solicitudes recibidas
      const receivedRes = await fetch(`/api/skill-exchanges?type=received`);
      const receivedData = await receivedRes.json();

      // Solicitudes enviadas (TODAS, no solo pending)
      const sentRes = await fetch(`/api/skill-exchanges?type=sent`);
      const sentData = await sentRes.json();

      // Historial
      const historyRes = await fetch(`/api/skill-exchanges?type=history`);
      const historyData = await historyRes.json();

      setReceivedExchanges(receivedData.data || []);
      setSentExchanges(sentData.data || []);
      setHistoryExchanges(historyData.data || []);

      // Actualizar contador
      const activeCount =
        [
          ...(receivedData.data?.filter((e: any) => e.status === "accepted") ||
            []),
          ...(sentData.data?.filter((e: any) => e.status === "accepted") || []),
        ].length / 2; // Dividir por 2 porque cada exchange aparece en ambos
      onActiveExchangesChange?.(activeCount);
    } catch (error) {
      console.error("Error cargando datos:", error);
      setMessage({
        type: "error",
        text: "Error al cargar los datos",
      });
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Recargar cada 5 segundos para ver cambios nuevos
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateExchange = async (
    exchangeId: string,
    newStatus: "accepted" | "rejected" | "completed",
  ) => {
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

      if (newStatus === "accepted") {
        setMessage({
          type: "success",
          text: "¡Solicitud aceptada! Ahora puedes comenzar a intercambiar.",
        });
      } else if (newStatus === "rejected") {
        setMessage({ type: "success", text: "Solicitud rechazada." });
      }

      // Recargar datos
      await loadData();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-700 border-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-300";
      case "completed":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "expired":
        return "bg-gray-100 text-gray-700 border-gray-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pendiente",
      accepted: "Aceptado",
      rejected: "Rechazado",
      completed: "Completado",
      expired: "Expirado",
    };
    return labels[status] || status;
  };

  const ExchangeCard = ({
    exchange,
    profile,
    type = "received",
  }: {
    exchange: ExchangeData;
    profile: {
      id: string;
      full_name: string;
      avatar_url?: string;
      career: string;
    };
    type?: "received" | "sent" | "history";
  }) => {
    const handleOpenModal = async () => {
      // Aquí iría la lógica para fetch de detalles completos del usuario
      setSelectedUserModal({
        isOpen: true,
        userId: profile.id,
        userName: profile.full_name,
        userAvatar: profile.avatar_url,
        career: profile.career,
      });
    };

    return (
      <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all border border-[#9cd2d3]/20 overflow-hidden">
        <div className="p-6 space-y-4">
          {/* Header con avatar */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-full overflow-hidden bg-[#dce7f4]">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-lg font-bold text-[#134f78]">
                  {profile.full_name?.slice(0, 1) ?? "U"}
                </div>
              )}
            </div>

            <div className="flex-grow">
              <h3 className="text-base font-bold text-[#114c5f]">
                {profile.full_name}
              </h3>
              <p className="text-sm text-[#4a4a4a]">{profile.career}</p>
              <p className="text-xs text-[#9cd2d3] mt-1">
                {new Date(exchange.created_at).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>

            <div
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                exchange.status,
              )}`}
            >
              {getStatusLabel(exchange.status)}
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-3 pt-2">
            {type === "received" && (
              <>
                <button
                  onClick={() => handleUpdateExchange(exchange.id, "accepted")}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#0057cc] hover:bg-[#004bb3] text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Aceptar
                </button>
                <button
                  onClick={() => handleUpdateExchange(exchange.id, "rejected")}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-[#114c5f] font-semibold py-2.5 px-4 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  Ignorar
                </button>
              </>
            )}

            {type === "sent" && (
              <>
                <button
                  onClick={handleOpenModal}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#0057cc] hover:bg-[#004bb3] text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Detalles
                </button>

                {exchange.status === "pending" && (
                  <button
                    onClick={() =>
                      handleUpdateExchange(exchange.id, "rejected")
                    }
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-[#114c5f] font-semibold py-2.5 px-4 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                )}

                {exchange.status === "accepted" && (
                  <Link
                    href="/protected/messages"
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Contactar
                  </Link>
                )}
              </>
            )}

            {type === "history" && (
              <button
                onClick={handleOpenModal}
                className="w-full flex items-center justify-center gap-2 bg-[#0057cc] hover:bg-[#004bb3] text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4" />
                Ver Detalles
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-[#9cd2d3] border-t-[#0057cc] animate-spin mx-auto mb-4" />
          <p className="text-[#4a4a4a]">Cargando solicitudes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notificación */}
      {message && (
        <NotificationCard
          type={message.type}
          message={message.text}
          onClose={() => setMessage(null)}
        />
      )}

      {/* Modal de detalles */}
      {selectedUserModal.isOpen && selectedUserModal.userId && (
        <UserDetailModal
          isOpen={selectedUserModal.isOpen}
          onClose={() =>
            setSelectedUserModal({ ...selectedUserModal, isOpen: false })
          }
          name={selectedUserModal.userName || "Usuario"}
          userId={selectedUserModal.userId}
          currentUserId={userId}
          avatarUrl={selectedUserModal.userAvatar}
          skills={selectedUserModal.skills || []}
          availability={selectedUserModal.availability || []}
          academicInfo={{
            gpa: selectedUserModal.gpa || 0,
            career: selectedUserModal.career || "No especificada",
          }}
        />
      )}

      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b-2 border-[#9cd2d3]/30 overflow-x-auto">
        <button
          onClick={() => setActiveTab("received")}
          className={`pb-4 px-6 font-semibold whitespace-nowrap transition-all relative ${
            activeTab === "received"
              ? "text-[#0057cc]"
              : "text-[#4a4a4a] hover:text-[#114c5f]"
          }`}
        >
          Solicitudes Recibidas
          <span className="ml-2 bg-[#0057cc] text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {receivedExchanges.length}
          </span>
          {activeTab === "received" && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0057cc] rounded-t" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("sent")}
          className={`pb-4 px-6 font-semibold whitespace-nowrap transition-all relative ${
            activeTab === "sent"
              ? "text-[#0057cc]"
              : "text-[#4a4a4a] hover:text-[#114c5f]"
          }`}
        >
          Enviadas
          <span className="ml-2 bg-[#0057cc] text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {sentExchanges.length}
          </span>
          {activeTab === "sent" && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0057cc] rounded-t" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`pb-4 px-6 font-semibold whitespace-nowrap transition-all relative ${
            activeTab === "history"
              ? "text-[#0057cc]"
              : "text-[#4a4a4a] hover:text-[#114c5f]"
          }`}
        >
          Historial
          <span className="ml-2 bg-[#0057cc] text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {historyExchanges.length}
          </span>
          {activeTab === "history" && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0057cc] rounded-t" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {/* SOLICITUDES RECIBIDAS */}
        {activeTab === "received" && (
          <div>
            {receivedExchanges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {receivedExchanges.map((exchange) =>
                  exchange.profiles ? (
                    <ExchangeCard
                      key={exchange.id}
                      exchange={exchange}
                      profile={exchange.profiles}
                      type="received"
                    />
                  ) : null,
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-[#9cd2d3]/30">
                <p className="text-[#4a4a4a] text-lg font-semibold mb-2">
                  No tienes solicitudes pendientes
                </p>
                <p className="text-[#4a4a4a]">
                  Cuando alguien te envíe una solicitud de intercambio,
                  aparecerá aquí.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ENVIADAS */}
        {activeTab === "sent" && (
          <div>
            {sentExchanges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sentExchanges.map((exchange) =>
                  exchange.profiles ? (
                    <ExchangeCard
                      key={exchange.id}
                      exchange={exchange}
                      profile={exchange.profiles}
                      type="sent"
                    />
                  ) : null,
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-[#9cd2d3]/30">
                <p className="text-[#4a4a4a] text-lg font-semibold mb-2">
                  No has enviado solicitudes
                </p>
                <p className="text-[#4a4a4a] mb-4">
                  Dirígete a Descubrir para encontrar compañeros y enviar
                  solicitudes.
                </p>
                <Link
                  href="/protected"
                  className="inline-block bg-[#0057cc] hover:bg-[#004bb3] text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                >
                  Ir a Descubrir
                </Link>
              </div>
            )}
          </div>
        )}

        {/* HISTORIAL */}
        {activeTab === "history" && (
          <div>
            {historyExchanges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {historyExchanges.map((exchange) => {
                  const isInitiator = exchange.sender_id === userId;
                  const profile = isInitiator
                    ? exchange.receiver || {
                        id: "",
                        full_name: "Usuario",
                        career: "",
                      }
                    : exchange.sender || {
                        id: "",
                        full_name: "Usuario",
                        career: "",
                      };

                  return (
                    <ExchangeCard
                      key={exchange.id}
                      exchange={exchange}
                      profile={profile}
                      type="history"
                    />
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-[#9cd2d3]/30">
                <History className="w-16 h-16 mx-auto text-[#9cd2d3] mb-4 opacity-50" />
                <p className="text-[#4a4a4a] text-lg font-semibold mb-2">
                  Sin historial
                </p>
                <p className="text-[#4a4a4a]">
                  Los intercambios completados, rechazados o expirados
                  aparecerán aquí.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
