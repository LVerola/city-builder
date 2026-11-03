import Link from "next/link";

export function MenuInicial() {
  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center bg-stone-100 px-6 py-16 text-stone-900">
      <h1 className="text-4xl font-semibold tracking-tight">City Builder</h1>
      <p className="mt-3 max-w-md text-center text-lg text-stone-700">
        Construa sua cidade no navegador. Sem conta e sem servidor.
      </p>
      <Link
        href="/jogo"
        className="mt-10 inline-flex h-12 items-center justify-center rounded-lg bg-stone-900 px-8 text-base font-semibold text-stone-50 hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
      >
        Jogar
      </Link>
    </main>
  );
}
