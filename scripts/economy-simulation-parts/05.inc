 club.trainerLevel=t.trainer;
  club.youthCoachLevel=t.youth;
}
function runMarket(rng,clubs) {
  let transfers=0;
  const buyers=shuffle(rng,clubs);
  for (const buyer of buyers) {
    const cfg=STRATEGY_CONFIG[buyer.strategy];
    if (rng()>cfg.transferAggression || buyer.balance<=cfg.reserve*.45) continue;
    const buyerWorst=[...buyer.players].sort((a,b)=>playerOverall(a)-playerOverall(b))[0];
    if (!buyerWorst) continue;
    const candidates=[];
    for (const seller of clubs) {
      if (seller.id===buyer.id) continue;
      const sellable=[...seller.players].sort((a,b)=>playerOverall(a)-playerOverall(b)).slice(0,3);
      for (const player of sellable) {
        const improvement=playerOverall(player)-playerOverall(buyerWorst);
        if (improvement<1.2) continue;
        const price=Math.round(calculateMarketValue(player)*(0.85+rng()*.30)/100)*100;
        const projectedSalary = squadWeeklySalary(buyer) - calculatePlayerWeeklySalary(playerOverall(buyerWorst)) + calculatePlayerWeeklySalary(playerOverall(player));
        if (price<=0 || price>buyer.balance*cfg.maxBidShare || buyer.balance-price<0 || projectedSalary>expectedWeeklyIncome(buyer)*cfg.salaryShare*1.08) continue;
        candidates.push({seller,player,improvement,price});
      }
    }
    if (!candidates.length) continue;
    candidates.sort((a,b)=>(b.improvement/(b.price/10000+1))-(a.improvement/(a.price/10000+1)));
    const pick=candidates[Math.min(candidates.length-1,Math.floor(rng()*Math.min(6,candidates.length)))];
    buyer.balance-=pick.price;
    pick.seller.balance+=Math.round(pick.price*(1-TRANSFER_FEE_RATE));
    buyer.players=buyer.players.filter(p=>p.id!==buyerWorst.id);
    pick.seller.players=pick.seller.players.filter(p=>p.id!==pick.player.id);
    buyer.players.push(pick.player);
    pick.seller.players.push(buyerWorst);
    transfers+=1;
  }
  return transfers;
}
function applyMovements(rng,clubs,standings,movement) {
  const positionById=new Map();
  for (const ranked of standings.values()) ranked.forEach((club,i)=>positionById.set(club.id,i+1));
  for (const club of clubs) {
    const promoted=movement.promoted.has(club.id);
    const relegated=movement.relegated.has(club.id);
    const pos=positionById.get(club.id);
    endSeasonFanRep(club,pos,promoted,relegated);
    if (promoted) {
      club.balance += PROMOTION_PRIZES_BY_SOURCE_LEVEL[club.level] ?? 0;
      club.level-=1;
      if (club.level===1) club.everReachedLevel1=true;
    }
    if (relegated) club.level+=1;
  }
  assignGroups(rng,clubs);
}
function recordCheckpoint(runResult,clubs,season,seasonTransfers) {
  const balances=clubs.map(c=>c.balance);
  const strengths=clubs.map(clubStrength);
  const trainingLevels=clubs.map(c=>c.trainingCenterLevel);
  const academyLevels=clubs.map(c=>c.academyLevel);
  const venueLevels=clubs.map(c=>c.venueLevel);
  const balancedClubs=clubs.filter(c=>c.strategy==='balanced');
  const salaryShares=balancedClubs.map(c=>squadWeeklySalary(c)/Math.max(1,expectedWeeklyIncome(c)));
  const staffShares=balancedClubs.map(c=>(TRAINER_WEEKLY_COSTS[c.trainerLevel]+YOUTH_COACH_WEEKLY_COSTS[c.youthCoachLevel])/Math.max(1,expectedWeeklyIncome(c)));
  const structureShares=balancedClubs.map(c=>(TRAINING_CENTER_LEVELS[c.trainingCenterLevel].weeklyMaintenance+ACADEMY_LEVELS[c.academyLevel].weeklyMaintenance+VENUE_LEVELS[c.venueLevel].weeklyMaintenance)/Math.max(1,expectedWeeklyIncome(c)));
  runResult.checkpoints[season]={
    medianBalance:percentile(balances,.5), p10Balance:percentile(balances,.1), p90Balance:percentile(balances,.9),
    negative:balances.filter(v=>v<0).length, warning:balances.filter(v=>v<FINANCIAL_WARNING_BALANCE).length,
    severe:balances.filter(v=>v<CONTROLLED_ADMINISTRATION_BALANCE).length,
    technicalGap:percentile(strengths,.9)-percentile(strengths,.1),
    medianStrength:percentile(strengths,.5),
    medianSalary:percentile(clubs.map(squadWeeklySalary),.5),
    transfers:seasonTransfers,
    medianTrainingCenter:percentile(trainingLevels,.5), medianAcademy:percentile(academyLevels,.5), medianVenue:percentile(venueLevels,.5),
    balancedSalaryShare:percentile(salaryShares,.5), balancedStaffShare:percentile(staffShares,.5), balancedStructureShare:percentile(structureShares,.5),
  };
}
function simulateRun(seed,seasons) {
  const rng=mulberry32(seed);
  const world=createWorld(rng);
  const clubs=world.clubs;
  const initialL4=new Set(clubs.filter(c=>c.initialLevel===4).map(c=>c.id));
  const champions=[];
  const runResult={checkpoints:{},champions,initialL4ReachedL1:new Set(),initialL4Champions:new Set(),totalTransfers:0};
  for (let season=1; season<=seasons; season+=1) {
    for (const club of clubs) {
      club.seasonPoints=0; club.pointDiff=0; club.recentPoints=[]; club.firstLeagueChampion=false;
      adjustStaff(club); chooseStructureUpgrade(club,season);
    }
    const schedules=buildSeasonSchedules(clubs);
    let seasonTransfers=0;
    for (let week=1; week<=ECONOMY_WEEKS_PER_SEASON; week+=1