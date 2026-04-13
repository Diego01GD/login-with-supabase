"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X, Star, Code2, Music, Globe, Briefcase, Award } from "lucide-react";

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  userId?: string;
  currentUserId?: string;
  avatarUrl?: string;
  skills: Array<{
    name: string;
    level: string;
  }>;
  availability: Array<{
    day: string;
    timeSlots: string[];
  }>;
  academicInfo: {
    gpa: number;
    career: string;
  };
}

// Mapeo de iconos por tipo de habilidad (puedes personalizar según necesites)
const getSkillIcon = (skillName: string, level: string) => {
  const lowerSkill = skillName.toLowerCase();
  const iconColor =
    level === "Experto"
      ? "text-white"
      : level === "Avanzado"
        ? "text-white"
        : level === "Intermedio"
          ? "text-black"
          : "text-black";

  if (
    lowerSkill.includes("python") ||
    lowerSkill.includes("javascript") ||
    lowerSkill.includes("code")
  ) {
    return <Code2 className={`w-5 h-5 ${iconColor}`} />;
  }
  if (lowerSkill.includes("música") || lowerSkill.includes("guitarra")) {
    return <Music className={`w-5 h-5 ${iconColor}`} />;
  }
  if (
    lowerSkill.includes("francés") ||
    lowerSkill.includes("inglés") ||
    lowerSkill.includes("idioma")
  ) {
    return <Globe className={`w-5 h-5 ${iconColor}`} />;
  }
  if (lowerSkill.includes("adobe") || lowerSkill.includes("ilustrator")) {
    return <Briefcase className={`w-5 h-5 ${iconColor}`} />;
  }
  return <Award className={`w-5 h-5 ${iconColor}`} />;
};

export function UserDetailModal({
  isOpen,
  onClose,
  name,
  userId,
  currentUserId,
  avatarUrl,
  skills,
  availability,
  academicInfo,
}: UserDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (overlayRef.current && event.target === overlayRef.current) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  const handleMakeMatch = async () => {
    if (!userId || !currentUserId) {
      setMessage({ type: "error", text: "Error: Usuario no identificado" });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/skill-exchanges", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverId: userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({
          type: "error",
          text: data.error || "Error al crear intercambio",
        });
        return;
      }

      setMessage({ type: "success", text: "¡Solicitud enviada exitosamente!" });
      setTimeout(() => {
        onClose();
        setMessage(null);
      }, 2000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Error desconocido",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-black/50 z-40"
      onClick={onClose}
    >
      {/* Modal */}
      <div
        ref={modalRef}
        className="fixed right-0 top-0 h-screen w-full max-w-lg bg-white shadow-2xl z-50 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con botón cerrar */}
        <div className="sticky top-0 bg-white border-b border-[#9cd2d3]/20 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#114c5f]">
            Perfil Detallado
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-[#114c5f]" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-8">
          {/* Avatar */}
          <div className="flex justify-center">
            <div className="relative w-32 h-32">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={name}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover rounded-full border-4 border-[#9cd2d3]"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#dce7f4] text-[#134f78] text-4xl font-bold rounded-full border-4 border-[#9cd2d3]">
                  {name?.slice(0, 1) ?? "U"}
                </div>
              )}
            </div>
          </div>

          {/* Nombre */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-[#114c5f]">{name}</h3>
          </div>

          {/* Rating */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < 4
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-gray-300 text-gray-300"
                  }`}
                />
              ))}
              <p className="text-lg text-black font-bold">4.3</p>
            </div>
            <p className="text-sm text-[#4a4a4a]">(32 reseñas)</p>
          </div>

          {/* Habilidades y Experiencia + Disponibilidad Horaria - Dos Columnas */}
          <div className="grid grid-cols-2 gap-8 pb-6 border-b border-gray-300">
            {/* Habilidades y Experiencia */}
            <div className="border-r border-gray-300 pr-8">
              <h4 className="text-lg font-bold text-[#114c5f] mb-4">
                Habilidades y Experiencia
              </h4>
              <div className="space-y-3">
                {skills && skills.length > 0 ? (
                  skills.map((skill, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        skill.level === "Experto"
                          ? "bg-[#0057cc]"
                          : skill.level === "Avanzado"
                            ? "bg-[#3983A6]"
                            : skill.level === "Intermedio"
                              ? "bg-[#9cd2d3]/70"
                              : "bg-gray-100"
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {getSkillIcon(skill.name, skill.level)}
                      </div>
                      <div className="flex-grow">
                        <p
                          className={`font-semibold text-sm ${
                            skill.level === "Experto"
                              ? "text-white"
                              : skill.level === "Avanzado"
                                ? "text-white"
                                : skill.level === "Intermedio"
                                  ? "text-black"
                                  : "text-black"
                          }`}
                        >
                          {skill.name} - {skill.level}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#4a4a4a]">
                    No hay habilidades registradas
                  </p>
                )}
              </div>
            </div>

            {/* Disponibilidad Horaria */}
            <div>
              <h4 className="text-lg font-bold text-[#114c5f] mb-4">
                Disponibilidad Horaria
              </h4>
              <div className="space-y-2">
                {availability && availability.length > 0 ? (
                  availability.map((slot, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg
                          className="w-4 h-4 text-[#285a77]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 2m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div className="flex-grow">
                        <p className="font-semibold text-sm text-[#114c5f]">
                          {slot.day}:
                        </p>
                        <p className="text-xs text-[#4a4a4a]">
                          {slot.timeSlots.join(", ")}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#4a4a4a]">
                    No hay disponibilidad registrada
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Información Académica - Centrada */}
          <div className="border-t border-[#9cd2d3]/20 pt-6">
            <h4 className="text-lg font-bold text-[#114c5f] mb-4 text-center">
              Información Académica
            </h4>
            <div className="flex flex-col items-center gap-4 text-center">
              <div>
                <p className="text-sm text-[#4a4a4a] font-bold mb-1">
                  Promedio General
                </p>
                <p className="text-2xl font-bold text-[#0057cc]">
                  {academicInfo.gpa}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#4a4a4a] font-bold mb-1">Carrera</p>
                <p className="text-base font-semibold text-[#114c5f]">
                  {academicInfo.career}
                </p>
              </div>
            </div>
          </div>

          {/* Botón Hacer Match */}
          <div className="space-y-4">
            {message && (
              <div
                className={`p-3 rounded-lg text-sm font-medium ${
                  message.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {message.text}
              </div>
            )}
            <button
              onClick={handleMakeMatch}
              disabled={isLoading}
              className="w-full bg-[#0057cc] hover:bg-[#004bb3] disabled:bg-gray-400 text-white font-bold py-3 rounded-2xl transition-colors"
            >
              {isLoading ? "Enviando solicitud..." : "Hacer Match"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
