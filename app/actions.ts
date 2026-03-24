"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signUpAction(formData: FormData) {
  const supabase = await createClient();

  // Recolección de datos del formulario
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;
  const career = formData.get("career") as string;
  const studentId = formData.get("student_id") as string;
  const semester = formData.get("semester") as string;
  const interests = formData.getAll("interests") as string[];
  const scheduleOptions = formData.getAll("schedule_options") as string[];

  // 1. Validación de Fuerza (Lógica de servidor)
  const hasUpper = /[A-Z]/.test(password);
  const hasNum = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  
  if (password.length < 8 || !hasUpper || !hasNum || !hasSpecial) {
    return redirect(`/auth/sign-up?error=${encodeURIComponent("La contraseña no cumple con los requisitos.")}`);
  }

  // 2. Registro en el esquema AUTH (auth.users)
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Guardamos metadatos básicos en auth.users para facilitar el acceso rápido
      data: { 
        full_name: fullName, 
        career: career 
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    return redirect(`/auth/sign-up?error=${encodeURIComponent(error.message)}`);
  }

  // 3. DETECCIÓN DE USUARIO EXISTENTE
  // Si Supabase no devuelve identidades, el usuario ya existía.
  // Esto evita la redirección falsa al "éxito".
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return redirect(`/auth/sign-up?error=${encodeURIComponent("Este correo electrónico ya está registrado.")}`);
  }

  // 4. Inserción en el esquema PUBLIC (public.profiles)
  // Solo llegamos aquí si el usuario es realmente nuevo
  if (data.user) {
    const { error: profileError } = await supabase
      .from("profiles")
      .insert([{
        id: data.user.id, // Referencia al ID de auth.users (FK)
        full_name: fullName,
        career: career,
        student_id: studentId,
        semester: semester,
        interests: interests,
        schedule_options: scheduleOptions,
      }]);
      
    if (profileError) {
      console.error("Error en public.profiles:", profileError.message);
      // Opcional: Podrías manejar aquí un borrado del auth.user si el perfil falla
      return redirect(`/auth/sign-up?error=${encodeURIComponent("Error al crear el perfil adicional.")}`);
    }
  }

  return redirect("/auth/sign-up-success");
}