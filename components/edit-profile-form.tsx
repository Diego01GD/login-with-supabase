"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, Plus } from "lucide-react";
import { NotificationCard } from "@/components/notification-card";

type UserSkill = {
  id: string;
  skill_id: string;
  level: string;
};

type UserInterest = {
  id: string;
  skill_id: string;
};

type UserAvailability = {
  id: string;
  day: string;
  slot_id: string;
};

type Skill = {
  id: string;
  name: string;
  category: string;
};

type TimeSlot = {
  id: string;
  range: string;
  shift: string;
};

interface EditProfileFormProps {
  userSkills: UserSkill[];
  userInterests: UserInterest[];
  userAvailability: UserAvailability[];
  allSkills: Skill[];
  skillsByCategory: Record<string, Skill[]>;
  timeSlots: TimeSlot[];
  allDays: string[];
  userId: string;
  userGPA?: number;
  userCareer?: string;
}

const LEVELS = ["Básico", "Intermedio", "Avanzado", "Experto"];

export function EditProfileForm({
  userSkills: initialSkills,
  userInterests: initialInterests,
  userAvailability: initialAvailability,
  allSkills,
  skillsByCategory,
  timeSlots,
  allDays,
  userId,
  userGPA,
  userCareer,
}: EditProfileFormProps) {
  const [skills, setSkills] = useState(initialSkills);
  const [interests, setInterests] = useState(initialInterests);
  const [availability, setAvailability] = useState(initialAvailability);

  // Para nuevas adiciones (antes de guardar)
  const [pendingSkillAdds, setPendingSkillAdds] = useState<
    Array<{ skill_id: string; level: string }>
  >([]);
  const [pendingInterestAdds, setPendingInterestAdds] = useState<
    Array<{ skill_id: string }>
  >([]);
  const [pendingAvailabilityAdds, setPendingAvailabilityAdds] = useState<
    Array<{ day: string; slot_id: string }>
  >([]);

  // Para eliminaciones (rastrear ids a eliminar)
  const [skillsToDelete, setSkillsToDelete] = useState<string[]>([]);
  const [interestsToDelete, setInterestsToDelete] = useState<string[]>([]);
  const [availabilityToDelete, setAvailabilityToDelete] = useState<string[]>(
    [],
  );

  const [newSkillId, setNewSkillId] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState("Básico");

  const [newInterestId, setNewInterestId] = useState("");

  const [newDay, setNewDay] = useState("Lunes");
  const [newSlot, setNewSlot] = useState(timeSlots[0]?.id || "");

  const [editGPA, setEditGPA] = useState(userGPA?.toString() || "");
  const [editCareer, setEditCareer] = useState(userCareer || "");

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const supabase = createClient();

  const getTimeSlotName = (slotId: string) => {
    const slot = timeSlots.find((s) => s.id === slotId);
    return slot ? slot.range : slotId;
  };

  const handleAddSkill = () => {
    if (!newSkillId) return;
    setPendingSkillAdds([
      ...pendingSkillAdds,
      { skill_id: newSkillId, level: newSkillLevel },
    ]);
    setNewSkillId("");
    setNewSkillLevel("Básico");
  };

  const handleRemoveSkill = (skillId: string, isPending: boolean) => {
    if (isPending) {
      setPendingSkillAdds(
        pendingSkillAdds.filter(
          (_, i) =>
            pendingSkillAdds.indexOf({ skill_id: skillId, level: "" }) !== i,
        ),
      );
    } else {
      setSkillsToDelete([...skillsToDelete, skillId]);
    }
  };

  const handleAddInterest = () => {
    if (!newInterestId) return;
    setPendingInterestAdds([
      ...pendingInterestAdds,
      { skill_id: newInterestId },
    ]);
    setNewInterestId("");
  };

  const handleRemoveInterest = (interestId: string, isPending: boolean) => {
    if (isPending) {
      setPendingInterestAdds(
        pendingInterestAdds.filter(
          (_, i) => pendingInterestAdds.indexOf({ skill_id: interestId }) !== i,
        ),
      );
    } else {
      setInterestsToDelete([...interestsToDelete, interestId]);
    }
  };

  const handleAddAvailability = () => {
    if (!newSlot) return;
    setPendingAvailabilityAdds([
      ...pendingAvailabilityAdds,
      { day: newDay, slot_id: newSlot },
    ]);
  };

  const handleRemoveAvailability = (avId: string, isPending: boolean) => {
    if (isPending) {
      setPendingAvailabilityAdds(
        pendingAvailabilityAdds.filter(
          (_, i) =>
            pendingAvailabilityAdds.indexOf({ day: "", slot_id: avId }) !== i,
        ),
      );
    } else {
      setAvailabilityToDelete([...availabilityToDelete, avId]);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setMessage(null);

      // Ejecutar todas las operaciones

      // 1. Agregar nuevas habilidades
      if (pendingSkillAdds.length > 0) {
        const { error } = await supabase.from("user_skills").insert(
          pendingSkillAdds.map((s) => ({
            profile_id: userId,
            skill_id: s.skill_id,
            level: s.level,
          })),
        );
        if (error) throw error;
      }

      // 2. Eliminar habilidades
      if (skillsToDelete.length > 0) {
        const { error } = await supabase
          .from("user_skills")
          .delete()
          .in("id", skillsToDelete);
        if (error) throw error;
      }

      // 3. Agregar nuevos intereses
      if (pendingInterestAdds.length > 0) {
        const { error } = await supabase.from("user_interests").insert(
          pendingInterestAdds.map((i) => ({
            profile_id: userId,
            skill_id: i.skill_id,
          })),
        );
        if (error) throw error;
      }

      // 4. Eliminar intereses
      if (interestsToDelete.length > 0) {
        const { error } = await supabase
          .from("user_interests")
          .delete()
          .in("id", interestsToDelete);
        if (error) throw error;
      }

      // 5. Agregar nueva disponibilidad
      if (pendingAvailabilityAdds.length > 0) {
        const { error } = await supabase.from("user_availability").insert(
          pendingAvailabilityAdds.map((a) => ({
            profile_id: userId,
            day: a.day,
            slot_id: a.slot_id,
          })),
        );
        if (error) throw error;
      }

      // 6. Eliminar disponibilidad
      if (availabilityToDelete.length > 0) {
        const { error } = await supabase
          .from("user_availability")
          .delete()
          .in("id", availabilityToDelete);
        if (error) throw error;
      }

      // 7. Actualizar información académica (GPA y Carrera)
      const gpaNum = parseFloat(editGPA);
      if (!isNaN(gpaNum) || editCareer !== userCareer) {
        const updateObj: { gpa?: number; career?: string } = {};
        if (!isNaN(gpaNum)) updateObj.gpa = gpaNum;
        if (editCareer !== userCareer) updateObj.career = editCareer;

        const { error } = await supabase
          .from("profiles")
          .update(updateObj)
          .eq("id", userId);
        if (error) throw error;
      }

      // Actualizar estado local con los cambios guardados
      const newSkills = [
        ...skills.filter((s) => !skillsToDelete.includes(s.id)),
        ...pendingSkillAdds.map((s, i) => ({
          id: `temp-${i}`,
          skill_id: s.skill_id,
          level: s.level,
        })),
      ];

      const newInterests = [
        ...interests.filter((i) => !interestsToDelete.includes(i.id)),
        ...pendingInterestAdds.map((i, idx) => ({
          id: `temp-interest-${idx}`,
          skill_id: i.skill_id,
        })),
      ];

      const newAvailability = [
        ...availability.filter((a) => !availabilityToDelete.includes(a.id)),
        ...pendingAvailabilityAdds.map((a, idx) => ({
          id: `temp-avail-${idx}`,
          day: a.day,
          slot_id: a.slot_id,
        })),
      ];

      setSkills(newSkills as UserSkill[]);
      setInterests(newInterests as UserInterest[]);
      setAvailability(newAvailability as UserAvailability[]);

      // Limpiar pendientes
      setPendingSkillAdds([]);
      setPendingInterestAdds([]);
      setPendingAvailabilityAdds([]);
      setSkillsToDelete([]);
      setInterestsToDelete([]);
      setAvailabilityToDelete([]);

      setMessage({ type: "success", text: "Cambios guardados correctamente" });
      // El NotificationCard se auto-cierra después de 4 segundos
    } catch {
      setMessage({ type: "error", text: "Error al guardar cambios" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Revertir cambios pendientes
    setPendingSkillAdds([]);
    setPendingInterestAdds([]);
    setPendingAvailabilityAdds([]);
    setSkillsToDelete([]);
    setInterestsToDelete([]);
    setAvailabilityToDelete([]);
    setNewSkillId("");
    setNewSkillLevel("Básico");
    setNewInterestId("");
    setNewDay("Lunes");
    setNewSlot(timeSlots[0]?.id || "");
    setEditGPA(userGPA?.toString() || "");
    setEditCareer(userCareer || "");
    setMessage(null);
  };

  const getVisibleSkills = () => [
    ...skills.filter((s) => !skillsToDelete.includes(s.id)),
    ...pendingSkillAdds.map((s, i) => ({
      id: `new-${i}`,
      skill_id: s.skill_id,
      level: s.level,
    })),
  ];

  const getVisibleInterests = () => [
    ...interests.filter((i) => !interestsToDelete.includes(i.id)),
    ...pendingInterestAdds.map((i, idx) => ({
      id: `new-interest-${idx}`,
      skill_id: i.skill_id,
    })),
  ];

  const getVisibleAvailability = () => [
    ...availability.filter((a) => !availabilityToDelete.includes(a.id)),
    ...pendingAvailabilityAdds.map((a, idx) => ({
      id: `new-avail-${idx}`,
      day: a.day,
      slot_id: a.slot_id,
    })),
  ];

  return (
    <div className="space-y-8">
      {/* Notificación Flotante */}
      {message && (
        <NotificationCard
          type={message.type}
          title={message.type === "success" ? "¡Cambios guardados!" : "Error"}
          message={message.text}
          duration={4000}
          onClose={() => setMessage(null)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* COLUMNA IZQUIERDA */}
        <div className="border-r border-[#9cd2d3] pr-8">
          {/* Habilidades que enseñas */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-[#114c5f] mb-4">
              Habilidades que enseñas
            </h3>

            {getVisibleSkills().length > 0 && (
              <table className="w-full mb-6 border-collapse">
                <thead>
                  <tr className="border-b-2 border-[#9cd2d3]">
                    <th className="text-left py-2 px-2 text-[#114c5f] font-semibold text-sm">
                      Categoría
                    </th>
                    <th className="text-left py-2 px-2 text-[#114c5f] font-semibold text-sm">
                      Habilidad
                    </th>
                    <th className="text-left py-2 px-2 text-[#114c5f] font-semibold text-sm">
                      Nivel
                    </th>
                    <th className="text-center py-2 px-2 text-[#114c5f] font-semibold text-sm">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {getVisibleSkills().map((skill) => {
                    const skillInfo = allSkills.find(
                      (s) => s.id === skill.skill_id,
                    );
                    const isPending = skill.id.startsWith("new-");
                    return (
                      <tr
                        key={skill.id}
                        className="border-b border-[#e2ecf6] hover:bg-[#f9fcff]"
                      >
                        <td className="py-3 px-2 text-sm text-[#325e80]">
                          {skillInfo?.category}
                        </td>
                        <td className="py-3 px-2 text-sm text-[#325e80]">
                          {skillInfo?.name}
                        </td>
                        <td className="py-3 px-2 text-sm text-[#325e80]">
                          {skill.level}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <button
                            onClick={() =>
                              handleRemoveSkill(skill.id, isPending)
                            }
                            className="text-red-500 hover:text-red-700"
                            disabled={isSaving}
                          >
                            <X size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            <div className="flex gap-3 flex-wrap items-end">
              <div className="flex-1 min-w-48">
                <label className="block text-sm font-semibold text-[#325e80] mb-2">
                  Selecciona una habilidad
                </label>
                <select
                  value={newSkillId}
                  onChange={(e) => setNewSkillId(e.target.value)}
                  className="w-full px-3 py-2 border bg-[#eff6ff] border-[#cfe8fb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057cc] text-sm text-[#114c5f]"
                >
                  <option value="">-- Seleccionar --</option>
                  {Object.entries(skillsByCategory).map(
                    ([category, catSkills]) => (
                      <optgroup key={category} label={category}>
                        {catSkills.map((skill) => {
                          const allSkillIds = [
                            ...skills,
                            ...pendingSkillAdds.map((s, i) => ({
                              id: `new-${i}`,
                              skill_id: s.skill_id,
                            })),
                          ].map((s) => s.skill_id);
                          return (
                            <option
                              key={skill.id}
                              value={skill.id}
                              disabled={allSkillIds.includes(skill.id)}
                            >
                              {skill.name}
                            </option>
                          );
                        })}
                      </optgroup>
                    ),
                  )}
                </select>
              </div>

              <div className="min-w-40">
                <label className="block text-sm font-semibold text-[#325e80] mb-2">
                  Nivel
                </label>
                <select
                  value={newSkillLevel}
                  onChange={(e) => setNewSkillLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-[#cfe8fb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057cc] text-sm bg-[#eff6ff] text-[#114c5f]"
                >
                  {LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleAddSkill}
                disabled={!newSkillId || isSaving}
                className="flex items-center gap-2 bg-[#0057cc] hover:bg-[#004499] disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
              >
                <Plus size={16} /> Añadir
              </button>
            </div>
          </div>

          {/* Habilidades a aprender */}
          <div className="mb-8 border-t border-[#9cd2d3] pt-8">
            <h3 className="text-lg font-bold text-[#114c5f] mb-4">
              Lo que busco aprender
            </h3>

            {getVisibleInterests().length > 0 && (
              <table className="w-full mb-6 border-collapse">
                <thead>
                  <tr className="border-b-2 border-[#9cd2d3]">
                    <th className="text-left py-2 px-2 text-[#114c5f] font-semibold text-sm">
                      Categoría
                    </th>
                    <th className="text-left py-2 px-2 text-[#114c5f] font-semibold text-sm">
                      Habilidad
                    </th>
                    <th className="text-center py-2 px-2 text-[#114c5f] font-semibold text-sm">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {getVisibleInterests().map((interest) => {
                    const skillInfo = allSkills.find(
                      (s) => s.id === interest.skill_id,
                    );
                    const isPending = interest.id.startsWith("new-");
                    return (
                      <tr
                        key={interest.id}
                        className="border-b border-[#e2ecf6] hover:bg-[#f9fcff]"
                      >
                        <td className="py-3 px-2 text-sm text-[#325e80]">
                          {skillInfo?.category}
                        </td>
                        <td className="py-3 px-2 text-sm text-[#325e80]">
                          {skillInfo?.name}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <button
                            onClick={() =>
                              handleRemoveInterest(interest.id, isPending)
                            }
                            className="text-red-500 hover:text-red-700"
                            disabled={isSaving}
                          >
                            <X size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-[#325e80] mb-2">
                  Selecciona lo que quieres aprender
                </label>
                <div className="flex items-center">
                  <select
                    value={newInterestId}
                    onChange={(e) => setNewInterestId(e.target.value)}
                    className="w-full px-3 py-2 border border-[#cfe8fb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057cc] text-sm bg-[#eff6ff] text-[#114c5f]"
                  >
                    <option value="">-- Seleccionar --</option>
                    {Object.entries(skillsByCategory).map(
                      ([category, catSkills]) => (
                        <optgroup key={category} label={category}>
                          {catSkills.map((skill) => {
                            const allInterestIds = [
                              ...interests,
                              ...pendingInterestAdds.map((i, idx) => ({
                                id: `new-interest-${idx}`,
                                skill_id: i.skill_id,
                              })),
                            ].map((i) => i.skill_id);
                            return (
                              <option
                                key={skill.id}
                                value={skill.id}
                                disabled={allInterestIds.includes(skill.id)}
                              >
                                {skill.name}
                              </option>
                            );
                          })}
                        </optgroup>
                      ),
                    )}
                  </select>

                  <button
                    onClick={handleAddInterest}
                    disabled={!newInterestId || isSaving}
                    className="flex items-center gap-2 bg-[#0057cc] hover:bg-[#004499] disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm h-fit ml-3"
                  >
                    <Plus size={16} /> Añadir
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA */}
        <div>
          <h3 className="text-lg font-bold text-[#114c5f] mb-4">
            Disponibilidad Horaria
          </h3>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-[#325e80] mb-2">
                Turno
              </label>
              <select
                value={newDay}
                onChange={(e) => setNewDay(e.target.value)}
                className="w-full px-3 py-2 border border-[#cfe8fb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057cc] text-sm bg-[#eff6ff] text-[#114c5f]"
              >
                {allDays.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#325e80] mb-2">
                Horario
              </label>
              <select
                value={newSlot}
                onChange={(e) => setNewSlot(e.target.value)}
                className="w-full px-3 py-2 border border-[#cfe8fb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057cc] text-sm bg-[#eff6ff] text-[#114c5f]"
              >
                {timeSlots.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {slot.range}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleAddAvailability}
              disabled={!newSlot || isSaving}
              className="w-full flex items-center justify-center gap-2 bg-[#0057cc] hover:bg-[#004499] disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
            >
              <Plus size={16} /> Añadir Horario
            </button>
          </div>

          {getVisibleAvailability().length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-[#325e80] mb-3">
                Mis horarios:
              </p>
              {allDays.map((day) => {
                const dayAvailability = getVisibleAvailability().filter(
                  (a) => a.day === day,
                );
                if (dayAvailability.length === 0) return null;

                return (
                  <div
                    key={day}
                    className="bg-[#f3f8ff] border border-[#9cd2d3] rounded-lg p-4"
                  >
                    <p className="font-bold text-[#114c5f] text-sm mb-2">
                      {day}
                    </p>
                    <div className="space-y-2">
                      {dayAvailability.map((slot) => (
                        <div
                          key={slot.id}
                          className="flex items-center justify-between bg-white p-2 rounded border border-[#d6eaf7]"
                        >
                          <span className="text-[#325e80] text-sm">
                            {getTimeSlotName(slot.slot_id)}
                          </span>
                          <button
                            onClick={() =>
                              handleRemoveAvailability(
                                slot.id,
                                slot.id.startsWith("new-"),
                              )
                            }
                            className="text-red-500 hover:text-red-700"
                            disabled={isSaving}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Información Académica */}

          <div className="mt-6 border-t border-[#9cd2d3] py-6">
            <label className="block text-sm font-semibold text-[#325e80] mb-2">
              Promedio General
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="5"
              value={editGPA}
              onChange={(e) => setEditGPA(e.target.value)}
              className="w-full px-4 py-2 border border-[#cfe8fb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057cc] bg-[#eff6ff] text-[#114c5f]"
              placeholder="0.00"
              disabled={isSaving}
            />
          </div>

          <div className="mt-5">
            <label className="block text-sm font-semibold text-[#325e80] mb-2">
              Carrera
            </label>
            <input
              type="text"
              value={editCareer}
              onChange={(e) => setEditCareer(e.target.value)}
              className="w-full px-4 py-2 border border-[#cfe8fb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057cc] bg-[#eff6ff] text-[#114c5f]"
              placeholder="ej: Ingeniería en Sistemas"
              disabled={isSaving}
            />
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-4 justify-center pt-8 border-t border-[#9cd2d3]">
        <button
          onClick={handleCancel}
          disabled={isSaving}
          className="px-8 py-3 border-2 border-[#0057cc] text-[#0057cc] hover:bg-[#f0f7ff] rounded-lg font-bold transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={
            isSaving ||
            (pendingSkillAdds.length === 0 &&
              pendingInterestAdds.length === 0 &&
              pendingAvailabilityAdds.length === 0 &&
              skillsToDelete.length === 0 &&
              interestsToDelete.length === 0 &&
              availabilityToDelete.length === 0 &&
              editGPA === userGPA?.toString() &&
              editCareer === userCareer)
          }
          className="px-8 py-3 bg-[#0057cc] hover:bg-[#004499] disabled:bg-gray-400 text-white rounded-lg font-bold transition-colors"
        >
          {isSaving ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </div>
  );
}
