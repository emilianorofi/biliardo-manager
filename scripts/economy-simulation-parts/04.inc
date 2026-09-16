dRetire(rng,world,club) {
  const survivors=[];
  for (const p of club.players) {
    p.age+=1;
    if (rng()>=retirementChance(p.age)) survivors.push(p);
  }
  club.players=survivors;
  for (const p of club.academy) p.age+=1;
  club.academy.sort((a,b)=>potentialScore(b)-potentialScore(a));
  const promotable=club.academy.filter(p=>p.age>=17);
  for (const candidate of promotable) {
    const weakest=[...club.players].sort((a,b)=>potentialScore(a)-potentialScore(b))[0];
    const forced=candidate.age>=18;
    const improves=!weakest || potentialScore(candidate)>potentialScore(weakest)+1.5;
    if ((club.players.length<6 || improves || (forced && potentialScore(candidate)>potentialScore(weakest)-1)) && club.players.length<7) {
      club.players.push(candidate);
      club.academy=club.academy.filter(p=>p.id!==candidate.id);
    } else if (forced) {
      club.academy=club.academy.filter(p=>p.id!==candidate.id);
    }
  }
  club.players.sort((a,b)=>potentialScore(b)-potentialScore(a));
  if (club.players.length>6) club.players.length=6;
  while (club.players.length<6) club.players.push(createFreeAgent(rng,club.level,world.nextPlayerId++));
}

function expectedWeeklyIncome(club) {
  const sponsor=sponsorIncome(club);
  const gate=LEAGUE_ECONOMY[club.level].homeGateBase*(1+VENUE_LEVELS[club.venueLevel].gateBonus)*(7/15);
  return sponsor+gate;
}
function squadWeeklySalary(club) {
  return club.players.reduce((sum,p)=>sum+calculatePlayerWeeklySalary(playerOverall(p)),0);
}
function rebalanceRosterForFinances(rng,world,club) {
  const cfg=STRATEGY_CONFIG[club.strategy];
  const salary=squadWeeklySalary(club);
  const budget=expectedWeeklyIncome(club)*cfg.salaryShare;
  const pressure=club.balance<0 || salary>budget;
  if (!pressure) return;
  const replaceCount=club.balance<CONTROLLED_ADMINISTRATION_BALANCE?2:1;
  for (let n=0;n<replaceCount;n+=1) {
    if (!club.players.length) break;
    const candidates=[...club.players].sort((a,b)=>{
      const ac=calculatePlayerWeeklySalary(playerOverall(a))/(potentialScore(a)+1);
      const bc=calculatePlayerWeeklySalary(playerOverall(b))/(potentialScore(b)+1);
      return bc-ac;
    });
    const outgoing=candidates[0];
    const academyChoice=[...club.academy].filter(p=>p.age>=16).sort((a,b)=>potentialScore(b)-potentialScore(a))[0];
    let replacement=academyChoice;
    if (!replacement || playerOverall(replacement)<playerOverall(outgoing)-14) replacement=createFreeAgent(rng,club.level,world.nextPlayerId++);
    club.players=club.players.filter(p=>p.id!==outgoing.id);
    if (academyChoice && replacement.id===academyChoice.id) club.academy=club.academy.filter(p=>p.id!==academyChoice.id);
    club.players.push(replacement);
  }
}

function targetStaff(club) {
  const strength=club.strategy==='contender'?1:club.strategy==='balanced'?0:-1;
  const baseTrainer={1:4,2:4,3:3,4:2}[club.level];
  const baseYouth={1:3,2:3,3:2,4:2}[club.level];
  let trainer=clamp(baseTrainer+strength,1,5);
  let youth=clamp(baseYouth+(strength>0?1:0),1,5);
  if (club.balance<20_000) { trainer=Math.max(1,trainer-1); youth=Math.max(1,youth-1); }
  if (club.balance<0) { trainer=Math.max(1,trainer-1); youth=1; }
  return {trainer,youth};
}
function chooseStructureUpgrade(club,season) {
  if (club.pendingUpgrade || club.balance<0) return;
  const config=STRATEGY_CONFIG[club.strategy];
  const order=club.strategy==='contender' ? ['trainingCenterLevel','academyLevel','venueLevel'] : club.strategy==='saver' ? ['venueLevel','academyLevel','trainingCenterLevel'] : ((season+club.id)%3===0?['academyLevel','venueLevel','trainingCenterLevel']:['trainingCenterLevel','venueLevel','academyLevel']);
  const tables={trainingCenterLevel:TRAINING_CENTER_LEVELS,academyLevel:ACADEMY_LEVELS,venueLevel:VENUE_LEVELS};
  for (const field of order) {
    const current=club[field];
    if (current>=5) continue;
    const target=current+1;
    const data=tables[field][target];
    const adjustedReserve=config.reserve + (club.level-1)*8_000;
    const currentWeeklyMaintenance = TRAINING_CENTER_LEVELS[club.trainingCenterLevel].weeklyMaintenance + ACADEMY_LEVELS[club.academyLevel].weeklyMaintenance + VENUE_LEVELS[club.venueLevel].weeklyMaintenance;
    const projectedWeeklyMaintenance = currentWeeklyMaintenance - tables[field][current].weeklyMaintenance + data.weeklyMaintenance;
    const salary = squadWeeklySalary(club);
    const projectedOtherCosts = TRAINER_WEEKLY_COSTS[club.trainerLevel] + YOUTH_COACH_WEEKLY_COSTS[club.youthCoachLevel] + LEAGUE_ECONOMY[club.level].clubManagementWeekly + projectedWeeklyMaintenance;
    const affordableWeekly = expectedWeeklyIncome(club) - salary - projectedOtherCosts > -1_000;
    if (club.balance >= data.upgradeCost + adjustedReserve && affordableWeekly) {
      club.balance -= data.upgradeCost;
      club.pendingUpgrade={field,targetLevel:target,completeWeek:Math.max(1,Math.ceil(data.upgradeDays/7))};
      return;
    }
  }
}
function adjustStaff(club) {
  const t=targetStaff(club);
 