"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton2() {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <button onClick={logout} className="flex gap-3 px-3 items-center ">
      <LogOut />
      <p>Cerrar Sesión</p>
    </button>
  );
}
