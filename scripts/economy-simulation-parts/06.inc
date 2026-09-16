) {
      for (const club of clubs) completePendingUpgrade(club,week);
      for (const club of clubs) settleWeeklyCosts(club);
      for (const club of clubs) { trainClub(rng,club,season,week); academyIntake(rng,world,club); }
      if (week<=14) {
        for (const [homeId,awayId] of schedules[week-1]) {
          const home=clubs[homeId-1], away=clubs[awayId-1];
          home.balance += gateIncome(home,away);
          const [hp,ap]=matchScore(rng,home,away);
          home.seasonPoints+=hp; away.seasonPoints+=ap; home.pointDiff+=hp-ap; away.pointDiff+=ap-hp;
          home.fans=normalizeFans(home.fans+FAN_MATCH_CHANGES[hp]);
          away.fans=normalizeFans(away.fans+FAN_MATCH_CHANGES[ap]);
          updateRecent(home,hp); updateRecent(away,ap);
        }
      }
    }
    runIndividualTournaments(rng,clubs);
    const standings=rankGroups(clubs);
    applySeasonPrizes(standings);
    const topChampion=standings.get('1:0')[0];
    topChampion.titles+=1; topChampion.firstLeagueChampion=true; champions.push(topChampion.id);
    if (initialL4.has(topChampion.id)) runResult.initialL4Champions.add(topChampion.id);
    const movement=decideMovement(standings);
    applyMovements(rng,clubs,standings,movement);
    for (const club of clubs) if (initialL4.has(club.id)&&club.everReachedLevel1) runResult.initialL4ReachedL1.add(club.id);
    for (const club of clubs) ageAndRetire(rng,world,club);
    for (const club of clubs) rebalanceRosterForFinances(rng,world,club);
    seasonTransfers=runMarket(rng,clubs);
    runResult.totalTransfers+=seasonTransfers;
    if (CHECKPOINTS.has(season)||season===seasons) recordCheckpoint(runResult,clubs,season,seasonTransfers);
  }
  runResult.uniqueChampions=new Set(champions).size;
  runResult.maxTitles=Math.max(...clubs.map(c=>c.titles));
  runResult.initialL4ReachedL1Count=runResult.initialL4ReachedL1.size;
  runResult.initialL4ChampionCount=runResult.initialL4Champions.size;
  delete runResult.initialL4ReachedL1; delete runResult.initialL4Champions;
  return runResult;
}
function aggregate(results,seasons) {
  const checkpoints={};
  for (const season of [...CHECKPOINTS].filter(s=>s<=seasons || s===seasons)) {
    const rows=results.map(r=>r.checkpoints[season]).filter(Boolean);
    if (!rows.length) continue;
    const avg=(key)=>average(rows.map(r=>r[key]));
    checkpoints[season]={
      medianBalance:Math.round(avg('medianBalance')),
      p10Balance:Math.round(avg('p10Balance')),
      p90Balance:Math.round(avg('p90Balance')),
      negative:round(avg('negative'),1), warning:round(avg('warning'),1), severe:round(avg('severe'),1),
      technicalGap:round(avg('technicalGap'),2), medianStrength:round(avg('medianStrength'),2), medianSalary:Math.round(avg('medianSalary')), transfers:round(avg('transfers'),1),
      medianTrainingCenter:round(avg('medianTrainingCenter'),2), medianAcademy:round(avg('medianAcademy'),2), medianVenue:round(avg('medianVenue'),2),
      balancedSalaryShare:round(avg('balancedSalaryShare'),3), balancedStaffShare:round(avg('balancedStaffShare'),3), balancedStructureShare:round(avg('balancedStructureShare'),3),
    };
  }
  return {
    checkpoints,
    uniqueChampionsMedian:percentile(results.map(r=>r.uniqueChampions),.5),
    maxTitlesAverage:round(average(results.map(r=>r.maxTitles)),2),
    initialL4ReachedL1Average:round(average(results.map(r=>r.initialL4ReachedL1Count)),2),
    initialL4ChampionAverage:round(average(results.map(r=>r.initialL4ChampionCount)),2),
    totalTransfersAverage:round(average(results.map(r=>r.totalTransfers)),1),
  };
}
function formatMoney(n) { return new Intl.NumberFormat('it-IT',{maximumFractionDigits:0}).format(n); }
function printReport(report,args) {
  console.log(`Biliardo Manager - simulazione economica ${args.runs} x ${args.seasons} stagioni`);
  console.log(`Seed base: ${args.seed}`);
  console.log('');
  for (const [season,row] of Object.entries(report.checkpoints)) {
    console.log(`S${season}: saldo mediano EUR ${formatMoney(row.medianBalance)} | p10 ${formatMoney(row.p10Balance)} | p90 ${formatMoney(row.p90Balance)} | negativi ${row.negative}/120 | <=-25k ${row.warning} | <=-50k ${row.severe} | gap ${row.technicalGap} | OVR med ${row.medianStrength} | salari med EUR ${formatMoney(row.medianSalary)} | share bilanciati ${Math.round(row.balancedSalaryShare*100)}%/${Math.round(row.balancedStaffShare*100)}%/${Math.round(row.balancedStructureShare*100)}% | trasferimenti ${row.transfers}`);
  }
  console.log('');
  console.log(`Campioni diversi in Prima (mediana): ${report.uniqueChampionsMedian}`);
  console.log(`Massimo titoli dello stesso club (media): ${report.maxTitlesAverage}/${args.seasons}`);
  console.log(`Club iniziali di Quarta arrivati in Prima (media): ${report.initialL4ReachedL1Average}/64`);
  console.log(`Club iniziali di Quarta diventati campioni di Prima (media): ${report.initialL4ChampionAverage}`);
  console.log(`Trasferimenti totali medi: ${report.totalTransfersAverage}`);
}

const args=p