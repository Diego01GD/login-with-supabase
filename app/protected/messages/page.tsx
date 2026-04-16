import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MessagesPageClient from "./messages-client";

export default async function MessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Perfil del usuario logueado
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  // Conteo total de mensajes no leídos para el Navbar
  const { count: unreadMessagesTotal } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .neq("sender_id", user.id)
    .eq("is_read", false);

  // Conteo de solicitudes pendientes para el icono de intercambio
  const { count: pendingExchanges } = await supabase
    .from("skill_exchanges")
    .select("*", { count: "exact", head: true })
    .eq("receiver_id", user.id)
    .eq("status", "pending");

  return (
    <MessagesPageClient
      userId={user.id}
      userName={profile?.full_name || "Usuario"}
      avatarUrl={profile?.avatar_url || ""}
      initialUnreadCount={unreadMessagesTotal || 0}
      initialPendingExchanges={pendingExchanges || 0}
    />
  );
}