# Configurazione account manager

L'autenticazione usa Supabase Auth con sessioni SSR conservate nei cookie.
Durante lo sviluppo, le pagine del club dimostrativo restano accessibili anche
senza account. Saranno protette quando il flusso di creazione del club sarà
completo.

## Variabili locali

Recuperare Project URL e Publishable key dal pannello Connect di Supabase e
aggiungere a `.env`:

```text
NEXT_PUBLIC_SUPABASE_URL=https://ID-PROGETTO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Le stesse variabili dovranno essere aggiunte in Vercel per Preview e
Production.

## Registrazione durante i test

In Supabase aprire Authentication, Providers, Email e disattivare
temporaneamente `Confirm email`. In questo modo l'account di prova ottiene
subito una sessione e viene indirizzato a `/onboarding`.

Prima del lancio definitivo, la conferma email dovrà essere riattivata e il
template `Confirm signup` configurato per indirizzare a:

```text
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
```

## Profilo manager

La migrazione `20260808150000_add_manager_accounts` crea il profilo applicativo
in modo automatico quando Supabase registra un nuovo utente. Il nome manager è
univoco senza distinzione tra maiuscole e minuscole e ogni ricompensa futura
sarà collegata a questo profilo.
