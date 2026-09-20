# Accademia

## Ingresso dei giovani

- Ogni martedì alle 21:00 (fuso `Europe/Rome`) arriva un candidato.
- L'età di ingresso è casuale tra 14 e 16 anni.
- L'Accademia contiene al massimo 10 giovani.
- Se al momento dell'ingresso i 10 posti sono occupati, la candidatura viene
  persa e il controllo riparte dalla settimana successiva.

La prossima scadenza è salvata in `Club.nextAcademyCandidateAt`. Il motore
temporale la elabora automaticamente e recupera in ordine anche eventuali
scadenze trascorse.

## Scouting

Un nuovo candidato entra con **3 caratteristiche stimate** e nessun valore
tecnico ancora rivelato.

A ogni scadenza settimanale:

1. finché non sono disponibili tutte le 9 stime, viene aggiunta una nuova
   caratteristica stimata;
2. quando tutte le 9 caratteristiche sono stimate, a ogni scadenza successiva
   una stima viene sostituita dal valore reale.

Il percorso completo richiede 15 scadenze settimanali:

- 6 settimane per passare da 3 a 9 caratteristiche stimate;
- 9 settimane per rivelare tutti i valori reali;
- 105 giorni complessivi dall'ingresso.

Il Responsabile giovani non cambia il numero di candidati né la velocità dello
scouting: migliora la precisione dell'intervallo mostrato per le stime.

## Decisione ed età

- Dai 16 anni il giovane può essere promosso in prima squadra.
- A 17 anni inizia la fase di decisione: il manager può promuoverlo oppure
  usare **Allontana**.
- L'età avanza quotidianamente tramite il game clock con il formato anni+giorni:
  da 0 a 104 giorni, poi scatta l'anno successivo.
- Chi raggiunge 18e0 senza essere stato promosso viene allontanato
  automaticamente dall'Accademia e genera un evento per il club.
