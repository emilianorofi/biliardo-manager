# Piramide iniziale e popolazione dei giocatori

Questa specifica definisce la struttura iniziale stabile di Biliardo Manager.

## Campionati

Ogni girone contiene otto squadre e disputa quattordici giornate, con andata
e ritorno.

| Categoria | Gironi | Squadre | Squadre totali |
| --- | ---: | ---: | ---: |
| Prima Serie | 1 | 8 | 8 |
| Seconda Serie | 2 | 8 | 16 |
| Terza Serie | 4 | 8 | 32 |
| Quarta Serie | 8 | 8 | 64 |
| Totale | 15 |  | 120 |

Ogni squadra inizia con cinque giocatori. La popolazione iniziale contiene
quindi 600 giocatori appartenenti alle squadre.

## Ingresso dei manager

Un nuovo manager sostituisce immediatamente un club controllato dal computer.
I posti vengono occupati partendo dalla categoria più alta ancora dotata di
club IA:

1. utenti 1-8 in Prima Serie;
2. utenti 9-24 in Seconda Serie;
3. utenti 25-56 in Terza Serie;
4. utenti 57-120 in Quarta Serie.

Quando una categoria contiene più gironi, i nuovi manager vengono distribuiti
nel girone con meno club umani. A parità viene usato l'ordine alfabetico dei
gironi.

Il subentro può avvenire a stagione iniziata. Il manager eredita punti,
risultati e calendario già disputato dal club IA e gioca con la propria squadra
dalla giornata successiva.

## Promozioni e retrocessioni

- Prima Serie: retrocedono settima e ottava; salgono le due vincitrici della
  Seconda Serie.
- Seconda Serie: sale la prima e retrocedono le ultime due di ogni girone.
- Terza Serie: sale la prima e retrocedono le ultime due di ogni girone.
- Quarta Serie: sale la prima di ogni girone; non sono previste retrocessioni
  finché non verrà introdotta una categoria inferiore.

Non sono previsti playoff nella prima versione.

## Nazionalità iniziali

| Nazione | Giocatori |
| --- | ---: |
| Italia | 390 |
| Argentina | 75 |
| Germania | 39 |
| Uruguay | 24 |
| Francia | 24 |
| Danimarca | 18 |
| Belgio | 12 |
| Altre 18 nazioni | 18 |
| Totale | 600 |

Le altre nazioni iniziali sono Lussemburgo, Svizzera, Repubblica Ceca,
Austria, San Marino, Brasile, Paesi Bassi, Spagna, Norvegia, Portogallo,
Svezia, Albania, Liechtenstein, Turchia, Colombia, Corea del Sud, Giappone ed
Egitto. Ognuna è rappresentata da almeno un giocatore.

Nuove nazionalità potranno entrare gradualmente attraverso il ricambio dei
giocatori e l'Accademia.

## Inizializzazione tecnica

Il comando idempotente seguente completa club, giocatori, gironi e calendari
senza cancellare la stagione o i risultati già esistenti:

```text
npm run world:bootstrap
```

Se la Prima Serie ha già un calendario, i nuovi gironi ne riutilizzano le date.
Gli incontri scaduti vengono recuperati dal motore temporale nel normale ordine
cronologico.
