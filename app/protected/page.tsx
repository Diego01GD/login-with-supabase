import Link from "next/link";
import Image from "next/image";
import LogoSS from "@/public/images/logo.png";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { unstable_noStore } from "next/cache";
import { UserDropdownMenu } from "@/components/user-dropdown-menu";
import { DiscoveryContent } from "@/components/discovery-content";
import { MessageSquare, Repeat } from "lucide-react";

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
  skill_id: string;
  level: string;
};

type UserInterest = {
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

type Availability = {
  day: string;
  slot_id: string;
};

type MatchedUser = {
  id: string;
  name: string;
  avatarUrl?: string;
  career: string;
  gpa: number;
  skill: string;
  level: string;
  schedule: string;
  matchScore: "perfect" | "good" | "fair";
  shift: string;
  availability: Array<{ day: string; timeSlots: string[] }>;
};

export default async function main() {
  unstable_noStore();

  const supabase = await createClient();
  const { data: sessionData, error: userError } = await supabase.auth.getUser();

  if (userError || !sessionData.user) {
    redirect("/auth/login");
  }

  const userId = sessionData.user.id;

  // Obtener perfil del usuario logueado
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id,full_name,career,student_id,semester,interests,gpa,avatar_url,is_complete",
    )
    .eq("id", userId)
    .maybeSingle();

  if (!profile) {
    redirect("/auth/login");
  }

  const typedProfile = profile as Profile;

  if (!typedProfile.is_complete) {
    redirect("/auth/complete-profile");
  }

  // Obtener intereses del usuario logueado
  const { data: userInterests } = await supabase
    .from("user_interests")
    .select("skill_id")
    .eq("profile_id", userId);

  // Obtener todos los time slots
  const { data: timeSlots } = await supabase
    .from("time_slots")
    .select("id, range, shift");

  // Obtener skills para filtrado
  const { data: allSkills } = await supabase
    .from("skills")
    .select("id, name, category");

  // Obtener todos los perfiles (excepto el actual) que tienen skills
  const { data: otherProfiles } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, career, gpa")
    .neq("id", userId);

  // Obtener todos los user_skills de otros usuarios
  const { data: allUserSkills } = await supabase
    .from("user_skills")
    .select("profile_id, skill_id, level");

  // Obtener disponibilidad de todos los usuarios
  const { data: allAvailability } = await supabase
    .from("user_availability")
    .select("profile_id, slot_id, day");

  // Procesar datos para matching
  const typedUserInterests = (userInterests ?? []) as UserInterest[];
  const typedTimeSlots = (timeSlots ?? []) as TimeSlot[];
  const typedAllSkills = (allSkills ?? []) as Skill[];
  const typedOtherProfiles = (otherProfiles ?? []) as Profile[];
  const typedAllUserSkills = (allUserSkills ?? []) as (UserSkill & {
    profile_id: string;
  })[];
  const typedAllAvailability = (allAvailability ?? []) as (Availability & {
    profile_id: string;
  })[];

  const slotMap = Object.fromEntries(
    typedTimeSlots.map((ts) => [ts.id, ts]),
  ) as Record<string, TimeSlot>;

  const skillMap = Object.fromEntries(
    typedAllSkills.map((s) => [s.id, s]),
  ) as Record<string, Skill>;

  // Obtener IDs de intereses del usuario
  const userInterestIds = typedUserInterests.map((i) => i.skill_id);

  // Obtener todos los shifts únicos
  const allShiftsSet = new Set(typedTimeSlots.map((ts) => ts.shift));
  const allShiftsArray = Array.from(allShiftsSet);

  // Obtener todas las categorías únicas
  const allCategoriesSet = new Set(typedAllSkills.map((s) => s.category));
  const allCategoriesArray = Array.from(allCategoriesSet).sort();

  // Crear matched users SIMPLE: Solo usuarios que ofrecen habilidades que el usuario busca
  const matchedUsers: MatchedUser[] = [];

  // FALLBACK: Usuarios con habilidades que NO son de interés del usuario
  const fallbackUsers: MatchedUser[] = [];

  typedOtherProfiles.forEach((otherProfile) => {
    // Obtener skills que ofrece este usuario
    const offeringSkills = typedAllUserSkills.filter(
      (us) => us.profile_id === otherProfile.id,
    );

    // Obtener disponibilidad de este usuario
    const otherAvailability = typedAllAvailability.filter(
      (ua) => ua.profile_id === otherProfile.id,
    );
    const otherShifts = new Set(
      otherAvailability.map((ua) => slotMap[ua.slot_id]?.shift).filter(Boolean),
    );

    // Procesar cada skill del usuario
    offeringSkills.forEach((skill) => {
      const skillInfo = skillMap[skill.skill_id];
      const firstOtherSlot = Array.from(otherAvailability)
        .map((ua) => slotMap[ua.slot_id])
        .filter(Boolean)[0];
      const scheduleDisplay = firstOtherSlot
        ? firstOtherSlot.range
        : "Sin horario definido";

      // Construir array de disponibilidad agrupado por día
      const availabilityByDay = new Map<string, string[]>();
      otherAvailability.forEach((ua) => {
        const timeSlot = slotMap[ua.slot_id];
        if (timeSlot) {
          if (!availabilityByDay.has(ua.day)) {
            availabilityByDay.set(ua.day, []);
          }
          availabilityByDay.get(ua.day)!.push(timeSlot.range);
        }
      });

      const availabilityArray = Array.from(
        availabilityByDay,
        ([day, timeSlots]) => ({
          day,
          timeSlots,
        }),
      );

      const userData: MatchedUser = {
        id: otherProfile.id,
        name: otherProfile.full_name || "Usuario",
        avatarUrl: otherProfile.avatar_url,
        career: (otherProfile as Profile).career || "Carrera no especificada",
        gpa: (otherProfile as Profile).gpa || 0,
        skill: skillInfo?.name || skill.skill_id,
        level: skill.level,
        schedule: scheduleDisplay,
        matchScore: "fair" as const,
        shift: Array.from(otherShifts)[0] || "Mañana",
        availability: availabilityArray,
      };

      // Si es habilidad de interés, agregar a matches
      if (userInterestIds.includes(skill.skill_id)) {
        matchedUsers.push(userData);
      } else {
        // Si NO es habilidad de interés, agregar a fallback
        fallbackUsers.push(userData);
      }
    });
  });

  // Ordenar por match score
  const sortedMatches = matchedUsers.sort((a, b) => {
    const scoreOrder = { perfect: 0, good: 1, fair: 2 };
    return (
      scoreOrder[a.matchScore] - scoreOrder[b.matchScore] ||
      b.name.localeCompare(a.name)
    );
  });

  return (
    <main className="min-h-screen flex flex-col items-center bg-[#f7f3e7]">
      <div className="w-full">
        <nav className="flex items-center justify-between px-12 py-4 bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-[#9cd2d3]/20">
          <div className="flex items-center gap-2">
            {/* Logo Placeholder */}
            <Link
              href="/"
              className="flex items-center hover:opacity-90 transition-opacity"
            >
              <Image
                src={LogoSS}
                alt="SkillSwap"
                className="rounded-full shadow-sm w-32 mr-3"
              />

              <span className="text-xl font-bold tracking-tight text-[#114c5f]">
                SkillSwap
              </span>
            </Link>
          </div>

          <div className="md:text-xl text-[#114c5f] font-bold flex items-center gap-10">
            <div className="flex gap-8">
              <Link href="/protected/Sexo">
                <Repeat
                  className="hover:scale-110 transition-transform"
                  size={26}
                />
              </Link>
              <Link href="/protected/messages" className="">
                <MessageSquare
                  className="hover:scale-110 transition-transform"
                  size={26}
                />
              </Link>
            </div>
            <UserDropdownMenu
              avatarUrl={typedProfile.avatar_url}
              firstName={typedProfile.full_name?.split(" ")[0] ?? "User"}
            />
          </div>
        </nav>
      </div>

      {/* Contenido Principal */}
      <div className="w-full max-w-7xl px-6 py-12">
        <DiscoveryContent
          matches={sortedMatches}
          fallbackUsers={fallbackUsers}
          allCategories={allCategoriesArray}
          allShifts={allShiftsArray}
          matchCount={sortedMatches.length}
          skillMap={skillMap}
        />
      </div>
    </main>
  );
}
