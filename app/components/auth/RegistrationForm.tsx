"use client";

import { useActionState } from "react";

import { registerManager } from "@/app/auth/actions";
import type { AuthActionState } from "@/app/auth/action-state";
import AuthField from "@/app/components/auth/AuthField";
import AuthSubmitButton from "@/app/components/auth/AuthSubmitButton";

const INITIAL_STATE: AuthActionState = {};

export default function RegistrationForm({
  initialMessage,
}: {
  initialMessage?: string;
}) {
  const [state, action] = useActionState(
    registerManager,
    INITIAL_STATE
  );

  return (
    <form action={action} className="space-y-5">
      <AuthField
        id="managerName"
        name="managerName"
        type="text"
        label="Nome manager"
        placeholder="Come verrai chiamato nel gioco"
        autoComplete="nickname"
        minLength={3}
        maxLength={30}
        required
        errors={state.errors?.managerName}
      />

      <AuthField
        id="email"
        name="email"
        type="email"
        label="Email"
        placeholder="manager@email.it"
        autoComplete="email"
        required
        errors={state.errors?.email}
      />

      <AuthField
        id="password"
        name="password"
        type="password"
        label="Password"
        placeholder="Almeno 8 caratteri"
        autoComplete="new-password"
        minLength={8}
        required
        errors={state.errors?.password}
      />

      <p className="text-xs leading-5 text-zinc-500">
        La password deve contenere almeno 8 caratteri,
        una lettera e un numero.
      </p>

      {state.message && (
        <p
          className={`rounded-xl border px-4 py-3 text-sm ${
            state.success
              ? "border-emerald-500/25 bg-emerald-500/5 text-emerald-300"
              : "border-red-500/25 bg-red-500/5 text-red-300"
          }`}
        >
          {state.message}
        </p>
      )}

      {initialMessage && !state.message && (
        <p className="rounded-xl border border-red-500/25 bg-red-500/5 px-4 py-3 text-sm text-red-300">
          {initialMessage}
        </p>
      )}

      <AuthSubmitButton
        idleLabel="Crea il mio account"
        pendingLabel="Creazione..."
      />
    </form>
  );
}
