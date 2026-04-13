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
    const { receiverId } = await request.json();

    if (!receiverId) {
      return NextResponse.json(
        { error: "receiverId es requerido" },
        { status: 400 },
      );
    }

    if (senderId === receiverId) {
      return NextResponse.json(
        { error: "No puedes hacer match contigo mismo" },
        { status: 400 },
      );
    }

    // Verificar que el usuario no tenga más de 5 intercambios activos (status='accepted')
    const { count: activeExchanges } = await supabase
      .from("skill_exchanges")
      .select("*", { count: "exact", head: true })
      .or(
        `and(sender_id.eq.${senderId},status.eq.accepted),and(receiver_id.eq.${senderId},status.eq.accepted)`,
      );

    if ((activeExchanges ?? 0) >= 5) {
      return NextResponse.json(
        { error: "Has alcanzado el límite de 5 intercambios activos" },
        { status: 400 },
      );
    }

    // Verificar que no exista un intercambio pendiente entre estos dos usuarios
    const { data: existingExchange } = await supabase
      .from("skill_exchanges")
      .select("id")
      .or(
        `and(sender_id.eq.${senderId},receiver_id.eq.${receiverId},status.eq.pending),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId},status.eq.pending)`,
      )
      .maybeSingle();

    if (existingExchange) {
      return NextResponse.json(
        { error: "Ya existe una solicitud pendiente con este usuario" },
        { status: 400 },
      );
    }

    // Crear el intercambio
    const { data, error } = await supabase
      .from("skill_exchanges")
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: sessionData, error: userError } =
      await supabase.auth.getUser();

    if (userError || !sessionData.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const userId = sessionData.user.id;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // 'received', 'sent', 'history'

    let query = supabase.from("skill_exchanges").select(
      `
        id,
        sender_id,
        receiver_id,
        status,
        created_at,
        updated_at,
        sender_profile:profiles!skill_exchanges_sender_id_fkey(id, full_name, avatar_url, career),
        receiver_profile:profiles!skill_exchanges_receiver_id_fkey(id, full_name, avatar_url, career)
      `,
    );

    if (type === "received") {
      query = query.eq("receiver_id", userId).eq("status", "pending");
    } else if (type === "sent") {
      // TODAS las solicitudes enviadas (pending, accepted, rejected, etc)
      query = query.eq("sender_id", userId);
    } else if (type === "history") {
      query = query.or(
        `and(sender_id.eq.${userId},status.in.(completed,rejected,expired)),and(receiver_id.eq.${userId},status.in.(completed,rejected,expired))`,
      );
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Transformar la respuesta para que el cliente tenga 'profiles' en lugar de sender_profile/receiver_profile
    const transformedData = (data || []).map((exchange: any) => {
      if (type === "sent") {
        return {
          ...exchange,
          profiles: exchange.receiver_profile,
        };
      } else if (type === "received") {
        return {
          ...exchange,
          profiles: exchange.sender_profile,
        };
      }
      return exchange;
    });

    return NextResponse.json({ data: transformedData }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: sessionData, error: userError } =
      await supabase.auth.getUser();

    if (userError || !sessionData.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const userId = sessionData.user.id;
    const { exchangeId, newStatus } = await request.json();

    if (!exchangeId || !newStatus) {
      return NextResponse.json(
        { error: "exchangeId y newStatus son requeridos" },
        { status: 400 },
      );
    }

    // Obtener el intercambio para verificar permisos
    const { data: exchange } = await supabase
      .from("skill_exchanges")
      .select("*")
      .eq("id", exchangeId)
      .maybeSingle();

    if (!exchange) {
      return NextResponse.json(
        { error: "Intercambio no encontrado" },
        { status: 404 },
      );
    }

    // Verificar que el usuario sea el receiver para aceptar/rechazar
    if (exchange.receiver_id !== userId) {
      return NextResponse.json(
        { error: "No tienes permiso para actualizar este intercambio" },
        { status: 403 },
      );
    }

    const { data, error } = await supabase
      .from("skill_exchanges")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", exchangeId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 },
    );
  }
}
