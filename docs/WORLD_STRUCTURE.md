# Piramide iniziale e popolazione dei giocatori

Questa specifica definisce la struttura iniziale stabile di Biliardo Manager.

## Campionati

Ogni girone contiene otto squadre e disputa quattordici giornate, con andata
e ritorno.

Tutte le partite della stessa giornata vengono disputate nello stesso istante
in ogni girone. Il motore temporale elabora l'intera giornata mondiale come un
unico evento, così nessuna classifica può rimanere con squadre aventi un numero
diverso di incontri giocati.

| Categoria | Gironi | Squadre per girone | Squadre totali |
| --- | ---: | ---: | ---: |
| Prima Serie | 1 | 8 | 8 |
| Seconda Serie | 2 | 8 | 16 |
| Terza Serie | 4 | 8 | 32 |
| Quarta Serie | 8 | 8 | 64 |
| Totale | 15 |  | 120 |

Ogni squadra IA iniziale contiene **6 giocatori**. La popolazione iniziale del
mondo è quindi di **720 giocatori** appartenenti alle squadre.

## Ingresso dei manager

Un nuovo manager sostituisce un club controllato dal computer. I posti vengono
assegnati partendo dalla categoria più alta che contiene ancora club IA. Nei
livelli con più gironi viene preferito il girone con meno manager umani e poi,
a parità, l'ordine del girone e la posizione del club prevista dalla query di
subentro.

Il subentro può avvenire a stagione iniziata. Il club mantiene punti, risultati
e calendario già registrati; identità, rosa e gestione operativa vengono invece
sostituiti dal nuovo manager.

## Promozioni e retrocessioni

- Prima Serie: retrocedono settima e ottava; salgono le due vincitrici della
  Seconda Serie.
- Seconda Serie: sale la prima e retrocedono le ultime due di ogni girone.
- Terza Serie: sale la prima e retrocedono le ultime due di ogni girone.
- Quarta Serie: sale la prima di ogni girone; non sono previste retrocessioni
  finché non verrà introdotta una categoria inferiore.

Non sono previsti playoff nella prima versione.

## Nazionalità iniziali

La distribuzione corrente dei 720 giocatori iniziali è:

| Nazione | Giocatori |
| --- | ---: |
| Italia | 350 |
| Argentina | 80 |
| Germania | 50 |
| Uruguay | 30 |
| Francia | 30 |
| Danimarca | 24 |
| Belgio | 20 |
| Brasile | 15 |
| Spagna | 15 |
| Paesi Bassi | 10 |
| Svizzera | 9 |
| Repubblica Ceca | 8 |
| Egitto | 7 |
| Austria | 6 |
| Turchia | 6 |
| Colombia | 6 |
| Giappone | 6 |
| Lussemburgo | 6 |
| San Marino | 6 |
| Norvegia | 6 |
| Portogallo | 6 |
| Svezia | 6 |
| Albania | 6 |
| Liechtenstein | 6 |
| Corea del Sud | 6 |
| **Totale** | **720** |

La Coppa delle Nazioni richiede 16 nazioni e 3 giocatori per nazionale; la
distribuzione iniziale garantisce un numero sufficiente di nazioni eleggibili.
Nuove nazionalità potranno entrare attraverso il ricambio dei giocatori.

## Inizializzazione tecnica

Il comando idempotente seguente completa club, giocatori, gironi e calendari
senza cancellare la stagione o i risultati già esistenti:

```text
npm run world:bootstrap
```

Il comando seguente riallinea i campionati IA alla giornata raggiunta dalla
Prima Serie. È idempotente e si arresta senza modifiche se nei gironi inferiori
è già subentrato un manager umano:

```text
npm run world:synchronize
```

Se la Prima Serie ha già un calendario, i nuovi gironi ne riutilizzano le date.
Gli incontri scaduti vengono recuperati dal motore temporale nel normale ordine
cronologico.
