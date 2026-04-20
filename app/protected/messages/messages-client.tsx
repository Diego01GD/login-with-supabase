"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Message, SkillExchange, Profile } from "@/types/database";
import Link from "next/link";
import Image from "next/image";
import { MessageCircleHeart, MessageSquare, Repeat } from "lucide-react";
import { UserDropdownMenu } from "@/components/user-dropdown-menu";
import LogoSS from "@/public/images/logo.png";

interface ExchangeWithUI extends SkillExchange {
  contact: Profile;
  hasUnread: boolean;
}

export default function MessagesPageClient({
  userId,
  userName,
  avatarUrl,
  initialUnreadCount,
  initialPendingExchanges,
}: any) {
  const supabase = createClient();
  const [exchanges, setExchanges] = useState<ExchangeWithUI[]>([]);
  const [selectedExchange, setSelectedExchange] =
    useState<ExchangeWithUI | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [unreadTotal, setUnreadTotal] = useState(initialUnreadCount);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const firstName = userName ? userName.split(" ")[0] : "Usuario";

  // Scroll al final cuando llegan mensajes nuevos
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- 1. ESCUCHADOR GLOBAL (NOTIFICACIONES EN TIEMPO REAL) ---
  useEffect(() => {
    const globalChannel = supabase
      .channel("global-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new as Message;
          if (msg.sender_id === userId) return;

          setExchanges((current) => {
            const index = current.findIndex((ex) => ex.id === msg.exchange_id);
            if (index === -1) return current;

            // Si el chat NO está seleccionado, marcamos como no leído y sumamos al total
            if (selectedExchange?.id !== msg.exchange_id) {
              const updated = [...current];
              if (!updated[index].hasUnread) {
                updated[index] = { ...updated[index], hasUnread: true };
                setUnreadTotal((prev: number) => prev + 1);
              }
              return updated;
            }
            return current;
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(globalChannel);
    };
  }, [userId, selectedExchange?.id, supabase]);

  // --- 2. CARGA INICIAL DE CHATS ---
  useEffect(() => {
    const fetchExchanges = async () => {
      const { data } = await supabase
        .from("skill_exchanges")
        .select(
          `
          id, sender_id, receiver_id, status,
          sender:profiles!sender_id(id, full_name, career, avatar_url),
          receiver:profiles!receiver_id(id, full_name, career, avatar_url),
          messages(id, is_read, sender_id)
        `,
        )
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .in("status", ["accepted", "completed"]);

      if (data) {
        const formatted: ExchangeWithUI[] = data.map((ex: any) => ({
          ...ex,
          contact: ex.sender_id === userId ? ex.receiver : ex.sender,
          hasUnread: ex.messages?.some(
            (m: any) => m.sender_id !== userId && !m.is_read,
          ),
        }));
        setExchanges(formatted);
      }
    };
    fetchExchanges();
  }, [userId, supabase]);

  // --- 3. LÓGICA DEL CHAT SELECCIONADO ---
  useEffect(() => {
    const exchangeId = selectedExchange?.id;
    if (!exchangeId) return;

    setMessages([]);

    const fetchHistory = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("exchange_id", exchangeId)
        .order("created_at", { ascending: true });
      if (data) setMessages(data);

      // Marcar como leídos en DB y limpiar indicadores locales
      const { data: updated } = await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("exchange_id", exchangeId)
        .neq("sender_id", userId)
        .eq("is_read", false)
        .select();

      if (updated && updated.length > 0) {
        setUnreadTotal((prev: number) => Math.max(0, prev - 1));
        setExchanges((prev) =>
          prev.map((ex) =>
            ex.id === exchangeId ? { ...ex, hasUnread: false } : ex,
          ),
        );
      }
    };

    fetchHistory();

    const chatChannel = supabase
      .channel(`chat_${exchangeId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `exchange_id=eq.${exchangeId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(chatChannel);
    };
  }, [selectedExchange?.id, userId, supabase]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newMessage.trim() ||
      !selectedExchange ||
      selectedExchange.status === "completed"
    )
      return;

    const response = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        exchangeId: selectedExchange.id,
        content: newMessage,
      }),
    });

    if (response.ok) {
      setNewMessage("");
      return;
    }

    const payload = await response
      .json()
      .catch(() => ({ error: "Error al enviar mensaje" }));
    console.error(payload.error || "No se pudo enviar el mensaje");
  };

  return (
    <main className="h-screen flex flex-col bg-[#f9f7f2]">
      {/* NAVBAR */}
      <nav className="flex-none flex items-center justify-between px-12 py-4 bg-white/80 backdrop-blur-sm border-b border-[#9cd2d3]/20 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Link href="/protected" className="flex items-center gap-3">
            <Image src={LogoSS} alt="SkillSwap" className="w-32" />
            <span className="text-2xl font-bold text-[#114c5f]">SkillSwap</span>
          </Link>
        </div>

        <div className="flex items-center gap-10">
          <div className="flex gap-8 text-[#114c5f]">
            <Link href="/protected/swap" className="relative">
              <Repeat
                size={26}
                className="hover:text-[#0057cc] transition-all hover:scale-110"
              />
              {initialPendingExchanges > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {initialPendingExchanges}
                </span>
              )}
            </Link>
            <div className="relative">
              <MessageSquare size={26} className="text-[#0057cc]" />
              {unreadTotal > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
                  {unreadTotal}
                </span>
              )}
            </div>
            <Link href="/protected/feedback" title="Mi Reputación">
              <MessageCircleHeart
                size={26}
                className="hover:text-[#0057cc] transition-all hover:scale-110"
              />
            </Link>
          </div>
          <div className="flex items-center gap-3 border-l pl-8 text-[#114c5f] font-bold">
            <UserDropdownMenu avatarUrl={avatarUrl} firstName={firstName} />
          </div>
        </div>
      </nav>

      <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full overflow-hidden p-4">
        <div className="flex justify-end mb-2">
          <Link
            href="/protected/"
            className="text-[#0057cc] hover:text-[#004499] text-sm font-semibold"
          >
            ← Volver a la ventana Inicial
          </Link>
        </div>

        <div className="flex-1 flex bg-white rounded-2xl shadow-xl overflow-hidden mt-4 border border-gray-100">
          {/* SIDEBAR */}
          <aside className="w-80 border-r flex flex-col bg-gray-50/30">
            <div className="p-6 border-b bg-white">
              <h2 className="font-black text-[#1a1a1a] text-xl">Chats</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {exchanges.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => setSelectedExchange(ex)}
                  className={`p-4 flex items-center cursor-pointer border-b transition-all ${
                    selectedExchange?.id === ex.id
                      ? "bg-[#114c5f]/10 border-l-4 border-l-[#114c5f]"
                      : "hover:bg-white"
                  } ${ex.status === "completed" ? "opacity-60 bg-gray-100" : ""}`}
                >
                  <div className="relative flex-shrink-0">
                    <Image
                      src={
                        ex.contact?.avatar_url ||
                        `https://ui-avatars.com/api/?name=${ex.contact?.full_name}`
                      }
                      alt="Avatar"
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                    {ex.hasUnread && ex.status !== "completed" && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-md animate-bounce" />
                    )}
                  </div>
                  <div className="ml-4 overflow-hidden">
                    <p className="font-bold text-gray-900 truncate text-sm">
                      {ex.contact?.full_name}
                    </p>
                    <p className="text-[10px] text-blue-600 font-black uppercase tracking-wider">
                      {ex.contact?.career}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* CHAT AREA */}
          <section className="flex-1 flex flex-col bg-[#fafafa]">
            {selectedExchange ? (
              <>
                <header className="p-4 border-b bg-white flex items-center shadow-sm">
                  <Image
                    src={
                      selectedExchange.contact?.avatar_url ||
                      `https://ui-avatars.com/api/?name=${selectedExchange.contact?.full_name}`
                    }
                    alt=""
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full mr-3 border"
                  />
                  <p className="font-bold text-[#114c5f]">
                    {selectedExchange.contact?.full_name}
                  </p>
                </header>
                <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
                        m.sender_id === userId
                          ? "self-end bg-[#114c5f] text-white rounded-tr-none"
                          : "self-start bg-white border text-[#0d3b4c] font-bold rounded-tl-none"
                      }`}
                    >
                      {m.content}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <footer className="p-4 bg-white border-t border-gray-100">
                  <form onSubmit={handleSend} className="flex gap-2">
                    <input
                      className="flex-1 p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-[#114c5f]/10 text-sm text-[#0d3b4c]"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={selectedExchange.status === "completed"}
                      placeholder={
                        selectedExchange.status === "completed"
                          ? "Intercambio finalizado"
                          : "Escribe un mensaje..."
                      }
                    />
                    <button
                      type="submit"
                      className="bg-[#114c5f] text-white px-6 py-2 rounded-xl font-bold hover:bg-[#0d3b4c] disabled:opacity-50"
                    >
                      Enviar
                    </button>
                  </form>
                </footer>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4 opacity-20">
                <MessageSquare size={80} />
                <p className="font-bold text-xl">SkillSwap Chat</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
