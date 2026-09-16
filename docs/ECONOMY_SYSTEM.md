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

## Entrate e costi base per categoria

| Serie | Sponsor/settimana | Incasso base gara in casa | Gestione club/settimana |
| ---: | ---: | ---: | ---: |
| 1 | 8.500 | 14.000 | 2.600 |
| 2 | 7.000 | 11.000 | 1.900 |
| 3 | 5.800 | 8.400 | 1.350 |
| 4 | 4.800 | 6.400 | 900 |

Sponsor e pubblico devono poter ricevere variazioni moderate da reputazione, tifosi, andamento e qualita dell'avversario, senza far dipendere la sopravvivenza del club dai risultati sportivi.

## Strutture

Il Centro Allenamento usa questa prima curva fissata:

| Livello | Costo upgrade | Manutenzione settimanale |
| ---: | ---: | ---: |
| 1 | iniziale | 300 |
| 2 | 25.000 | 700 |
| 3 | 60.000 | 1.400 |
| 4 | 130.000 | 2.400 |
| 5 | 260.000 | 3.800 |

Accademia e impianto di gioco devono seguire lo stesso principio economico, ma i loro importi definitivi restano da fissare insieme ai bonus prodotti da ciascun livello prima dell'attivazione in produzione.

## Mercato e liquidita

- Commissione su ogni cessione: 5%.
- Il venditore incassa il 95% del prezzo finale.
- Le offerte devono essere coperte dalla liquidita disponibile.
- Le offerte in cui il club e attualmente primo impegnano denaro e posti rosa: lo stesso denaro non puo coprire piu aste contemporaneamente.
- Un saldo negativo blocca nuovi acquisti e nuovi upgrade strutturali.
- A -25.000 scatta l'avviso finanziario grave.
- A -50.000 scatta l'amministrazione controllata; non e previsto il fallimento immediato del club.

## Capitale iniziale

Un nuovo manager parte con 100.000 di liquidita, indipendentemente dalla categoria del club ricevuto.

## Premi

Per la Prima Serie la baseline approvata e:

| Posizione | Premio |
| ---: | ---: |
| 1 | 35.000 |
| 2 | 22.000 |
| 3 | 14.000 |

I premi delle categorie inferiori devono essere progressivamente inferiori. La tabella completa verra fissata prima dell'attivazione dei premi automatici.

## Target di bilanciamento

Questi sono target da validare con un simulatore riproducibile, non risultati certificati:

- stipendi di una societa normale: 55-60% delle entrate;
- staff: 20-25%;
- strutture: circa 10%;
- margine libero: 5-15%;
- squadra da titolo: spesa pari al 120-150% delle entrate per periodi limitati;
- super-squadra: spesa pari al 250-300% delle entrate, quindi non sostenibile stabilmente;
- dopo molte stagioni il saldo mediano ideale deve restare nell'ordine di 50.000-150.000;
- il divario tecnico tra fascia alta e fascia bassa non dovrebbe superare stabilmente circa 12 punti di overall.

## Elementi ancora da finalizzare prima dell'attivazione completa

1. Formula definitiva del valore di mercato: overall, talento, eta e rischio ritiro.
2. Curva completa di Accademia e Impianto di gioco: costi, manutenzione e benefici.
3. Premi completi di Seconda, Terza e Quarta Serie, promozioni e tornei individuali.
4. Formula precisa di sponsor e pubblico per reputazione, tifosi, forma recente e avversario.
5. Simulatore economico riproducibile su 20 stagioni con promozioni, retrocessioni, crescita, mercato, accademia e ritiri.

Fino a quando questi cinque punti non sono chiusi, questa baseline resta bloccata come riferimento e non deve essere sostituita da numeri ad hoc nelle singole pagine o servizi.
