import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request: NextRequest) {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return NextResponse.json(
      {
        error: "La verificación del correo no está configurada en el servidor.",
      },
      { status: 500 },
    );
  }

  const body = await request.json();
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Correo inválido." }, { status: 400 });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false },
    });

    const { data, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (error) {
      console.error("forgot-password verify error:", error);
      const message =
        process.env.NODE_ENV === "development"
          ? error.message ||
            "No se pudo verificar el correo. Intenta más tarde."
          : "No se pudo verificar el correo. Intenta más tarde.";

      return NextResponse.json({ error: message }, { status: 500 });
    }

    const exists = Array.isArray(data?.users)
      ? data.users.some((user) => user.email?.toLowerCase() === email)
      : false;

    return NextResponse.json({ exists });
  } catch (err) {
    console.error("forgot-password verify unexpected error:", err);
    const message =
      process.env.NODE_ENV === "development"
        ? err instanceof Error
          ? err.message
          : String(err)
        : "No se pudo verificar el correo. Intenta más tarde.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
