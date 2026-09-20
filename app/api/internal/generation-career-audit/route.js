import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const SKILLS=["precisione","diretto","sponde","tattica","mentalita","difesa","realizzazione","creativita","misura"];
const TALENT_BANDS=[
 {label:"45-59",min:45,max:59},
 {label:"60-69",min:60,max:69},
 {label:"70-79",min:70,max:79},
 {label:"80-89",min:80,max:89},
 {label:"90-95",min:90,max:95},
];
const AGE_PROFILES={
 14:[40,42],
 15:[45,47],
 16:[50,52],
};
const ACADEMY_LEVEL=3;
const ACADEMY_BONUS=[0,2];
const SAMPLE=250;
const SCENARIOS=[
 {key:"reserve",label:"Riserva",intensity:35,trainer:80,tournamentFactor:0.15},
 {key:"regular",label:"Titolare",intensity:70,trainer:90,tournamentFactor:0.55},
 {key:"elite",label:"Elite",intensity:100,trainer:100,tournamentFactor:1},
];

export async function GET(){
 const rnd=rng(27092026);
 const results=[];
 for(const band of TALENT_BANDS){
  for(const startAge of [14,15,16]){
   for(const scenario of SCENARIOS){
    const sample=[];
    for(let i=0;i<SAMPLE;i++){
      sample.push(simulateCareer({band,startAge,scenario,rnd}));
    }
    results.push(summarize(band,startAge,scenario,sample));
   }
  }
 }
 return NextResponse.json({
  parameters:{academyLevel:ACADEMY_LEVEL,samplePerCell:SAMPLE,totalCareers:results.length*SAMPLE},
  assumptions:[
   "Giovani generati con gli stessi profili OVR per eta dell'Accademia corrente e bonus medio di Accademia livello 3.",
   "Nessuna crescita tecnica in Accademia prima della promozione, coerente con il codice attuale.",
   "Promozione appena raggiunti 16 anni.",
   "Allenamento bilanciato: ogni settimana il focus primario va alla skill piu bassa e il secondario alla seconda piu bassa.",
   "Tre percorsi di utilizzo: Riserva 35%, Titolare 70%, Elite 100%.",
   "Allenatore rispettivamente livello equivalente 3,4,5.",
   "Bonus tornei sintetico proporzionale al livello di utilizzo, con soft-cap corrente; serve a rappresentare la maggiore esposizione dei giocatori forti.",
   "Ritiro con le probabilita correnti da 50 anni in poi.",
   "Ogni carriera termina al ritiro o a 95 anni."
  ],
  results
 });
}

function simulateCareer({band,startAge,scenario,rnd}){
 const talent=randInt(band.min,band.max,rnd);
 const bonus=randInt(ACADEMY_BONUS[0],ACADEMY_BONUS[1],rnd);
 const target=randInt(AGE_PROFILES[startAge][0],AGE_PROFILES[startAge][1],rnd)+bonus;
 const dev=shuffle([-4,-3,-2,-1,0,1,2,3,4],rnd);
 const p={age:startAge,talent,experience:0};
 SKILLS.forEach((k,i)=>p[k]=target+dev[i]);
 const startOverall=overall(p);

 while(p.age<16)p.age++;

 const promotionOverall=overall(p);
 const milestones={60:null,70:null,80:null,90:null,100:null};
 let peakOverall=promotionOverall,peakAge=p.age;
 let retirementAge=null;

 for(let age=p.age;age<=95;age++){
  p.age=age;
  for(let week=0;week<15;week++){
   const ordered=[...SKILLS].sort((a,b)=>p[a]-p[b]);
   const primary=ordered[0],secondary=ordered[1];
   const gains={
    [primary]:trainingGain(p,primary,scenario.intensity,scenario.trainer,1),
    [secondary]:trainingGain(p,secondary,scenario.intensity,scenario.trainer,.5),
   };
   for(const k of SKILLS){
    const decline=weeklyDecline(p.age,p.talent,p[k]);
    p[k]=Math.max(0,p[k]+(gains[k]??0)-decline);
   }
   p.experience=Math.min(100,p.experience+(scenario.intensity>=70?.5:.22));
  }

  applySyntheticTournamentGrowth(p,scenario.tournamentFactor,rnd);

  const o=overall(p);
  for(const t of [60,70,80,90,100])if(milestones[t]==null&&o>=t)milestones[t]=age;
  if(o>peakOverall){peakOverall=o;peakAge=age}

  if(age>=50 && rnd()<retireChance(age)){
   retirementAge=age;
   break;
  }
 }
 return {talent,startAge,startOverall,promotionOverall,milestones,peakOverall,peakAge,retirementAge};
}

function applySyntheticTournamentGrowth(p,factor,rnd){
 if(factor<=0)return;
 const o=overall(p);
 let events=0;
 if(o>=60)events=2;
 if(o>=70)events=4;
 if(o>=80)events=7;
 if(o>=90)events=10;
 events=Math.round(events*factor);
 for(let i=0;i<events;i++){
  const base=o>=90?.08:o>=80?.10:o>=70?.08:.05;
  const specialty=["ITALIANA","GORIZIANA","TUTTI_DOPPI"][Math.floor(rnd()*3)];
  const weights=specialtyWeights(specialty);
  for(const k of SKILLS)p[k]+=base*weights[k]*growthMultiplier(p[k]);
 }
}

function summarize(band,startAge,scenario,sample){
 const withThreshold=t=>sample.filter(x=>x.milestones[t]!=null);
 return {
  talentBand:band.label,startAge,scenario:scenario.label,
  avgTalent:r2(avg(sample.map(x=>x.talent))),
  avgStartOverall:r2(avg(sample.map(x=>x.startOverall))),
  avgPromotionOverall:r2(avg(sample.map(x=>x.promotionOverall))),
  reached60:pctRate(withThreshold(60).length,sample.length),
  avgAge60:r2(avg(withThreshold(60).map(x=>x.milestones[60]))),
  reached70:pctRate(withThreshold(70).length,sample.length),
  avgAge70:r2(avg(withThreshold(70).map(x=>x.milestones[70]))),
  reached80:pctRate(withThreshold(80).length,sample.length),
  avgAge80:r2(avg(withThreshold(80).map(x=>x.milestones[80]))),
  reached90:pctRate(withThreshold(90).length,sample.length),
  avgAge90:r2(avg(withThreshold(90).map(x=>x.milestones[90]))),
  reached100:pctRate(withThreshold(100).length,sample.length),
  avgAge100:r2(avg(withThreshold(100).map(x=>x.milestones[100]))),
  avgPeakOverall:r2(avg(sample.map(x=>x.peakOverall))),
  p90PeakOverall:r2(percentile(sample.map(x=>x.peakOverall),.9)),
  avgPeakAge:r2(avg(sample.map(x=>x.peakAge))),
  avgRetirementAge:r2(avg(sample.map(x=>x.retirementAge).filter(x=>x!=null))),
 };
}
function overall(p){return SKILLS.reduce((s,k)=>s+p[k],0)/9}
function trainingGain(p,k,intensity,trainer,weight){
 const v=p[k],n=Math.max(0,v)/100,skill=n<=1?Math.max(.2,1-.8*n*n):Math.max(.02,.2/(n*n));
 return .9*(intensity/100)*(trainer/100)*weight*ageMult(p.age)*(.9+p.talent/500)*skill;
}
function ageMult(a){if(a<=18)return 1.45;if(a<=20)return 1.38;if(a<=22)return 1.32;if(a<=24)return 1.25;if(a<=27)return 1.16;if(a<=30)return 1.06;if(a<=33)return .98;if(a<=36)return .9;if(a<=39)return .8;if(a<=42)return .65;if(a<=45)return .55;if(a<=48)return .43;if(a<=51)return .3;if(a<=54)return .18;if(a<=57)return .09;if(a<=60)return .06;if(a<=63)return .04;if(a<=66)return .02;return .005}
function weeklyDecline(age,talent,current){const b=declineBase(age);return b*(1.1-Math.max(0,Math.min(100,talent))*.002)*(.6+Math.max(0,current)*.004)}
function declineBase(a){if(a<=40)return 0;if(a<=42)return .005;if(a<=45)return .0075;if(a<=48)return .033;if(a<=51)return .034;if(a<=54)return .035;if(a<=57)return .036;if(a<=60)return .045;if(a<=63)return .0575;if(a<=66)return .0725;if(a<=69)return .0875;if(a<=72)return .1075;if(a<=75)return .13;if(a<=78)return .155;if(a<=81)return .185;if(a<=84)return .2125;if(a<=87)return .245;if(a<=90)return .28;return .3375}
function growthMultiplier(v){if(v<60)return 1.2;if(v<70)return 1.1;if(v<80)return 1;if(v<90)return .8;if(v<95)return .55;if(v<100)return .3;if(v<105)return .12;return .05}
function specialtyWeights(s){const core=s==="ITALIANA"?new Set(["precisione","diretto"]):s==="GORIZIANA"?new Set(["precisione","sponde"]):new Set(["diretto","sponde"]);const comp=new Set(["tattica","realizzazione","misura"]);const rest=SKILLS.filter(k=>!core.has(k)&&!comp.has(k));const out={};for(const k of SKILLS)out[k]=core.has(k)?9*.5/core.size:comp.has(k)?9*.3/comp.size:9*.2/rest.length;return out}
function retireChance(a){if(a<50)return 0;if(a<=55)return .02;if(a<=60)return .03;if(a<=65)return .05;if(a<=70)return .1;if(a<=75)return .2;if(a<=80)return .4;if(a<=85)return .7;if(a<=90)return .9;return .95}
function percentile(v,p){if(!v.length)return 0;const s=[...v].sort((a,b)=>a-b);return s[Math.min(s.length-1,Math.floor((s.length-1)*p))]}
function pctRate(n,d){return d?Math.round(n/d*10000)/100:0}
function avg(v){return v.length?v.reduce((a,b)=>a+b,0)/v.length:0}
function r2(v){return Math.round(v*100)/100}
function randInt(a,b,r){return Math.floor(r()*(b-a+1))+a}
function shuffle(v,r){for(let i=v.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[v[i],v[j]]=[v[j],v[i]]}return v}
function rng(seed){let s=seed>>>0;return()=>{s+=0x6d2b79f5;let v=s;v=Math.imul(v^(v>>>15),v|1);v^=v+Math.imul(v^(v>>>7),v|61);return((v^(v>>>14))>>>0)/4294967296}}
