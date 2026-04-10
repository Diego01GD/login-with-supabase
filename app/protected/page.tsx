import Link from "next/link";
import Image from "next/image";
import LogoSS from "@/public/images/logo.png";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { unstable_noStore } from "next/cache";
import { UserDropdownMenu } from "@/components/user-dropdown-menu";
import { MessageSquare, Repeat } from "lucide-react";

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

export default async function main() {
  unstable_noStore();

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
                className="rounded-full shadow-sm w-40 mr-3"
              />

              <span className="text-xl font-bold tracking-tight text-[#114c5f]">
                SkillSwap
              </span>
            </Link>
          </div>

          

          <div className="md:text-xl text-[#114c5f] font-bold flex items-center gap-10">
            <div className="flex gap-8">
              <Link href="/protected/Sexo"><Repeat className="hover:scale-110 transition-transform"  size={26}/></Link>
              <Link href="/protected/messages" className=""><MessageSquare className="hover:scale-110 transition-transform" size={26}/></Link>
            </div>
            <UserDropdownMenu
              avatarUrl={typedProfile.avatar_url}
              firstName={typedProfile.full_name?.split(" ")[0] ?? "User"}
            />
          </div>
        </nav>
      </div>
    </main>
  );
}
