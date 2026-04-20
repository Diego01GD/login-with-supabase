import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

type CreateReviewPayload = {
  exchangeId?: string;
  generalRating?: number;
  masteryRating?: number;
  clarityRating?: number;
  punctualityRating?: number;
  attitudeRating?: number;
  respectRating?: number;
  comment?: string;
  skillName?: string;
};

const inRange = (value: number) => value >= 1 && value <= 5;

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("exchange_reviews")
      .select("id, exchange_id, reviewer_id, reviewee_id, created_at")
      .eq("reviewer_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data: data || [] });
  } catch {
    return NextResponse.json({ error: "Error servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const payload = (await request.json()) as CreateReviewPayload;

    if (!payload.exchangeId) {
      return NextResponse.json(
        { error: "exchangeId es requerido" },
        { status: 400 },
      );
    }

    const ratings = [
      payload.generalRating,
      payload.masteryRating,
      payload.clarityRating,
      payload.punctualityRating,
      payload.attitudeRating,
      payload.respectRating,
    ];

    if (ratings.some((r) => typeof r !== "number" || !inRange(r))) {
      return NextResponse.json(
        { error: "Todas las calificaciones deben estar entre 1 y 5" },
        { status: 400 },
      );
    }

    const { data: exchange, error: exchangeError } = await supabase
      .from("skill_exchanges")
      .select("id, sender_id, receiver_id, status, skill_name")
      .eq("id", payload.exchangeId)
      .maybeSingle();

    if (exchangeError || !exchange) {
      return NextResponse.json(
        { error: "Intercambio no encontrado" },
        { status: 404 },
      );
    }

    if (exchange.sender_id !== user.id) {
      return NextResponse.json(
        {
          error:
            "Solo quien envió la solicitud de intercambio puede dejar esta reseña",
        },
        { status: 403 },
      );
    }

    if (exchange.status !== "completed") {
      return NextResponse.json(
        { error: "Solo puedes reseñar intercambios completados" },
        { status: 400 },
      );
    }

    const { data: existingReview } = await supabase
      .from("exchange_reviews")
      .select("id")
      .eq("exchange_id", payload.exchangeId)
      .eq("reviewer_id", user.id)
      .maybeSingle();

    if (existingReview) {
      return NextResponse.json(
        { error: "Ya realizaste la reseña de este intercambio" },
        { status: 409 },
      );
    }

    const skillName = payload.skillName || exchange.skill_name;
    if (!skillName) {
      return NextResponse.json(
        {
          error:
            "No se pudo identificar la habilidad del intercambio. Verifica skill_name en skill_exchanges.",
        },
        { status: 400 },
      );
    }

    const { data: skill } = await supabase
      .from("skills")
      .select("id")
      .eq("name", skillName)
      .maybeSingle();

    if (!skill) {
      return NextResponse.json(
        {
          error:
            "La habilidad del intercambio no existe en catálogo de skills.",
        },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("exchange_reviews")
      .insert({
        exchange_id: payload.exchangeId,
        reviewer_id: user.id,
        reviewee_id: exchange.receiver_id,
        skill_id: skill.id,
        general_rating: payload.generalRating,
        mastery_rating: payload.masteryRating,
        clarity_rating: payload.clarityRating,
        punctuality_rating: payload.punctualityRating,
        attitude_rating: payload.attitudeRating,
        respect_rating: payload.respectRating,
        comment: payload.comment || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error servidor" }, { status: 500 });
  }
}
