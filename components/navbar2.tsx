import Link from "next/link";
import Image from "next/image";
import LogoSS from "@/public/images/logo.png"
import { LogoutButton } from "@/components/logout-button";

export default function Navbar2(){

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
          <LogoutButton />
        </div>
      </nav>

}