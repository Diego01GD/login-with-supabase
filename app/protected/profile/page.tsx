import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import Link from "next/link";

type Profile = {
  full_name: string;
  career: string;
  student_id: string;
  semester: string;
  interests: string[];
  gpa: number;
  avatar_url?: string;
  is_complete: boolean;
};

type Skill = {
  id: string;
  name: string;
  category: string;
};

type UserSkill = {
  skill_id: string;
  level: string;
};

type UserInterest = {
  skill_id: string;
};

type TimeSlot = {
  id: string;
  range: string;
  shift: string;
};

type Availability = {
  day: string;
  slot_id: string;
  comment: string;
};

export default async function ProtectedPage() {
  const supabase = await createClient();
  const { data: sessionData, error: userError } = await supabase.auth.getUser();

  if (userError || !sessionData.user) {
    redirect("/auth/login");
  }

  const userId = sessionData.user.id;

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "full_name,career,student_id,semester,interests,gpa,avatar_url,is_complete",
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

  const { data: userSkills } = await supabase
    .from("user_skills")
    .select("skill_id, level")
    .eq("profile_id", userId);

  const { data: userInterests } = await supabase
    .from("user_interests")
    .select("skill_id")
    .eq("profile_id", userId);

  const { data: userAvailability } = await supabase
    .from("user_availability")
    .select("day, slot_id, comment")
    .eq("profile_id", userId);

  const { data: timeSlots } = await supabase
    .from("time_slots")
    .select("id, range, shift");

  const typedUserSkills = (userSkills ?? []) as UserSkill[];
  const typedUserInterests = (userInterests ?? []) as UserInterest[];
  const typedUserAvailability = (userAvailability ?? []) as Availability[];
  const typedTimeSlots = (timeSlots ?? []) as TimeSlot[];

  const slotMap = Object.fromEntries(
    typedTimeSlots.map((ts) => [ts.id, ts]),
  ) as Record<string, TimeSlot>;

  const skillIds = typedUserSkills.map((row) => row.skill_id);
  const interestIds = typedUserInterests.map((row) => row.skill_id);

  const { data: skillsData } = await supabase
    .from("skills")
    .select("id, name, category")
    .in("id", skillIds);

  const { data: interestsData } = await supabase
    .from("skills")
    .select("id, name, category")
    .in("id", interestIds);

  const typedSkillsData = (skillsData ?? []) as Skill[];
  const typedInterestsData = (interestsData ?? []) as Skill[];

  const skillsOffered = typedSkillsData.map((skill) => {
    const meta = typedUserSkills.find((s) => s.skill_id === skill.id);
    return { ...skill, level: meta?.level ?? "N/A" };
  });

  const skillsLearning = typedInterestsData;

  const scheduleByDay = typedUserAvailability.reduce<
    Record<string, Availability[]>
  >((acc, item) => {
    if (!acc[item.day]) acc[item.day] = [];
    acc[item.day].push(item);
    return acc;
  }, {});

  const reputation = "N/A";

  return (
    <div className="min-h-screen font-gentium mt-7">
      <div className="w-full text-right">
        <Link
            href="/protected/"
            className="text-[#0057cc] hover:text-[#004499] font-semibold mb-8 inline-block"
          >
            ← Volver a la ventana principal
          </Link>
      </div>
      <div className="max-w-full mx-auto bg-white space-y-8 p-6 md:p-12">
        
        <header className="bg-white rounded-[2rem] p-6 md:p-8 shadow-lg border border-[#d7e5ef] flex flex-col md:flex-row justify-between items-start gap-6 relative">
          <div className="flex items-start gap-5">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-[#3983A6] bg-[#eff6ff]">
              {typedProfile.avatar_url ? (
                <Image
                  src={typedProfile.avatar_url}
                  width={112}
                  height={112}
                  alt="Avatar"
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#dce7f4] text-[#134f78] text-xl font-bold">
                  {typedProfile.full_name?.slice(0, 1) ?? "U"}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-[#0d3453] leading-tight">
                {typedProfile.full_name}
              </h1>
              <p className="text-xl font-semibold text-[#134f78] mt-1">
                {typedProfile.career} • {typedProfile.semester}° Semestre
              </p>
              <p className="text-sm md:text-base text-[#3b5b79] mt-1">
                {sessionData.user.email}
              </p>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <article className="bg-white rounded-2xl p-5 border shadow-sm border-[#e2ecf6]">
            <h2 className="text-lg font-bold text-[#114c5f] mb-3">
              Información Académica
            </h2>
            <ul className="text-sm text-[#325e80] space-y-2">
              <li>
                <strong>Promedio:</strong>{" "}
                {typedProfile.gpa?.toFixed(2) ?? "N/A"}
              </li>
              <li>
                <strong>Semestre:</strong> {typedProfile.semester}°
              </li>
              <li>
                <strong>Matrícula:</strong> {typedProfile.student_id}
              </li>
            </ul>
          </article>

          <article className="bg-[#fff8df] rounded-2xl p-5 border border-[#f5e2af] text-center shadow-sm">
            <h2 className="text-lg font-bold text-[#114c5f] mb-3">
              Reputación SkillSwap
            </h2>
            <p className="text-5xl font-black text-[#0f4f6f]">{reputation}</p>
            <p className="text-sm text-[#385e7d] mt-1">
              Colaboraciones exitosas
            </p>
          </article>

          <article className="bg-white rounded-2xl p-5 border shadow-sm border-[#e2ecf6]">
            <h2 className="text-lg font-bold text-[#114c5f] mb-3">
              Disponibilidad Semanal
            </h2>
            <div className="text-sm text-[#285a77] space-y-2">
              {Object.entries(scheduleByDay).length === 0 ? (
                <p>Ninguna disponibilidad registrada.</p>
              ) : (
                Object.entries(scheduleByDay).map(([day, items]) => (
                  <div
                    key={day}
                    className="py-1 border-b border-[#e3eef6] last:border-none"
                  >
                    <p className="font-semibold text-[#0f4f6f]">{day}</p>
                    <p>
                      {items
                        .map((entry) => {
                          const slotLabel =
                            slotMap[entry.slot_id]?.range ?? entry.slot_id;
                          return (
                            slotLabel +
                            (entry.comment ? ` (${entry.comment})` : "")
                          );
                        })
                        .join(" • ")}
                    </p>
                  </div>
                ))
              )}
            </div>
          </article>
        </section>

        <section className="bg-white p-6 rounded-2xl border shadow-sm border-[#e2ecf6]">
          <h2 className="text-2xl font-bold text-[#114c5f] mb-4">
            Habilidades que Ofrezco
          </h2>
          <div className="flex flex-wrap gap-3">
            {skillsOffered.length === 0 ? (
              <span className="text-sm text-[#587a92]">
                No has agregado habilidades aún.
              </span>
            ) : (
              skillsOffered.map((skill) => (
                <span
                  key={skill.id}
                  className="bg-[#eaf5fd] text-[#0f5590] px-4 py-2 rounded-full font-semibold border border-[#cfe8fb]"
                >
                  {skill.category} • {skill.name} ({skill.level})
                </span>
              ))
            )}
          </div>

          <h2 className="text-2xl font-bold text-[#114c5f] mt-8 mb-4">
            Lo que busco aprender
          </h2>
          <div className="flex flex-wrap gap-3">
            {skillsLearning.length === 0 ? (
              <span className="text-sm text-[#587a92]">
                No hay habilidades de aprendizaje registradas.
              </span>
            ) : (
              skillsLearning.map((interest) => (
                <span
                  key={interest.id}
                  className="bg-[#f3f8ff] text-[#1f688f] px-4 py-2 rounded-full font-semibold border border-[#d6eaf7]"
                >
                  {interest.category} • {interest.name}
                </span>
              ))
            )}
          </div>
        </section>

        {/* Botón Editar */}
        <div className="flex justify-center mt-8">
          <Link
            href="/protected/profile/edit"
            className="bg-[#0057cc] hover:bg-[#004499] text-white px-8 py-3 rounded-lg font-bold text-lg transition-colors"
          >
            Editar Perfil
          </Link>
        </div>
      </div>
    </div>
  );
}
