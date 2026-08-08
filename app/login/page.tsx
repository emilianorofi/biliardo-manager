import Link from "next/link";

import AuthShell from "@/app/components/auth/AuthShell";
import LoginForm from "@/app/components/auth/LoginForm";

interface LoginPageProps {
  searchParams: Promise<{
    error?: string;
  }>;
}

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const { error } = await searchParams;
  const initialMessage =
    error === "confirmation"
      ? "Il collegamento di conferma non è valido o è scaduto."
      : undefined;

  return (
    <AuthShell
      eyebrow="Bentornato"
      title="Accedi alla tua carriera"
      description="Riprendi il controllo del club e continua la tua scalata."
    >
      <LoginForm initialMessage={initialMessage} />

      <p className="mt-6 text-center text-sm text-zinc-500">
        Non hai ancora un account?{" "}
        <Link
          href="/register"
          className="font-bold text-amber-300 transition hover:text-amber-200"
        >
          Inizia una nuova carriera
        </Link>
      </p>
    </AuthShell>
  );
}
