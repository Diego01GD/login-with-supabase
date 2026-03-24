"use client"

import { useState } from "react";
import { Plus, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CompleteProfile() {
  // Estados para las listas dinámicas
  const [mySkills, setMySkills] = useState<any[]>([]);
  const [learningInterests, setLearningInterests] = useState<any[]>([]);
  const [availability, setAvailability] = useState<any[]>([]);

  // Función para añadir habilidad evitando duplicados
  const addSkill = (skill: string, level: string) => {
    if (!mySkills.find(s => s.name === skill)) {
      setMySkills([...mySkills, { name: skill, level }]);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f3e7] py-12 px-4 font-gentium">
      <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-xl p-8 md:p-12 border border-[#9cd2d3]/20">
        <h1 className="text-4xl font-extrabold text-[#114c5f] text-center mb-10">¡Bienvenido! Completemos tu perfil</h1>

        {/* --- SECCIÓN 1: FOTO DE PERFIL --- */}
        <div className="flex flex-col items-center mb-12">
           <div className="w-32 h-32 rounded-full bg-[#eff6ff] border-2 border-dashed border-[#0057cc] flex items-center justify-center relative overflow-hidden group cursor-pointer">
              <Upload className="text-[#0057cc] group-hover:scale-110 transition-transform" />
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
           </div>
           <p className="mt-3 text-sm font-bold text-[#114c5f] uppercase tracking-wider">Subir foto de perfil</p>
        </div>

        {/* --- SECCIÓN 2: MIS HABILIDADES (Lo que enseño) --- */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6 flex items-center gap-2">
             <span className="bg-[#0057cc] text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm">1</span>
             Mis Habilidades
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
             {/* Selects de Categoría, Habilidad y Dominio irían aquí */}
             <select className="bg-[#eff6ff] rounded-xl h-12 px-4 border-none text-[#114c5f] font-bold">
                <option>Categoría</option>
                <option>Programación</option>
             </select>
             {/* ... otros selects ... */}
             <Button onClick={() => addSkill("React", "Avanzado")} className="bg-[#0057cc] h-12 rounded-xl">Agregar</Button>
          </div>
          
          {/* Tags de Habilidades Agregadas */}
          <div className="flex flex-wrap gap-3">
             {mySkills.map((skill, index) => (
               <div key={index} className="bg-[#eff6ff] text-[#0057cc] px-4 py-2 rounded-full font-bold flex items-center gap-2 border border-[#0057cc]/30">
                 {skill.name} • <span className="text-xs uppercase opacity-70">{skill.level}</span>
                 <X size={16} className="cursor-pointer hover:text-red-500" onClick={() => setMySkills(mySkills.filter((_, i) => i !== index))} />
               </div>
             ))}
          </div>
        </section>

        {/* --- SECCIÓN 3: DISPONIBILIDAD (Rangos de 2 horas) --- */}
        <section className="mb-12 pt-8 border-t border-slate-100">
           <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6 flex items-center gap-2">
             <span className="bg-[#114c5f] text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm">3</span>
             Disponibilidad Horaria
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
             <select className="bg-[#eff6ff] rounded-xl h-12 px-4 border-none font-bold text-[#114c5f]"><option>Día</option></select>
             <select className="bg-[#eff6ff] rounded-xl h-12 px-4 border-none font-bold text-[#114c5f]"><option>Turno</option></select>
             <select className="bg-[#eff6ff] rounded-xl h-12 px-4 border-none font-bold text-[#114c5f]"><option>08:00 - 10:00</option></select>
             <Button className="bg-[#114c5f] h-12 rounded-xl">Añadir Horario</Button>
          </div>
          <textarea placeholder="Comentarios adicionales sobre tu horario..." className="w-full bg-[#eff6ff] rounded-2xl p-4 border-none min-h-[100px] mb-4 text-[#114c5f]" />
        </section>

        {/* --- SECCIÓN FINAL: PROMEDIO --- */}
        <section className="mb-12 pt-8 border-t border-slate-100">
           <Label className="text-[#114c5f] font-black uppercase text-xs mb-3 block tracking-widest">Promedio Académico</Label>
           <Input type="number" step="0.1" placeholder="Ej: 92.5" className="bg-[#eff6ff] border-none rounded-xl h-12 w-full md:w-48 text-lg font-bold text-[#114c5f]" />
        </section>

        <Button className="w-full h-16 bg-[#0057cc] hover:bg-[#004bb3] text-white rounded-2xl font-bold text-xl shadow-lg transition-transform active:scale-95">
           Finalizar mi perfil
        </Button>
      </div>
    </div>
  );
}