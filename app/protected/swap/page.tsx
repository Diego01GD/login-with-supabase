import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SwapPageClient from "./page-client"; // Ajusta la ruta si es necesario

export default async function SwapPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Obtenemos el perfil del usuario logueado directamente
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  // Obtenemos el conteo de intercambios activos (status = 'accepted')
  // para pasarlo como valor inicial al widget
  const { count: activeCount } = await supabase
    .from("skill_exchanges")
    .select("*", { count: "exact", head: true })
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .eq("status", "accepted");

  // Obtenemos el conteo de solicitudes pendientes recibidas
  const { count: pendingReceivedCount } = await supabase
    .from("skill_exchanges")
    .select("*", { count: "exact", head: true })
    .eq("receiver_id", user.id)
    .eq("status", "pending");

  return (
    <SwapPageClient
      userId={user.id}
      userName={profile?.full_name || "Usuario"}
      avatarUrl={profile?.avatar_url || ""}
      initialActiveCount={activeCount || 0}
      pendingReceivedCount={pendingReceivedCount || 0}
    />
  );
}
