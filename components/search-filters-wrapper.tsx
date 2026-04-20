"use client";

import { useState, useMemo } from "react";
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
}

interface Skill {
  id: string;
  name: string;
  category: string;
}

interface SearchFiltersWrapperProps {
  initialMatches: MatchedUser[];
  allSkills: Skill[];
  allShifts: string[];
}

export function SearchFiltersWrapper({
  initialMatches,
  allSkills,
  allShifts,
}: SearchFiltersWrapperProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    string | undefined
  >();
  const [selectedShift, setSelectedShift] = useState<string | undefined>();

  // Filtrar y buscar en tiempo real
  const filteredMatches = useMemo(() => {
    return initialMatches.filter((user) => {
      // Filtro por búsqueda (nombre o habilidad)
      const matchesSearch =
        !searchQuery ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.skill.toLowerCase().includes(searchQuery.toLowerCase());

      // Filtro por categoria
      const matchesCategory = !selectedCategory || true;

      // Filtro por shift
      const matchesShift = !selectedShift || user.shift === selectedShift;

      return matchesSearch && matchesCategory && matchesShift;
    });
  }, [initialMatches, searchQuery, selectedCategory, selectedShift]);

  const handleSearch = (
    query: string,
    filters: {
      category?: string;
      shift?: string;
      level?: string;
      skillName?: string;
    },
  ) => {
    setSearchQuery(query);
    setSelectedCategory(filters.category);
    setSelectedShift(filters.shift);
  };

  const categories = Array.from(new Set(allSkills.map((s) => s.category)));
  const skillNames = Array.from(new Set(allSkills.map((s) => s.name)));

  return (
    <div className="space-y-8">
      {/* Componente de búsqueda y filtros */}
      <SearchFilters
        onSearch={handleSearch}
        categories={categories}
        shifts={allShifts}
        skillNames={skillNames}
      />

      {/* Resultados */}
      <div>
        {filteredMatches.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-[#9cd2d3]/20">
            <h3 className="text-2xl font-bold text-[#114c5f] mb-4">
              Sin resultados
            </h3>
            <p className="text-[#4a4a4a] text-lg">
              No encontramos compañeros que coincidan con tus criterios de
              búsqueda. Intenta ajustar los filtros.
            </p>
          </div>
        ) : (
          <div>
            <h2 className="text-3xl font-bold text-[#114c5f] mb-8">
              Compañeros Disponibles ({filteredMatches.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMatches.map((user) => (
                <UserCard
                  key={`${user.id}-${user.skill}`}
                  userId={user.id}
                  name={user.name}
                  avatarUrl={user.avatarUrl}
                  skill={user.skill}
                  level={user.level}
                  schedule={user.schedule}
                  matchScore={user.matchScore}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
