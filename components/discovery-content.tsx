"use client";

import { useState, useMemo, useCallback } from "react";
import { SearchFilters } from "@/components/search-filters";
import { UserCard } from "@/components/user-card";

interface MatchedUser {
  id: string;
  name: string;
  avatarUrl?: string;
  skill: string;
  level: string;
  schedule: string;
  matchScore: "perfect" | "good" | "fair";
  shift: string;
  career: string;
  gpa: number;
  availability: Array<{ day: string; timeSlots: string[] }>;
}

interface Skill {
  id: string;
  name: string;
  category: string;
}

interface DiscoveryContentProps {
  matches: MatchedUser[];
  fallbackUsers: MatchedUser[];
  allCategories: string[];
  allShifts: string[];
  matchCount?: number;
  currentUserId?: string;
  skillMap: Record<string, Skill>;
}

export function DiscoveryContent({
  matches,
  fallbackUsers,
  allCategories,
  allShifts,
  matchCount = 0,
  currentUserId,
  skillMap,
}: DiscoveryContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    string | undefined
  >();
  const [selectedShift, setSelectedShift] = useState<string | undefined>();

  // Función para calcular relevancia de búsqueda
  const calculateRelevance = (user: MatchedUser, query: string): number => {
    const lowerQuery = query.toLowerCase();
    const name = user.name.toLowerCase();
    const skill = user.skill.toLowerCase();

    // Coincidencia exacta = 100
    if (name === lowerQuery || skill === lowerQuery) return 100;

    // Comienza con = 90
    if (name.startsWith(lowerQuery) || skill.startsWith(lowerQuery)) return 90;

    // Contiene = 80
    if (name.includes(lowerQuery) || skill.includes(lowerQuery)) return 80;

    // Sin coincidencia
    return 0;
  };

  // Obtener categoría de una skill
  const getSkillCategory = useCallback(
    (skillName: string): string => {
      const entry = Object.entries(skillMap).find(
        ([, skill]) => skill.name === skillName,
      );
      return entry ? entry[1].category : "";
    },
    [skillMap],
  );

  // Filtrar y buscar en tiempo real CON RELEVANCIA Y CATEGORÍA
  const filteredMatches = useMemo(() => {
    const results = matches.filter((user) => {
      const relevance = calculateRelevance(user, searchQuery);
      const matchesSearch = !searchQuery || relevance > 0;

      const skillCategory = getSkillCategory(user.skill);
      const matchesCategory =
        !selectedCategory || skillCategory === selectedCategory;

      const matchesShift = !selectedShift || user.shift === selectedShift;

      return matchesSearch && matchesCategory && matchesShift;
    });

    // Ordenar por relevancia si hay búsqueda
    if (searchQuery) {
      results.sort(
        (a, b) =>
          calculateRelevance(b, searchQuery) -
          calculateRelevance(a, searchQuery),
      );
    }

    return results;
  }, [matches, searchQuery, selectedCategory, selectedShift, getSkillCategory]);

  // Filtrar fallback users con la misma lógica que matches
  const filteredFallback = useMemo(() => {
    const results = fallbackUsers.filter((user) => {
      const relevance = calculateRelevance(user, searchQuery);
      const matchesSearch = !searchQuery || relevance > 0;

      const skillCategory = getSkillCategory(user.skill);
      const matchesCategory =
        !selectedCategory || skillCategory === selectedCategory;

      const matchesShift = !selectedShift || user.shift === selectedShift;

      return matchesSearch && matchesCategory && matchesShift;
    });

    if (searchQuery) {
      results.sort(
        (a, b) =>
          calculateRelevance(b, searchQuery) -
          calculateRelevance(a, searchQuery),
      );
    }

    return results;
  }, [
    fallbackUsers,
    searchQuery,
    selectedCategory,
    selectedShift,
    getSkillCategory,
  ]);

  const handleSearch = (
    query: string,
    filters: { category?: string; shift?: string },
  ) => {
    setSearchQuery(query);
    setSelectedCategory(filters.category);
    setSelectedShift(filters.shift);
  };

  // Detectar si hay búsqueda o filtros activos
  const hasActiveFilters = !!(searchQuery || selectedCategory || selectedShift);

  // Calcular habilidades en tendencia (con más usuarios)
  const trendingSkills = useMemo(() => {
    const skillMap = new Map<string, number>();

    [...matches, ...fallbackUsers].forEach((user) => {
      skillMap.set(user.skill, (skillMap.get(user.skill) || 0) + 1);
    });

    return Array.from(skillMap.entries())
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5
  }, [matches, fallbackUsers]);

  // Crear mapa de userId -> todas sus habilidades
  const userSkillsMap = useMemo(() => {
    const map = new Map<string, Array<{ name: string; level: string }>>();

    [...matches, ...fallbackUsers].forEach((user) => {
      if (!map.has(user.id)) {
        map.set(user.id, []);
      }
      const skills = map.get(user.id)!;
      // Evitar duplicados
      if (!skills.some((s) => s.name === user.skill)) {
        skills.push({ name: user.skill, level: user.level });
      }
    });

    return map;
  }, [matches, fallbackUsers]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="col-span-3">
        <SearchFilters
          onSearch={handleSearch}
          categories={allCategories}
          shifts={allShifts}
        />
      </div>
      {/* COLUMNA IZQUIERDA - Contenido Principal (más grande) */}
      <div className="lg:col-span-2 space-y-8">
        {/* Componente de búsqueda y filtros */}

        {/* Resultados */}
        {hasActiveFilters ? (
          // CON FILTROS/BÚSQUEDA ACTIVOS
          filteredMatches.length > 0 ? (
            <div>
              <h2 className="text-3xl font-bold text-[#114c5f] mb-8">
                Coincidencias ({filteredMatches.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredMatches.map((user) => (
                  <UserCard
                    key={`${user.id}-${user.skill}`}
                    userId={user.id}
                    currentUserId={currentUserId}
                    name={user.name}
                    avatarUrl={user.avatarUrl}
                    skill={user.skill}
                    level={user.level}
                    schedule={user.schedule}
                    matchScore={user.matchScore}
                    skills={userSkillsMap.get(user.id)}
                    career={user.career}
                    gpa={user.gpa}
                    dbAvailability={user.availability}
                  />
                ))}
              </div>
            </div>
          ) : filteredFallback.length > 0 ? (
            <div>
              <h2 className="text-3xl font-bold text-[#114c5f] mb-8">
                Compañeros Disponibles ({filteredFallback.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredFallback.map((user) => (
                  <UserCard
                    key={`${user.id}-${user.skill}`}
                    userId={user.id}
                    currentUserId={currentUserId}
                    name={user.name}
                    avatarUrl={user.avatarUrl}
                    skill={user.skill}
                    level={user.level}
                    schedule={user.schedule}
                    matchScore={user.matchScore}
                    skills={userSkillsMap.get(user.id)}
                    career={user.career}
                    gpa={user.gpa}
                    dbAvailability={user.availability}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-[#9cd2d3]/20">
              <h3 className="text-2xl font-bold text-[#114c5f] mb-4">
                Sin resultados
              </h3>
              <p className="text-[#4a4a4a] text-lg">
                No encontramos compañeros que coincidan con tus criterios de
                búsqueda. Intenta ajustar los filtros.
              </p>
            </div>
          )
        ) : matches.length === 0 ? (
          // SIN FILTROS Y SIN MATCHES INICIALES - Mostrar "No hay coincidencias" + fallback
          <div>
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-[#9cd2d3]/20 mb-8">
              <h3 className="text-2xl font-bold text-[#114c5f] mb-4">
                No hay coincidencias disponibles
              </h3>
              <p className="text-[#4a4a4a] text-lg">
                No encontramos usuarios que ofrezcan las habilidades que buscas
                aprender. Pero aquí hay otras habilidades disponibles:
              </p>
            </div>

            {fallbackUsers.length > 0 ? (
              <div>
                <h2 className="text-3xl font-bold text-[#114c5f] mb-8">
                  Otras Habilidades Disponibles ({fallbackUsers.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {fallbackUsers.map((user) => (
                    <UserCard
                      key={`${user.id}-${user.skill}`}
                      userId={user.id}
                      currentUserId={currentUserId}
                      name={user.name}
                      avatarUrl={user.avatarUrl}
                      skill={user.skill}
                      level={user.level}
                      schedule={user.schedule}
                      matchScore={user.matchScore}
                      skills={userSkillsMap.get(user.id)}
                      career={user.career}
                      gpa={user.gpa}
                      dbAvailability={user.availability}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-[#9cd2d3]/20">
                <p className="text-[#4a4a4a] text-lg">
                  No hay más habilidades disponibles en SkillSwap.
                </p>
              </div>
            )}
          </div>
        ) : (
          // SIN FILTROS Y HAY MATCHES - Mostrar matches
          <div>
            <h2 className="text-3xl font-bold text-[#114c5f] mb-8">
              Compañeros Disponibles ({matches.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {matches.map((user) => (
                <UserCard
                  key={`${user.id}-${user.skill}`}
                  userId={user.id}
                  currentUserId={currentUserId}
                  name={user.name}
                  avatarUrl={user.avatarUrl}
                  skill={user.skill}
                  level={user.level}
                  schedule={user.schedule}
                  matchScore={user.matchScore}
                  skills={userSkillsMap.get(user.id)}
                  career={user.career}
                  gpa={user.gpa}
                  dbAvailability={user.availability}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* COLUMNA DERECHA - Sidebar */}
      <div className="lg:col-span-1 space-y-8">
        {/* Estado de Intercambios */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#9cd2d3]/20 top-20">
          <h3 className="text-2xl font-bold text-[#114c5f] mb-3">
            Estado de <br /> Intercambios
          </h3>
          <p className="text-[#4a4a4a] mb-4">
            Tienes{" "}
            <span className="font-bold text-[#0057cc]">{matchCount}</span> de{" "}
            <span className="font-bold">5</span> intercambios activos
          </p>

          {/* Barra de progreso */}
          <div className="w-full bg-[#e8f0f2] rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#0057cc] to-[#9cd2d3] h-full rounded-full transition-all duration-300"
              style={{ width: `${(matchCount / 5) * 100}%` }}
            />
          </div>
          <p className="text-xs text-[#4a4a4a] mt-2 text-right">
            {matchCount}/5
          </p>
        </div>

        {/* Habilidades en Tendencia */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#9cd2d3]/20">
          <h3 className="text-2xl font-bold text-[#114c5f] mb-4">
            Habilidades en <br /> Tendencia
          </h3>
          <div className="space-y-3">
            {trendingSkills.length > 0 ? (
              trendingSkills.map(({ skill, count }, index) => (
                <div
                  key={skill}
                  className="flex items-center justify-between p-3 bg-[#f7f3e7] rounded-xl hover:bg-[#f0eadc] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-[#0057cc] bg-white rounded-full w-6 h-6 flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-sm font-semibold text-[#114c5f]">
                      {skill}
                    </span>
                  </div>
                  <span className="text-xs text-[#4a4a4a] bg-white px-2 py-1 rounded-lg">
                    {count} {count === 1 ? "persona" : "personas"}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#4a4a4a]">
                Sin habilidades disponibles
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
