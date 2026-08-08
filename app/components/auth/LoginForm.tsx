"use client";

import { useActionState } from "react";

import { loginManager } from "@/app/auth/actions";
import type { AuthActionState } from "@/app/auth/action-state";
import AuthField from "@/app/components/auth/AuthField";
import AuthSubmitButton from "@/app/components/auth/AuthSubmitButton";

const INITIAL_STATE: AuthActionState = {};

export default function LoginForm({
  initialMessage,
}: {
  initialMessage?: string;
}) {
  const [state, action] = useActionState(
    loginManager,
    INITIAL_STATE
  );

  return (
    <form action={action} className="space-y-5">
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
        placeholder="La tua password"
        autoComplete="current-password"
        required
        errors={state.errors?.password}
      />

      {(state.message || initialMessage) && (
        <p className="rounded-xl border border-red-500/25 bg-red-500/5 px-4 py-3 text-sm text-red-300">
          {state.message ?? initialMessage}
        </p>
      )}

      <AuthSubmitButton
        idleLabel="Entra nel club"
        pendingLabel="Accesso..."
      />
    </form>
  );
}
