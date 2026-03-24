"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Camera, Loader2, AlertCircle } from "lucide-react";
import Image from "next/image";

// Interfaces para tipado estricto (Adiós a los errores de 'any')
interface Skill { id: string; name: string; category: string; }
interface TimeSlot { id: string; range: string; shift: string; }
interface UserSkill { skill_id: string; level: string; }
interface UserInterest { skill_id: string; } // Tabla simplificada
interface UserAvailability { day: string; slot_id: string; comment: string; }

export default function CompleteProfile() {
  const router = useRouter();
  const supabase = createClient();

  // --- ESTADOS DE DATOS ---
  const [categories, setCategories] = useState<string[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  
  // --- ESTADOS DE SELECCIÓN ---
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mySkills, setMySkills] = useState<UserSkill[]>([]);
  const [myInterests, setMyInterests] = useState<UserInterest[]>([]);
  const [myAvailability, setMyAvailability] = useState<UserAvailability[]>([]);
  const [gpa, setGpa] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const [selDay, setSelDay] = useState("");
  const [selShift, setSelShift] = useState("");
  const [selSlot, setSelSlot] = useState("");
  const [comment, setComment] = useState("");

  useEffect(() => {
    const fetchCatalogs = async () => {
      const { data: skills } = await supabase.from("skills").select("*");
      const { data: slots } = await supabase.from("time_slots").select("*");
      if (skills) {
        setAllSkills(skills);
        setCategories([...new Set(skills.map(s => s.category))]);
      }
      if (slots) setTimeSlots(slots);
    };
    fetchCatalogs();
  }, [supabase]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const filteredSlots = useMemo(() => 
    timeSlots.filter(s => s.shift === selShift), 
  [selShift, timeSlots]);

  const validateForm = () => {
    const gpaNum = parseFloat(gpa);
    if (!selectedFile) return "La foto de perfil es obligatoria.";
    if (mySkills.length === 0) return "Añade al menos una habilidad que poseas.";
    if (myInterests.length === 0) return "Añade al menos una habilidad que quieras aprender.";
    if (myAvailability.length === 0) return "Define tu disponibilidad horaria.";
    if (isNaN(gpaNum) || gpaNum < 0 || gpaNum > 100) return "El promedio debe estar entre 0.0 y 100.0.";
    return null;
  };

  const addAvailability = () => {
    if (!selDay || !selSlot) return;
    if (!myAvailability.find(a => a.day === selDay && a.slot_id === selSlot)) {
      setMyAvailability([...myAvailability, { day: selDay, slot_id: selSlot, comment }]);
    }
  };

  const handleSubmit = async () => {
    const errorMsg = validateForm();
    if (errorMsg) {
      setFormError(errorMsg);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsLoading(true);
    setFormError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      let avatarPath = "";
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("userId", user.id);
        const res = await fetch("/api/upload-avatar", { method: "POST", body: formData });
        const data = await res.json();
        avatarPath = data.path;
      }

      // 1. Actualizar perfil principal
      const { error: profError } = await supabase.from("profiles").update({ 
        gpa: parseFloat(gpa), 
        avatar_url: avatarPath,
        is_complete: true 
      }).eq("id", user.id);

      if (profError) throw profError;

      // 2. Inserciones Limpias (Asegurando que el objeto coincida con la BD)
      const skillsToInsert = mySkills.map(s => ({ profile_id: user.id, skill_id: s.skill_id, level: s.level }));
      const interestsToInsert = myInterests.map(i => ({ profile_id: user.id, skill_id: i.skill_id }));
      const availabilityToInsert = myAvailability.map(a => ({ profile_id: user.id, day: a.day, slot_id: a.slot_id, comment: a.comment }));

      // Ejecutar promesas en paralelo para mayor velocidad
      const results = await Promise.all([
        supabase.from("user_skills").insert(skillsToInsert),
        supabase.from("user_interests").insert(interestsToInsert),
        supabase.from("user_availability").insert(availabilityToInsert)
      ]);

      // Verificar si hubo error en alguna de las inserciones
      const failed = results.find(r => r.error);
      if (failed) throw failed.error;

      router.push("/protected");
      router.refresh();
    } catch (err: any) {
      setFormError(err.message || "Error al guardar los datos.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f3e7] py-16 px-4 font-gentium text-[#114c5f]">
      <div className="max-w-4xl mx-auto bg-white rounded-[3rem] shadow-2xl p-10 md:p-16 border border-[#9cd2d3]/20">
        
        {formError && (
          <div className="mb-8 flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl animate-bounce">
            <AlertCircle className="h-5 w-5" />
            <p className="font-bold">{formError}</p>
          </div>
        )}

        <header className="text-center mb-12">
          <h1 className="text-4xl font-black mb-2">Personaliza tu Experiencia</h1>
          <p className="text-slate-500 italic">Cuentanos más sobre ti para encontrar tu match perfecto</p>
        </header>

        {/* FOTO DE PERFIL */}
        <section className="flex flex-col items-center mb-12">
          <div className="relative w-40 h-40 rounded-full bg-[#eff6ff] border-4 border-[#3983A6] overflow-hidden shadow-inner cursor-pointer group">
            {previewUrl ? (
              <Image src={previewUrl} alt="Preview" fill className="object-cover transition-opacity group-hover:opacity-80" />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-[#3983A6]">
                <Camera size={48} />
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
          </div>
          <p className="mt-4 font-bold text-sm uppercase tracking-tighter">Haz clic para subir tu foto</p>
        </section>

        <div className="space-y-12">
            <SkillSelector 
                title="¿Qué habilidades posees?" 
                subtitle="Selecciona lo que puedes enseñar a otros"
                categories={categories}
                allSkills={allSkills}
                selectedList={mySkills}
                onAdd={(s: UserSkill) => setMySkills([...mySkills, s])}
                onRemove={(id: string) => setMySkills(mySkills.filter(s => s.skill_id !== id))}
                withLevel
            />

            <SkillSelector 
                title="¿Qué quieres aprender?" 
                subtitle="Habilidades que buscas desarrollar"
                categories={categories}
                allSkills={allSkills}
                selectedList={myInterests}
                onAdd={(i: UserInterest) => setMyInterests([...myInterests, i])}
                onRemove={(id: string) => setMyInterests(myInterests.filter(i => i.skill_id !== id))}
            />

            {/* DISPONIBILIDAD */}
            <section className="border-t pt-8">
              <h2 className="text-2xl font-bold mb-6">Disponibilidad Horaria</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <select value={selDay} onChange={(e)=>setSelDay(e.target.value)} className="bg-[#eff6ff] rounded-xl h-12 px-4 border-none font-bold">
                  <option value="">Día</option>
                  {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select value={selShift} onChange={(e)=>setSelShift(e.target.value)} className="bg-[#eff6ff] rounded-xl h-12 px-4 border-none font-bold">
                  <option value="">Turno</option>
                  <option value="Mañana">Mañana</option>
                  <option value="Tarde">Tarde</option>
                  <option value="Noche">Noche</option>
                </select>
                <select value={selSlot} onChange={(e)=>setSelSlot(e.target.value)} disabled={!selShift} className="bg-[#eff6ff] rounded-xl h-12 px-4 border-none font-bold disabled:opacity-50">
                  <option value="">Rango (2h)</option>
                  {filteredSlots.map(s => <option key={s.id} value={s.id}>{s.range}</option>)}
                </select>
                <Button onClick={addAvailability} className="bg-[#3983A6] h-12 rounded-xl text-white hover:bg-[#114c5f]"><Plus /></Button>
              </div>
              <Input placeholder="Comentario (opcional)" value={comment} onChange={(e)=>setComment(e.target.value)} className="mb-4 bg-[#eff6ff] border-none rounded-xl" />
              
              <div className="flex flex-wrap gap-3">
                {myAvailability.map((a, idx) => (
                  <div key={idx} className="bg-[#114c5f] text-white px-4 py-2 rounded-2xl flex items-center gap-2 font-bold shadow-sm">
                    {a.day} - {timeSlots.find(ts => ts.id === a.slot_id)?.range}
                    <X size={16} className="cursor-pointer hover:text-red-300" onClick={() => setMyAvailability(myAvailability.filter((_, i) => i !== idx))} />
                  </div>
                ))}
              </div>
            </section>

            <section className="border-t pt-8">
              <Label className="text-lg font-bold mb-2 block">Promedio Académico</Label>
              <Input type="number" step="0.1" value={gpa} onChange={(e)=>setGpa(e.target.value)} placeholder="Ej: 90.5" className="h-12 rounded-xl bg-[#eff6ff] border-none text-lg font-bold w-40 text-[#114c5f]" />
            </section>

            <Button onClick={handleSubmit} disabled={isLoading} className="w-full h-16 bg-[#114c5f] hover:bg-[#0799b6] mt-12 rounded-2xl text-xl font-bold text-white shadow-xl">
              {isLoading ? <Loader2 className="animate-spin" /> : "Guardar Perfil y Continuar"}
            </Button>
        </div>
      </div>
    </div>
  );
}

// Subcomponente tipado
interface SkillSelectorProps {
  title: string;
  subtitle: string;
  categories: string[];
  allSkills: Skill[];
  selectedList: any[];
  onAdd: (item: any) => void;
  onRemove: (id: string) => void;
  withLevel?: boolean;
}

function SkillSelector({ title, subtitle, categories, allSkills, selectedList, onAdd, onRemove, withLevel = false }: SkillSelectorProps) {
    const [cat, setCat] = useState("");
    const [skillId, setSkillId] = useState("");
    const [level, setLevel] = useState("Básico");

    const filteredSkills = allSkills.filter(s => s.category === cat);

    const handleAdd = () => {
        if (!skillId) return;
        // Evitar duplicados
        if (selectedList.some(s => s.skill_id === skillId)) return;
        
        if (withLevel) {
            onAdd({ skill_id: skillId, level });
        } else {
            onAdd({ skill_id: skillId });
        }
        setSkillId(""); // Reset para nueva selección
    };

    return (
        <section className="border-t pt-8">
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="text-slate-400 mb-6">{subtitle}</p>
            <div className="flex flex-wrap gap-4 mb-6">
                <select value={cat} onChange={(e)=>setCat(e.target.value)} className="bg-[#eff6ff] rounded-xl px-4 h-12 border-none font-bold text-[#114c5f]">
                    <option value="">Categoría</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={skillId} onChange={(e)=>setSkillId(e.target.value)} className="bg-[#eff6ff] rounded-xl px-4 h-12 border-none font-bold text-[#114c5f]">
                    <option value="">Habilidad</option>
                    {filteredSkills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                {withLevel && (
                    <select value={level} onChange={(e)=>setLevel(e.target.value)} className="bg-[#eff6ff] rounded-xl px-4 h-12 border-none font-bold text-[#114c5f]">
                        <option value="Básico">Básico</option>
                        <option value="Intermedio">Intermedio</option>
                        <option value="Avanzado">Avanzado</option>
                    </select>
                )}
                <Button onClick={handleAdd} className="h-12 w-12 rounded-xl bg-[#3983A6] text-white hover:bg-[#114c5f]"><Plus /></Button>
            </div>
            <div className="flex flex-wrap gap-3">
                {selectedList.map((item) => {
                    const skillName = allSkills.find(s => s.id === item.skill_id)?.name;
                    return (
                        <div key={item.skill_id} className="bg-white border-2 border-[#3983A6] text-[#3983A6] px-4 py-2 rounded-2xl font-bold flex items-center gap-2 shadow-sm">
                            {skillName} {item.level && `(${item.level})`}
                            <X size={16} className="cursor-pointer hover:text-red-500" onClick={() => onRemove(item.skill_id)} />
                        </div>
                    );
                })}
            </div>
        </section>
    );
}