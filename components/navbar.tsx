import Link from "next/link";
import Image from "next/image";
import LogoSS from "@/public/images/logo.png"
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();

export default function Navbar(){

{/* --- Navbar --- */}
      <nav className="flex items-center justify-between px-12 py-4 bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-[#9cd2d3]/20">
        <div className="flex items-center gap-2">
          {/* Logo Placeholder */}
          <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
            <Image
              src={LogoSS}
              alt="SkillSwap"
              className="rounded-full shadow-sm w-40 mr-3"
            />

            <span className="text-xl font-bold tracking-tight">SkillSwap</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-8">
          {!user ? (
            /* --- MOSTRAR SI NO HAY SESIÓN --- */
            <>
              <Link 
                href="/auth/login" 
                className="text-lg font-semibold hover:text-[#0799b6] transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Button asChild className="bg-[#3983A6] hover:bg-[#4aaad7] text-white px-8 h-10 rounded-md font-bold text-lg transition-all">
                <Link href="/auth/sign-up">Registrarse</Link>
              </Button>
            </>
          ) : (
            /* --- MOSTRAR SI YA HAY SESIÓN --- */
            <Button asChild className="bg-[#114c5f] hover:bg-[#0799b6] text-white px-8 h-10 rounded-md font-bold text-lg shadow-lg transition-all">
              <Link href="/protected">Ir a mi Dashboard</Link>
            </Button>
          )}
        </div>
      </nav>

}