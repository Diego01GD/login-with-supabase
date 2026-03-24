"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type FormState = {
  error?: string;
};

export async function signUpAction(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient();

  // Recolección de datos
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;
  const career = formData.get("career") as string;
  const studentId = formData.get("student_id") as string;
  const semester = formData.get("semester") as string;
  const interests = formData.getAll("interests") as string[];
  const scheduleOptions = formData.getAll("schedule_options") as string[];

  // 1. Validación de seguridad en servidor
  const hasUpper = /[A-Z]/.test(password);
  const hasNum = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  
  if (password.length < 8 || !hasUpper || !hasNum || !hasSpecial) {
    return { error: "La contraseña no cumple con los requisitos de seguridad." };
  }

  // 2. Registro en Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, career: career },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) return { error: error.message };

  // 3. Verificar si el correo ya existe (identities vacías)
  if (data.user?.identities?.length === 0) {
    return { error: "Este correo electrónico ya está registrado." };
  }

  // 4. Inserción en tabla Profiles
  if (data.user) {
    const { error: profileError } = await supabase
      .from("profiles")
      .insert([{
        id: data.user.id,
        full_name: fullName,
        career: career,
        student_id: studentId,
        semester: semester,
        interests: interests,
        schedule_options: scheduleOptions,
      }]);
      
    if (profileError) return { error: "Error al crear el perfil en la base de datos." };
  }

  redirect("/auth/sign-up-success");
}