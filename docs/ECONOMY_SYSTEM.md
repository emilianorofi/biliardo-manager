# Sistema economico di Biliardo Manager

Questa pagina fissa la baseline economica approvata dopo il primo ciclo di bilanciamento. I valori qui sotto sono la fonte di verita per la prossima implementazione delle finanze.

## Obiettivi di design

- Una societa normale e ben amministrata deve essere vicina al pareggio e conservare un margine ridotto.
- Una societa competitiva puo permettersi uno o due campioni, ma deve sacrificare risorse in altre aree.
- Una rosa piena di fuoriclasse deve essere possibile solo come scelta temporanea e molto costosa.
- Non esiste un salary cap artificiale: il limite e economico.
- Vincere aiuta, ma non deve generare un ciclo automatico `vinco -> mi arricchisco -> compro tutti -> continuo a vincere`.
- Le societa deboli devono poter recuperare tramite risparmio, sviluppo dei giovani, allenamento, strutture e mercato.
- Gli upgrade delle strutture sono money sink principali: costo di costruzione alto e manutenzione piu moderata.
- Il 5% delle cessioni esce dall'economia come commissione di mercato.

## Stipendi dei giocatori

Formula settimanale:

`stipendio = max(250, round(250 * 1.105^(overall - 50)))`

Riferimenti:

| Overall | Stipendio settimanale |
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

Sei giocatori da 85 costano quindi 49.404 a settimana prima di staff, strutture e gestione del club.

## Valore di mercato dei giocatori

Il valore non dipende soltanto dalla forza attuale. Un giovane meno forte puo valere piu di un giocatore anziano con overall superiore perche conserva una finestra di crescita molto piu lunga.

Formula definitiva:

`valore = valore base overall * coefficiente eta * coefficiente talento`

Forma, morale ed esperienza non modificano il valore di mercato.

### Valore base da overall

`valore base = 30.000 * 1,075^(overall - 60)`

| Overall | Valore base |
| ---: | ---: |
| 50 | 14.556 |
| 55 | 20.897 |
| 60 | 30.000 |
| 65 | 43.069 |
| 70 | 61.831 |
| 75 | 88.766 |
| 80 | 127.436 |
| 85 | 182.950 |
| 90 | 262.649 |
| 95 | 377.066 |

### Coefficiente eta

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

La curva rispetta il ciclo specifico del biliardo: i giocatori possono continuare a crescere fino alla fascia 40-45 anni, mentre oltre tale soglia il valore futuro cala progressivamente insieme alla finestra residua di sviluppo e al rischio di ritiro.

### Coefficiente talento

`coefficiente talento = 0,70 + talento / 180`

| Talento | Moltiplicatore circa |
| ---: | ---: |
| 60 | 1,03 |
| 70 | 1,09 |
| 80 | 1,14 |
| 90 | 1,20 |
| 100 | 1,26 |

Il valore finale viene arrotondato ai 100 piu vicini.

Esempi fissati:

- 18 anni, overall 60, talento 80: 79.000.
- 60 anni, overall 75, talento 70: 53.200.
- 40 anni, overall 90, talento 85: 400.200.
- 45 anni, overall 95, talento 90: 520.400.

## Staff

### Allenatore

| Livello | Costo settimanale |
| ---: | ---: |
| 1 | 500 |
| 2 | 900 |
| 3 | 1.500 |
| 4 | 2.400 |
| 5 | 3.800 |

### Responsabile giovani

| Livello | Costo settimanale |
| ---: | ---: |
| 1 | 250 |
| 2 | 450 |
| 3 | 800 |
| 4 | 1.300 |
| 5 | 2.100 |

Il Responsabile giovani resta distinto dall'Accademia: il suo livello migliora la precisione con cui vengono stimate le caratteristiche dei giovani gia presenti, mentre il livello dell'Accademia modifica la qualita media dei nuovi candidati.

## Entrate e costi base per categoria

| Serie | Sponsor/settimana | Incasso base gara in casa | Gestione club/settimana |
| ---: | ---: | ---: | ---: |
| 1 | 8.500 | 14.000 | 2.600 |
| 2 | 7.000 | 11.000 | 1.900 |
| 3 | 5.800 | 8.400 | 1.350 |
| 4 | 4.800 | 6.400 | 900 |

## Tifosi, reputazione, sponsor e pubblico

I tifosi rappresentano una sala da biliardo reale, non uno stadio. La scala definitiva e quindi 10-300, con riferimento economico pari a 90.

Variazione tifosi dopo ogni giornata:

| Punti giornata | Variazione |
| ---: | ---: |
| 0 | -3 |
| 1 | -2 |
| 2 | -1 |
| 3 | 0 |
| 4 | +1 |
| 5 | +2 |
| 6 | +3 |

A fine stagione:

| Posizione | Variazione tifosi | Variazione reputazione |
| ---: | ---: | ---: |
| 1 | +12 | +4 |
| 2 | +7 | +2 |
| 3 | +4 | +1 |
| 4 | 0 | 0 |
| 5 | 0 | 0 |
| 6 | -3 | -1 |
| 7 | -6 | -2 |
| 8 | -9 | -3 |

Promozione: +6 tifosi e +2 reputazione. Retrocessione: -6 tifosi e -2 reputazione. Il campione della Prima Serie riceve inoltre +2 reputazione. La reputazione resta su scala 1-100 e viene aggiornata a fine stagione.

Sponsor settimanale:

`base serie * reputazione * tifosi * andamento recente`

- reputazione: `1 + (reputazione - 40) * 0,004`, limitata a 0,92-1,08;
- tifosi: `1 + (tifosi - 90) / 1.600`, limitata a 0,95-1,05;
- media punti ultime 5 giornate: `1 + (media - 3) * 0,01`, limitata a 0,97-1,03;
- moltiplicatore sponsor complessivo limitato a 0,85-1,15.

Incasso casalingo:

`base serie * interesse partita * bonus Impianto`

L'interesse partita usa:

- tifosi casa: `1 + (tifosi - 90) / 800`, limitato a 0,90-1,10;
- reputazione casa: `1 + (reputazione - 40) * 0,0025`, limitata a 0,95-1,05;
- andamento ultime 5: limitato a 0,95-1,05;
- reputazione avversario: `1 + (reputazione - 40) * 0,0035`, limitata a 0,95-1,10;
- interesse complessivo limitato a 0,80-1,25 prima del bonus Impianto.

La posizione in classifica non entra direttamente nella formula, per evitare di moltiplicare troppo il vantaggio di chi e gia in testa.

## Strutture

### Centro Allenamento

| Livello | Costo upgrade | Manutenzione settimanale | Bonus crescita | Tempo upgrade |
| ---: | ---: | ---: | ---: | ---: |
| 1 | iniziale | 300 | 0% | - |
| 2 | 25.000 | 700 | +4% | 7 giorni |
| 3 | 60.000 | 1.400 | +8% | 14 giorni |
| 4 | 130.000 | 2.400 | +13% | 21 giorni |
| 5 | 260.000 | 3.800 | +18% | 28 giorni |

Il bonus si applica soltanto alla crescita positiva prodotta dall'allenamento e non al decadimento per eta. Durante i lavori resta attivo il livello precedente.

### Accademia

| Livello | Costo upgrade | Manutenzione settimanale | Bonus OVR candidato | Tempo upgrade |
| ---: | ---: | ---: | ---: | ---: |
| 1 | iniziale | 150 | nessuno | - |
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

Restano invariati: un candidato ogni settimana, massimo 10 giovani, eta 14-16, tre caratteristiche stimate all'ingresso e nessun aumento del numero di candidati ai livelli superiori.

### Impianto di gioco

| Livello | Costo upgrade | Manutenzione settimanale | Bonus incasso casa | Tempo upgrade |
| ---: | ---: | ---: | ---: | ---: |
| 1 | iniziale | 150 | 0% | - |
| 2 | 30.000 | 250 | +7% | 7 giorni |
| 3 | 75.000 | 400 | +15% | 14 giorni |
| 4 | 160.000 | 650 | +25% | 21 giorni |
| 5 | 320.000 | 1.000 | +40% | 28 giorni |

Il bonus Impianto si applica dopo il fattore di interesse della partita. Durante i lavori resta attivo il livello precedente.

## Mercato e liquidita

- Commissione su ogni cessione: 5%.
- Il venditore incassa il 95% del prezzo finale.
- Le offerte devono essere coperte dalla liquidita disponibile.
- Le offerte in cui il club e attualmente primo impegnano denaro e posti rosa.
- Un saldo negativo blocca nuovi acquisti e nuovi upgrade strutturali.
- A -25.000 scatta l'avviso finanziario grave.
- A -50.000 scatta l'amministrazione controllata; non e previsto il fallimento immediato del club.

## Capitale iniziale

Un nuovo manager parte con 100.000 di liquidita, indipendentemente dalla categoria del club ricevuto.

## Premi

### Campionati

I premi valgono per ogni singolo girone.

| Serie | 1° | 2° | 3° |
| ---: | ---: | ---: | ---: |
| Prima | 35.000 | 22.000 | 14.000 |
| Seconda | 20.000 | 12.000 | 7.000 |
| Terza | 13.000 | 8.000 | 5.000 |
| Quarta | 8.000 | 5.000 | 3.000 |

Premio promozione aggiuntivo:

- Seconda -> Prima: 10.000;
- Terza -> Seconda: 7.000;
- Quarta -> Terza: 5.000.

Non esiste buonuscita economica per la retrocessione.

### Tornei individuali normali

Il premio viene accreditato al club del giocatore.

| Risultato | Premio |
| --- | ---: |
| Vincitore | 6.000 |
| Finalista | 3.000 |
| Semifinalista | 1.500 |
| Quarti | 500 |

Montepremi complessivo per torneo: 14.000.

### Mondiale individuale

| Risultato | Premio |
| --- | ---: |
| Campione del Mondo | 15.000 |
| Finalista | 8.000 |
| Semifinalista | 4.000 |
| Quarti | 1.500 |

Montepremi complessivo: 37.000.

### Coppa delle Nazioni

La Coppa delle Nazioni non assegna denaro ai club. Resta una competizione di prestigio, per evitare che il possesso di piu nazionali forti generi ulteriore vantaggio economico automatico.

## Target di bilanciamento

- stipendi di una societa normale: 55-60% delle entrate;
- staff: 20-25%;
- strutture: circa 10%;
- margine libero: 5-15%;
- squadra da titolo: spesa pari al 120-150% delle entrate per periodi limitati;
- super-squadra: spesa pari al 250-300% delle entrate, quindi non sostenibile stabilmente;
- dopo molte stagioni il saldo mediano ideale deve restare nell'ordine di 50.000-150.000;
- il divario tecnico tra fascia alta e fascia bassa non dovrebbe superare stabilmente circa 12 punti di overall.

## Elementi ancora da finalizzare prima dell'attivazione completa

1. Simulatore economico riproducibile su 20 stagioni con promozioni, retrocessioni, crescita, mercato, accademia, strutture, premi e ritiri.

Fino alla chiusura del simulatore questa baseline resta bloccata come riferimento e non deve essere sostituita da numeri ad hoc nelle singole pagine o servizi.
