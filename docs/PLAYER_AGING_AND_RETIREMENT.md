# Invecchiamento e ritiro

L'età dei giocatori avanza **ogni giorno di calendario di gioco** tramite il
game clock. Un anno di età corrisponde a 105 giorni ed è rappresentato come
`anni + giorni`, con `ageDays` compreso tra 0 e 104.

Il controllo di fine stagione non aggiunge più un anno ai giocatori: serve
soltanto a valutare gli eventuali ritiri usando l'età già raggiunta in quel
momento.

## Avanzamento quotidiano

Il game clock conserva l'ultima data elaborata nel fuso `Europe/Rome`.
Quando viene eseguito:

1. calcola quanti giorni di calendario sono trascorsi;
2. incrementa `ageDays` per tutti i giocatori attivi e per i giovani
   dell'Accademia;
3. ogni 105 giorni converte automaticamente i giorni accumulati in un anno;
4. rimuove dall'Accademia i giovani che raggiungono 18e0 senza essere stati
   promossi, registrando l'evento per il club.

L'operazione usa un lock dedicato ed è idempotente: più esecuzioni nella stessa
giornata non fanno invecchiare due volte i giocatori.

## Ritiro a fine stagione

La stagione viene chiusa soltanto dopo il termine della settimana 15 e dopo la
conclusione di tutte le competizioni obbligatorie.

Alla chiusura:

1. vengono considerati tutti i giocatori con carriera `ACTIVE`, compresi gli
   svincolati;
2. la probabilità di ritiro viene calcolata sull'età corrente, senza modificarla;
3. i ritiri estratti vengono limitati, quando necessario, per non lasciare un
   club con meno di tre giocatori attivi;
4. i giocatori che si ritirano vengono marcati `RETIRED`, rimossi da rosa e
   formazione e le loro inserzioni di mercato ancora aperte vengono annullate;
5. storico di partite e trasferimenti rimane collegato al giocatore;
6. la stagione passa a `COMPLETED`.

## Probabilità

| Età corrente | Probabilità di ritiro |
| --- | ---: |
| Fino a 49 | 0% |
| 50–55 | 2% |
| 56–60 | 3% |
| 61–65 | 5% |
| 66–70 | 10% |
| 71–75 | 20% |
| 76–80 | 40% |
| 81–85 | 70% |
| 86–90 | 90% |
| Da 91 in poi | 95% |

Crescita e decadimento delle caratteristiche tecniche restano processi distinti
dall'avanzamento anagrafico.
