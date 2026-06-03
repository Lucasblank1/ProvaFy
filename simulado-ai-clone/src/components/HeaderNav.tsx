"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { History, LogIn, LogOut, UserPlus } from "lucide-react";

export default function HeaderNav() {
  const { data: session, status } = useSession();
  const carregando = status === "loading";

  return (
    <nav className="flex items-center gap-4 text-sm font-medium">
      {carregando ? (
        <span className="text-gray-400">...</span>
      ) : session?.user ? (
        <>
          <Link
            href="/historico"
            className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <History className="w-4 h-4" />
            Histórico
          </Link>
          <span className="text-gray-400 hidden sm:inline">
            {session.user.email}
          </span>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-1.5 text-gray-600 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </>
      ) : (
        <>
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Cadastrar
          </Link>
        </>
      )}
    </nav>
  );
}
