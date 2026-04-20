"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MessageCircleHeart,
  MessageSquare,
  Repeat,
  Star,
  CircleCheck,
  Eye,
} from "lucide-react";
import LogoSS from "@/public/images/logo.png";
import { UserDropdownMenu } from "@/components/user-dropdown-menu";

export type FeedbackReviewItem = {
  id: string;
  exchangeId: string;
  authorId: string;
  targetId: string;
  authorName: string;
  authorAvatar?: string;
  skillName: string;
  comment: string;
  createdAt: string;
  ratings: {
    overall: number;
    mastery: number;
    clarity: number;
    punctuality: number;
    attitude: number;
    respect: number;
  };
};

export type FeedbackRatingSummary = {
  totalReviews: number;
  overall: number;
  mastery: number;
  clarity: number;
  punctuality: number;
  attitude: number;
  respect: number;
};

interface FeedbackPageClientProps {
  userName: string;
  avatarUrl?: string;
  initialUnreadCount: number;
  initialPendingExchanges: number;
  summary: FeedbackRatingSummary;
  receivedReviews: FeedbackReviewItem[];
  authoredReviews: FeedbackReviewItem[];
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function toPercent(score: number) {
  return `${Math.max(0, Math.min(100, (score / 5) * 100))}%`;
}

function renderStars(score: number) {
  return Array.from({ length: 5 }, (_, i) => {
    const filled = i < Math.round(score);
    return (
      <Star
        key={i}
        size={16}
        className={filled ? "fill-[#f4c542] text-[#f4c542]" : "text-[#d6d6d6]"}
      />
    );
  });
}

function RatingBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <p className="text-[#1c1c1c] font-semibold text-[17px]">{label}</p>
        <p className="text-[#1c1c1c] font-bold text-[17px]">
          {value.toFixed(1)}
        </p>
      </div>
      <div className="h-4 w-full rounded-full bg-[#d6d6d6] overflow-hidden">
        <div
          className="h-full rounded-full bg-[#0d57bf]"
          style={{ width: toPercent(value) }}
        />
      </div>
    </div>
  );
}

function ReviewCard({
  review,
  onOpen,
}: {
  review: FeedbackReviewItem;
  onOpen: (review: FeedbackReviewItem) => void;
}) {
  return (
    <article
      className="rounded-xl border border-[#8f9499] bg-white p-3 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onOpen(review)}
    >
      <div className="flex justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-11 h-11 rounded-full overflow-hidden border border-[#dbe5ef]">
            {review.authorAvatar ? (
              <Image
                src={review.authorAvatar}
                alt={review.authorName}
                width={44}
                height={44}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#dce7f4] text-[#134f78] font-bold flex items-center justify-center">
                {review.authorName.slice(0, 1)}
              </div>
            )}
          </div>
          <div>
            <p className="text-[28px] font-bold text-[#1c1c1c] leading-tight">
              {review.authorName}
            </p>
            <div className="flex items-center gap-1">
              {renderStars(review.ratings.overall)}
            </div>
          </div>
        </div>
        <p className="text-[12px] text-[#7b7b7b]">
          {formatDate(review.createdAt)}
        </p>
      </div>

      <p className="text-xs text-[#114c5f] font-semibold mb-2">
        Habilidad: {review.skillName}
      </p>

      <p className="text-[15px] text-[#1f1f1f] line-clamp-2 mb-3">
        {review.comment}
      </p>

      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1 rounded-full bg-[#f2f4f7] px-3 py-1 text-[#1f1f1f] font-bold">
          <CircleCheck size={16} /> Intercambio exitoso
        </div>
        <button
          onClick={(event) => {
            event.stopPropagation();
            onOpen(review);
          }}
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#0057cc] hover:text-[#004499]"
        >
          <Eye size={16} /> Ver detalle
        </button>
      </div>
    </article>
  );
}

function ReviewDetailModal({
  review,
  onClose,
}: {
  review: FeedbackReviewItem;
  onClose: () => void;
}) {
  const averageDetail =
    (review.ratings.mastery +
      review.ratings.clarity +
      review.ratings.punctuality +
      review.ratings.attitude +
      review.ratings.respect) /
    5;

  return (
    <div className="fixed inset-0 z-[120] bg-black/45 overflow-y-auto p-4">
      <div className="min-h-full flex items-center justify-center">
        <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-[#dfe8f2] overflow-hidden">
          <div className="bg-gradient-to-r from-[#114c5f] to-[#1b6d86] px-6 py-5 text-white">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="text-3xl font-black">Detalle de reseña</h3>
                <p className="text-sm text-white/90 mt-1">
                  {formatDate(review.createdAt)}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white/90 hover:text-white text-5xl font-bold leading-none"
              >
                ×
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="rounded-2xl border border-[#dbe6f1] bg-[#f8fbff] p-4">
                <p className="text-xs font-bold text-[#6b7d8f] uppercase mb-1">
                  Autor
                </p>
                <p className="text-lg font-black text-[#114c5f]">
                  {review.authorName}
                </p>
              </div>
              <div className="rounded-2xl border border-[#dbe6f1] bg-[#f8fbff] p-4">
                <p className="text-xs font-bold text-[#6b7d8f] uppercase mb-1">
                  Habilidad
                </p>
                <p className="text-lg font-black text-[#114c5f]">
                  {review.skillName}
                </p>
              </div>
              <div className="rounded-2xl border border-[#dbe6f1] bg-[#f8fbff] p-4">
                <p className="text-xs font-bold text-[#6b7d8f] uppercase mb-1">
                  Promedio
                </p>
                <p className="text-lg font-black text-[#114c5f]">
                  {averageDetail.toFixed(1)} / 5.0
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="rounded-2xl border border-[#e3edf7] p-4 bg-white">
                <RatingBar
                  label="Calificación general"
                  value={review.ratings.overall}
                />
              </div>
              <div className="rounded-2xl border border-[#e3edf7] p-4 bg-white">
                <RatingBar
                  label="Dominio del tema"
                  value={review.ratings.mastery}
                />
              </div>
              <div className="rounded-2xl border border-[#e3edf7] p-4 bg-white">
                <RatingBar label="Claridad" value={review.ratings.clarity} />
              </div>
              <div className="rounded-2xl border border-[#e3edf7] p-4 bg-white">
                <RatingBar
                  label="Puntualidad"
                  value={review.ratings.punctuality}
                />
              </div>
              <div className="rounded-2xl border border-[#e3edf7] p-4 bg-white">
                <RatingBar label="Actitud" value={review.ratings.attitude} />
              </div>
              <div className="rounded-2xl border border-[#e3edf7] p-4 bg-white">
                <RatingBar label="Respeto" value={review.ratings.respect} />
              </div>
            </div>

            <div className="rounded-2xl border border-[#dbe6f1] bg-[#f8fbff] p-5">
              <p className="text-sm font-bold text-[#114c5f] mb-2">
                Comentario completo
              </p>
              <p className="text-[#1f1f1f] text-base whitespace-pre-wrap leading-relaxed">
                {review.comment}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FeedbackPageClient({
  userName,
  avatarUrl,
  initialUnreadCount,
  initialPendingExchanges,
  summary,
  receivedReviews,
  authoredReviews,
}: FeedbackPageClientProps) {
  const [selectedReview, setSelectedReview] =
    useState<FeedbackReviewItem | null>(null);
  const [showAllReceived, setShowAllReceived] = useState(false);
  const [showAllAuthored, setShowAllAuthored] = useState(false);

  const firstName = userName ? userName.split(" ")[0] : "Usuario";

  const receivedVisible = useMemo(
    () => (showAllReceived ? receivedReviews : receivedReviews.slice(0, 3)),
    [showAllReceived, receivedReviews],
  );

  const authoredVisible = useMemo(
    () => (showAllAuthored ? authoredReviews : authoredReviews.slice(0, 3)),
    [showAllAuthored, authoredReviews],
  );

  const ringDeg = `${Math.max(0, Math.min(360, (summary.overall / 5) * 360))}deg`;

  return (
    <main className="min-h-screen bg-[#f7f3e7] pb-10">
      <nav className="flex-none flex items-center justify-between px-12 py-4 bg-white/80 backdrop-blur-sm border-b border-[#9cd2d3]/20 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Link href="/protected" className="flex items-center gap-3">
            <Image src={LogoSS} alt="SkillSwap" className="w-32" />
            <span className="text-2xl font-bold text-[#114c5f]">SkillSwap</span>
          </Link>
        </div>

        <div className="flex items-center gap-10">
          <div className="flex gap-8 text-[#114c5f]">
            <Link href="/protected/swap" className="relative">
              <Repeat
                size={26}
                className="hover:text-[#0057cc] transition-all hover:scale-110"
              />
              {initialPendingExchanges > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {initialPendingExchanges > 99
                    ? "99+"
                    : initialPendingExchanges}
                </span>
              )}
            </Link>

            <Link href="/protected/messages" className="relative">
              <MessageSquare
                size={26}
                className="hover:text-[#0057cc] transition-all hover:scale-110"
              />
              {initialUnreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
                  {initialUnreadCount > 99 ? "99+" : initialUnreadCount}
                </span>
              )}
            </Link>

            <Link
              href="/protected/feedback"
              className="relative"
              title="Mi Reputación"
            >
              <MessageCircleHeart
                size={26}
                className="text-[#0057cc] scale-110"
              />
            </Link>
          </div>

          <div className="flex items-center gap-3 border-l pl-8 text-[#114c5f] font-bold">
            <UserDropdownMenu avatarUrl={avatarUrl} firstName={firstName} />
          </div>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex justify-end mb-4">
          <Link
            href="/protected"
            className="text-[#0057cc] hover:text-[#004499] text-lg font-semibold"
          >
            ← Volver a la ventana principal
          </Link>
        </div>

        <h1 className="text-5xl font-black text-[#1c1c1c] mb-2">
          Mi Reputación y Feedback
        </h1>
        <p className="text-[#1f1f1f] font-semibold mb-8">
          Visualiza los comentarios y calificaciones recibidas de tus matchings.
        </p>

        <article className="rounded-2xl border border-[#8f9499] bg-white p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 items-center">
            <div className="md:border-r md:border-[#8f9499] md:pr-6">
              <p className="text-2xl font-bold text-[#1c1c1c] text-center mb-3">
                Calificación Promedio
              </p>
              <div
                className="mx-auto w-40 h-40 rounded-full flex items-center justify-center"
                style={{
                  background: `conic-gradient(#0d57bf ${ringDeg}, #d6d6d6 ${ringDeg})`,
                }}
              >
                <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center">
                  <p className="text-3xl font-black text-[#1c1c1c] leading-none">
                    {summary.overall.toFixed(1)}
                    <span className="text-3xl text-[#777]">/5.0</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-11">
              <RatingBar label="Dominio del Tema" value={summary.mastery} />
              <RatingBar label="Claridad" value={summary.clarity} />
              <RatingBar label="Puntualidad" value={summary.punctuality} />
              <RatingBar
                label="Actitud y Respeto"
                value={(summary.attitude + summary.respect) / 2}
              />
              <p className="sm:col-span-2 text-sm -mt-7 text-[#9a9a9a] font-semibold">
                *Basado en {summary.totalReviews} intercambio
                {summary.totalReviews === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        </article>

        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-[#1c1c1c]">
              Comentarios recientes (sobre ti)
            </h2>
            {receivedReviews.length > 3 && (
              <button
                onClick={() => setShowAllReceived((prev) => !prev)}
                className="text-[#0057cc] hover:text-[#004499] font-semibold"
              >
                {showAllReceived ? "Ver menos" : "Ver más"}
              </button>
            )}
          </div>

          {receivedVisible.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {receivedVisible.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onOpen={setSelectedReview}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[#9fb3c6] bg-white p-6 text-[#516170]">
              Aún no tienes reseñas recibidas.
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-[#1c1c1c]">
              Reseñas que tú has hecho
            </h2>
            {authoredReviews.length > 3 && (
              <button
                onClick={() => setShowAllAuthored((prev) => !prev)}
                className="text-[#0057cc] hover:text-[#004499] font-semibold"
              >
                {showAllAuthored ? "Ver menos" : "Ver más"}
              </button>
            )}
          </div>

          {authoredVisible.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {authoredVisible.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onOpen={setSelectedReview}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[#9fb3c6] bg-white p-6 text-[#516170]">
              Aún no has hecho reseñas.
            </div>
          )}
        </section>
      </section>

      {selectedReview && (
        <ReviewDetailModal
          review={selectedReview}
          onClose={() => setSelectedReview(null)}
        />
      )}
    </main>
  );
}
