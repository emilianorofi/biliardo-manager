import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const SKILLS=["precisione","diretto","sponde","tattica","mentalita","difesa","realizzazione","creativita","misura"];
const GROWTH={
 INDIVIDUAL:{WINNER:.30,FINALIST:.24,SEMI_FINAL:.20,QUARTER_FINAL:.17,ROUND_OF_16:.12,ROUND_OF_32:.08,ROUND_OF_64:.05,ROUND_OF_128:.03},
 SPECIALTY_CUP:{WINNER:.40,FINALIST:.32,SEMI_FINAL:.28,QUARTER_FINAL:.24,ROUND_OF_16:.16,ROUND_OF_32:.11,ROUND_OF_64:.07,ROUND_OF_128:.04},
 WORLD:{WINNER:.50,FINALIST:.40,SEMI_FINAL:.35,QUARTER_FINAL:.30,ROUND_OF_16:.20,ROUND_OF_32:.15,ROUND_OF_64:.10,ROUND_OF_128:.05},
};
const TALENT={
 1:[[45,59,.78],[60,69,.17],[70,79,.045],[80,89,.005],[90,95,0]],
 2:[[45,59,.72],[60,69,.20],[70,79,.065],[80,89,.015],[90,95,0]],
 3:[[45,59,.65],[60,69,.23],[70,79,.09],[80,89,.025],[90,95,.005]],
 4:[[45,59,.58],[60,69,.25],[70,79,.12],[80,89,.04],[90,95,.01]],
 5:[[45,59,.50],[60,69,.27],[70,79,.16],[80,89,.06],[90,95,.01]],
};

export async function GET(){
 const [sourcePlayers,sourceClubs]=await Promise.all([
  prisma.player.findMany({where:{careerStatus:"ACTIVE"},select:{id:true,clubId:true,age:true,ageDays:true,talent:true,experience:true,precisione:true,diretto:true,sponde:true,tattica:true,mentalita:true,difesa:true,realizzazione:true,creativita:true,misura:true}}),
  prisma.club.findMany({select:{id:true,trainerLevel:true,youthCoachLevel:true,trainingPlan:{select:{primaryFocus:true,secondaryFocus:true}}}})
 ]);
 const seasons=20,runs=20,seed=26092026,target=sourcePlayers.length;
 const clubs=new Map(sourceClubs.map(c=>[c.id,c]));
 const buckets=Array.from({length:seasons},()=>[]);
 for(let run=0;run<runs;run++){
  const rnd=rng(seed+run*7919); let sid=-1;
  let players=sourcePlayers.map(p=>({...p,sourceId:p.id}));
  for(let season=1;season<=seasons;season++){
   trainSeason(players,clubs);
   tournaments(players,rnd);
   players.forEach(p=>p.age++);
   const survivors=[],retired=[];
   for(const p of players)(rnd()<retireChance(p.age)?retired:survivors).push(p);
   const entrants=[];
   for(let i=0;i<target-survivors.length;i++){
    const clubId=retired[i]?.clubId??sourceClubs[Math.floor(rnd()*sourceClubs.length)]?.id??null;
    entrants.push(graduate(sid--,clubId,clubs.get(clubId)?.youthCoachLevel??1,rnd));
   }
   players=[...survivors,...entrants];
   buckets[season-1].push(snapshot(players,season,retired.length,entrants.length));
  }
 }
 const rows=buckets.map((bucket,i)=>{
  const out={season:i+1}; for(const k of Object.keys(bucket[0])) if(k!=="season") out[k]=round(avg(bucket.map(r=>r[k])),2); return out;
 });
 return NextResponse.json({
  parameters:{seasons,runs,seed,startingPlayers:target,startingClubs:sourceClubs.length},
  assumptions:["Database solo letto: nessuna scrittura.","15 settimane per stagione.","Primi 3 del club al 70% di intensita, altri tesserati 35%, svincolati 15%.","Piano allenamento attuale del club; fallback Precisione/Tattica.","12 tornei individuali, Mondiale e Coppa Specialita con crescita corrente.","Forma e morale neutralizzati a 5 per isolare la deriva tecnica.","Ogni ritiro compensato da un nuovo 17enne; popolazione mantenuta costante.","Qualita nuovi giovani derivata dal livello Responsabile giovani corrente."],
  seasons:rows
 });
}
function overall(p){return SKILLS.reduce((s,k)=>s+p[k],0)/9}
function ageMult(a){if(a<=18)return 1.45;if(a<=20)return 1.38;if(a<=22)return 1.32;if(a<=24)return 1.25;if(a<=27)return 1.16;if(a<=30)return 1.06;if(a<=33)return .98;if(a<=36)return .9;if(a<=39)return .8;if(a<=42)return .65;if(a<=45)return .55;if(a<=48)return .43;if(a<=51)return .3;if(a<=54)return .18;if(a<=57)return .09;if(a<=60)return .06;if(a<=63)return .04;if(a<=66)return .02;return .005}
function declineBase(a){if(a<=40)return 0;if(a<=42)return .005;if(a<=45)return .0075;if(a<=48)return .033;if(a<=51)return .034;if(a<=54)return .035;if(a<=57)return .036;if(a<=60)return .045;if(a<=63)return .0575;if(a<=66)return .0725;if(a<=69)return .0875;if(a<=72)return .1075;if(a<=75)return .13;if(a<=78)return .155;if(a<=81)return .185;if(a<=84)return .2125;if(a<=87)return .245;if(a<=90)return .28;return .3375}
function gain(p,k,intensity,trainer,weight){const v=p[k],skill=Math.max(v/100<=1?.2:0,.2);const n=v/100;const sm=n<=1?Math.max(.2,1-.8*n*n):Math.max(.02,.2/(n*n));return .9*(intensity/100)*(trainer/100)*weight*ageMult(p.age)*(.9+p.talent/100*.2)*sm}
function trainSeason(players,clubs){
 for(let w=0;w<15;w++){
  const ranks=ranked(players);
  for(const p of players){
   const c=clubs.get(p.clubId),plan=c?.trainingPlan; const primary=SKILLS.includes(plan?.primaryFocus)?plan.primaryFocus:"precisione"; let secondary=SKILLS.includes(plan?.secondaryFocus)?plan.secondaryFocus:"tattica";if(secondary===primary)secondary=primary==="tattica"?"precisione":"tattica";
   const rank=ranks.get(p.id)??99,intensity=p.clubId==null?15:rank<=3?70:35,trainer=({1:60,2:70,3:80,4:90,5:100})[c?.trainerLevel??1]??60;
   const gs={[primary]:gain(p,primary,intensity,trainer,1),[secondary]:gain(p,secondary,intensity,trainer,.5)};
   for(const k of SKILLS){const d=declineBase(p.age)*(1.1-Math.max(0,Math.min(100,p.talent))*.002)*(.6+Math.max(0,p[k])*.004);p[k]=round(Math.max(0,p[k]+(gs[k]??0)-d),3)}
   p.experience=Math.min(100,p.experience+(intensity>=70?.55:intensity>=30?.25:.1));
  }
 }
}
function tournaments(players,rnd){
 for(const s of ["ITALIANA","GORIZIANA","TUTTI_DOPPI","ITALIANA","GORIZIANA","TUTTI_DOPPI","ITALIANA","GORIZIANA","TUTTI_DOPPI","ITALIANA","GORIZIANA","TUTTI_DOPPI"]) knockout([...players].sort((a,b)=>overall(b)-overall(a)).slice(0,256),s,"INDIVIDUAL",rnd);
 knockout([...players].sort((a,b)=>overall(b)-overall(a)).slice(0,256),null,"WORLD",rnd);
 const g={ITALIANA:[],GORIZIANA:[],TUTTI_DOPPI:[]};for(const p of players.filter(p=>p.clubId!=null))g[best(p)].push(p);for(const s of Object.keys(g))knockout(g[s],s,"SPECIALTY_CUP",rnd);
}
function specialty(p,s){return s==="ITALIANA"?(p.precisione+p.diretto)/2:s==="GORIZIANA"?(p.precisione+p.sponde)/2:(p.diretto+p.sponde)/2}
function performance(p,s){return specialty(p,s)+Math.max(0,Math.min(100,p.experience))*.025}
function best(p){return ["ITALIANA","GORIZIANA","TUTTI_DOPPI"].sort((a,b)=>specialty(p,b)-specialty(p,a))[0]}
function knockout(entrants,s,tier,rnd){if(entrants.length<2)return;let a=shuffle([...entrants],rnd);while(a.length>1){const n=[],size=a.length;for(let i=0;i<a.length;i+=2){const x=a[i],y=a[i+1];if(!y){n.push(x);continue}const sp=s??["ITALIANA","GORIZIANA","TUTTI_DOPPI"][Math.floor(rnd()*3)],p=Math.max(.08,Math.min(.92,.5+(performance(x,sp)-performance(y,sp))*.015)),win=rnd()<p?x:y,lose=win===x?y:x,place=placement(size);if(place)grow(lose,GROWTH[tier][place]);n.push(win)}a=n}grow(a[0],GROWTH[tier].WINNER)}
function placement(n){if(n<=2)return"FINALIST";if(n<=4)return"SEMI_FINAL";if(n<=8)return"QUARTER_FINAL";if(n<=16)return"ROUND_OF_16";if(n<=32)return"ROUND_OF_32";if(n<=64)return"ROUND_OF_64";if(n<=128)return"ROUND_OF_128";return null}
function grow(p,v){for(const k of SKILLS)p[k]=round(p[k]+v,3)}
function retireChance(a){if(a<50)return 0;if(a<=55)return .02;if(a<=60)return .03;if(a<=65)return .05;if(a<=70)return .1;if(a<=75)return .2;if(a<=80)return .4;if(a<=85)return .7;if(a<=90)return .9;return .95}
function graduate(id,clubId,level,rnd){level=Math.max(1,Math.min(5,Math.round(level)));const o=50+Math.floor(rnd()*5)+Math.max(0,level-1),dev=shuffle([-4,-3,-2,-1,0,1,2,3,4],rnd);let roll=rnd(),cum=0,talent=55;for(const [lo,hi,p] of TALENT[level]){cum+=p;if(roll<cum){talent=lo+Math.floor(rnd()*(hi-lo+1));break}}const x={id,sourceId:null,clubId,age:17,ageDays:0,talent,experience:7};SKILLS.forEach((k,i)=>x[k]=o+dev[i]);return x}
function salary(o){return Math.max(250,Math.round(250*Math.pow(1.105,o-50)))}
function value(p){const o=overall(p),base=30000*Math.pow(1.075,o-60),a=p.age<=20?2.3:p.age<=25?2.1:p.age<=30?1.8:p.age<=35?1.55:p.age<=40?1.3:p.age<=45?1.15:p.age<=50?.95:p.age<=55?.75:p.age<=60?.55:p.age<=65?.4:p.age<=70?.28:p.age<=75?.18:.1,t=.7+p.talent/180;return Math.round(base*a*t/100)*100}
function snapshot(players,season,retired,entrants){const r=[...players].sort((a,b)=>overall(b)-overall(a)),os=r.map(overall),top=r.slice(0,10),sal=r.map(p=>salary(overall(p))),val=r.map(value);return{season,players:players.length,avgOverall:avg(os),medianOverall:pct(os,.5),top10Average:avg(top.map(overall)),p90Overall:pct(os,.9),p99Overall:pct(os,.99),maxOverall:os[0]??0,avgAge:avg(players.map(p=>p.age)),avgTop10Age:avg(top.map(p=>p.age)),over80:os.filter(v=>v>=80).length,over90:os.filter(v=>v>=90).length,over100:os.filter(v=>v>=100).length,retired,entrants,avgSalary:avg(sal),maxSalary:Math.max(...sal,0),avgValue:avg(val),maxValue:Math.max(...val,0)}}
function ranked(players){const m=new Map(),g=new Map();for(const p of players){if(p.clubId==null)continue;const a=g.get(p.clubId)??[];a.push(p);g.set(p.clubId,a)}for(const a of g.values())a.sort((x,y)=>overall(y)-overall(x)).forEach((p,i)=>m.set(p.id,i+1));return m}
function pct(v,p){const s=[...v].sort((a,b)=>a-b);return s.length?s[Math.min(s.length-1,Math.floor((s.length-1)*p))]:0}
function avg(v){return v.length?v.reduce((a,b)=>a+b,0)/v.length:0}
function shuffle(v,r){for(let i=v.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[v[i],v[j]]=[v[j],v[i]]}return v}
function rng(seed){let s=seed>>>0;return()=>{s+=0x6d2b79f5;let v=s;v=Math.imul(v^(v>>>15),v|1);v^=v+Math.imul(v^(v>>>7),v|61);return((v^(v>>>14))>>>0)/4294967296}}
function round(v,d=2){const f=10**d;return Math.round(v*f)/f}
