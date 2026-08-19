# Percorso individuale dei giocatori

Questo documento definisce la base stabile dello storico carriera. Le statistiche aggregate non vengono salvate direttamente sul giocatore: vengono calcolate a partire dalle presenze e dalle singole prove registrate. In questo modo i totali non possono divergere dai risultati reali.

## Presenza nella giornata

Per ogni giocatore schierato viene creata una sola `PlayerFixtureAppearance` per giornata. La presenza conserva:

- partita, data e giornata attraverso `LeagueFixture`;
- giocatore e club correnti, con relazioni che possono diventare nulle senza cancellare lo storico;
- nome, nazionalità ed età del giocatore al momento della partita;
- nome del club e dell'avversario al momento della partita;
- casa o trasferta;
- posizione A, B o C;
- risultato complessivo della squadra;
- overall, forma, morale ed esperienza prima della partita;
- prestazione media ottenuta nelle tre prove.

I dati testuali sono fotografie storiche. Se il giocatore cambia squadra o il club modifica nome, la partita continua a mostrare le informazioni corrette di quel momento.

## Singola prova

Ogni incontro di campionato contiene sei `LeagueFixtureGame`. Per ciascuna prova vengono conservati:

- ordine da 1 a 6;
- specialità;
- singolo o coppia;
- punteggio obiettivo;
- squadra vincitrice;
- prestazione delle due squadre;
- probabilità di vittoria;
- valore casuale utilizzato dalla simulazione.

## Prestazione del giocatore

Ogni partecipante alla prova riceve una `PlayerGamePerformance` collegata sia alla prova sia alla propria presenza nella giornata. Vengono registrati:

- vittoria o sconfitta;
- overall della specialità;
- prestazione effettiva;
- modificatori di forma, morale ed esperienza.

Una vittoria in coppia vale una vittoria intera per entrambi i giocatori. Una presenza di giornata conta invece una sola volta, anche se il giocatore disputa tre prove.

## Statistiche calcolabili

Questa struttura permette di ottenere senza duplicare dati:

- presenze complessive e per stagione;
- prove giocate, vinte e perse;
- percentuale di vittorie;
- rendimento per specialità;
- rendimento nei singoli e nelle coppie;
- utilizzi e risultati negli slot A, B e C;
- rendimento con diversi compagni;
- andamento stagionale;
- club rappresentati nel corso della carriera.

Trasferimenti, crescita delle caratteristiche, trofei, premi e ritiro verranno collegati nelle fasi successive del percorso individuale.
