import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-5 text-center">
      <p className="text-7xl font-semibold tracking-[-0.03em] text-ink-3">404</p>
      <h1 className="mt-4 text-xl font-medium">Pagina non trovata · Page not found</h1>
      <Link href="/it" className="link mt-6">
        Home ›
      </Link>
    </main>
  );
}
