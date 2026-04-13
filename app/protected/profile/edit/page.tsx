import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { EditProfileForm } from "@/components/edit-profile-form";
import { ChangePasswordForm } from "@/components/change-password-form";


type Profile = {
  id: string;
  full_name: string;
  career: string;
  student_id: string;
  semester: string;
  interests: string[];
  gpa: number;
  avatar_url?: string;
  is_complete: boolean;
};

type UserSkill = {
  id: string;
  skill_id: string;
  level: string;
};

type UserInterest = {
  id: string;
  skill_id: string;
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

type UserAvailability = {
  id: string;
  day: string;
  slot_id: string;
};

export default async function EditProfilePage() {
  const supabase = await createClient();
  const { data: sessionData, error: userError } = await supabase.auth.getUser();

  if (userError || !sessionData.user) {
    redirect("/auth/login");
  }

  const userId = sessionData.user.id;

  // Obtener perfil
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) {
    redirect("/auth/login");
  }

  const typedProfile = profile as Profile;

  if (!typedProfile.is_complete) {
    redirect("/auth/complete-profile");
  }

  // Obtener skills ofrecidas
  const { data: userSkills } = await supabase
    .from("user_skills")
    .select("id, skill_id, level")
    .eq("profile_id", userId);

  // Obtener intereses
  const { data: userInterests } = await supabase
    .from("user_interests")
    .select("id, skill_id")
    .eq("profile_id", userId);

  // Obtener disponibilidad
  const { data: userAvailability } = await supabase
    .from("user_availability")
    .select("id, day, slot_id")
    .eq("profile_id", userId);

  // Obtener todos los skills y time slots
  const { data: allSkills } = await supabase
    .from("skills")
    .select("id, name, category");

  const { data: timeSlots } = await supabase
    .from("time_slots")
    .select("id, range, shift");

  const typedUserSkills = (userSkills ?? []) as UserSkill[];
  const typedUserInterests = (userInterests ?? []) as UserInterest[];
  const typedUserAvailability = (userAvailability ?? []) as UserAvailability[];
  const typedAllSkills = (allSkills ?? []) as Skill[];
  const typedTimeSlots = (timeSlots ?? []) as TimeSlot[];

  // Agrupar skills por categoría
  const skillsByCategory = typedAllSkills.reduce<Record<string, Skill[]>>(
    (acc, skill) => {
      if (!acc[skill.category]) acc[skill.category] = [];
      acc[skill.category].push(skill);
      return acc;
    },
    {},
  );

  const allDays = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];

  return (
    <main className="min-h-screen bg-[#f7f3e7]">
      <div className="w-full max-w-7xl mx-auto px-6 py-12">
        <Link
          href="/protected/profile"
          className="text-[#0057cc] hover:text-[#004499] font-semibold mb-8 inline-block"
        >
          ← Volver al perfil
        </Link>

        <div className="space-y-8">
          {/* Editar Información */}
          <section className="bg-white rounded-2xl p-8 shadow-lg border border-[#d7e5ef]">
            <h1 className="text-3xl font-bold text-[#0d3453] mb-2">
              Editar Habilidades y Horarios
            </h1>
            <p className="text-[#325e80] mb-6">
              Actualiza lo que enseñas, lo que quieres aprender y tu
              disponibilidad
            </p>

            <EditProfileForm
              userSkills={typedUserSkills}
              userInterests={typedUserInterests}
              userAvailability={typedUserAvailability}
              allSkills={typedAllSkills}
              skillsByCategory={skillsByCategory}
              timeSlots={typedTimeSlots}
              allDays={allDays}
              userId={userId}
              userGPA={typedProfile.gpa}
              userCareer={typedProfile.career}
            />
          </section>

          {/* Cambiar Contraseña */}
          <section className="bg-white rounded-2xl p-8 shadow-lg border border-[#d7e5ef]">
            <h2 className="text-2xl font-bold text-[#0d3453] mb-2">
              Cambiar Contraseña
            </h2>
            <p className="text-[#325e80] mb-6">
              Para cambiar tu contraseña, debes verificar la actual
            </p>

            <ChangePasswordForm
              userId={userId}
              userEmail={sessionData.user.email}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
