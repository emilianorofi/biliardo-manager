# Simulazione economica a 20 stagioni

Questa simulazione serve come stress test riproducibile della baseline economica di Biliardo Manager. Non modifica il database e non sostituisce i processi di produzione: verifica se le regole fissate restano sostenibili su un orizzonte lungo.

## Comando

```bash
npm run economy:simulate
```

Per una validazione piu ampia:

```bash
npm run economy:simulate -- --runs 30 --seasons 20 --seed 20260916
```

Il simulatore e deterministico a parita di seed. Supporta anche `--json` e `--raw`.

## Modello

La simulazione usa 120 club nella struttura reale 1-2-4-8 gironi, 8 club per girone, 6 giocatori per rosa e 15 settimane economiche per stagione. Sono inclusi:

- sponsor, pubblico, tifosi e reputazione;
- 14 giornate di campionato con 6 partite per incontro;
- promozioni e retrocessioni 2/4/8 coerenti con la piramide;
- stipendi con la curva esponenziale approvata;
- allenatore e responsabile giovani;
- Centro Allenamento, Accademia e Impianto di gioco con costi, manutenzione, bonus e tempi di costruzione;
- crescita dei giocatori con eta, talento, livello skill e intensita;
- decadimento settimanale per eta e ritiri a fine stagione;
- un candidato Accademia per settimana e massimo 10 giovani;
- mercato con prezzo coerente con valore, 5% di commissione e vincoli di liquidita;
- premi di campionato, promozione, 12 tornei individuali normali e Mondiale;
- tre profili gestionali IA: prudente, bilanciato e competitivo.

La gestione IA non conserva indefinitamente rose economicamente insostenibili: quando il monte stipendi supera il budget sostenibile, puo sostituire un giocatore costoso con un giovane o un giocatore economico. Questo e intenzionale: il sistema economico deve punire una rosa troppo cara, non obbligare ogni club a mantenerla fino al dissesto.

Le probabilita delle singole partite usano la stessa impostazione del motore: 50% piu 1,5 punti percentuali per ogni punto di differenza prestazionale, limitate tra 8% e 92%.

## Validazione principale

Sono state eseguite 30 simulazioni indipendenti da 20 stagioni. Per evitare il limite temporale dell'ambiente di esecuzione, le 30 run sono state lanciate in tre batch consecutivi da 10 con seed equivalenti alla stessa sequenza completa:

- 20260916;
- 20340106;
- 20419296.

I valori sotto sono le medie dei tre batch, quindi 30 mondi simulati e 72.000 club-stagioni complessive.

| Stagione | Saldo mediano | P10 | P90 | Club negativi /120 | Sotto -25k | Sotto -50k | Gap tecnico P90-P10 | OVR mediano | Stipendi rosa mediani | Trasferimenti/stagione |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 130.754 | 73.976 | 180.219 | 0,0 | 0,0 | 0,0 | 7,14 | 59,57 | 3.208 | 66,2 |
| 5 | 117.580 | 48.938 | 203.613 | 0,1 | 0,0 | 0,0 | 8,01 | 63,74 | 4.258 | 63,6 |
| 10 | 88.724 | 11.272 | 180.350 | 5,0 | 0,1 | 0,0 | 8,35 | 65,18 | 4.807 | 50,4 |
| 15 | 76.565 | 12.956 | 180.365 | 3,1 | 0,1 | 0,0 | 9,06 | 64,41 | 4.616 | 46,8 |
| 20 | 82.756 | 14.335 | 191.988 | 2,4 | 0,0 | 0,0 | 9,19 | 64,10 | 4.515 | 49,5 |

### Competitivita

- campioni diversi della Prima Serie in 20 stagioni: mediana **11**;
- massimo numero di titoli dello stesso club: mediana **4**, media **4,33**, range osservato 3-7;
- club partiti dalla Quarta arrivati almeno una volta in Prima: media **3,63 su 64**, mediana 4;
- club partiti dalla Quarta diventati campioni di Prima: media **0,77**, mediana 1;
- trasferimenti totali medi in 20 stagioni: **1.081,7**, circa 54 per stagione.

### Ripartizione dei costi dei club bilanciati

Il simulatore misura anche la quota dell'entrata settimanale teorica assorbita da stipendi, staff e strutture nei club con strategia bilanciata.

| Stagione | Stipendi | Staff | Strutture |
| ---: | ---: | ---: | ---: |
| 1 | 37% | 18% | 8% |
| 5 | 50% | 18% | 16% |
| 10 | 55% | 18% | 17% |
| 15 | 52% | 18% | 18% |
| 20 | 51% | 18% | 19% |

I target 55-60% stipendi, 20-25% staff e circa 10% strutture sono obiettivi di design, non cap rigidi. Il risultato mostra che nel lungo periodo l'IA bilanciata tende a investire piu del target nelle strutture e a mantenere una rosa leggermente piu prudente. Non emerge pero un accumulo o un dissesto sistemico.

## Esito

La baseline supera i due controlli principali fissati prima della simulazione:

- saldo mediano di lungo periodo: **82.756**, dentro il target 50.000-150.000;
- gap tecnico a stagione 20: **9,19**, sotto il limite desiderato di circa 12.

Ai checkpoint non emerge un gruppo strutturale di club in amministrazione controllata: il numero medio sotto -50.000 e pari a zero. La mobilita sportiva resta presente e il mercato non si spegne nel tempo.

Il test evidenzia inoltre un comportamento voluto: una gestione che non controlla il monte stipendi puo entrare rapidamente in difficolta. La sostenibilita dipende quindi dalle decisioni del manager, non da un pareggio garantito dal sistema.

## Conclusione operativa

La baseline economica e considerata validata per passare all'integrazione in produzione. Questa validazione non significa che ogni singolo parametro sia immutabile: dopo l'attivazione andranno monitorati i dati reali e, se necessario, corretti con variazioni piccole e documentate invece di numeri ad hoc.
