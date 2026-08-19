# Invecchiamento e ritiro

La chiusura della stagione è collegata alla registrazione dell'ultima partita.
Una stagione viene conclusa soltanto quando tutti i suoi campionati risultano
`COMPLETED`.

L'operazione è protetta dallo stato della stagione e dal lock della sua riga:
anche in presenza di richieste concorrenti, età e ritiri vengono elaborati una
sola volta.

## Ordine delle operazioni

1. Ogni giocatore di prima squadra con carriera `ACTIVE`, compresi gli
   svincolati, compie un anno.
2. La probabilità di ritiro viene calcolata sulla nuova età.
3. I giocatori estratti vengono marcati `RETIRED`, rimossi dalla rosa e dalla
   formazione, e le loro inserzioni di mercato ancora aperte vengono annullate.
4. Lo storico di partite e trasferimenti rimane collegato al giocatore.
5. La stagione passa a `COMPLETED`.

## Probabilità

| Età dopo il compleanno | Probabilità di ritiro |
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

Il ciclo anagrafico dell'accademia e la crescita o il calo delle caratteristiche
sono interventi separati.
