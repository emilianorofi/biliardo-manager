"use client";

import { useActionState, useState } from "react";

import type { ClubOnboardingActionState } from "@/app/onboarding/action-state";
import { createManagerClub } from "@/app/onboarding/actions";
import AuthSubmitButton from "@/app/components/auth/AuthSubmitButton";
import ClubCrest from "@/app/components/onboarding/ClubCrest";
import {
  CLUB_CITY_MAX_LENGTH,
  CLUB_CITY_MIN_LENGTH,
  CLUB_CREST_STYLES,
  CLUB_NAME_MAX_LENGTH,
  CLUB_NAME_MIN_LENGTH,
  type ClubCrestStyle,
} from "@/lib/onboarding/club-rules";

const INITIAL_STATE: ClubOnboardingActionState = {};

const CREST_LABELS: Record<ClubCrestStyle, string> = {
  CLASSIC: "Scudo",
  DIAMOND: "Diamante",
  CROWN: "Corona",
  STAR: "Stella",
  PINS: "Bersaglio",
};

export default function ClubIdentityForm() {
  const [state, action] = useActionState(
    createManagerClub,
    INITIAL_STATE
  );
  const [primaryColor, setPrimaryColor] =
    useState("#065F46");
  const [secondaryColor, setSecondaryColor] =
    useState("#FBBF24");
  const [crestStyle, setCrestStyle] =
    useState<ClubCrestStyle>("CLASSIC");

  return (
    <form action={action} className="space-y-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id="clubName"
          name="clubName"
          label="Nome del club"
          placeholder="Biliardo Club Pontedera"
          minLength={CLUB_NAME_MIN_LENGTH}
          maxLength={CLUB_NAME_MAX_LENGTH}
          errors={state.errors?.clubName}
        />
        <TextField
          id="city"
          name="city"
          label="Città"
          placeholder="Pontedera"
          minLength={CLUB_CITY_MIN_LENGTH}
          maxLength={CLUB_CITY_MAX_LENGTH}
          errors={state.errors?.city}
        />
      </div>

      <fieldset>
        <legend className="text-sm font-black text-zinc-200">
          Colori sociali
        </legend>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <ColorField
            id="primaryColor"
            label="Colore principale"
            value={primaryColor}
            onChange={setPrimaryColor}
            errors={state.errors?.primaryColor}
          />
          <ColorField
            id="secondaryColor"
            label="Colore secondario"
            value={secondaryColor}
            onChange={setSecondaryColor}
            errors={state.errors?.secondaryColor}
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-black text-zinc-200">
          Stemma
        </legend>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {CLUB_CREST_STYLES.map((style) => (
            <label
              key={style}
              className={`cursor-pointer rounded-2xl border p-3 text-center transition ${
                crestStyle === style
                  ? "border-amber-400/70 bg-amber-400/10"
                  : "border-white/10 bg-black/20 hover:border-white/20"
              }`}
            >
              <input
                type="radio"
                name="crestStyle"
                value={style}
                checked={crestStyle === style}
                onChange={() => setCrestStyle(style)}
                className="sr-only"
              />
              <ClubCrest
                style={style}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                size="small"
              />
              <span className="mt-2 block text-xs font-bold text-zinc-300">
                {CREST_LABELS[style]}
              </span>
            </label>
          ))}
        </div>
        <FieldErrors errors={state.errors?.crestStyle} />
      </fieldset>

      <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
        <ClubCrest
          style={crestStyle}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          size="large"
        />
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-400">
            Anteprima
          </p>
          <p className="mt-1 font-bold text-white">
            La tua nuova identità
          </p>
          <p className="mt-1 text-sm leading-5 text-zinc-500">
            Potremo ampliare e perfezionare gli stemmi più
            avanti.
          </p>
        </div>
      </div>

      {state.message ? (
        <p className="rounded-xl border border-red-500/25 bg-red-500/5 px-4 py-3 text-sm text-red-300">
          {state.message}
        </p>
      ) : null}

      <AuthSubmitButton
        idleLabel="Fonda il mio club"
        pendingLabel="Creazione del club..."
      />

      <p className="text-center text-xs leading-5 text-zinc-500">
        Confermando prenderai il posto di una squadra
        dell&apos;ultima serie. La scelta non potrà essere ripetuta
        con questo account.
      </p>
    </form>
  );
}

function TextField({
  id,
  name,
  label,
  placeholder,
  minLength,
  maxLength,
  errors,
}: {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  minLength: number;
  maxLength: number;
  errors?: string[];
}) {
  const errorId = errors?.length
    ? `${id}-error`
    : undefined;

  return (
    <label className="block" htmlFor={id}>
      <span className="text-sm font-black text-zinc-200">
        {label}
      </span>
      <input
        id={id}
        name={name}
        type="text"
        placeholder={placeholder}
        minLength={minLength}
        maxLength={maxLength}
        required
        aria-describedby={errorId}
        aria-invalid={Boolean(errors?.length)}
        className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b0b0b] px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-400/60"
      />
      <FieldErrors id={errorId} errors={errors} />
    </label>
  );
}

function ColorField({
  id,
  label,
  value,
  onChange,
  errors,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  errors?: string[];
}) {
  return (
    <label
      htmlFor={id}
      className="rounded-2xl border border-white/10 bg-black/20 p-4"
    >
      <span className="text-xs font-black uppercase tracking-wider text-zinc-500">
        {label}
      </span>
      <span className="mt-3 flex items-center gap-3">
        <input
          id={id}
          name={id}
          type="color"
          value={value}
          onChange={(event) =>
            onChange(event.target.value.toLocaleUpperCase())
          }
          className="h-11 w-14 cursor-pointer rounded-lg border-0 bg-transparent p-0"
        />
        <span className="font-mono text-sm font-bold text-white">
          {value}
        </span>
      </span>
      <FieldErrors errors={errors} />
    </label>
  );
}

function FieldErrors({
  id,
  errors,
}: {
  id?: string;
  errors?: string[];
}) {
  if (!errors?.length) {
    return null;
  }

  return (
    <span
      id={id}
      className="mt-2 block text-sm text-red-400"
    >
      {errors.join(" ")}
    </span>
  );
}
