[++i]);
  }
  return args;
}

function mulberry32(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const round = (v, n = 0) => {
  const m = 10 ** n;
  return Math.round(v * m) / m;
};
const randomInt = (rng, min, max) => Math.floor(rng() * (max - min + 1)) + min;
const average = (xs) => xs.length ? xs.reduce((a,b)=>a+b,0)/xs.length : 0;
function percentile(values, p) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a,b)=>a-b);
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx), hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}
function shuffle(rng, values) {
  const out = [...values];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = randomInt(rng, 0, i);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
function weightedSampleWithoutReplacement(rng, items, weightFn, count) {
  const pool = [...items];
  const out = [];
  while (pool.length && out.length < count) {
    let total = 0;
    const weights = pool.map((item) => {
      const w = Math.max(0.0001, weightFn(item));
      total += w;
      return w;
    });
    let roll = rng() * total;
    let index = weights.length - 1;
    for (let i = 0; i < weights.length; i += 1) {
      roll -= weights[i];
      if (roll <= 0) { index = i; break; }
    }
    out.push(pool[index]);
    pool.splice(index, 1);
  }
  return out;
}

function calculatePlayerWeeklySalary(overall) {
  const o = clamp(overall, 0, 100);
  return Math.max(250, Math.round(250 * 1.105 ** (o - 50)));
}
function calculatePlayerBaseMarketValue(overall) {
  return 30_000 * 1.075 ** (clamp(overall, 0, 100) - 60);
}
function getAgeValueMultiplier(age) {
  if (age <= 20) return 2.3;
  if (age <= 25) return 2.1;
  if (age <= 30) return 1.8;
  if (age <= 35) return 1.55;
  if (age <= 40) return 1.3;
  if (age <= 45) return 1.15;
  if (age <= 50) return .95;
  if (age <= 55) return .75;
  if (age <= 60) return .55;
  if (age <= 65) return .4;
  if (age <= 70) return .28;
  if (age <= 75) return .18;
  return .1;
}
function calculateMarketValue(player) {
  const talentMult = .7 + clamp(player.talent, 0, 100) / 180;
  const raw = calculatePlayerBaseMarketValue(playerOverall(player)) * getAgeValueMultiplier(player.age) * talentMult;
  return Math.round(raw / 100) * 100;
}
function getAgeTrainingMultiplier(age) {
  if (age <= 18) return 1.45;
  if (age <= 20) return 1.38;
  if (age <= 22) return 1.32;
  if (age <= 24) return 1.25;
  if (age <= 27) return 1.16;
  if (age <= 30) return 1.06;
  if (age <= 33) return .98;
  if (age <= 36) return .9;
  if (age <= 39) return .8;
  if (age <= 42) return .65;
  if (age <= 45) return .55;
  if (age <= 48) return .43;
  if (age <= 51) return .30;
  if (age <= 54) return .18;
  if (age <= 57) return .09;
  if (age <= 60) return .06;
  if (age <= 63) return .04;
  if (age <= 66) return .02;
  return .005;
}
function getWeeklyDeclineBase(age) {
  if (age <= 40) return 0;
  if (age <= 42) return .005;
  if (age <= 45) return .0075;
  if (age <= 48) return .033;
  if (age <= 51) return .034;
  if (age <= 54) return .035;
  if (age <= 57) return .036;
  if (age <= 60) return .045;
  if (age <= 63) return .0575;
  if (age <= 66) return .0725;
  if (age <= 69) return .0875;
  if (age <= 72) return .1075;
  if (age <= 75) return .13;
  if (age <= 78) return .155;
  if (age <= 81) return .185;
  if (age <= 84) return .2125;
  if (age <= 87) return .245;
  if (age <= 90) return .28;
  return .3375;
}
function weeklyDecline(age, talent, current) {
  const base = getWeeklyDeclineBase(age);
  if (!base) return 0;
  const talentMultiplier = 1.1 - clamp(talent,0,100)*.002;
  const valueMultiplier = .6 + clamp(current,0,100)*.004;
  return round(base * talentMultiplier * valueMultiplier, 4);
}
function retirementChance(age) {
  if (age < 50) return 0;
  if (age <= 55) return .02;
  if (age <= 60) return .03;
  if (age <= 65) return .05;
  if (age <= 70) return .10;
  if (age <= 75) return .20;
  if (age <= 80) return .40;
  if (age <= 85) return .70;
  if (age <= 90) return .90;
  return .95;
}
function playerOverall(player) { return average(player.skills); }
function clubStrength(club) {
  const best = [...club.players].sort((a,b)=>playerOverall(b)-playerOverall(a)).slice(0,3);
  return average(best.map(playerOverall));
}
function potentialScore(player) {
  return playerOverall(player) + (player.talent - 60) * .22 + Math.max(0, 35-player.age)*.08;
}
function createSkills(rng, target) {
  const deviations = shuffle(rng, [-4,-3,-2,-1,0,1,2,3,4]);
  return deviations.map((d)=>clamp(target+d, 0, 100));
}
function createPlayer(rng, level, rosterIndex, id)