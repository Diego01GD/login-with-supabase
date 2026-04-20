import { notifyPendingMessages } from "@/lib/email/notifications";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: sessionData, error: userError } =
      await supabase.auth.getUser();

    if (userError || !sessionData.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const senderId = sessionData.user.id;
    const { exchangeId, content } = await request.json();

    if (!exchangeId || typeof exchangeId !== "string") {
      return NextResponse.json(
        { error: "exchangeId es requerido" },
        { status: 400 },
      );
    }

    const cleanContent = typeof content === "string" ? content.trim() : "";
    if (!cleanContent) {
      return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 });
    }

    const { data: exchange, error: exchangeError } = await supabase
      .from("skill_exchanges")
      .select("id, sender_id, receiver_id, status")
      .eq("id", exchangeId)
      .maybeSingle();

    if (exchangeError || !exchange) {
      return NextResponse.json(
        { error: "Intercambio no encontrado" },
        { status: 404 },
      );
    }

    const isParticipant =
      exchange.sender_id === senderId || exchange.receiver_id === senderId;

    if (!isParticipant) {
      return NextResponse.json(
        { error: "No tienes permiso para enviar mensajes en este chat" },
        { status: 403 },
      );
    }

    if (exchange.status === "completed") {
      return NextResponse.json(
        { error: "El intercambio está finalizado" },
        { status: 400 },
      );
    }

    const receiverId =
      exchange.sender_id === senderId
        ? exchange.receiver_id
        : exchange.sender_id;

    const { data, error } = await supabase
      .from("messages")
      .insert({
        exchange_id: exchangeId,
        sender_id: senderId,
        content: cleanContent,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await notifyPendingMessages({
      senderId,
      receiverId,
    });

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error servidor" },
      { status: 500 },
    );
  }
}
