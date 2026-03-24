import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-[#114c5f] py-4 mt-auto">
      <div className="flex justify-center items-center gap-x-12">
        <Link 
          href="/ayuda" 
          className="text-white text-lg font-medium hover:opacity-80 underline underline-offset-8 decoration-1"
        >
          Sección de ayuda
        </Link>
        <Link 
          href="/reporte" 
          className="text-white text-lg font-medium hover:opacity-80 underline underline-offset-8 decoration-1"
        >
          Reporte de usuarios
        </Link>
        <Link 
          href="/reglas" 
          className="text-white text-lg font-medium hover:opacity-80 underline underline-offset-8 decoration-1"
        >
          Reglas de la comunidad
        </Link>
      </div>
    </footer>
  );
}