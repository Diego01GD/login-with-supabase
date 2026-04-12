"use client";

import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";

interface SearchFiltersProps {
  onSearch: (
    query: string,
    filters: { category?: string; shift?: string },
  ) => void;
  categories: string[];
  shifts: string[];
}

export function SearchFilters({
  onSearch,
  categories,
  shifts,
}: SearchFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showAvailabilityDropdown, setShowAvailabilityDropdown] =
    useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedShift, setSelectedShift] = useState<string>("");

  const categoryRef = useRef<HTMLDivElement>(null);
  const availabilityRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        categoryRef.current &&
        !categoryRef.current.contains(event.target as Node)
      ) {
        setShowCategoryDropdown(false);
      }
      if (
        availabilityRef.current &&
        !availabilityRef.current.contains(event.target as Node)
      ) {
        setShowAvailabilityDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value, {
      category: selectedCategory || undefined,
      shift: selectedShift || undefined,
    });
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setShowCategoryDropdown(false);
    onSearch(searchQuery, {
      category: category || undefined,
      shift: selectedShift || undefined,
    });
  };

  const handleShiftSelect = (shift: string) => {
    setSelectedShift(shift);
    setShowAvailabilityDropdown(false);
    onSearch(searchQuery, {
      category: selectedCategory || undefined,
      shift: shift || undefined,
    });
  };

  const handleReset = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedShift("");
    setShowCategoryDropdown(false);
    setShowAvailabilityDropdown(false);
    onSearch("", {});
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#9cd2d3]/20 flex gap-5 items-center">
      {/* Barra de búsqueda */}
      <div className="relative w-7/12 justify-center">
        <input
          type="text"
          placeholder="Buscar habilidades o personas..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full px-5 py-3 pl-12 bg-[#eff6ff] border-none rounded-2xl text-[#114c5f] md:text-base focus:outline-none focus:ring-2 focus:ring-[#0057cc]"
        />
        <Search
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
      </div>

      {/* Botones de Filtro */}
      <div className="flex gap-3 flex-wrap">
        {/* Botón Categorías */}
        <div className="relative" ref={categoryRef}>
          <button
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className={`px-6 py-2 rounded-2xl font-semibold text-sm transition-colors ${
              selectedCategory
                ? "bg-[#0057cc] text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Categorías
            {selectedCategory && <span className="ml-2">✓</span>}
          </button>

          {showCategoryDropdown && (
            <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-2xl shadow-lg p-3 w-56 z-20 max-h-64 overflow-y-auto">
              <button
                onClick={() => handleCategorySelect("")}
                className={`block w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  !selectedCategory
                    ? "bg-[#0057cc] text-white"
                    : "hover:bg-gray-100 text-[#114c5f]"
                }`}
              >
                Todas las categorías
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  className={`block w-full text-left px-4 py-2 rounded-lg text-[#114c5f] transition-colors ${
                    selectedCategory === category
                      ? "bg-[#0057cc] text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Botón Disponibilidad */}
        <div className="relative" ref={availabilityRef}>
          <button
            onClick={() =>
              setShowAvailabilityDropdown(!showAvailabilityDropdown)
            }
            className={`px-6 py-2 rounded-2xl font-semibold text-sm transition-colors ${
              selectedShift
                ? "bg-[#0057cc] text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Disponibilidad
            {selectedShift && <span className="ml-2">✓</span>}
          </button>

          {showAvailabilityDropdown && (
            <div className="absolute top-full text-[#114c5f] mt-2 left-0 bg-white border border-gray-200 rounded-2xl shadow-lg p-3 w-56 z-20 max-h-64 overflow-y-auto">
              <button
                onClick={() => handleShiftSelect("")}
                className={`block w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  !selectedShift
                    ? "bg-[#0057cc] text-white"
                    : "hover:bg-gray-100 text-[#114c5f]"
                }`}
              >
                Cualquier horario
              </button>
              {shifts.map((shift) => (
                <button
                  key={shift}
                  onClick={() => handleShiftSelect(shift)}
                  className={`block w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    selectedShift === shift
                      ? "bg-[#0057cc] text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {shift}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Botón Limpiar */}
        {(searchQuery || selectedCategory || selectedShift) && (
          <button
            onClick={handleReset}
            className="px-6 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-2xl font-semibold text-sm transition-colors"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}
