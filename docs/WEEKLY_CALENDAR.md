# Calendario settimanale definitivo

Questa specifica definisce il ciclo settimanale canonico di Biliardo Manager.
Tutti gli orari usano il fuso `Europe/Rome` e gli eventi avvengono
automaticamente: il manager non può anticiparli con pulsanti manuali.

## Calendario

| Giorno e ora | Evento automatico |
| --- | --- |
| Lunedì 12:00 | Aggiornamento settimanale completo di giocatori e club |
| Lunedì 12:05 | Pubblicazione della news riepilogativa settimanale |
| Martedì 21:00 | Nuovo candidato dell'Accademia e avanzamento dello scouting |
| Mercoledì | Nessun evento fisso; gestione di squadra e mercato |
| Giovedì | Nessun evento fisso; preparazione della formazione |
| Venerdì 21:00 | Giornata di campionato automatica |
| Sabato | Nessun evento fisso; preparazione ai tornei |
| Domenica 14:00 | Torneo individuale, Europeo o Mondiale |
| Sempre | Mercato, aste e svincolati |

## Aggiornamento del lunedì

Il lunedì alle 12:00 chiude la settimana sportiva precedente. L'elaborazione
avviene una sola volta e nel seguente ordine:

1. allenamento e crescita tecnica;
2. esperienza maturata in campionato e nei tornei;
3. calo delle caratteristiche dovuto all'età;
4. aggiornamento di forma e morale;
5. premi e incassi di campionato e tornei;
6. entrate settimanali, stipendi e costi di gestione;
7. calcolo e registrazione del saldo settimanale.

Alle 12:05 viene pubblicata una news con il riepilogo dell'aggiornamento.

Il programma di allenamento può essere modificato fino alle 11:59 del lunedì.

### Forma e morale

Forma e morale sono valori interi compresi tra 1 e 10 e vengono aggiornati
soltanto il lunedì alle 12:00.

La forma cambia in base alle tre prove di campionato disputate:

- due o tre vittorie: `+1`;
- una vittoria: nessuna variazione;
- zero vittorie: `-1`;
- nessuna prova disputata: si avvicina di un punto al valore normale `5`.

Il morale cambia in base al risultato della squadra:

- vittoria: `+1`;
- pareggio: nessuna variazione;
- sconfitta: `-1`;
- due settimane consecutive senza essere utilizzato: `-1`.

Gli effetti futuri dei tornei saranno calcolati in base al turno raggiunto.

Durante una prova, la prestazione del giocatore viene calcolata con la formula:

```text
prestazione = valore specialita
             + 0,75 * (forma - 5)
             + 0,50 * (morale - 5)
             + 0,025 * esperienza
```

Ogni punto di differenza nella prestazione modifica la probabilità di vittoria
di 1,5 punti percentuali, entro i limiti già previsti dal simulatore.

## Campionato

Tutte le partite della giornata vengono disputate automaticamente il venerdì
alle 21:00. La formazione A-B-C può essere modificata fino alle 20:59.
Risultati, cronaca e classifica vengono registrati e pubblicati subito dopo la
conclusione della giornata. Gli effetti sui giocatori confluiscono
nell'aggiornamento del lunedì successivo.

## Tornei individuali

I tornei individuali, gli Europei e i Mondiali iniziano automaticamente la
domenica alle 14:00. L'iscrizione o la scelta del giocatore termina alle 13:59.
Risultati e news vengono pubblicati subito; esperienza e allenamento vengono
applicati il lunedì successivo in base al turno raggiunto, non per singola
partita. Le formule dei premi per turno saranno definite separatamente.

## Accademia

Il martedì alle 21:00 arriva un nuovo candidato, se c'è posto, e avanza lo
scouting settimanale dei giovani già presenti.

## Mercato e news

Le aste durano 72 ore e si chiudono automaticamente. Un'offerta negli ultimi
tre minuti prolunga la scadenza di tre minuti. Acquisti, vendite, svincoli e
movimenti di denaro collegati al mercato vengono registrati immediatamente.

Le news seguono gli eventi:

- lunedì 12:05: riepilogo settimanale sportivo e finanziario;
- martedì dopo le 21:00: Accademia e scouting;
- venerdì dopo le 21:00: campionato, cronaca e classifica;
- domenica dopo le 14:00: percorso e risultati dei tornei;
- immediatamente: mercato e altri eventi straordinari.

## Garanzie del motore temporale

- Ogni evento viene elaborato al massimo una volta.
- Se il servizio non è disponibile all'orario previsto, gli eventi scaduti
  vengono recuperati automaticamente alla prima riattivazione.
- Il recupero conserva l'ordine cronologico degli eventi.
- Nessuna partita o sessione può essere anticipata manualmente.

## Stato di implementazione

Questo documento è la specifica definitiva. Il codice esistente deve essere
allineato a questo calendario tramite gli interventi successivi.
