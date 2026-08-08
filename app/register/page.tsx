import Link from "next/link";

import AuthShell from "@/app/components/auth/AuthShell";
import RegistrationForm from "@/app/components/auth/RegistrationForm";

interface RegisterPageProps {
  searchParams: Promise<{
    error?: string;
  }>;
}

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const { error } = await searchParams;
  const initialMessage =
    error === "manager-profile"
      ? "Il profilo manager non è disponibile. Registra un nuovo account di prova."
      : undefined;

  return (
    <AuthShell
      eyebrow="Nuova carriera"
      title="Crea il tuo profilo manager"
      description="Questo è il primo passo. Subito dopo creerai nome, colori e stemma del tuo club."
    >
      <RegistrationForm
        initialMessage={initialMessage}
      />

      <p className="mt-6 text-center text-sm text-zinc-500">
        Hai già un account?{" "}
        <Link
          href="/login"
          className="font-bold text-amber-300 transition hover:text-amber-200"
        >
          Accedi
        </Link>
      </p>
    </AuthShell>
  );
}
