"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, CircleUser } from "lucide-react";
import { LogoutButton2 } from "@/components/logout_button2";

type UserDropdownMenuProps = {
  avatarUrl?: string;
  firstName: string;
};

export function UserDropdownMenu({
  avatarUrl,
  firstName,
}: UserDropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleMenuItemClick = () => {
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 cursor-pointer active:scale-105 transition-transform hover:opacity-80"
      >
        <div className="w-16 h-16 rounded-full overflow-hidden">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              width={112}
              height={112}
              alt="Avatar"
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#dce7f4] text-[#134f78] text-xl font-bold">
              {firstName?.slice(0, 1) ?? "U"}
            </div>
          )}
        </div>
        <div>{firstName ?? "User"}</div>
        <div
          className={`-ml-2 transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`}
        >
          <ChevronRight />
        </div>
      </button>

      {isOpen && (
        <ul
          className="absolute top-[calc(100%+0.5rem)] bg-white/95 border border-gray-200 rounded-2xl p-2 right-0 w-64 
          shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <li className="hover:bg-gray-100/80 transition-colors rounded-lg">
            <Link
              href="/protected/profile/"
              onClick={handleMenuItemClick}
              className="flex gap-3 p-3 items-center text-[#114c5f] font-medium"
            >
              <CircleUser />
              <p>Perfil De Usuario</p>
            </Link>
          </li>
          <li className="border-t border-gray-200 mt-2 pt-2 hover:bg-gray-100/80 transition-colors rounded-lg">
            <div onClick={handleMenuItemClick}>
              <LogoutButton2 />
            </div>
          </li>
        </ul>
      )}
    </div>
  );
}
