# Chiusura automatica delle aste

La chiusura automatica usa Supabase Cron per chiamare ogni minuto l'endpoint
`GET /api/cron/market-settlement` della produzione Vercel.

L'endpoint richiede l'header:

```text
Authorization: Bearer <CRON_SECRET>
```

La stessa chiave deve essere salvata:

- in Vercel, come variabile di ambiente `CRON_SECRET` per Production;
- in Supabase Vault, con il nome `market_settlement_secret`.

L'URL pubblico della produzione deve essere salvato in Supabase Vault con il
nome `market_settlement_url`, senza barra finale.

## Configurazione Supabase

Abilitare i moduli Supabase Cron (`pg_cron`) e `pg_net`, poi creare i due
segreti nel Vault:

```sql
select vault.create_secret(
  'https://URL-PRODUZIONE-VERCEL',
  'market_settlement_url'
);

select vault.create_secret(
  'CHIAVE-SEGRETA-UGUALE-A-QUELLA-DI-VERCEL',
  'market_settlement_secret'
);
```

Infine creare il controllo automatico:

```sql
select cron.schedule(
  'settle-market-auctions-every-minute',
  '* * * * *',
  $$
  select net.http_get(
    url := (
      select decrypted_secret
      from vault.decrypted_secrets
      where name = 'market_settlement_url'
    ) || '/api/cron/market-settlement',
    headers := jsonb_build_object(
      'Authorization',
      'Bearer ' || (
        select decrypted_secret
        from vault.decrypted_secrets
        where name = 'market_settlement_secret'
      )
    ),
    timeout_milliseconds := 10000
  ) as request_id;
  $$
);
```

Il processo è idempotente: le aste già concluse non vengono elaborate una
seconda volta. La chiusura manuale dalla pagina Mercato resta disponibile come
controllo aggiuntivo.
