import Link from "next/link";

interface AuthCardProps {
  titulo: string;
  subtitulo: string;
  children: React.ReactNode;
  rodape: React.ReactNode;
}

export default function AuthCard({
  titulo,
  subtitulo,
  children,
  rodape,
}: AuthCardProps) {
  return (
    <div className="w-full max-w-md mx-auto mt-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6 [&_input]:text-black [&_input]:bg-white [&_input]:placeholder:text-gray-400">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">{titulo}</h1>
          <p className="text-gray-600 text-sm">{subtitulo}</p>
        </div>
        {children}
        <div className="text-center text-sm text-gray-600">{rodape}</div>
      </div>
      <p className="text-center mt-6">
        <Link href="/" className="text-sm text-gray-500 hover:text-blue-600">
          ← Voltar ao início
        </Link>
      </p>
    </div>
  );
}
