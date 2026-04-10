import { ForgotPasswordForm } from "@/components/forgot-password-form";
import Image from "next/image";
import Link from "next/link";
import LogoSS from "@/public/images/logo.png";

export default function Page() {
  return (
    <div className="min-h-screen bg-[#f7f3e7] font-gentium flex flex-col relative p-6 md:p-5">
      {/* Logo en la esquina superior izquierda */}
      <div className="w-full px-40 flex items-center justify-between bg-transparent">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image
            src={LogoSS}
            alt="SkillSwap Logo"
            className="rounded-full shadow-sm w-32"
          />
          <span className="text-xl font-bold text-[#114c5f] tracking-tight">SkillSwap</span>
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-md">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}