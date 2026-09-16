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

Quindi un giovane da overall 60 puo valere piu di un sessantenne da overall 75 per il potenziale di crescita residuo.

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

### Centro Allenamento

Il Centro Allenamento aumenta soltanto i guadagni positivi prodotti dall'allenamento. Non riduce il decadimento dovuto all'eta e non sostituisce l'allenatore: i due effetti si combinano.

| Livello | Costo upgrade | Manutenzione settimanale | Bonus crescita | Tempo upgrade |
| ---: | ---: | ---: | ---: | ---: |
| 1 | iniziale | 300 | 0% | - |
| 2 | 25.000 | 700 | +4% | 7 giorni |
| 3 | 60.000 | 1.400 | +8% | 14 giorni |
| 4 | 130.000 | 2.400 | +13% | 21 giorni |
| 5 | 260.000 | 3.800 | +18% | 28 giorni |

Formula:

`guadagno finale = guadagno allenamento * (1 + bonus Centro Allenamento)`

Esempi con un guadagno base di 0,70:

- livello 1: 0,700;
- livello 2: 0,728;
- livello 3: 0,756;
- livello 4: 0,791;
- livello 5: 0,826.

Con un guadagno base di 0,90, il livello 5 porta il guadagno a 1,062. Su 15 settimane equivalenti a piena intensita significa circa 2,43 punti aggiuntivi rispetto al livello 1 prima di eventuali limiti della skill.

Durante un upgrade resta attivo il livello precedente fino alla conclusione dei lavori. Gli upgrade non sono quindi istantanei e non permettono di passare dal livello 1 al livello 5 nello stesso momento.

Accademia e Impianto di gioco devono seguire lo stesso principio economico, ma i loro importi definitivi restano da fissare insieme ai bonus prodotti da ciascun livello prima dell'attivazione in produzione.

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

1. Curva completa di Accademia e Impianto di gioco: costi, manutenzione e benefici.
2. Premi completi di Seconda, Terza e Quarta Serie, promozioni e tornei individuali.
3. Formula precisa di sponsor e pubblico per reputazione, tifosi, forma recente e avversario.
4. Simulatore economico riproducibile su 20 stagioni con promozioni, retrocessioni, crescita, mercato, accademia e ritiri.

Fino a quando questi quattro punti non sono chiusi, questa baseline resta bloccata come riferimento e non deve essere sostituita da numeri ad hoc nelle singole pagine o servizi.
