import type { InputHTMLAttributes } from "react";

interface AuthFieldProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  errors?: string[];
}

export default function AuthField({
  label,
  errors,
  id,
  ...inputProps
}: AuthFieldProps) {
  const errorId = errors?.length
    ? `${id}-error`
    : undefined;

  return (
    <label className="block" htmlFor={id}>
      <span className="text-sm font-bold text-zinc-200">
        {label}
      </span>
      <input
        {...inputProps}
        id={id}
        aria-describedby={errorId}
        aria-invalid={Boolean(errors?.length)}
        className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b0b0b] px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-400/60 disabled:cursor-not-allowed disabled:opacity-60"
      />
      {errors?.length ? (
        <span
          id={errorId}
          className="mt-2 block text-sm text-red-400"
        >
          {errors.join(" ")}
        </span>
      ) : null}
    </label>
  );
}
