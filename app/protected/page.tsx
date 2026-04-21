import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { unstable_noStore } from "next/cache";
import { ProtectedPageClient } from "@/components/protected-page-client";

// Definición de tipos basada en tu estructura de base de datos
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
  scheduleCount: number;
  matchScore: "perfect" | "good" | "fair";
  shift: string;
  availability: Array<{ day: string; timeSlots: string[] }>;
};

type TrendingSkill = {
  skill: string;
  count: number;
};

type RankedMatchedUser = MatchedUser & {
  distanceScore: number;
};

const DAY_ORDER: Record<string, number> = {
  Lunes: 0,
  Martes: 1,
  Miercoles: 2,
  Miércoles: 2,
  Jueves: 3,
  Viernes: 4,
  Sabado: 5,
  Sábado: 5,
  Domingo: 6,
};

function parseSlotMidpoint(range: string): number {
  const [start, end] = range.split("-").map((part) => part.trim());
  if (!start || !end) return Number.MAX_SAFE_INTEGER;

  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);

  if (
    Number.isNaN(startHour) ||
    Number.isNaN(startMinute) ||
    Number.isNaN(endHour) ||
    Number.isNaN(endMinute)
  ) {
    return Number.MAX_SAFE_INTEGER;
  }

  const startTotal = startHour * 60 + startMinute;
  const endTotal = endHour * 60 + endMinute;
  return Math.floor((startTotal + endTotal) / 2);
}

function circularDayDistance(a: number, b: number): number {
  const diff = Math.abs(a - b);
  return Math.min(diff, 7 - diff);
}

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

  // Lógica de Matching y obtención de datos [cite: 1]
  const { data: userInterests } = await supabase
    .from("user_interests")
    .select("skill_id")
    .eq("profile_id", userId);

  const { data: timeSlots } = await supabase
    .from("time_slots")
    .select("id, range, shift");

  const { data: allSkills } = await supabase
    .from("skills")
    .select("id, name, category");

  const { data: otherProfiles } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, career, gpa")
    .neq("id", userId);

  const { data: allUserSkills } = await supabase
    .from("user_skills")
    .select("profile_id, skill_id, level");

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

  const userInterestIds = typedUserInterests.map((i) => i.skill_id);
  const currentUserAvailability = typedAllAvailability.filter(
    (ua) => ua.profile_id === userId,
  );
  const userAvailabilityKeySet = new Set(
    currentUserAvailability.map((ua) => `${ua.day}|${ua.slot_id}`),
  );

  const slotMidpointMap = new Map<string, number>(
    typedTimeSlots.map((slot) => [slot.id, parseSlotMidpoint(slot.range)]),
  );
  const allShiftsSet = new Set(typedTimeSlots.map((ts) => ts.shift));
  const allShiftsArray = Array.from(allShiftsSet);
  const allCategoriesSet = new Set(typedAllSkills.map((s) => s.category));
  const allCategoriesArray = Array.from(allCategoriesSet).sort();

  const matchedUsers: RankedMatchedUser[] = [];
  const fallbackUsers: RankedMatchedUser[] = [];

  typedOtherProfiles.forEach((otherProfile) => {
    const offeringSkills = typedAllUserSkills.filter(
      (us) => us.profile_id === otherProfile.id,
    );
    const otherAvailability = typedAllAvailability.filter(
      (ua) => ua.profile_id === otherProfile.id,
    );

    const uniqueOtherAvailability = Array.from(
      new Map(
        otherAvailability
          .filter((ua) => Boolean(slotMap[ua.slot_id]))
          .map((ua) => [`${ua.day}|${ua.slot_id}`, ua]),
      ).values(),
    );

    let hasExactOverlap = false;
    let bestDistanceScore = Number.MAX_SAFE_INTEGER;
    let bestAvailabilitySlot: Availability | undefined;

    if (uniqueOtherAvailability.length > 0) {
      uniqueOtherAvailability.forEach((otherSlot) => {
        const otherKey = `${otherSlot.day}|${otherSlot.slot_id}`;
        if (userAvailabilityKeySet.has(otherKey)) {
          hasExactOverlap = true;
          if (0 < bestDistanceScore) {
            bestDistanceScore = 0;
            bestAvailabilitySlot = otherSlot;
          }
          return;
        }

        const otherDayIndex = DAY_ORDER[otherSlot.day] ?? 0;
        const otherMid =
          slotMidpointMap.get(otherSlot.slot_id) ?? Number.MAX_SAFE_INTEGER;

        currentUserAvailability.forEach((mySlot) => {
          const myDayIndex = DAY_ORDER[mySlot.day] ?? 0;
          const myMid =
            slotMidpointMap.get(mySlot.slot_id) ?? Number.MAX_SAFE_INTEGER;

          const dayDistance = circularDayDistance(otherDayIndex, myDayIndex);
          const minuteDistance = Math.abs(otherMid - myMid);

          const score =
            dayDistance === 0
              ? 100 + minuteDistance
              : 1000 + dayDistance * 180 + Math.floor(minuteDistance / 2);

          if (score < bestDistanceScore) {
            bestDistanceScore = score;
            bestAvailabilitySlot = otherSlot;
          }
        });
      });
    }

    if (!Number.isFinite(bestDistanceScore)) {
      bestDistanceScore = Number.MAX_SAFE_INTEGER;
    }

    const bestSlot = bestAvailabilitySlot
      ? slotMap[bestAvailabilitySlot.slot_id]
      : undefined;

    const scheduleDisplay = bestSlot?.range || "Sin horario definido";
    const scheduleCount = uniqueOtherAvailability.length;

    const otherShifts = new Set(
      otherAvailability.map((ua) => slotMap[ua.slot_id]?.shift).filter(Boolean),
    );

    offeringSkills.forEach((skill) => {
      const skillInfo = skillMap[skill.skill_id];

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

      const userData: RankedMatchedUser = {
        id: otherProfile.id,
        name: otherProfile.full_name || "Usuario",
        avatarUrl: otherProfile.avatar_url,
        career: (otherProfile as Profile).career || "Carrera no especificada",
        gpa: (otherProfile as Profile).gpa || 0,
        skill: skillInfo?.name || skill.skill_id,
        level: skill.level,
        schedule: scheduleDisplay,
        scheduleCount,
        matchScore: "fair" as const,
        shift: bestSlot?.shift || Array.from(otherShifts)[0] || "Mañana",
        availability: availabilityArray,
        distanceScore: bestDistanceScore,
      };

      const hasSkillMatch = userInterestIds.includes(skill.skill_id);

      if (hasSkillMatch && hasExactOverlap) {
        userData.matchScore = "perfect";
        matchedUsers.push(userData);
      } else if (hasSkillMatch) {
        userData.matchScore = "good";
        matchedUsers.push(userData);
      } else {
        userData.matchScore = "fair";
        fallbackUsers.push(userData);
      }
    });
  });

  const sortedMatches = matchedUsers.sort((a, b) => {
    const scoreOrder = { perfect: 0, good: 1, fair: 2 };
    return (
      scoreOrder[a.matchScore] - scoreOrder[b.matchScore] ||
      a.distanceScore - b.distanceScore ||
      b.name.localeCompare(a.name)
    );
  });

  const sortedFallback = fallbackUsers.sort((a, b) => {
    return a.distanceScore - b.distanceScore || b.name.localeCompare(a.name);
  });

  // Ranking dinámico de habilidades en tendencia basado en la base de datos.
  // Se cuenta cuántas personas (profile_id únicos) enseñan cada habilidad.
  const trendMap = new Map<string, Set<string>>();

  typedAllUserSkills.forEach((userSkill) => {
    const skillName = skillMap[userSkill.skill_id]?.name;
    if (!skillName) return;

    if (!trendMap.has(skillName)) {
      trendMap.set(skillName, new Set<string>());
    }

    trendMap.get(skillName)!.add(userSkill.profile_id);
  });

  const trendingSkills: TrendingSkill[] = Array.from(trendMap.entries())
    .map(([skill, profiles]) => ({ skill, count: profiles.size }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // --- LÓGICA DE CONTADORES PARA NOTIFICACIONES --- [cite: 1]

  // 1. Contador de intercambios activos
  const { count: activeExchangesCount } = await supabase
    .from("skill_exchanges")
    .select("*", { count: "exact", head: true })
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .eq("status", "accepted");

  // 2. Contador de solicitudes pendientes recibidas
  const { count: pendingReceivedCount } = await supabase
    .from("skill_exchanges")
    .select("*", { count: "exact", head: true })
    .eq("receiver_id", userId)
    .eq("status", "pending");

  // 3. NUEVO: Contador de mensajes no leídos
  const { data: userExchanges } = await supabase
    .from("skill_exchanges")
    .select("id")
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

  const exchangeIds = userExchanges?.map((ex) => ex.id) || [];

  const { count: unreadMessagesCount } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .in("exchange_id", exchangeIds)
    .neq("sender_id", userId)
    .eq("is_read", false);

  return (
    <ProtectedPageClient
      profile={typedProfile}
      userId={userId}
      activeExchangesCount={activeExchangesCount || 0}
      pendingReceivedCount={pendingReceivedCount || 0}
      unreadMessagesCount={unreadMessagesCount || 0}
      matches={sortedMatches.map(({ distanceScore, ...user }) => user)}
      fallbackUsers={sortedFallback.map(({ distanceScore, ...user }) => user)}
      allCategories={allCategoriesArray}
      allShifts={allShiftsArray}
      skillMap={skillMap}
      trendingSkills={trendingSkills}
    />
  );
}
