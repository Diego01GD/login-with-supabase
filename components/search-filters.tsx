"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  Target, 
  LayoutGrid, 
  BarChart3, 
  CalendarClock, 
  Check,
  Code2,
  Palette,
  Music,
  Languages,
  MessageCircle,
  Trophy,
  Calculator,
  AppWindow,
  Sunrise,
  Sun,
  Moon,
  SignalLow,
  SignalMedium,
  SignalHigh,
  Terminal
} from "lucide-react";

interface SearchFiltersProps {
  onSearch: (
    query: string,
    filters: { 
      category?: string; 
      shift?: string; 
      level?: string; 
      skillName?: string;
    },
  ) => void;
  categories: string[];
  shifts: string[];
  skillNames: string[];
}

export function SearchFilters({
  onSearch,
  categories,
  shifts,
  skillNames,
}: SearchFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedShift, setSelectedShift] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [selectedSkill, setSelectedSkill] = useState<string>("");
  
  const [activeTab, setActiveTab] = useState<"habilidades" | "categorias" | "nivel" | "disponibilidad">("habilidades");

  const modalRef = useRef<HTMLDivElement>(null);

  // Mapeo de iconos para Categorías (Basado en tu CSV)
  const categoryIconMap: Record<string, any> = {
    "Programación": Code2,
    "Diseño": Palette,
    "Música": Music,
    "Idiomas": Languages,
    "Comunicación": MessageCircle,
    "Deportes": Trophy,
    "Matemáticas": Calculator,
    "Herramientas digitales": AppWindow,
  };

  // Mapeo para Niveles
  const levelIconMap: Record<string, any> = {
    "Básico": SignalLow,
    "Intermedio": SignalMedium,
    "Avanzado": SignalHigh,
  };

  // Mapeo para Disponibilidad
  const shiftIconMap: Record<string, any> = {
    "Mañana": Sunrise,
    "Tarde": Sun,
    "Noche": Moon,
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsModalOpen(false);
      }
    }
    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isModalOpen]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    triggerSearch(value, selectedCategory, selectedShift, selectedLevel, selectedSkill);
  };

  const triggerSearch = (query: string, cat: string, shift: string, lvl: string, sk: string) => {
    onSearch(query, {
      category: cat || undefined,
      shift: shift || undefined,
      level: lvl || undefined,
      skillName: sk || undefined,
    });
  };

  const handleReset = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedShift("");
    setSelectedLevel("");
    setSelectedSkill("");
    setIsModalOpen(false);
    onSearch("", {});
  };

  const hasActiveFilters = !!(searchQuery || selectedCategory || selectedShift || selectedLevel || selectedSkill);

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#9cd2d3]/20 flex gap-4 items-center">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar habilidades o personas..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-5 py-3 pl-12 bg-[#eff6ff] border-none rounded-2xl text-[#114c5f] focus:outline-none focus:ring-2 focus:ring-[#0057cc]"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-sm ${
            hasActiveFilters ? "bg-[#0057cc] text-white" : "bg-gray-100 text-[#114c5f] hover:bg-gray-200"
          }`}
        >
          <SlidersHorizontal size={18} />
          Filtros
        </button>

        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-red-50/80 text-red-600 hover:bg-red-100 rounded-2xl font-bold text-sm transition-colors border border-red-100"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            ref={modalRef}
            className="bg-[#f7f3e7] w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[85vh] animate-in zoom-in-95 duration-200"
          >
            {/* Sidebar del Modal */}
            <div className="w-full md:w-72 bg-white p-6 border-r border-gray-100 flex flex-col gap-8">
              <div className="space-y-6">
                <section>
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Explorar</h3>
                  <div className="flex flex-col gap-1">
                    <button 
                      onClick={() => setActiveTab("habilidades")}
                      className={`flex items-center gap-3 text-left text-sm font-bold p-3 rounded-xl transition-all ${activeTab === "habilidades" ? "text-[#0057cc] bg-blue-50" : "text-[#114c5f] hover:bg-gray-50"}`}
                    >
                      <Target size={18} />
                      Habilidades
                    </button>
                    <button 
                      onClick={() => setActiveTab("categorias")}
                      className={`flex items-center gap-3 text-left text-sm font-bold p-3 rounded-xl transition-all ${activeTab === "categorias" ? "text-[#0057cc] bg-blue-50" : "text-[#114c5f] hover:bg-gray-50"}`}
                    >
                      <LayoutGrid size={18} />
                      Categorías
                    </button>
                  </div>
                </section>

                <section>
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Ajustes</h3>
                  <div className="flex flex-col gap-1">
                    <button 
                      onClick={() => setActiveTab("nivel")}
                      className={`flex items-center gap-3 text-left w-full text-sm font-bold p-3 rounded-xl transition-all ${activeTab === "nivel" ? "text-[#0057cc] bg-blue-50" : "text-[#114c5f] hover:bg-gray-50"}`}
                    >
                      <BarChart3 size={18} />
                      Nivel
                    </button>
                    <button 
                      onClick={() => setActiveTab("disponibilidad")}
                      className={`flex items-center gap-3 text-left w-full text-sm font-bold p-3 rounded-xl transition-all ${activeTab === "disponibilidad" ? "text-[#0057cc] bg-blue-50" : "text-[#114c5f] hover:bg-gray-50"}`}
                    >
                      <CalendarClock size={18} />
                      Disponibilidad
                    </button>
                  </div>
                </section>
              </div>

              <button onClick={handleReset} className="mt-auto text-left text-[10px] font-bold text-gray-400 hover:text-red-500 uppercase tracking-widest transition-colors">
                Reiniciar filtros
              </button>
            </div>

            {/* Contenido Dinámico */}
            <div className="flex-1 p-8 overflow-y-auto bg-[#fdfcf9]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-[#114c5f] capitalize">{activeTab}</h2>
                <X className="text-gray-300 hover:text-[#114c5f] cursor-pointer" onClick={() => setIsModalOpen(false)} />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeTab === "habilidades" && skillNames.map(name => (
                  <button
                    key={name}
                    onClick={() => {
                      const val = selectedSkill === name ? "" : name;
                      setSelectedSkill(val);
                      triggerSearch(searchQuery, selectedCategory, selectedShift, selectedLevel, val);
                    }}
                    className={`group p-5 rounded-2xl border-2 text-left transition-all bg-white hover:shadow-md ${selectedSkill === name ? "border-[#0057cc] shadow-md" : "border-transparent"}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <Terminal size={18} className="text-gray-300 group-hover:text-[#0057cc]" />
                      {selectedSkill === name && <Check size={16} className="text-[#0057cc]" />}
                    </div>
                    <p className="font-bold text-[#114c5f] text-sm">{name}</p>
                  </button>
                ))}

                {activeTab === "categorias" && categories.map(cat => {
                  const Icon = categoryIconMap[cat] || LayoutGrid;
                  return (
                    <button key={cat} onClick={() => {
                      const val = selectedCategory === cat ? "" : cat;
                      setSelectedCategory(val);
                      triggerSearch(searchQuery, val, selectedShift, selectedLevel, selectedSkill);
                    }}
                    className={`group p-5 rounded-2xl border-2 text-left transition-all bg-white hover:shadow-md ${selectedCategory === cat ? "border-[#0057cc] shadow-md" : "border-transparent"}`}
                    >
                      <Icon size={24} className="text-gray-300 group-hover:text-[#0057cc] mb-3" />
                      <p className="font-bold text-[#114c5f] text-sm">{cat}</p>
                    </button>
                  )
                })}

                {activeTab === "nivel" && Object.keys(levelIconMap).map(lvl => {
                  const Icon = levelIconMap[lvl];
                  return (
                    <button key={lvl} onClick={() => {
                      const val = selectedLevel === lvl ? "" : lvl;
                      setSelectedLevel(val);
                      triggerSearch(searchQuery, selectedCategory, selectedShift, val, selectedSkill);
                    }}
                    className={`group p-5 rounded-2xl border-2 text-left transition-all bg-white hover:shadow-md ${selectedLevel === lvl ? "border-[#0057cc] shadow-md" : "border-transparent"}`}
                    >
                      <Icon size={24} className="text-gray-300 group-hover:text-[#0057cc] mb-3" />
                      <p className="font-bold text-[#114c5f] text-sm">{lvl}</p>
                    </button>
                  )
                })}

                {activeTab === "disponibilidad" && Object.keys(shiftIconMap).map(shift => {
                  const Icon = shiftIconMap[shift];
                  return (
                    <button key={shift} onClick={() => {
                      const val = selectedShift === shift ? "" : shift;
                      setSelectedShift(val);
                      triggerSearch(searchQuery, selectedCategory, val, selectedLevel, selectedSkill);
                    }}
                    className={`group p-5 rounded-2xl border-2 text-left transition-all bg-white hover:shadow-md ${selectedShift === shift ? "border-[#0057cc] shadow-md" : "border-transparent"}`}
                    >
                      <Icon size={24} className="text-gray-300 group-hover:text-[#0057cc] mb-3" />
                      <p className="font-bold text-[#114c5f] text-sm">{shift}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}