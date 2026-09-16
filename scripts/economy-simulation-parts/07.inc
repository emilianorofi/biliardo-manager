arseArgs(process.argv);
const results=[];
for (let run=0; run<args.runs; run+=1) results.push(simulateRun(args.seed+run*7919,args.seasons));
const report=aggregate(results,args.seasons);
if (args.json) {
  const payload = { args, report };
  if (args.raw) payload.runs = results.map((result) => ({
    uniqueChampions: result.uniqueChampions,
    maxTitles: result.maxTitles,
    initialL4ReachedL1Count: result.initialL4ReachedL1Count,
    initialL4ChampionCount: result.initialL4ChampionCount,
    totalTransfers: result.totalTransfers,
  }));
  console.log(JSON.stringify(payload,null,2));
} else printReport(report,args);
