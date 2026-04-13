"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Check, X, History } from "lucide-react";
import { NotificationCard } from "./notification-card";

interface ExchangeData {
  id: string;
  created_at: string;
  updated_at?: string;
  status: string;
}

interface ReceivedExchange extends ExchangeData {
  sender_id: string;
  profiles: {
    id: string;
    full_name: string;
    avatar_url?: string;
    career: string;
  };
}

interface SentExchange extends ExchangeData {
  receiver_id: string;
  profiles: {
    id: string;
    full_name: string;
    avatar_url?: string;
    career: string;
  };
}

interface HistoryExchange extends ExchangeData {
  sender_id: string;
  receiver_id: string;
  sender?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    career: string;
  };
  receiver?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    career: string;
  };
}

interface ExchangeTabsContentProps {
  userId: string;
  initialReceivedExchanges: ReceivedExchange[];
  initialSentExchanges: SentExchange[];
  initialHistoryExchanges: HistoryExchange[];
}

export function ExchangeTabsContent({
  userId,
  initialReceivedExchanges,
  initialSentExchanges,
  initialHistoryExchanges,
}: ExchangeTabsContentProps) {
  const [activeTab, setActiveTab] = useState<"received" | "sent" | "history">(
    "received",
  );
  const [receivedExchanges, setReceivedExchanges] = useState(
    initialReceivedExchanges,
  );
  const [sentExchanges, setSentExchanges] = useState(initialSentExchanges);
  const [historyExchanges, setHistoryExchanges] = useState(
    initialHistoryExchanges,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleUpdateExchange = async (
    exchangeId: string,
    newStatus: "accepted" | "rejected" | "completed",
  ) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/skill-exchanges", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exchangeId,
          newStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({
          type: "error",
          text: data.error || "Error al actualizar",
        });
        return;
      }

      // Actualizar el estado local
      if (newStatus === "accepted" || newStatus === "rejected") {
        setReceivedExchanges((prev) =>
          prev.filter((ex) => ex.id !== exchangeId),
        );
        if (newStatus === "accepted") {
          setMessage({
            type: "success",
            text: "¡Solicitud aceptada! Ahora puedes comenzar a intercambiar.",
          });
        } else {
          setMessage({ type: "success", text: "Solicitud rechazada." });
        }

        // Recargar el historial
        const historyResponse = await fetch(
          `/api/skill-exchanges?type=history`,
        );
        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          setHistoryExchanges(historyData.data || []);
        }
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Error desconocido",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-50 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "rejected":
        return "bg-red-50 text-red-700 border-red-200";
      case "completed":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "expired":
        return "bg-gray-50 text-gray-700 border-gray-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
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
    showActions = false,
    isHistory = false,
  }: {
    exchange: ExchangeData;
    profile: {
      id: string;
      full_name: string;
      avatar_url?: string;
      career: string;
    };
    showActions?: boolean;
    isHistory?: boolean;
  }) => (
    <div className="bg-white rounded-xl shadow-sm border border-[#9cd2d3]/20 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header con avatar y nombre */}
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0 w-16 h-16 rounded-full overflow-hidden bg-[#dce7f4]">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.full_name}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-[#134f78]">
                {profile.full_name?.slice(0, 1) ?? "U"}
              </div>
            )}
          </div>
          <div className="flex-grow">
            <h3 className="text-lg font-bold text-[#114c5f]">
              {profile.full_name}
            </h3>
            <p className="text-sm text-[#4a4a4a]">{profile.career}</p>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(exchange.status)}`}
          >
            {getStatusLabel(exchange.status)}
          </div>
        </div>

        {/* Fecha */}
        <div className="text-xs text-[#4a4a4a] mb-4">
          {new Date(exchange.created_at).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>

        {/* Acciones */}
        {showActions && (
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => handleUpdateExchange(exchange.id, "accepted")}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 bg-[#0057cc] hover:bg-[#004bb3] disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              <Check className="w-4 h-4" />
              Aceptar
            </button>
            <button
              onClick={() => handleUpdateExchange(exchange.id, "rejected")}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-400 text-[#114c5f] font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              Ignorar
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Mensaje de notificación */}
      {message && (
        <NotificationCard
          type={message.type}
          message={message.text}
          onClose={() => setMessage(null)}
        />
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-[#9cd2d3]">
        <button
          onClick={() => setActiveTab("received")}
          className={`pb-4 px-4 font-semibold transition-colors border-b-2 ${
            activeTab === "received"
              ? "text-[#0057cc] border-[#0057cc]"
              : "text-[#4a4a4a] border-transparent hover:text-[#114c5f]"
          }`}
        >
          Solicitudes Recibidas ({receivedExchanges.length})
        </button>
        <button
          onClick={() => setActiveTab("sent")}
          className={`pb-4 px-4 font-semibold transition-colors border-b-2 ${
            activeTab === "sent"
              ? "text-[#0057cc] border-[#0057cc]"
              : "text-[#4a4a4a] border-transparent hover:text-[#114c5f]"
          }`}
        >
          Enviadas ({sentExchanges.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-4 px-4 font-semibold transition-colors border-b-2 ${
            activeTab === "history"
              ? "text-[#0057cc] border-[#0057cc]"
              : "text-[#4a4a4a] border-transparent hover:text-[#114c5f]"
          }`}
        >
          Historial ({historyExchanges.length})
        </button>
      </div>

      {/* Contenido de Tabs */}
      <div className="space-y-6">
        {/* SOLICITUDES RECIBIDAS */}
        {activeTab === "received" && (
          <div>
            {receivedExchanges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {receivedExchanges.map((exchange) => (
                  <ExchangeCard
                    key={exchange.id}
                    exchange={exchange}
                    profile={exchange.profiles}
                    showActions={true}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-12 text-center border border-[#9cd2d3]/20">
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
                {sentExchanges.map((exchange) => (
                  <ExchangeCard
                    key={exchange.id}
                    exchange={exchange}
                    profile={exchange.profiles}
                    showActions={false}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-12 text-center border border-[#9cd2d3]/20">
                <p className="text-[#4a4a4a] text-lg font-semibold mb-2">
                  No has enviado solicitudes
                </p>
                <p className="text-[#4a4a4a]">
                  Dirígete a Descubrir para encontrar compañeros y enviar
                  solicitudes.
                </p>
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
                    ? exchange.receiver
                    : exchange.sender;

                  if (!profile) return null;

                  return (
                    <ExchangeCard
                      key={exchange.id}
                      exchange={exchange}
                      profile={profile}
                      showActions={false}
                      isHistory={true}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-12 text-center border border-[#9cd2d3]/20">
                <History className="w-12 h-12 mx-auto text-[#9cd2d3] mb-4" />
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
