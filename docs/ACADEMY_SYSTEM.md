# Accademia

## Ingresso dei giovani

- Ogni martedì alle 21:00 (fuso `Europe/Rome`) arriva un candidato.
- L'età di ingresso è casuale tra 14 e 16 anni.
- L'Accademia contiene al massimo 10 giovani.
- Se al momento dell'ingresso i 10 posti sono occupati, la candidatura viene persa e il controllo riparte dalla settimana successiva.

La prossima scadenza è salvata in `Club.nextAcademyCandidateAt`. Il motore temporale la elabora automaticamente e recupera in ordine anche eventuali scadenze trascorse.

## Scouting

Un nuovo candidato entra con 3 caratteristiche stimate. Ogni scadenza settimanale aggiunge prima una delle 6 stime mancanti e poi sostituisce una stima con il valore reale.

Il percorso richiede 15 scadenze settimanali:

- 6 settimane per completare le stime;
- 9 settimane per rivelare i valori reali;
- 105 giorni complessivi dall'ingresso.

## Decisione ed età

- Dai 16 anni il giovane può essere promosso in prima squadra.
- A 17 anni il manager deve promuoverlo o usare **Allontana** entro la fine della stagione successiva.
- Alla chiusura stagionale tutti i giovani compiono un anno.
- Chi raggiunge i 18 anni senza essere stato promosso viene rilasciato automaticamente e genera un evento per il club.
