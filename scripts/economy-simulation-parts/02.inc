 {
  const target = LEVEL_OVERALLS[level][rosterIndex % 5] + randomInt(rng,-2,2);
  const ageRange = AGE_RANGES[rosterIndex % AGE_RANGES.length];
  const age = randomInt(rng, ageRange[0], ageRange[1]);
  const talent = rosterIndex % 5 === 4 ? randomInt(rng,72,88) : randomInt(rng,58,78);
  return { id, age, talent, skills:createSkills(rng,target) };
}
function createAcademyCandidate(rng, club, id) {
  const age = randomInt(rng,14,16);
  const baseRange = age===14 ? [40,42] : age===15 ? [45,47] : [50,52];
  const academy = ACADEMY_LEVELS[club.academyLevel];
  const base = randomInt(rng,baseRange[0],baseRange[1]);
  const bonus = randomInt(rng,academy.overallBonus[0],academy.overallBonus[1]);
  const roll = rng();
  let cumulative = 0;
  let band = ACADEMY_TALENT_BANDS[club.academyLevel][0];
  for (const candidateBand of ACADEMY_TALENT_BANDS[club.academyLevel]) {
    cumulative += candidateBand[2];
    if (roll < cumulative) { band = candidateBand; break; }
  }
  const talent = randomInt(rng,band[0],band[1]);
  return { id, age, talent, skills:createSkills(rng,base+bonus) };
}
function createFreeAgent(rng, level, id) {
  const target = LEVEL_OVERALLS[level][3] + randomInt(rng,-3,1);
  return { id, age:randomInt(rng,18,32), talent:randomInt(rng,55,74), skills:createSkills(rng,target) };
}

function normalizeFans(v) { return clamp(Math.round(v), FAN_LIMITS.minimum, FAN_LIMITS.maximum); }
function normalizeReputation(v) { return clamp(Math.round(v), 1, 100); }
function sponsorIncome(club) {
  const econ = LEAGUE_ECONOMY[club.level];
  const reputation = clamp(1 + (club.reputation - 40) * .004, .92, 1.08);
  const fans = clamp(1 + (club.fans - 90) / 1600, .95, 1.05);
  const recent = average(club.recentPoints.length ? club.recentPoints : [3]);
  const form = clamp(1 + (recent - 3) * .01, .97, 1.03);
  return Math.round(econ.sponsorWeekly * clamp(reputation*fans*form,.85,1.15));
}
function gateIncome(home, away) {
  const econ = LEAGUE_ECONOMY[home.level];
  const fanMult = clamp(1+(home.fans-90)/800,.9,1.1);
  const repMult = clamp(1+(home.reputation-40)*.0025,.95,1.05);
  const recent = average(home.recentPoints.length ? home.recentPoints : [3]);
  const formMult = clamp(1+(recent-3)/60,.95,1.05);
  const oppMult = clamp(1+(away.reputation-40)*.0035,.95,1.1);
  const interest = clamp(fanMult*repMult*formMult*oppMult,.8,1.25);
  return Math.round(econ.homeGateBase * interest * (1+VENUE_LEVELS[home.venueLevel].gateBonus));
}

function strategyForSequence(sequence) {
  const x = sequence % 20;
  return x < 4 ? 'saver' : x < 15 ? 'balanced' : 'contender';
}
function initialTrainerLevel(sequence) { return Math.max(1, 4 - Math.floor(sequence/32)); }
function initialYouthLevel(sequence) { return Math.max(1, 3 - Math.floor(sequence/64)); }
function createWorld(rng) {
  const clubs = [];
  let playerId = 1;
  for (let sequence=0; sequence<120; sequence+=1) {
    const level = sequence<8 ? 1 : sequence<24 ? 2 : sequence<56 ? 3 : 4;
    const club = {
      id: sequence+1,
      initialLevel: level,
      level,
      group:0,
      strategy: strategyForSequence(sequence),
      balance: NEW_MANAGER_STARTING_BALANCE,
      fans: normalizeFans(Math.round(Math.max(100,1400-sequence*8)/10)),
      reputation: Math.max(1,55-Math.floor(sequence/8)*2),
      trainerLevel: initialTrainerLevel(sequence),
      youthCoachLevel: initialYouthLevel(sequence),
      trainingCenterLevel:1,
      academyLevel:1,
      venueLevel:1,
      pendingUpgrade:null,
      recentPoints:[],
      players:[],
      academy:[],
      seasonPoints:0,
      pointDiff:0,
      titles:0,
      everReachedLevel1: level===1,
      firstLeagueChampion:false,
    };
    for (let r=0;r<6;r+=1) club.players.push(createPlayer(rng,level,r,playerId++));
    clubs.push(club);
  }
  assignGroups(rng,clubs);
  return { clubs, nextPlayerId: playerId };
}
function assignGroups(rng, clubs) {
  for (const level of [1,2,3,4]) {
    const levelClubs = shuffle(rng, clubs.filter(c=>c.level===level));
    levelClubs.forEach((club,index)=>{ club.group=Math.floor(index/8); });
  }
}
function roundRobinSchedule(clubs) {
  const ids = clubs.map(c=>c.id);
  const rounds=[];
  let arr=[...ids];
  for (let r=0;r<7;r+=1) {
    const pairs=[];
    for (let i=0;i<4;i+=1) {
      let a=arr[i], b=arr[7-i];
      if ((r+i)%2===1) [a,b]=[b,a];
      pairs.push([a,b]);
    }
    rounds.push(pairs);
    arr=[arr[0],arr[7],...arr.slice(1,7)];
  }
  for (let r=0;r<7;r+=1) rounds.push(rounds[r].map(([a,b])=>[b,a]));
  return rounds;
}
function buildSeasonSchedules(clubs) {
  const byRound = Array.from({length:14},()=>[]);
  for (const level of [1,2,3,4]) {
    for (let group=0; group<LEVEL_GROUP_COUNTS[level]; group+=1) {
      const groupClubs=clubs.filter(c=>c.level===level && c.group===group);
      const rr=roundRobinSchedule(groupClubs);
      rr.forEach((matches,round)=>byRound[round].push(...matches));
    }
  }
  return byRound;
}
function matchScore(rng, home, away) {
  const diff=clu