# Calendario settimanale definitivo

Questa specifica definisce il ciclo stagionale canonico di Biliardo Manager.
Tutti gli orari usano il fuso `Europe/Rome` e gli eventi sono automatici:
il manager non può anticiparli con pulsanti manuali.

La stagione dura **15 settimane**. Le prime 14 contengono una giornata di
campionato il venerdì; la settimana 15 è riservata alla chiusura stagionale e
al Campionato Mondiale individuale.

## Eventi fissi settimanali

| Giorno e ora | Evento automatico |
| --- | --- |
| Lunedì 12:00 | Aggiornamento settimanale completo di giocatori e club |
| Lunedì 12:05 | Pubblicazione della news riepilogativa settimanale |
| Martedì 21:00 | Nuovo candidato dell'Accademia e avanzamento dello scouting |
| Mercoledì | Nessun evento fisso; gestione di squadra e mercato |
| Giovedì | Nessun evento fisso; preparazione della formazione |
| Venerdì 21:00 | Giornata di campionato automatica, nelle settimane 1-14 |
| Sempre | Mercato, aste, svincolati e game clock |

## Competizioni del fine settimana

Ogni settimana ha una competizione principale nel weekend.

| Settimana | Competizione |
| ---: | --- |
| 1 | Torneo Italiana · 1ª prova |
| 2 | Torneo Goriziana · 1ª prova |
| 3 | Torneo Tutti Doppi · 1ª prova |
| 4 | Torneo Italiana · 2ª prova |
| 5 | Torneo Goriziana · 2ª prova |
| 6 | Torneo Tutti Doppi · 2ª prova |
| 7 | Coppa delle Nazioni |
| 8 | Torneo Italiana · 3ª prova |
| 9 | Torneo Goriziana · 3ª prova |
| 10 | Torneo Tutti Doppi · 3ª prova |
| 11 | Torneo Italiana · 4ª prova |
| 12 | Torneo Goriziana · 4ª prova |
| 13 | Torneo Tutti Doppi · 4ª prova |
| 14 | Coppa Specialità |
| 15 | Campionato Mondiale |

Non è previsto un Europeo.

## Tornei individuali di specialità e Mondiale

Per i dodici tornei individuali di specialità e per il Mondiale:

| Giorno e ora | Fase |
| --- | --- |
| Sabato 10:00 | Sorteggio |
| Sabato 14:00 | 128esimi |
| Sabato 16:00 | 64esimi |
| Sabato 18:00 | 32esimi |
| Sabato 20:00 | 16esimi |
| Domenica 10:00 | Ottavi |
| Domenica 12:00 | Quarti |
| Domenica 14:00 | Semifinali |
| Domenica 16:00 | Finale e premiazione |

Il sabato alle 10:00 vengono selezionati automaticamente i primi 256 giocatori
per overall e viene sorteggiato una sola volta l'intero tabellone. Non esistono
teste di serie o protezioni per club e nazionalità. Il manager non deve
iscrivere alcun giocatore.

Ogni confronto dei tornei di specialità è al meglio delle tre prove della stessa
specialità. Il Mondiale utilizza le tre specialità: se dopo le prime due prove
il risultato è 1-1 viene disputata la specialità rimasta.

## Coppa delle Nazioni

La settimana 7 è riservata alla Coppa delle Nazioni.

| Giorno e ora | Fase |
| --- | --- |
| Sabato 09:00 | Sorteggio |
| Sabato 10:00 | 1ª giornata gironi |
| Sabato 14:00 | 2ª giornata gironi |
| Sabato 18:00 | 3ª giornata gironi |
| Domenica 10:00 | Quarti |
| Domenica 14:00 | Semifinali |
| Domenica 18:00 | Finale |

La competizione coinvolge 16 nazioni e tre giocatori per nazionale, selezionati
secondo il ranking previsto dal motore.

## Coppa Specialità

La settimana 14 è riservata alla Coppa Specialità. Tutti i giocatori attivi con
club vengono assegnati a una delle tre coppe in base alla loro specialità
migliore:

- Coppa Italiana;
- Coppa Goriziana;
- Coppa Tutti Doppi.

Il sorteggio avviene il sabato alle 10:00. I turni successivi sono gestiti dal
game clock fino alla conclusione della domenica. Le dimensioni dei tre
tabelloni dipendono dal numero di giocatori assegnati a ciascuna specialità e
possono quindi prevedere bye.

## Aggiornamento del lunedì

Il lunedì alle 12:00 chiude la settimana sportiva precedente. L'elaborazione
avviene una sola volta e nel seguente ordine:

1. allenamento e crescita tecnica;
2. esperienza maturata in campionato e nelle competizioni;
3. decadimento tecnico dovuto all'età;
4. aggiornamento di forma e morale;
5. premi e incassi maturati;
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

Durante una prova, la prestazione del giocatore viene calcolata con la formula:

```text
prestazione = valore specialita
             + 0,75 * (forma - 5)
             + 0,50 * (morale - 5)
             + 0,025 * esperienza
```

Ogni punto di differenza nella prestazione modifica la probabilità di vittoria
di 1,5 punti percentuali, entro i limiti previsti dal simulatore.

## Campionato

Tutte le partite della giornata vengono disputate automaticamente il venerdì
alle 21:00 nelle settimane 1-14. La formazione A-B-C può essere modificata fino
alle 20:59. Risultati, cronaca e classifica vengono registrati subito dopo la
conclusione della giornata.

## Accademia

Il martedì alle 21:00 arriva un nuovo candidato, se c'è posto, e avanza lo
scouting settimanale dei giovani già presenti.

## Mercato e news

Le aste durano 72 ore e si chiudono automaticamente. Un'offerta negli ultimi
tre minuti prolunga la scadenza di tre minuti. Acquisti, vendite, svincoli e
movimenti di denaro collegati al mercato vengono registrati immediatamente.

Le news seguono gli eventi principali del game clock.

## Chiusura e nuova stagione

La settimana 15 non contiene una giornata di campionato. Il Mondiale termina
la domenica alle 16:00.

La stagione resta attiva fino a domenica 23:59:59. Dal lunedì alle **00:01** il
motore può completarla soltanto se risultano concluse tutte le competizioni
obbligatorie:

- tutti i 15 campionati della piramide;
- tutti i 12 tornei individuali di specialità;
- il Mondiale;
- la Coppa delle Nazioni;
- la Coppa Specialità.

Alla chiusura vengono elaborati i ritiri di fine stagione. L'età non aumenta in
questo passaggio, perché avanza già quotidianamente tramite il game clock.

Completata la stagione, vengono applicate promozioni e retrocessioni, creati i
nuovi gironi e il nuovo calendario e ricalcolati gli stipendi dei giocatori
attivi sotto contratto.

## Garanzie del motore temporale

- Ogni evento viene elaborato al massimo una volta.
- Se il servizio non è disponibile all'orario previsto, gli eventi scaduti
  vengono recuperati automaticamente alla prima riattivazione.
- Il recupero conserva l'ordine cronologico degli eventi.
- Nessuna partita o sessione può essere anticipata manualmente.

## Stato di implementazione

Questa specifica è allineata al game clock, al calendario stagionale e ai test
di audit presenti nel branch `cleanup/stabilizzazione`.
