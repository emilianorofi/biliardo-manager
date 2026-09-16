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

Il Responsabile giovani resta distinto dall'Accademia: il suo livello migliora la precisione con cui vengono stimate le caratteristiche dei giovani gia presenti, mentre il livello dell'Accademia modifica la qualita media dei nuovi candidati.

## Entrate e costi base per categoria

| Serie | Sponsor/settimana | Incasso base gara in casa | Gestione club/settimana |
| ---: | ---: | ---: | ---: |
| 1 | 8.500 | 14.000 | 2.600 |
| 2 | 7.000 | 11.000 | 1.900 |
| 3 | 5.800 | 8.400 | 1.350 |
| 4 | 4.800 | 6.400 | 900 |

## Tifosi, reputazione, sponsor e pubblico

### Tifosi

La scala dei tifosi e volutamente ridotta per essere coerente con una sala biliardo e non con uno stadio: minimo 10, riferimento 90, massimo 300.

Dopo ogni giornata di campionato:

| Punti giornata | Variazione tifosi |
| ---: | ---: |
| 0 | -3 |
| 1 | -2 |
| 2 | -1 |
| 3 | 0 |
| 4 | +1 |
| 5 | +2 |
| 6 | +3 |

A fine stagione:

| Posizione | Variazione tifosi |
| ---: | ---: |
| 1 | +12 |
| 2 | +7 |
| 3 | +4 |
| 4-5 | 0 |
| 6 | -3 |
| 7 | -6 |
| 8 | -9 |

Promozione: +6 tifosi. Retrocessione: -6 tifosi.

### Reputazione

La reputazione usa una scala 1-100 e rappresenta il prestigio storico del club. Non viene modificata dopo ogni giornata: si aggiorna soltanto a fine stagione.

| Posizione | Variazione reputazione |
| ---: | ---: |
| 1 | +4 |
| 2 | +2 |
| 3 | +1 |
| 4-5 | 0 |
| 6 | -1 |
| 7 | -2 |
| 8 | -3 |

Promozione: +2. Retrocessione: -2. Il campione della Prima Serie riceve inoltre +2 reputazione, quindi una stagione chiusa al primo posto in Prima puo produrre +6.

### Sponsor settimanale

Lo sponsor parte dalla base della categoria e riceve tre correttivi moderati.

Reputazione:

`1 + (reputazione - 40) * 0,004`, limitato tra 0,92 e 1,08.

Tifosi:

`1 + (tifosi - 90) / 1.600`, limitato tra 0,95 e 1,05.

Andamento recente, usando la media dei punti nelle ultime 5 giornate:

`1 + (media punti - 3) * 0,01`, limitato tra 0,97 e 1,03.

Formula finale:

`sponsor = sponsor base categoria * reputazione * tifosi * andamento`

Il moltiplicatore complessivo viene comunque limitato tra 0,85 e 1,15. In Prima Serie, con base 8.500, lo sponsor rimane quindi tra circa 7.225 e 9.775 a settimana.

### Incasso casalingo

L'incasso parte dalla base della categoria. L'interesse partita usa:

- tifosi di casa: `1 + (tifosi - 90) / 800`, limitato 0,90-1,10;
- reputazione di casa: `1 + (reputazione - 40) * 0,0025`, limitato 0,95-1,05;
- andamento ultime 5 giornate: `1 + (media punti - 3) / 60`, limitato 0,95-1,05;
- reputazione avversario: `1 + (reputazione avversario - 40) * 0,0035`, limitato 0,95-1,10.

Il prodotto dei fattori di interesse viene limitato tra 0,80 e 1,25. Soltanto dopo si applica il bonus dell'Impianto di gioco.

Formula finale:

`incasso = incasso base categoria * interesse partita * bonus Impianto`

In Prima Serie, prima del bonus Impianto, l'incasso resta quindi tra 11.200 e 17.500. Con Impianto livello 5 la forbice diventa 15.680-24.500.

La posizione in classifica non entra direttamente nelle formule: l'andamento recente, i tifosi e la reputazione sono gia sufficienti. In questo modo si limita il ciclo automatico vittorie -> piu ricavi -> rosa piu forte -> altre vittorie.

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

### Accademia

L'Accademia non accelera direttamente la crescita dei giovani gia presenti. Il suo compito e aumentare la qualita media dei nuovi candidati, lasciando comunque una componente di fortuna: anche un club con Accademia di livello 1 puo trovare raramente un grande prospetto.

| Livello | Costo upgrade | Manutenzione settimanale | Bonus OVR candidato | Tempo upgrade |
| ---: | ---: | ---: | ---: | ---: |
| 1 | iniziale | 150 | nessuno | - |
| 2 | 20.000 | 300 | 0-1 | 7 giorni |
| 3 | 50.000 | 500 | 0-2 | 14 giorni |
| 4 | 110.000 | 800 | 1-3 | 21 giorni |
| 5 | 220.000 | 1.200 | 2-4 | 28 giorni |

Il bonus di overall si applica alla qualita iniziale del nuovo candidato e non altera direttamente la sua eta. I candidati restano tra 14 e 16 anni con la stessa distribuzione di eta a tutti i livelli dell'Accademia.

Le fasce talento sono:

| Fascia | Talento |
| --- | ---: |
| Normale | 45-59 |
| Interessante | 60-69 |
| Grande prospetto | 70-79 |
| Fuoriclasse potenziale | 80-89 |
| Eccezionale | 90-95 |

Probabilita per livello:

| Livello | 45-59 | 60-69 | 70-79 | 80-89 | 90-95 |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 78% | 17% | 4,5% | 0,5% | 0% |
| 2 | 72% | 20% | 6,5% | 1,5% | 0% |
| 3 | 65% | 23% | 9% | 2,5% | 0,5% |
| 4 | 58% | 25% | 12% | 4% | 1% |
| 5 | 50% | 27% | 16% | 6% | 1% |

Il livello superiore aumenta quindi soprattutto la continuita con cui arrivano giovani interessanti, senza garantire fenomeni. Un talento da 80+ resta raro anche al livello 5.

Restano invariati i principi gia stabiliti per il vivaio:

- un nuovo candidato ogni settimana;
- massimo 10 giovani in Accademia;
- eta 14-16 anni;
- ogni nuovo candidato entra con 3 caratteristiche stimate;
- la scoperta progressiva delle caratteristiche continua con il sistema di scouting;
- salire di livello non aumenta il numero di candidati settimanali;
- durante un upgrade resta attivo il livello precedente fino al completamento dei lavori.

L'OVR base continua a dipendere anche dall'eta del candidato: indicativamente 40-42 a 14 anni, 45-47 a 15 anni e 50-52 a 16 anni prima del bonus prodotto dal livello dell'Accademia.

### Impianto di gioco

L'Impianto di gioco e una struttura economica pura: aumenta gli incassi delle partite casalinghe ma non modifica direttamente sponsor, reputazione o forza della squadra.

| Livello | Costo upgrade | Manutenzione settimanale | Bonus incasso casa | Tempo upgrade |
| ---: | ---: | ---: | ---: | ---: |
| 1 | iniziale | 150 | 0% | - |
| 2 | 30.000 | 250 | +7% | 7 giorni |
| 3 | 75.000 | 400 | +15% | 14 giorni |
| 4 | 160.000 | 650 | +25% | 21 giorni |
| 5 | 320.000 | 1.000 | +40% | 28 giorni |

Formula:

`incasso partita = incasso base * fattori pubblico * (1 + bonus Impianto)`

Il bonus Impianto si applica quindi dopo la definizione dell'incasso base della categoria e insieme ai fattori di pubblico, reputazione, andamento recente e qualita dell'avversario.

Esempio in Prima Serie con incasso base di 14.000 prima degli altri correttivi:

- livello 1: 14.000;
- livello 2: 14.980;
- livello 3: 16.100;
- livello 4: 17.500;
- livello 5: 19.600.

Durante i lavori resta attivo il livello precedente fino al completamento dell'upgrade. Il livello 5 richiede un investimento molto elevato e risulta quindi piu remunerativo nelle categorie superiori, dove gli incassi base sono maggiori.

Le tre strutture hanno cosi ruoli separati:

- Centro Allenamento: sviluppo della prima squadra;
- Accademia: qualita dei nuovi giovani;
- Impianto di gioco: entrate delle partite casalinghe.

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

1. Premi completi di Seconda, Terza e Quarta Serie, promozioni e tornei individuali.
2. Simulatore economico riproducibile su 20 stagioni con promozioni, retrocessioni, crescita, mercato, accademia e ritiri.

Fino a quando questi due punti non sono chiusi, questa baseline resta bloccata come riferimento e non deve essere sostituita da numeri ad hoc nelle singole pagine o servizi.
