import Link from "next/link";
import Image from "next/image";
import logoImage from "@/public/images/logo.png"; // Asegúrate de que la ruta sea correcta

export default function Header() {
  return (
    <header className="w-full px-40 py-4 flex items-center justify-between bg-transparent">
      {/* Logo SkillSwap */}
      <Link href="/" className="flex items-center gap-2">
        <Image 
          src={logoImage} 
          alt="SkillSwap Logo" 
          className="w-28"
        />
        <span className="text-2xl font-bold text-[#114c5f]">SkillSwap</span>
      </Link>

      {/* Botón Registrarse */}
      <Link 
        href="/auth/sign-up" 
        className="bg-[#4a7c92] hover:bg-[#3d6678] text-white px-6 py-2 rounded-lg font-medium text-lg transition-colors shadow-sm"
      >
        Registrarse
      </Link>
    </header>
  );
}