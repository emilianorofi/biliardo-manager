bStrength(home)-clubStrength(away);
  const p=clamp(.5 + diff * .015, .08, .92);
  let h=0;
  for (let i=0;i<6;i+=1) if (rng()<p) h+=1;
  return [h,6-h];
}
function updateRecent(club, points) {
  club.recentPoints.push(points);
  if (club.recentPoints.length>5) club.recentPoints.shift();
}
function settleWeeklyCosts(club) {
  const salary=club.players.reduce((sum,p)=>sum+calculatePlayerWeeklySalary(playerOverall(p)),0);
  const expenses = salary + TRAINER_WEEKLY_COSTS[club.trainerLevel] + YOUTH_COACH_WEEKLY_COSTS[club.youthCoachLevel] +
    TRAINING_CENTER_LEVELS[club.trainingCenterLevel].weeklyMaintenance + ACADEMY_LEVELS[club.academyLevel].weeklyMaintenance +
    VENUE_LEVELS[club.venueLevel].weeklyMaintenance + LEAGUE_ECONOMY[club.level].clubManagementWeekly;
  club.balance -= expenses;
  club.balance += sponsorIncome(club);
}
function completePendingUpgrade(club, week) {
  if (club.pendingUpgrade && week>=club.pendingUpgrade.completeWeek) {
    club[club.pendingUpgrade.field]=club.pendingUpgrade.targetLevel;
    club.pendingUpgrade=null;
  }
}
function calculateTrainingGain(age,talent,current,intensity,trainerEfficiency,focusWeight,centerBonus) {
  const ageMult=getAgeTrainingMultiplier(age);
  const talentMult=.9+clamp(talent,0,100)/100*.2;
  const normalized=clamp(current,0,100)/100;
  const skillMult=normalized>=1?0:1-.8*normalized**2;
  const gain=BASE_WEEKLY_GAIN*(intensity/100)*(trainerEfficiency/100)*focusWeight*ageMult*talentMult*skillMult;
  return Math.max(0,gain)*(1+centerBonus);
}
function trainClub(rng, club, season, week) {
  const selection=[...club.players].sort((a,b)=>{
    const aScore=playerOverall(a)+(a.talent-60)*.025+Math.max(0,30-a.age)*.03+rng()*.3;
    const bScore=playerOverall(b)+(b.talent-60)*.025+Math.max(0,30-b.age)*.03+rng()*.3;
    return bScore-aScore;
  });
  const starters=new Set(selection.slice(0,3).map(p=>p.id));
  const primary=(club.id+season*2+week)%SKILL_COUNT;
  const secondary=(primary+3+(club.id%4))%SKILL_COUNT;
  const efficiency=TRAINER_EFFICIENCY[club.trainerLevel];
  const centerBonus=TRAINING_CENTER_LEVELS[club.trainingCenterLevel].growthBonus;
  for (const p of club.players) {
    const intensity=starters.has(p.id)?100:15;
    const gains=Array(SKILL_COUNT).fill(0);
    gains[primary]=calculateTrainingGain(p.age,p.talent,p.skills[primary],intensity,efficiency,1,centerBonus);
    gains[secondary]=calculateTrainingGain(p.age,p.talent,p.skills[secondary],intensity,efficiency,.5,centerBonus);
    for (let s=0;s<SKILL_COUNT;s+=1) {
      const decline=weeklyDecline(p.age,p.talent,p.skills[s]);
      p.skills[s]=round(clamp(p.skills[s]+gains[s]-decline,0,100),3);
    }
  }
}
function academyIntake(rng, world, club) {
  const candidate=createAcademyCandidate(rng,club,world.nextPlayerId++);
  club.academy.push(candidate);
  club.academy.sort((a,b)=>potentialScore(b)-potentialScore(a));
  if (club.academy.length>10) club.academy.length=10;
}
function awardTournament(rng, clubs, prizes) {
  const players=clubs.flatMap(c=>c.players.map(p=>({player:p,club:c}))).sort((a,b)=>playerOverall(b.player)-playerOverall(a.player)).slice(0,256);
  const selected=weightedSampleWithoutReplacement(rng,players,(entry)=>Math.exp((playerOverall(entry.player)-55)/9),8);
  selected.forEach((entry,index)=>{ entry.club.balance+=prizes[index]; });
}
function runIndividualTournaments(rng,clubs) {
  for (let i=0;i<12;i+=1) awardTournament(rng,clubs,INDIVIDUAL_TOURNAMENT_PRIZES);
  awardTournament(rng,clubs,WORLD_CHAMPIONSHIP_PRIZES);
}
function rankGroups(clubs) {
  const standings=new Map();
  for (const level of [1,2,3,4]) {
    for (let group=0; group<LEVEL_GROUP_COUNTS[level]; group+=1) {
      const ranked=clubs.filter(c=>c.level===level&&c.group===group).sort((a,b)=>b.seasonPoints-a.seasonPoints || b.pointDiff-a.pointDiff || clubStrength(b)-clubStrength(a));
      standings.set(`${level}:${group}`,ranked);
    }
  }
  return standings;
}
function applySeasonPrizes(standings) {
  for (const [key, ranked] of standings.entries()) {
    const level=Number(key.split(':')[0]);
    for (let pos=1;pos<=3;pos+=1) ranked[pos-1].balance += LEAGUE_POSITION_PRIZES[level][pos];
  }
}
function decideMovement(standings) {
  const promoted=new Set(), relegated=new Set();
  for (const [key, ranked] of standings.entries()) {
    const level=Number(key.split(':')[0]);
    if (level>=2) promoted.add(ranked[0].id);
    if (level<=3) { relegated.add(ranked[6].id); relegated.add(ranked[7].id); }
  }
  return {promoted,relegated};
}
function endSeasonFanRep(club, position, promoted, relegated) {
  club.fans=normalizeFans(club.fans+FAN_SEASON_POSITION_CHANGES[position]+(promoted?FAN_PROMOTION_CHANGE:0)+(relegated?FAN_RELEGATION_CHANGE:0));
  club.reputation=normalizeReputation(club.reputation+REPUTATION_SEASON_POSITION_CHANGES[position]+(promoted?REPUTATION_PROMOTION_CHANGE:0)+(relegated?REPUTATION_RELEGATION_CHANGE:0)+(club.level===1&&position===1?FIRST_LEAGUE_CHAMPION_REPUTATION_BONUS:0));
}
function ageAn