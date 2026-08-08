"use client";

import { useFormStatus } from "react-dom";

interface AuthSubmitButtonProps {
  idleLabel: string;
  pendingLabel: string;
}

export default function AuthSubmitButton({
  idleLabel,
  pendingLabel,
}: AuthSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-gradient-to-r from-[#b8941f] via-[#d4af37] to-[#c9a227] px-5 py-3.5 font-black text-[#0a0a0a] transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
