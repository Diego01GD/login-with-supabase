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

// app/api/skill-exchanges/route.ts

// ... (POST se mantiene igual)

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: sessionData } = await supabase.auth.getUser();
    if (!sessionData.user)
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const userId = sessionData.user.id;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    let query = supabase.from("skill_exchanges").select(`
        id, sender_id, receiver_id, status, created_at,
        sender_profile:profiles!skill_exchanges_sender_id_fkey(id, full_name, avatar_url, career, gpa),
        receiver_profile:profiles!skill_exchanges_receiver_id_fkey(id, full_name, avatar_url, career, gpa)
    `);

    if (type === "received") {
      query = query.eq("receiver_id", userId).eq("status", "pending");
    } else if (type === "sent") {
      query = query.eq("sender_id", userId);
    } else if (type === "active") {
      // Intercambios activos (accepted) desde ambas perspectivas
      query = query
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .eq("status", "accepted");
    } else if (type === "history") {
      query = query.or(
        `and(sender_id.eq.${userId},status.in.(completed,rejected,expired)),and(receiver_id.eq.${userId},status.in.(completed,rejected,expired))`,
      );
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });
    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });

    // TRANSFORMACIÓN: Siempre poner el perfil de la OTRA persona en 'profiles'
    const transformedData = (data || []).map((exchange: any) => {
      const isSender = exchange.sender_id === userId;
      return {
        ...exchange,
        profiles: isSender
          ? exchange.receiver_profile
          : exchange.sender_profile,
      };
    });

    return NextResponse.json({ data: transformedData });
  } catch (error) {
    return NextResponse.json({ error: "Error servidor" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: sessionData } = await supabase.auth.getUser();
    if (!sessionData.user)
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const userId = sessionData.user.id;
    const { exchangeId, newStatus } = await request.json();

    const { data: exchange } = await supabase
      .from("skill_exchanges")
      .select("*")
      .eq("id", exchangeId)
      .maybeSingle();

    if (!exchange)
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    const isReceiver = exchange.receiver_id === userId;
    const isSender = exchange.sender_id === userId;

    let allowed = false;

    // LÓGICA DE PERMISOS MEJORADA
    if (newStatus === "accepted") {
      allowed = isReceiver; // Solo el que recibe puede aceptar
    } else if (newStatus === "rejected") {
      // El receptor puede rechazar (Ignorar)
      // El emisor puede rechazar (Cancelar) SOLO si aún está pendiente
      allowed = isReceiver || (isSender && exchange.status === "pending");
    } else if (newStatus === "completed") {
      // Ambos pueden completar el intercambio si está actualmente accepted
      allowed = (isReceiver || isSender) && exchange.status === "accepted";
    }

    if (!allowed) {
      return NextResponse.json(
        { error: "No tienes permiso para esta acción" },
        { status: 403 },
      );
    }

    const { data, error } = await supabase
      .from("skill_exchanges")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", exchangeId)
      .select()
      .single();

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
