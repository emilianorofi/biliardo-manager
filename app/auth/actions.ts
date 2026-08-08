"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { AuthActionState } from "@/app/auth/action-state";
import {
  getManagerByAuthUserId,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const MANAGER_NAME_PATTERN = /^[\p{L}\p{N} .'-]+$/u;

export async function registerManager(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const managerName = normalizeManagerName(
    formData.get("managerName")
  );
  const email = normalizeEmail(formData.get("email"));
  const password = readText(formData.get("password"));
  const errors = validateRegistration({
    managerName,
    email,
    password,
  });

  if (Object.keys(errors).length > 0) {
    return {
      errors,
      message: "Controlla i dati inseriti.",
    };
  }

  try {
    const existingManagers = await prisma.$queryRaw<
      { id: string }[]
    >`
      SELECT "id"
      FROM "Manager"
      WHERE "normalizedName" = ${managerName.toLocaleLowerCase("it-IT")}
      LIMIT 1
    `;

    if (existingManagers.length > 0) {
      return {
        errors: {
          managerName: [
            "Questo nome manager è già utilizzato.",
          ],
        },
      };
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          manager_name: managerName,
        },
      },
    });

    if (error) {
      return mapRegistrationError(error);
    }

    if (!data.user) {
      return {
        message:
          "Non è stato possibile creare l'account.",
      };
    }

    if (!data.session) {
      return {
        success: true,
        message:
          "Account creato. Controlla la tua email per confermare la registrazione.",
      };
    }
  } catch (error: unknown) {
    console.error(
      "Errore durante la registrazione del manager:",
      error
    );

    return {
      message:
        error instanceof Error &&
        error.message.includes("Supabase Auth")
          ? error.message
          : "Registrazione temporaneamente non disponibile.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/onboarding");
}

export async function loginManager(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = normalizeEmail(formData.get("email"));
  const password = readText(formData.get("password"));
  const errors: AuthActionState["errors"] = {};

  if (!isValidEmail(email)) {
    errors.email = ["Inserisci un indirizzo email valido."];
  }

  if (!password) {
    errors.password = ["Inserisci la password."];
  }

  if (Object.keys(errors).length > 0) {
    return {
      errors,
      message: "Controlla i dati inseriti.",
    };
  }

  let destination = "/onboarding";

  try {
    const supabase = await createClient();
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error || !data.user) {
      return {
        message: "Email o password non corretti.",
      };
    }

    const manager = await getManagerByAuthUserId(
      data.user.id
    );

    if (!manager) {
      await supabase.auth.signOut();

      return {
        message:
          "Il profilo manager non è disponibile. Crea nuovamente l'account di prova.",
      };
    }

    if (manager.clubId !== null) {
      destination = "/team";
    }
  } catch (error: unknown) {
    console.error(
      "Errore durante l'accesso del manager:",
      error
    );

    return {
      message:
        error instanceof Error &&
        error.message.includes("Supabase Auth")
          ? error.message
          : "Accesso temporaneamente non disponibile.",
    };
  }

  revalidatePath("/", "layout");
  redirect(destination);
}

export async function logoutManager() {
  const supabase = await createClient();

  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

function validateRegistration(input: {
  managerName: string;
  email: string;
  password: string;
}) {
  const errors: NonNullable<
    AuthActionState["errors"]
  > = {};

  if (
    input.managerName.length < 3 ||
    input.managerName.length > 30
  ) {
    errors.managerName = [
      "Il nome manager deve avere da 3 a 30 caratteri.",
    ];
  } else if (
    !MANAGER_NAME_PATTERN.test(input.managerName)
  ) {
    errors.managerName = [
      "Usa soltanto lettere, numeri, spazi, punti, apostrofi o trattini.",
    ];
  }

  if (!isValidEmail(input.email)) {
    errors.email = ["Inserisci un indirizzo email valido."];
  }

  const passwordErrors: string[] = [];

  if (input.password.length < 8) {
    passwordErrors.push("Almeno 8 caratteri.");
  }

  if (!/[A-Za-z]/.test(input.password)) {
    passwordErrors.push("Almeno una lettera.");
  }

  if (!/[0-9]/.test(input.password)) {
    passwordErrors.push("Almeno un numero.");
  }

  if (passwordErrors.length > 0) {
    errors.password = passwordErrors;
  }

  return errors;
}

function normalizeManagerName(value: FormDataEntryValue | null) {
  return readText(value).replace(/\s+/g, " ").trim();
}

function normalizeEmail(value: FormDataEntryValue | null) {
  return readText(value).trim().toLowerCase();
}

function readText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function mapRegistrationError(error: {
  code?: string;
  message: string;
}): AuthActionState {
  if (
    error.code === "user_already_exists" ||
    error.code === "email_exists"
  ) {
    return {
      errors: {
        email: ["Esiste già un account con questa email."],
      },
    };
  }

  if (error.code === "weak_password") {
    return {
      errors: {
        password: [
          "La password non rispetta i requisiti di sicurezza.",
        ],
      },
    };
  }

  return {
    message:
      "Non è stato possibile creare l'account. Controlla i dati e riprova.",
  };
}
