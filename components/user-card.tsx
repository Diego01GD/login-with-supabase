"use client";

import { useState } from "react";
import Image from "next/image";
import { UserDetailModal } from "./user-detail-modal";

interface Skill {
  name: string;
  level: string;
}

interface TimeSlot {
  day: string;
  timeSlots: string[];
}

interface UserCardProps {
  userId: string;
  name: string;
  avatarUrl?: string;
  skill: string;
  level: string;
  schedule: string;
  matchScore?: "perfect" | "good" | "fair";
  // Datos adicionales para el modal detallado
  skills?: Skill[];
  availability?: TimeSlot[];
  academicInfo?: {
    gpa: number;
    career: string;
  };
  // Datos reales de la base de datos
  career?: string;
  gpa?: number;
  dbAvailability?: Array<{ day: string; timeSlots: string[] }>;
}

export function UserCard({
  name,
  avatarUrl,
  skill,
  level,
  schedule,
  matchScore = "fair",
  skills,
  availability,
  academicInfo,
  career,
  gpa,
  dbAvailability,
}: UserCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Datos por defecto si no se proporcionan
  const defaultSkills =
    skills && skills.length > 0 ? skills : [{ name: skill, level }];
  const defaultAvailability = dbAvailability ||
    availability || [
      { day: "Lunes", timeSlots: ["07:00 - 09:00"] },
      { day: "Martes", timeSlots: ["10:00 - 13:00"] },
      { day: "Jueves", timeSlots: ["15:00 - 18:00"] },
      { day: "Viernes", timeSlots: ["10:00 - 18:00"] },
    ];
  const defaultAcademicInfo = academicInfo || {
    gpa: gpa || 9.4,
    career: career || "Ing. en Sistemas computacionales",
  };

  const getMatchBadge = () => {
    if (matchScore === "perfect") {
      return (
        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
          Match Perfecto ✓
        </div>
      );
    }
    if (matchScore === "good") {
      return (
        <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">
          Buen Match
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-[#9cd2d3]/20 relative">
        {getMatchBadge()}

        {/* Imagen del Usuario */}
        <div className="h-72  flex items-center justify-center overflow-hidden">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={name}
              width={300}
              height={300}
              className="w-[calc(100%-1.5rem)] h-[calc(100%-1.5rem)] object-cover object-center rounded-sm"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#dce7f4] text-[#134f78] text-5xl font-bold">
              {name?.slice(0, 1) ?? "U"}
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="p-5 space-y-4">
          {/* Nombre */}
          <div>
            <h3 className="text-lg font-bold text-[#114c5f]">{name}</h3>
          </div>

          {/* Habilidad */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-[#4a4a4a] uppercase tracking-wider">
              Habilidad que ofrece
            </p>
            <p className="text-base font-semibold text-[#0057cc]">{skill}</p>
          </div>

          {/* Nivel */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-[#4a4a4a] uppercase tracking-wider">
              Nivel
            </p>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  level === "Experto"
                    ? "bg-[#0057cc] text-white"
                    : level === "Avanzado"
                      ? "bg-[#3983A6] text-white"
                      : level === "Intermedio"
                        ? "bg-[#9cd2d3] text-[#114c5f]"
                        : "bg-gray-300 text-gray-700"
                }`}
              >
                {level}
              </span>
            </div>
          </div>

          {/* Horario */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-[#4a4a4a] uppercase tracking-wider">
              Disponibilidad
            </p>
            <p className="text-sm text-[#285a77]">{schedule}</p>
          </div>

          {/* Botón */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full mt-6 bg-[#0057cc] hover:bg-[#004bb3] text-white font-bold py-3 rounded-2xl transition-colors"
          >
            Más Información
          </button>
        </div>
      </div>

      {/* Modal Detallado */}
      <UserDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        name={name}
        avatarUrl={avatarUrl}
        skills={defaultSkills}
        availability={defaultAvailability}
        academicInfo={defaultAcademicInfo}
      />
    </>
  );
}
