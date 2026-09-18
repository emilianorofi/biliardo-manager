# Sistema economico di Biliardo Manager


Questa pagina raccoglie la baseline economica approvata. I valori qui indicati sono la fonte di verita per l'integrazione in produzione. La validazione a 20 stagioni e documentata in `docs/ECONOMY_SIMULATION.md`.

## Principi

- nessun salary cap artificiale: il limite e economico;
- una societa ben amministrata deve stare vicino al pareggio o a un piccolo surplus;
- uno o due campioni devono essere sostenibili, una rosa interamente elite solo temporaneamente;
- vincere aiuta ma non deve creare un ciclo automatico di dominio economico;
- mercato, strutture e commissioni funzionano anche da money sink;
- un club debole deve poter recuperare tramite sviluppo, giovani, mercato e buona gestione.

## Capitale e controllo finanziario

- capitale iniziale nuovo manager: **100.000**;
- commissione mercato: **5%** del prezzo di cessione;
- saldo negativo: blocco di nuovi acquisti e nuovi upgrade;
- sotto **-25.000**: avviso finanziario grave;
- sotto **-50.000**: amministrazione controllata, senza cancellazione immediata del club.

## Stipendi

Formula settimanale:

`stipendio = max(250, round(250 * 1.105^(overall - 50)))`

| OVR | Stipendio |
| ---: | ---: |
| 50 | 250 |
| 55 | 412 |
| 60 | 679 |
| 65 | 1.118 |
| 70 | 1.842 |
| 75 | 3.034 |
| 80 | 4.998 |
| 85 | 8.234 |
| 90 | 13.565 |
| 95 | 22.348 |

Sei giocatori da 85 costano 49.404 a settimana prima di staff, strutture e gestione.

## Valore di mercato

`valore = valore base overall * coefficiente eta * coefficiente talento`

`valore base = 30.000 * 1,075^(overall - 60)`

Coefficiente eta:

| Eta | Moltiplicatore |
| ---: | ---: |
| 16-20 | 2,30 |
| 21-25 | 2,10 |
| 26-30 | 1,80 |
| 31-35 | 1,55 |
| 36-40 | 1,30 |
| 41-45 | 1,15 |
| 46-50 | 0,95 |
| 51-55 | 0,75 |
| 56-60 | 0,55 |
| 61-65 | 0,40 |
| 66-70 | 0,28 |
| 71-75 | 0,18 |
| 76+ | 0,10 |

`coefficiente talento = 0,70 + talento / 180`

Forma, morale ed esperienza non modificano il valore. Il risultato viene arrotondato ai 100 piu vicini.

Esempi fissati: 18 anni/OVR60/talento80 = 79.000; 60 anni/OVR75/talento70 = 53.200; 40 anni/OVR90/talento85 = 400.200; 45 anni/OVR95/talento90 = 520.400.

## Staff

| Livello | Allenatore | Responsabile giovani |
| ---: | ---: | ---: |
| 1 | 500 | 250 |
| 2 | 900 | 450 |
| 3 | 1.500 | 800 |
| 4 | 2.400 | 1.300 |
| 5 | 3.800 | 2.100 |

L'allenatore modifica l'efficienza dell'allenamento. Il Responsabile giovani migliora la precisione delle stime dei giovani gia presenti; non sostituisce il livello Accademia.

## Economia per categoria

| Serie | Sponsor base/settimana | Incasso base casa | Gestione club/settimana |
| ---: | ---: | ---: | ---: |
| 1 | 8.500 | 14.000 | 2.600 |
| 2 | 7.000 | 11.000 | 1.900 |
| 3 | 5.800 | 8.400 | 1.350 |
| 4 | 4.800 | 6.400 | 900 |

## Tifosi e reputazione

Tifosi: scala **10-300**, riferimento economico **90**.

| Punti giornata | Variazione tifosi |
| ---: | ---: |
| 0 | -3 |
| 1 | -2 |
| 2 | -1 |
| 3 | 0 |
| 4 | +1 |
| 5 | +2 |
| 6 | +3 |

Fine stagione:

| Posizione | Tifosi | Reputazione |
| ---: | ---: | ---: |
| 1 | +12 | +4 |
| 2 | +7 | +2 |
| 3 | +4 | +1 |
| 4 | 0 | 0 |
| 5 | 0 | 0 |
| 6 | -3 | -1 |
| 7 | -6 | -2 |
| 8 | -9 | -3 |

Promozione: +6 tifosi e +2 reputazione. Retrocessione: -6 tifosi e -2 reputazione. Campione Prima Serie: ulteriore +2 reputazione. Reputazione su scala 1-100.

## Sponsor

`base serie * fattore reputazione * fattore tifosi * fattore forma`

- reputazione: `1 + (rep - 40) * 0,004`, limite 0,92-1,08;
- tifosi: `1 + (tifosi - 90) / 1.600`, limite 0,95-1,05;
- media punti ultime 5: `1 + (media - 3) * 0,01`, limite 0,97-1,03;
- moltiplicatore finale sponsor: **0,85-1,15**.

## Pubblico

`incasso = base serie * interesse partita * bonus Impianto`

Interesse partita:

- tifosi casa: `1 + (tifosi - 90) / 800`, limite 0,90-1,10;
- reputazione casa: `1 + (rep - 40) * 0,0025`, limitata a 0,95-1,05;
- andamento ultime 5: limite 0,95-1,05;
- reputazione avversario: `1 + (rep avversario - 40) * 0,0035`, limitata a 0,95-1,10;
- interesse complessivo prima dell'Impianto: **0,80-1,25**.

La posizione in classifica non entra direttamente nella formula.

## Strutture

### Centro Allenamento

| Livello | Upgrade | Manutenzione | Bonus crescita | Tempo |
| ---: | ---: | ---: | ---: | ---: |
| 1 | iniziale | 300 | 0% | - |
| 2 | 25.000 | 700 | +4% | 7 giorni |
| 3 | 60.000 | 1.400 | +8% | 14 giorni |
| 4 | 130.000 | 2.400 | +13% | 21 giorni |
| 5 | 260.000 | 3.800 | +18% | 28 giorni |

Il bonus si applica solo alla crescita positiva, non al decadimento per eta. Durante i lavori resta attivo il livello precedente.

### Accademia

| Livello | Upgrade | Manutenzione | Bonus OVR candidato | Tempo |
| ---: | ---: | ---: | ---: | ---: |
| 1 | iniziale | 150 | 0 | - |
| 2 | 20.000 | 300 | 0-1 | 7 giorni |
| 3 | 50.000 | 500 | 0-2 | 14 giorni |
| 4 | 110.000 | 800 | 1-3 | 21 giorni |
| 5 | 220.000 | 1.200 | 2-4 | 28 giorni |

Probabilita talento:

| Livello | 45-59 | 60-69 | 70-79 | 80-89 | 90-95 |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 78% | 17% | 4,5% | 0,5% | 0% |
| 2 | 72% | 20% | 6,5% | 1,5% | 0% |
| 3 | 65% | 23% | 9% | 2,5% | 0,5% |
| 4 | 58% | 25% | 12% | 4% | 1% |
| 5 | 50% | 27% | 16% | 6% | 1% |

Restano invariati: un candidato/settimana, massimo 10, eta 14-16, tre caratteristiche stimate all'ingresso. Il livello non aumenta il numero di candidati.

### Impianto di gioco

| Livello | Upgrade | Manutenzione | Bonus incasso | Tempo |
| ---: | ---: | ---: | ---: | ---: |
| 1 | iniziale | 150 | 0% | - |
| 2 | 30.000 | 250 | +7% | 7 giorni |
| 3 | 75.000 | 400 | +15% | 14 giorni |
| 4 | 160.000 | 650 | +25% | 21 giorni |
| 5 | 320.000 | 1.000 | +40% | 28 giorni |

Il bonus si applica dopo il fattore interesse partita. Durante i lavori resta attivo il livello precedente.

## Premi

Campionati, per ogni girone:

| Serie | 1° | 2° | 3° |
| ---: | ---: | ---: | ---: |
| Prima | 35.000 | 22.000 | 14.000 |
| Seconda | 20.000 | 12.000 | 7.000 |
| Terza | 13.000 | 8.000 | 5.000 |
| Quarta | 8.000 | 5.000 | 3.000 |

Promozioni: Seconda->Prima 10.000; Terza->Seconda 7.000; Quarta->Terza 5.000. Nessun paracadute retrocessione.

Tornei individuali normali: vincitore 6.000, finalista 3.000, semifinalisti 1.500, quarti 500; montepremi 14.000 per torneo.

Mondiale individuale: campione 15.000, finalista 8.000, semifinalisti 4.000, quarti 1.500; montepremi 37.000.

Coppa delle Nazioni: nessun premio economico ai club.

## Target di bilanciamento

- stipendi societa normale: 55-60% delle entrate;
- staff: 20-25%;
- strutture: circa 10%;
- margine libero: 5-15%;
- squadra da titolo: spesa 120-150% delle entrate per periodi limitati;
- super-squadra: spesa 250-300%, quindi non sostenibile stabilmente;
- saldo mediano di lungo periodo desiderato: 50.000-150.000;
- gap tecnico P90-P10 desiderato: non stabilmente oltre circa 12 OVR.

## Validazione a 20 stagioni

La baseline e stata stress-testata con un simulatore riproducibile su 30 mondi da 20 stagioni, includendo 120 club, sviluppo, ritiri, Accademia, mercato, strutture, sponsor/pubblico, premi e promozioni/retrocessioni.

Risultati principali a stagione 20:

- saldo mediano: **82.756**;
- P10/P90: **14.335 / 191.988**;
- club con saldo negativo: **2,4 su 120** in media;
- club sotto -50.000 al checkpoint: **0** in media;
- gap tecnico P90-P10: **9,19**;
- campioni diversi della Prima in 20 stagioni: mediana **11**;
- club iniziali di Quarta arrivati in Prima: media **3,63 su 64**;
- club iniziali di Quarta diventati campioni di Prima: media **0,77**.

I due target principali risultano rispettati: saldo mediano dentro 50.000-150.000 e gap tecnico sotto 12. La baseline e quindi considerata validata per l'integrazione in produzione. Dettagli, metodologia e assunzioni sono in `docs/ECONOMY_SIMULATION.md`.
