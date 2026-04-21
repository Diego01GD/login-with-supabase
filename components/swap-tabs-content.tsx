"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Eye,
  MessageSquare,
  RefreshCw,
  History as HistoryIcon,
  Star,
  HandHeart,
  ShieldCheck,
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

const ACTIVE_EXCHANGES_LIMIT = 6;

export function SwapTabsContent({
  userId,
  onActiveExchangesChange,
  onPendingReceivedChange,
}: SwapTabsContentProps) {
  type RatingKey =
    | "generalRating"
    | "masteryRating"
    | "clarityRating"
    | "punctualityRating"
    | "attitudeRating"
    | "respectRating";

  const [activeTab, setActiveTab] = useState<
    "received" | "sent" | "active" | "history"
  >("received");
  const [exchanges, setExchanges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCount, setActiveCount] = useState(0);
  const [pendingReceivedCount, setPendingReceivedCount] = useState(0);
  const [statusUpdating, setStatusUpdating] = useState<{
    exchangeId: string;
    newStatus: string;
  } | null>(null);
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

  const [reviewedExchangeIds, setReviewedExchangeIds] = useState<string[]>([]);
  const [reviewPrompt, setReviewPrompt] = useState<{
    isOpen: boolean;
    exchange: any | null;
  }>({
    isOpen: false,
    exchange: null,
  });
  const [reviewForm, setReviewForm] = useState<{
    isOpen: boolean;
    exchange: any | null;
    generalRating: number;
    masteryRating: number;
    clarityRating: number;
    punctualityRating: number;
    attitudeRating: number;
    respectRating: number;
    comment: string;
    isSubmitting: boolean;
  }>({
    isOpen: false,
    exchange: null,
    generalRating: 0,
    masteryRating: 0,
    clarityRating: 0,
    punctualityRating: 0,
    attitudeRating: 0,
    respectRating: 0,
    comment: "",
    isSubmitting: false,
  });

  const resetReviewForm = (exchange: any | null = null) => {
    setReviewForm({
      isOpen: !!exchange,
      exchange,
      generalRating: 0,
      masteryRating: 0,
      clarityRating: 0,
      punctualityRating: 0,
      attitudeRating: 0,
      respectRating: 0,
      comment: "",
      isSubmitting: false,
    });
  };

  const openReviewForm = (exchange: any) => {
    setReviewPrompt({ isOpen: false, exchange: null });
    resetReviewForm(exchange);
  };

  const handleSetRating = (key: RatingKey, value: number) => {
    setReviewForm((prev) => ({ ...prev, [key]: value }));
  };

  const allRatingsComplete =
    reviewForm.generalRating > 0 &&
    reviewForm.masteryRating > 0 &&
    reviewForm.clarityRating > 0 &&
    reviewForm.punctualityRating > 0 &&
    reviewForm.attitudeRating > 0 &&
    reviewForm.respectRating > 0;

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

      const reviewsRes = await fetch("/api/exchange-reviews");
      const reviewsJson = await reviewsRes.json();
      const reviewedIds = (reviewsJson.data || []).map(
        (review: any) => review.exchange_id,
      );
      setReviewedExchangeIds(reviewedIds);

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

  const handleUpdateStatus = async (exchange: any, newStatus: string) => {
    setStatusUpdating({ exchangeId: exchange.id, newStatus });
    try {
      const response = await fetch("/api/skill-exchanges", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exchangeId: exchange.id, newStatus }),
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

      if (
        newStatus === "completed" &&
        exchange.sender_id === userId &&
        !reviewedExchangeIds.includes(exchange.id)
      ) {
        setReviewPrompt({
          isOpen: true,
          exchange,
        });
      }

      // Recargar datos para que desaparezca de la pestaña actual y se mueva si es necesario
      loadData();
    } catch (error) {
      setMessage({ type: "error", text: "Error de conexión" });
    } finally {
      setStatusUpdating(null);
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

  const handleSubmitReview = async () => {
    if (!reviewForm.exchange || !allRatingsComplete) {
      setMessage({
        type: "error",
        text: "Completa todas las calificaciones antes de enviar.",
      });
      return;
    }

    try {
      setReviewForm((prev) => ({ ...prev, isSubmitting: true }));

      const response = await fetch("/api/exchange-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exchangeId: reviewForm.exchange.id,
          generalRating: reviewForm.generalRating,
          masteryRating: reviewForm.masteryRating,
          clarityRating: reviewForm.clarityRating,
          punctualityRating: reviewForm.punctualityRating,
          attitudeRating: reviewForm.attitudeRating,
          respectRating: reviewForm.respectRating,
          comment: reviewForm.comment,
          skillName: reviewForm.exchange.skill_name,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        setMessage({
          type: "error",
          text: payload.error || "No se pudo guardar la reseña",
        });
        return;
      }

      setReviewedExchangeIds((prev) => [...prev, reviewForm.exchange.id]);
      setMessage({
        type: "success",
        text: "¡Calificación enviada correctamente!",
      });
      resetReviewForm(null);
      setReviewPrompt({ isOpen: false, exchange: null });
      loadData();
    } catch {
      setMessage({
        type: "error",
        text: "No se pudo guardar la reseña. Intenta de nuevo.",
      });
    } finally {
      setReviewForm((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  const StarRatingInput = ({
    label,
    value,
    ratingKey,
    mirrorKey,
  }: {
    label: string;
    value: number;
    ratingKey: RatingKey;
    mirrorKey?: RatingKey;
  }) => (
    <div className="bg-[#e8edf7] rounded-2xl p-4">
      <p className="text-center font-black text-[#1a1a1a] text-xl md:text-2xl mb-3">
        {label}
      </p>
      <div className="flex justify-center gap-1 md:gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => {
              handleSetRating(ratingKey, star);
              if (mirrorKey) handleSetRating(mirrorKey, star);
            }}
            className="hover:scale-110 transition-transform"
          >
            <Star
              size={34}
              className={
                star <= value
                  ? "fill-[#f4c542] text-[#f4c542]"
                  : "text-[#f4c542]"
              }
            />
          </button>
        ))}
      </div>
    </div>
  );

  const ExchangeCard = ({ exchange }: { exchange: any }) => {
    const profile = exchange.profiles;
    if (!profile) return null;

    const isHistory = activeTab === "history";
    const isActive = activeTab === "active";
    const isSender = exchange.sender_id === userId;
    const canReview = isHistory && isSender && exchange.status === "completed";
    const alreadyReviewed = reviewedExchangeIds.includes(exchange.id);
    const isRowUpdating = statusUpdating?.exchangeId === exchange.id;
    const isAcceptedLoading =
      isRowUpdating && statusUpdating?.newStatus === "accepted";
    const isRejectedLoading =
      isRowUpdating && statusUpdating?.newStatus === "rejected";
    const isCompletedLoading =
      isRowUpdating && statusUpdating?.newStatus === "completed";

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
                    : exchange.status === "completed"
                      ? "bg-blue-100 text-blue-700"
                      : exchange.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : exchange.status === "rejected"
                          ? "bg-red-100 text-red-700"
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
                onClick={() => handleUpdateStatus(exchange, "accepted")}
                disabled={isRowUpdating}
                className="bg-[#0057cc] text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors"
              >
                {isAcceptedLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <RefreshCw size={16} className="animate-spin" />
                    Aceptando...
                  </span>
                ) : (
                  "Aceptar"
                )}
              </button>
              <button
                onClick={() => handleUpdateStatus(exchange, "rejected")}
                disabled={isRowUpdating}
                className="bg-[#eef6ff] text-[#0057cc] px-6 py-2 rounded-lg font-bold hover:bg-blue-50 transition-colors"
              >
                {isRejectedLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <RefreshCw size={16} className="animate-spin" />
                    Ignorando...
                  </span>
                ) : (
                  "Ignorar"
                )}
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

              {canReview && (
                <button
                  onClick={() => !alreadyReviewed && openReviewForm(exchange)}
                  disabled={alreadyReviewed}
                  className={`px-6 py-2 rounded-lg font-bold transition-colors ${
                    alreadyReviewed
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                      : "bg-[#0057cc] text-white hover:bg-blue-700"
                  }`}
                >
                  {alreadyReviewed ? "Reseña realizada" : "Hacer reseña"}
                </button>
              )}

              {exchange.status === "pending" && activeTab === "sent" && (
                <button
                  onClick={() => handleUpdateStatus(exchange, "rejected")}
                  disabled={isRowUpdating}
                  className="bg-red-50 text-red-600 px-6 py-2 rounded-lg font-bold hover:bg-red-100 transition-colors"
                >
                  {isRejectedLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <RefreshCw size={16} className="animate-spin" />
                      Cancelando...
                    </span>
                  ) : (
                    "Cancelar"
                  )}
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
                  onClick={() => handleUpdateStatus(exchange, "completed")}
                  disabled={isRowUpdating}
                  className="bg-[#0057cc] text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                >
                  {isCompletedLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <RefreshCw size={16} className="animate-spin" />
                      Completando...
                    </span>
                  ) : (
                    "Completar"
                  )}
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
        selectedSkill={selectedUserModal.selectedSkill}
        skills={selectedUserModal.skills}
        availability={selectedUserModal.availability}
        academicInfo={{
          gpa: selectedUserModal.gpa,
          career: selectedUserModal.career,
        }}
      />

      {reviewPrompt.isOpen && reviewPrompt.exchange && (
        <div className="fixed inset-0 z-[120] bg-black/45 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-[#dbe6f1] p-6 shadow-2xl">
            <h3 className="text-2xl font-black text-[#114c5f] mb-2">
              Intercambio completado
            </h3>
            <p className="text-[#2f4050] mb-1 font-semibold">
              ¿Quieres reseñar este intercambio ahora?
            </p>
            <p className="text-sm text-[#4f6070] mb-5">
              Habilidad: {reviewPrompt.exchange.skill_name || "No especificada"}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setReviewPrompt({ isOpen: false, exchange: null });
                  setMessage({
                    type: "success",
                    text: "Puedes reseñar este intercambio más tarde desde Historial.",
                  });
                }}
                className="px-4 py-2 rounded-lg border border-[#0057cc] text-[#0057cc] font-semibold hover:bg-[#eff6ff]"
              >
                Más tarde
              </button>
              <button
                onClick={() => openReviewForm(reviewPrompt.exchange)}
                className="px-4 py-2 rounded-lg bg-[#0057cc] text-white font-semibold hover:bg-[#004499]"
              >
                Sí, reseñar ahora
              </button>
            </div>
          </div>
        </div>
      )}

      {reviewForm.isOpen && reviewForm.exchange && (
        <div className="fixed inset-0 z-[130] bg-black/50 overflow-y-auto p-4 md:p-6">
          <div className="min-h-full flex items-center justify-center">
            <div className="w-full max-w-4xl bg-[#f7f3e7] rounded-3xl border border-[#8f9499] p-4 md:p-6 shadow-2xl">
              <div className="flex justify-between items-start gap-4 mb-5">
                <div>
                  <h2 className="text-3xl md:text-4xl font-black text-[#1a1a1a] leading-tight">
                    Calificar intercambio
                  </h2>
                  <p className="text-sm md:text-base text-[#1f1f1f] font-semibold mt-1">
                    Tus calificaciones honestas ayudan a mejorar a la comunidad
                    de SkillSwap
                  </p>
                </div>
                <button
                  onClick={() => resetReviewForm(null)}
                  className="text-[#4a5d70] text-5xl font-bold hover:text-[#1f2d3d] leading-none"
                >
                  ×
                </button>
              </div>

              <div className="rounded-2xl border border-[#8f9499] bg-white p-4 mb-5">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-[#dce7f4] border border-[#dbe5ef] shadow-sm flex-shrink-0">
                    {reviewForm.exchange.profiles?.avatar_url ? (
                      <Image
                        src={reviewForm.exchange.profiles.avatar_url}
                        alt={
                          reviewForm.exchange.profiles.full_name || "Usuario"
                        }
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-[#134f78]">
                        {reviewForm.exchange.profiles?.full_name?.charAt(0) ||
                          "U"}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="text-2xl md:text-3xl font-black text-[#1a1a1a] leading-tight">
                      {reviewForm.exchange.profiles?.full_name || "Usuario"}
                    </p>
                    <p className="text-[#0057cc] text-base md:text-lg font-bold mt-1">
                      {reviewForm.exchange.profiles?.career ||
                        "Carrera no especificada"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#dce7f4] bg-[#f8fbff] px-4 py-3 min-w-[220px]">
                    <p className="text-xs uppercase tracking-wide font-bold text-[#6b7d8f] mb-1">
                      Habilidad del intercambio
                    </p>
                    <p className="text-base md:text-lg font-black text-[#114c5f]">
                      {reviewForm.exchange.skill_name || "No especificada"}
                    </p>
                  </div>
                </div>
              </div>

              <section className="rounded-2xl border border-[#8f9499] bg-white p-4 md:p-5 mb-5">
                <div className="mb-5">
                  <p className="text-2xl md:text-3xl font-black text-[#1a1a1a] mb-2">
                    Escala General (1-5 Estrellas)
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleSetRating("generalRating", star)}
                        className="hover:scale-105 transition-transform"
                      >
                        <Star
                          size={38}
                          className={
                            star <= reviewForm.generalRating
                              ? "fill-[#f4c542] text-[#f4c542]"
                              : "text-[#f4c542]"
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <StarRatingInput
                    label="Dominio del Tema"
                    value={reviewForm.masteryRating}
                    ratingKey="masteryRating"
                  />
                  <StarRatingInput
                    label="Claridad"
                    value={reviewForm.clarityRating}
                    ratingKey="clarityRating"
                  />
                  <StarRatingInput
                    label="Puntualidad"
                    value={reviewForm.punctualityRating}
                    ratingKey="punctualityRating"
                  />
                  <StarRatingInput
                    label="Actitud y Respeto"
                    value={reviewForm.attitudeRating}
                    ratingKey="attitudeRating"
                    mirrorKey="respectRating"
                  />
                </div>
              </section>

              <section className="mb-5">
                <label className="text-xl md:text-2xl font-bold text-[#1a1a1a] block mb-2">
                  Comentario (Recomendado, no obligatorio)
                </label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) =>
                    setReviewForm((prev) => ({
                      ...prev,
                      comment: e.target.value,
                    }))
                  }
                  placeholder="Comparte tu experiencia..."
                  className="w-full min-h-[110px] rounded-2xl border border-[#8f9499] px-4 py-3 text-base text-[#1f1f1f] bg-white"
                />
              </section>

              <section className="rounded-2xl border border-[#dce7f4] bg-[#f8fbff] p-4 mb-5">
                <p className="text-base md:text-lg font-black text-[#114c5f] mb-3">
                  Nuestro compromiso con la comunidad
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm md:text-base text-[#23455f]">
                  <div className="flex items-center gap-3">
                    <HandHeart className="mt-0.5 text-[#0057cc]" size={32} />
                    <p>
                      Tus calificaciones fomentan la confianza entre pares y el
                      crecimiento mutuo.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="mt-0.5 text-[#0057cc]" size={32} />
                    <p>
                      Cada evaluación constructiva fortalece perfiles más
                      sólidos y transparentes.
                    </p>
                  </div>
                </div>
              </section>

              <div className="flex flex-wrap justify-end gap-3">
                <button
                  onClick={() => resetReviewForm(null)}
                  className="px-6 py-2.5 rounded-2xl border border-[#7c7c7c] text-[#1a1a1a] text-base md:text-lg font-bold bg-[#e7e7e7] hover:bg-[#dcdcdc]"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={!allRatingsComplete || reviewForm.isSubmitting}
                  className="px-6 py-2.5 rounded-2xl text-base md:text-lg font-bold bg-[#0057cc] text-white hover:bg-[#004499] disabled:bg-gray-400"
                >
                  {reviewForm.isSubmitting
                    ? "Enviando..."
                    : "Enviar Calificaciones"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                strokeDashoffset={
                  282.7 -
                  282.7 * Math.min(1, activeCount / ACTIVE_EXCHANGES_LIMIT)
                }
                strokeLinecap="round"
                className="text-[#0057cc] transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-[#114c5f]">
                {activeCount}/{ACTIVE_EXCHANGES_LIMIT}
              </span>
            </div>
          </div>
          <p className="text-gray-500 font-medium mt-6">
            Activos {activeCount} de {ACTIVE_EXCHANGES_LIMIT}
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
