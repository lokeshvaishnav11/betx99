// // const express = require("express");
// // const Redis = require("ioredis");
// // const http = require("http");
// // const { Server } = require("socket.io");
// // const mongoose = require("mongoose");
// // const axios = require("axios").default;

// // const Match = require("./models/Match.model");

// // const dsn ="mongodb://chero:chero0908nitin@62.72.58.167:27017/nchero?authSource=admin&replicaSet=rs0";
  

// // const app = express();
// // const server = http.createServer(app);

// // const io = new Server(server, {
// //   cors: {
// //     origin: "*",
// //     methods: ["GET", "POST"],
// //   },
// // });

// // app.use(express.json());

// // // ---------------- DB Connection ----------------
// // const setConnection = async () => {
// //   try {
// //     await mongoose.connect(dsn);
// //     console.log("✅ DataBase Connected Successfully");
// //   } catch (err) {
// //     console.log("❌ error in connecting DataBase", err);
// //     process.exit(1);
// //   }
// // };

// // // ---------------- Redis Connection ----------------
// // const publisher = new Redis({
// //   host: "127.0.0.1",
// //   port: 6379,
// // });

// // publisher.on("connect", () => {
// //   console.log("✅ Successfully connected to Redis");
// // });

// // publisher.on("error", (err) => {
// //   console.log("❌ Redis error:", err?.message || err);
// // });

// // // ---------------- In-memory store ----------------
// // let matches = []; // active matches list
// // const FancyData = {}; // FancyData[matchId] = array

// // // ---------------- Fetch active matches ----------------
// // const getMatches = async () => {
// //   try {
// //     const list = await Match.find({ active: true }).lean();
// //     matches = list || [];
// //     // console.log("Active matches:", matches.length);
// //   } catch (err) {
// //     console.log("❌ error in fetching matches:", err?.message || err);
// //   }
// // };

// // // ---------------- Fetch Fancy API Data ----------------
// // const getFancyDataApi = async () => {
// //   try {
// //     if (!matches || matches.length === 0) return;

// //     // parallel requests (but safe)
// //     await Promise.all(
// //       matches.map(async (m) => {
// //         try {
// //           // const url = `http://130.250.191.212:3009/getPriveteData?gmid=${m?.matchId}&sid=${m?.sportId}&key=dijbfuwd719e12rqhfbjdqdnkqnd11eqdqdnkanknakn`;

// //           const res = await axios.get(
// //           `https://docs.vkmster.com/sportapi/privateData?sportsid=4&gmid=${m.matchId}`,        {
// //           headers: {
// //             "x-api-key": "a3f41cc1eff0e0609f70b738d9e9d6cfda7b7465",
// //             "x-api-secret":
// //               "06926b1891e99df1dd28f123c4935cfb87d07e4b9641f21ac99bc6f31263f946",
// //           },
// //         }
// //       )  

// //           FancyData[m?.matchId] = res?.data?.data?.data || [];
// //         } catch (err) {
// //           console.log(
// //             `❌ Fancy API error matchId=${m?.matchId}:`,
// //             err?.message || err
// //           );
// //         }
// //       })
// //     );
// //   } catch (err) {
// //     console.log("❌ getFancyDataApi error:", err?.message || err);
// //   }
// // };

// // // ---------------- Format fancy + Redis store + socket emit ----------------
// // const formattedFancyData = async () => {
// //   try {
// //     if (!matches || matches.length === 0) return;

// //     for (const m of matches) {
// //       const data = FancyData[m.matchId];

// //       if (!data || !Array.isArray(data) || data.length === 0) continue;

// //       // ✅ FIXED FILTER (must be &&)
// //       const fancydata = data
// //        .filter(
// //   (fb) =>
// //     !fb.mname.includes("Bookmaker") &&
// //     fb.mname !== "MATCH_ODDS" &&
// //     fb.mname !== "TIED_MATCH" &&
// //     fb.gtype !== "cricketcasino"
// // )
// //         .flatMap((f) =>
// //           (f.section || []).map((fa) => ({
// //             BackPrice1: fa?.odds?.[0]?.odds || 0,
// //             BackPrice2: 0,
// //             BackPrice3: 0,
// //             BackSize1: fa?.odds?.[0]?.size || 0,
// //             BackSize2: 0,
// //             BackSize3: 0,

// //             LayPrice1: fa?.odds?.[1]?.odds || 0,
// //             LayPrice2: 0,
// //             LayPrice3: 0,
// //             LaySize1: fa?.odds?.[1]?.size || 0,
// //             LaySize2: 0,
// //             LaySize3: 0,

// //             RunnerName: fa?.nat,
// //             SelectionId: fa?.sid,

// //             ballsess: "1",
// //             gtype: f?.gtype,
// //             GameStatus: fa?.gstatus,
// //             gtstatus: fa?.gstatus,

// //             max: "50000",
// //             min: "100",
// //             remm: "",
// //             srno: fa?.sno?.toString(),
// //             mname: f?.mname,
// //           }))
// //         );

// //       const redisKey = `fancy-${m.matchId}`;

// //       // previous fancy from redis
// //       const previousFancyStr = await publisher.get(redisKey);
// //       let pfancy = [];
// //       if (previousFancyStr) {
// //         try {
// //           pfancy = JSON.parse(previousFancyStr);
// //         } catch (e) {
// //           pfancy = [];
// //         }
// //       }

// //       const currentSelectionIds = new Set(
// //         fancydata.map((item) => item.SelectionId)
// //       );
// //       const previousSelectionIds = new Set(
// //         pfancy.map((item) => item.SelectionId)
// //       );

// //       // Emit new fancy added
// //       for (const item of fancydata) {
// //         if (!previousSelectionIds.has(item.SelectionId)) {
// //           io.emit("newFancyAdded", {
// //             fancy: { matchId: m.matchId, ...item },
// //             matchId: m.matchId,
// //           });
// //         }
// //       }

// //       // Emit deactivated fancy
// //       const deactivated = pfancy.filter(
// //         (oldItem) => !currentSelectionIds.has(oldItem.SelectionId)
// //       );

// //       if (deactivated.length > 0) {
// //         io.emit("deactivateFancy", {
// //           [m.matchId]: deactivated.map((d) => d.SelectionId?.toString()),
// //         });
// //       }

// //       // Save updated fancy to Redis
// //       await publisher.set(redisKey, JSON.stringify(fancydata));
// //       console.log(`✅ Saved ${redisKey} to Redis`);
// //     }
// //   } catch (err) {
// //     console.log("❌ formattedFancyData error:", err?.message || err);
// //   }
// // };

// // // ---------------- BookMaker Odds Data ----------------
// // const BookMakerOddsData = async () => {
// //   try {
// //     if (!matches || matches.length === 0) return;

// //     for (const m of matches) {
// //       const allFancy = FancyData[m.matchId];
// //       if (!allFancy || !Array.isArray(allFancy)) continue;

// //       // Bookmaker / match type
// //       const bData = allFancy.filter((x) => {
// //         const gtype = (x?.gtype || "").toLowerCase();

// //         return (
// //           gtype.includes("match") ||
// //           gtype.includes("cricketcasino")
// //         );
// //       });


// //       if (!bData || bData.length === 0) continue;

// //       for (const Data of bData) {
// //         try {
// //           const transformRunners = (inputRunners) => {
// //             return {
// //               runners: (inputRunners || []).map((runner) => {
// //                 const oddsArr = runner?.odds || [];

// //                 const backOdds = oddsArr.filter((odd) => odd.otype === "back");
// //                 const layOdds = oddsArr.filter((odd) => odd.otype === "lay");

// //                 const backoddsmain = [...backOdds]
// //                   .reverse()
// //                   .map((x) => ({ size: x.size, price: x.odds  })); //x.odds 

// //                 const layoddsmain = layOdds.map((x) => ({
// //                   size: x.size,
// //                   price: x.odds,
// //                 }));

// //                 return {
// //                   selectionId: runner.sid,
// //                   status: runner.gstatus.toUpperCase(),
// //                   lastPriceTraded: null,
// //                   runnerName: runner.nat,
// //                   totalMatched: 0,
// //                   ex: {
// //                     availableToBack: backoddsmain,
// //                     availableToLay: layoddsmain,
// //                   },
// //                 };
// //               }),
// //             };
// //           };

// //           const output = transformRunners(Data?.section);

// //           const marketPayload = {
// //             ...Data,
// //             runners: output.runners,
// //             marketName: Data?.mname,
// //             marketId: Data?.mid?.toString(),
// //             matchId: Data?.gmid?.toString(),
// //           };

// //           if (!marketPayload.marketId) continue;

// //           const jsonMessage = JSON.stringify(marketPayload);

// //           await publisher.set(`odds-market-${marketPayload.marketId}`, jsonMessage);
// //           publisher.publish("getMarketData", jsonMessage);
// //         } catch (err) {
// //           console.log(
// //             `❌ BookMakerOddsData matchId=${m.matchId} error:`,
// //             err?.message || err
// //           );
// //         }
// //       }
// //     }
// //   } catch (err) {
// //     console.log("❌ BookMakerOddsData error:", err?.message || err);
// //   }
// // };

// // const getPendingFancyList = async () => {
// //   try {
// //     const { data } = await axios.get(
// //       "https://napi.A2Z.online/api/get-business-fancy-list"
// //     );
// //     console.log("lokesh")
// //     return data?.data?.list || [];
// //   } catch (e) {
// //     console.log("Pending Fancy Error", e.message);
// //     return [];
// //   }
// // };

// // const groupFancyByMatch = (list) => {
// //   return list.reduce((acc, item) => {
// //     if (!acc[item.matchId]) {
// //       acc[item.matchId] = [];
// //     }

// //     acc[item.matchId].push(item);

// //     return acc;
// //   }, {});
// // };

// // const getProviderResult = async (matchId) => {
// //   try {
// //     const { data } = await axios.get(
// //           `https://docs.vkmster.com/sportapi/sportsResult?sportsid=4&gmid=${matchId}`,        {
// //           headers: {
// //             "x-api-key": "a3f41cc1eff0e0609f70b738d9e9d6cfda7b7465",
// //             "x-api-secret":
// //               "06926b1891e99df1dd28f123c4935cfb87d07e4b9641f21ac99bc6f31263f946",
// //           },
// //         }
// //       ) 
// //       console.log(data,"data")
// //     return data?.markets || [];
// //   } catch (e) {
// //     console.log("Provider Error", matchId, e.message);
// //     return [];
// //   }
// // };

// // const declareFancyResult = async (payload) => {
// //   try {
// //     await axios.post(
// //       "https://napi.A2Z.online/api/update-fancy-result",
// //       payload
// //     );
// //   } catch (e) {
// //     console.log("Declare Error", e.message);
// //   }
// // };

// // const processMatchResult = async (matchId, pendingFancy) => {

// //     const markets = await getProviderResult(matchId);

// //     if (!markets.length)
// //         return;

// //     const jobs = [];

// //     for (const fancy of pendingFancy) {

// //         const market = markets.find(
// //             x =>
// //                 x.marketName.trim().toLowerCase() ===
// //                 fancy.selectionName.trim().toLowerCase()
// //         );

// //         if (!market)
// //             continue;

// //         if (market.status !== "SETTLE")
// //             continue;

// //         jobs.push(

// //             declareFancyResult({

// //                 message: "ok",

// //                 result: String(market.winnerId),

// //                 runnerName: fancy.selectionName,

// //                 matchId: fancy.matchId,

// //                 isRollback: false

// //             })

// //         );

// //     }

// //     await Promise.allSettled(jobs);

// // }

// // const processPendingFancyResult = async () => {

// //     const list = await getPendingFancyList();

// //     if (!list.length)
// //         return;

// //     const grouped = groupFancyByMatch(list);

// //     const jobs = [];

// //     for (const matchId in grouped) {

// //         jobs.push(

// //             processMatchResult(
// //                 Number(matchId),
// //                 grouped[matchId]
// //             )

// //         );

// //     }

// //     await Promise.allSettled(jobs);

// // }

// // // ---------------- Start App ----------------
// // const start = async () => {
// //   await setConnection();

// //   // initial fetch
// //   await getMatches();
// //   await getFancyDataApi();

// //   // 🔥 Intervals (optimized)
// //   setInterval(getMatches, 5000); // every 5 sec (not 1 sec)
// //   setInterval(getFancyDataApi, 1000);
// //   setInterval(formattedFancyData, 1000);
// //   setInterval(BookMakerOddsData, 900);
// //   setInterval(processPendingFancyResult,2000);

// //   const PORT = 3031;
// //   server.listen(PORT, () => {
// //     console.log(`🚀 Socket Server running on port ${PORT}`);
// //   });
// // };

// // start();



// const express = require("express");
// const Redis = require("ioredis");
// const http = require("http");
// const { Server } = require("socket.io");
// const mongoose = require("mongoose");
// const axios = require("axios").default;

// const Match = require("./models/Match.model");

// // Mongo DSN
// const dsn = process.env.MONGO_URI || "mongodb://chero:chero0908nitin@62.72.58.167:27017/atoz?authSource=admin&replicaSet=rs0";

// const app = express();
// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//   },
// });

// app.use(express.json());

// // ---------------- DB Connection ----------------
// const setConnection = async () => {
//   try {
//     await mongoose.connect(dsn);
//     console.log("✅ DataBase Connected Successfully");
//   } catch (err) {
//     console.log("❌ error in connecting DataBase", err);
//     process.exit(1);
//   }
// };

// // ---------------- Redis Connection ----------------
// const publisher = new Redis({
//   host: "127.0.0.1",
//   port: 6379,
// });

// publisher.on("connect", () => {
//   console.log("✅ Successfully connected to Redis");
// });

// publisher.on("error", (err) => {
//   console.log("❌ Redis error:", err?.message || err);
// });

// // ---------------- In-memory store ----------------
// let matches = []; // active matches list
// const FancyData = {}; // FancyData[matchId] = array

// // ---------------- Fetch active matches + RAM Cleanup ----------------
// const getMatches = async () => {
//   try {
//     const list = await Match.find({ active: true }).lean();
//     matches = list || [];

//     // 🧹 MEMORY LEAK CLEANUP: Purane inactive matches ko RAM (FancyData) se delete karo
//     const activeMatchIds = new Set(matches.map((m) => String(m.matchId)));
//     Object.keys(FancyData).forEach((matchId) => {
//       if (!activeMatchIds.has(String(matchId))) {
//         delete FancyData[matchId];
//       }
//     });

//   } catch (err) {
//     console.log("❌ error in fetching matches:", err?.message || err);
//   }
// };

// // ---------------- Fetch Fancy API Data ----------------
// const getFancyDataApi = async () => {
//   try {
//     if (!matches || matches.length === 0) return;

//     // Parallel requests (safe)
//     await Promise.all(
//       matches.map(async (m) => {
//         try {
//           const res = await axios.get(
//             `http://165.232.177.161:3088/data/v1?sportsid=4&gmid=${m.matchId}&key=lokesh8279`,
//             {
//           headers: {
//             "x-api-key": "1cfdeb5a7b55d02111f3e2bd324f609f2330c928",
//             "x-api-secret":
//               "0e3be4c11c551261575a87b50a0b14da1c87c50aada2770c765a1ed6f2d5b84b",
//           },
//         }
//           );

//           FancyData[m?.matchId] = res?.data?.data?.data || [];
//         } catch (err) {
//           console.log(
//             `❌ Fancy API error matchId=${m?.matchId}:`,
//             err?.message || err
//           );
//         }
//       })
//     );
//   } catch (err) {
//     console.log("❌ getFancyDataApi error:", err?.message || err);
//   }
// };

// // ---------------- Format fancy + Redis store + socket emit ----------------
// const formattedFancyData = async () => {
//   try {
//     if (!matches || matches.length === 0) return;

//     for (const m of matches) {
//       const data = FancyData[m.matchId];

//       if (!data || !Array.isArray(data) || data.length === 0) continue;

//       const fancydata = data
//         .filter(
//           (fb) =>
//             !fb.mname.includes("Bookmaker") &&
//             fb.mname !== "MATCH_ODDS" &&
//             fb.mname !== "TIED_MATCH" &&
//             fb.gtype !== "cricketcasino" && fb.gtype == "fancy"
//         )
//         .flatMap((f) =>
//           (f.section || []).map((fa) => ({
//             BackPrice1: fa?.odds?.[2]?.odds || fa?.odds?.[0]?.odds ||0,
//             BackPrice2: 0,
//             BackPrice3: 0,
//             BackSize1: fa?.odds?.[2]?.size || fa?.odds?.[0]?.size || 0,
//             BackSize2: 0,
//             BackSize3: 0,

//             LayPrice1: fa?.odds?.[4]?.odds || fa?.odds?.[1]?.odds || 0,
//             LayPrice2: 0,
//             LayPrice3: 0,
//             LaySize1: fa?.odds?.[4]?.size || fa?.odds?.[1]?.size || 0,
//             LaySize2: 0,
//             LaySize3: 0,

//             RunnerName: fa?.nat,
//             SelectionId: fa?.sid,

//             ballsess: "1",
//             gtype: f?.gtype,
//             GameStatus: fa?.gstatus,
//             gtstatus: fa?.gstatus,

//             max: "50000",
//             min: "100",
//             remm: fa?.rem,
//             srno: fa?.sno?.toString(),
//             mname: f?.mname,
//           }))
//         );

//       const redisKey = `fancy-${m.matchId}`;

//       // previous fancy from redis
//       const previousFancyStr = await publisher.get(redisKey);
//       let pfancy = [];
//       if (previousFancyStr) {
//         try {
//           pfancy = JSON.parse(previousFancyStr);
//         } catch (e) {
//           pfancy = [];
//         }
//       }

//       const currentSelectionIds = new Set(
//         fancydata.map((item) => item.SelectionId)
//       );
//       const previousSelectionIds = new Set(
//         pfancy.map((item) => item.SelectionId)
//       );

//       // Emit new fancy added
//       for (const item of fancydata) {
//         if (!previousSelectionIds.has(item.SelectionId)) {
//           io.emit("newFancyAdded", {
//             fancy: { matchId: m.matchId, ...item },
//             matchId: m.matchId,
//           });
//         }
//       }

//       // Emit deactivated fancy
//       const deactivated = pfancy.filter(
//         (oldItem) => !currentSelectionIds.has(oldItem.SelectionId)
//       );

//       if (deactivated.length > 0) {
//         io.emit("deactivateFancy", {
//           [m.matchId]: deactivated.map((d) => d.SelectionId?.toString()),
//         });
//       }

//       // 💥 ADDED TTL: Safe 3 Seconds Expiry on Fancy Data
//       await publisher.set(redisKey, JSON.stringify(fancydata), "EX", 3);
//     }
//   } catch (err) {
//     console.log("❌ formattedFancyData error:", err?.message || err);
//   }
// };

// // ---------------- BookMaker Odds Data ----------------
// const BookMakerOddsData = async () => {
//   try {
//     if (!matches || matches.length === 0) return;

//     for (const m of matches) {
//       const allFancy = FancyData[m.matchId];
//       if (!allFancy || !Array.isArray(allFancy)) continue;

//       // Bookmaker / match type
//       const bData = allFancy.filter((x) => {
//         const gtype = (x?.gtype || "").toLowerCase();
//         return gtype.includes("match") || gtype.includes("cricketcasino");
//       });

//       if (!bData || bData.length === 0) continue;

//       for (const Data of bData) {
//         try {
//           const transformRunners = (inputRunners) => {
//             return {
//               runners: (inputRunners || []).map((runner) => {
//                 const oddsArr = runner?.odds || [];

//                 const backOdds = oddsArr.filter((odd) => odd.otype === "back");
//                 const layOdds = oddsArr.filter((odd) => odd.otype === "lay");

//                 const backoddsmain = [...backOdds]
//                   .reverse()
//                   .map((x) => ({ size: x.size, price: x.odds }));

//                 const layoddsmain = layOdds.map((x) => ({
//                   size: x.size,
//                   price: x.odds,
//                 }));

//                 return {
//                   selectionId: runner.sid,
//                   status: runner.gstatus.toUpperCase(),
//                   lastPriceTraded: null,
//                   runnerName: runner.nat,
//                   totalMatched: 0,
//                   ex: {
//                     availableToBack: backoddsmain,
//                     availableToLay: layoddsmain,
//                   },
//                 };
//               }),
//             };
//           };

//           const output = transformRunners(Data?.section);

//           const marketPayload = {
//             ...Data,
//             runners: output.runners,
//             marketName: Data?.mname,
//             marketId: Data?.mid?.toString(),
//             matchId: Data?.gmid?.toString(),
//           };

//           if (!marketPayload.marketId) continue;

//           const jsonMessage = JSON.stringify(marketPayload);

//           // 💥 ADDED TTL: Safe 2 Seconds Expiry for Odds Data
//           await publisher.set(`odds-market-${marketPayload.marketId}`, jsonMessage, "EX", 2);
//           publisher.publish("getMarketData", jsonMessage);
//         } catch (err) {
//           console.log(
//             `❌ BookMakerOddsData matchId=${m.matchId} error:`,
//             err?.message || err
//           );
//         }
//       }
//     }
//   } catch (err) {
//     console.log("❌ BookMakerOddsData error:", err?.message || err);
//   }
// };

// // // ---------------- Fancy Results Processors ----------------
// // const getPendingFancyList = async () => {
// //   try {
// //     const { data } = await axios.get(
// //       "https://api.a2zlive.shop/api/get-business-fancy-list"
// //     );
// //     return data?.data?.list || [];
// //   } catch (e) {
// //     console.log("Pending Fancy Error", e.message);
// //     return [];
// //   }
// // };

// // const groupFancyByMatch = (list) => {
// //   return list.reduce((acc, item) => {
// //     if (!acc[item.matchId]) {
// //       acc[item.matchId] = [];
// //     }
// //     acc[item.matchId].push(item);
// //     return acc;
// //   }, {});
// // };

// // const getProviderResult = async (matchId) => {
// //   try {
// //     const { data } = await axios.get(
// //       `https://docs.vkmster.com/sportapi/sportsResult?sportsid=4&gmid=${matchId}`,
// //       {
// //         headers: {
// //           "x-api-key": "a3f41cc1eff0e0609f70b738d9e9d6cfda7b7465",
// //           "x-api-secret":
// //             "06926b1891e99df1dd28f123c4935cfb87d07e4b9641f21ac99bc6f31263f946",
// //         },
// //       }
// //     );
// //     return data?.markets || [];
// //   } catch (e) {
// //     console.log("Provider Error", matchId, e.message);
// //     return [];
// //   }
// // };

// // const declareFancyResult = async (payload) => {
// //   try {
// //     await axios.post(
// //       "https://api.a2zlive.shop/api/update-fancy-result",
// //       payload
// //     );
// //   } catch (e) {
// //     console.log("Declare Error", e.message);
// //   }
// // };

// // const processMatchResult = async (matchId, pendingFancy) => {
// //   const markets = await getProviderResult(matchId);
// //   if (!markets.length) return;

// //   const jobs = [];

// //   for (const fancy of pendingFancy) {
// //     const market = markets.find(
// //       (x) =>
// //         x.marketName.trim().toLowerCase() ===
// //         fancy.selectionName.trim().toLowerCase()
// //     );

// //     if (!market || market.status !== "SETTLE") continue;

// //     jobs.push(
// //       declareFancyResult({
// //         message: "ok",
// //         result: String(market.winnerId),
// //         runnerName: fancy.selectionName,
// //         matchId: fancy.matchId,
// //         isRollback: false,
// //       })
// //     );
// //   }

// //   await Promise.allSettled(jobs);
// // };

// // const processPendingFancyResult = async () => {
// //   const list = await getPendingFancyList();
// //   if (!list.length) return;

// //   const grouped = groupFancyByMatch(list);
// //   const jobs = [];

// //   for (const matchId in grouped) {
// //     jobs.push(processMatchResult(Number(matchId), grouped[matchId]));
// //   }

// //   await Promise.allSettled(jobs);
// // };

// // ---------------- Fancy Results Processors ----------------

// const FANCY_APIS = [
//   "https://api.a2zlive.shop",
//   "https://sixapi.vkmster.com",
//   "https://api.star-99.com"
// ];

// const getPendingFancyList = async () => {
//   const responses = await Promise.allSettled(
//     FANCY_APIS.map(async (baseUrl) => {
//       const { data } = await axios.get(
//         `${baseUrl}/api/get-business-fancy-list`
//       );

//       const list = data?.data?.list || [];

//       // Source backend save kar rahe hain,
//       // taaki result usi backend me declare ho.
//       return list.map((item) => ({
//         ...item,
//         __baseUrl: baseUrl,
//       }));
//     })
//   );

//   const finalList = [];

//   responses.forEach((response, index) => {
//     if (response.status === "fulfilled") {
//       finalList.push(...response.value);
//     } else {
//       console.log(
//         "Pending Fancy Error:",
//         FANCY_APIS[index],
//         response.reason?.message
//       );
//     }
//   });

//   return finalList;
// };


// const groupFancyByMatch = (list) => {
//   return list.reduce((acc, item) => {
//     if (!acc[item.matchId]) {
//       acc[item.matchId] = [];
//     }

//     acc[item.matchId].push(item);
//     return acc;
//   }, {});
// };


// const getProviderResult = async (matchId) => {
//   try {
//     const { data } = await axios.get(
//       `http://165.232.177.161:3088/data/v1?sportsid=4&gmid=${matchId}&key=lokesh8279`,
//       {
//         headers: {
//           "x-api-key": "1cfdeb5a7b55d02111f3e2bd324f609f2330c928",
//           "x-api-secret":
//             "0e3be4c11c551261575a87b50a0b14da1c87c50aada2770c765a1ed6f2d5b84b",
//         },
//       }
//     );

//     return data?.markets || [];
//   } catch (e) {
//     console.log("Provider Error", matchId, e.message);
//     return [];
//   }
// };


// const declareFancyResult = async (baseUrl, payload) => {
//   try {
//     await axios.post(
//       `${baseUrl}/api/update-fancy-result`,
//       payload
//     );
//   } catch (e) {
//     console.log(
//       "Declare Error:",
//       baseUrl,
//       payload?.matchId,
//       payload?.runnerName,
//       e.message
//     );
//   }
// };


// const processMatchResult = async (matchId, pendingFancy) => {
//   const markets = await getProviderResult(matchId);

//   if (!markets.length) return;

//   const jobs = [];

//   for (const fancy of pendingFancy) {
//     const market = markets.find(
//       (x) =>
//         x.marketName?.trim().toLowerCase() ===
//         fancy.selectionName?.trim().toLowerCase()
//     );

//     if (!market || market.status !== "SETTLE") {
//       continue;
//     }

//     jobs.push(
//       declareFancyResult(
//         fancy.__baseUrl,
//         {
//           message: "ok",
//           result: String(market.winnerId),
//           runnerName: fancy.selectionName,
//           matchId: fancy.matchId,
//           isRollback: false,
//         }
//       )
//     );
//   }

//   await Promise.allSettled(jobs);
// };


// const processPendingFancyResult = async () => {
//   const list = await getPendingFancyList();

//   if (!list.length) return;

//   const grouped = groupFancyByMatch(list);
//   const jobs = [];

//   for (const matchId in grouped) {
//     jobs.push(
//       processMatchResult(
//         Number(matchId),
//         grouped[matchId]
//       )
//     );
//   }

//   await Promise.allSettled(jobs);
// };
// // ---------------- Start App ----------------
// const start = async () => {
//   await setConnection();

//   // Initial Boot Fetch
//   await getMatches();
//   await getFancyDataApi();

//   // 🔥 Intervals Execution
//   setInterval(getMatches, 5000);                // Matches sync every 5s
//   setInterval(getFancyDataApi, 1000);           // API Polling every 1s
//   setInterval(formattedFancyData, 1000);        // Redis Sync every 1s
//   setInterval(BookMakerOddsData, 900);          // Odds Publishing every 900ms
//   setInterval(processPendingFancyResult, 2000); // Result Declarations every 2s

//   const PORT = process.env.PORT || 3031;
//   server.listen(PORT, () => {
//     console.log(`🚀 High-Throughput Socket & Redis Engine running on port ${PORT}`);
//   });
// };

// start();






const express = require("express");
const Redis = require("ioredis");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const axios = require("axios").default;

const Match = require("./models/Match.model");

// =====================================================
// DATABASE + API CONFIG
// =====================================================

const MONGO_URI =
  "mongodb://chero:chero0908nitin@62.72.58.167:27017/betx?authSource=admin&replicaSet=rs0";

const PROVIDER_URL =
  "http://165.232.177.161:3088/data/v1";

const PROVIDER_QUERY_KEY = "lokesh8279";

const PROVIDER_API_KEY =
  "1cfdeb5a7b55d02111f3e2bd324f609f2330c928";

const PROVIDER_API_SECRET =
  "0e3be4c11c551261575a87b50a0b14da2770c765a1ed6f2d5b84b";

const PORT = 3031;

const LIVE_POLL_MS = 300;
const UPCOMING_POLL_MS = 2000;
const MATCH_SYNC_MS = 5000;
const RESULT_POLL_MS = 2000;

const PROVIDER_TIMEOUT_MS = 2500;

const FANCY_TTL_SECONDS = 5;
const ODDS_TTL_SECONDS = 5;

// =====================================================
// EXPRESS + SOCKET.IO
// =====================================================

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(express.json());

// =====================================================
// MONGODB CONNECTION
// =====================================================

const setConnection = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("MongoDB connected: betx");
  } catch (error) {
    console.error(
      "MongoDB connection error:",
      error?.message || error
    );

    process.exit(1);
  }
};

// =====================================================
// REDIS CONNECTION
// =====================================================

const publisher = new Redis({
  host: "127.0.0.1",
  port: 6379,
});

publisher.on("connect", () => {
  console.log("Redis connected successfully");
});

publisher.on("error", (error) => {
  console.error(
    "Redis error:",
    error?.message || error
  );
});

// =====================================================
// AXIOS PROVIDER CLIENT
// =====================================================

const provider = axios.create({
  baseURL: PROVIDER_URL,
  timeout: PROVIDER_TIMEOUT_MS,

  headers: {
    "x-api-key": PROVIDER_API_KEY,
    "x-api-secret": PROVIDER_API_SECRET,
  },
});

// =====================================================
// MEMORY STORE
// =====================================================

let matches = [];

const FancyData = Object.create(null);

// Every match has independent polling state
const matchPollers = new Map();

// Prevent overlapping match DB sync
let matchSyncRunning = false;

// Prevent overlapping result processing
let resultProcessingRunning = false;

// =====================================================
// MATCH DATETIME CHECK
// =====================================================

const isInPlay = (match) => {
  if (!match?.matchDateTime) {
    return false;
  }

  const matchTimestamp = new Date(
    match.matchDateTime
  ).getTime();

  if (!Number.isFinite(matchTimestamp)) {
    return false;
  }

  return Date.now() >= matchTimestamp;
};

const getPollingInterval = (match) => {
  return isInPlay(match)
    ? LIVE_POLL_MS
    : UPCOMING_POLL_MS;
};

// =====================================================
// PROVIDER API
// =====================================================

const fetchFancyData = async (matchId) => {
  const response = await provider.get("", {
    params: {
      sportsid: 4,
      gmid: matchId,
      key: PROVIDER_QUERY_KEY,
    },
  });

  return response?.data?.data?.data || [];
};

// =====================================================
// FORMAT FANCY DATA
// =====================================================

const formatFancyData = (providerData) => {
  if (!Array.isArray(providerData)) {
    return [];
  }

  return providerData
    .filter((fb) => {
      const marketName = String(
        fb?.mname || ""
      );

      return (
        !marketName.includes("Bookmaker") &&
        marketName !== "MATCH_ODDS" &&
        marketName !== "TIED_MATCH" &&
        fb?.gtype !== "cricketcasino" &&
        fb?.gtype === "fancy"
      );
    })
    .flatMap((f) =>
      (f.section || []).map((fa) => ({
        BackPrice1:
          fa?.odds?.[2]?.odds ||
          fa?.odds?.[0]?.odds ||
          0,

        BackPrice2: 0,
        BackPrice3: 0,

        BackSize1:
          fa?.odds?.[2]?.size ||
          fa?.odds?.[0]?.size ||
          0,

        BackSize2: 0,
        BackSize3: 0,

        LayPrice1:
          fa?.odds?.[4]?.odds ||
          fa?.odds?.[1]?.odds ||
          0,

        LayPrice2: 0,
        LayPrice3: 0,

        LaySize1:
          fa?.odds?.[4]?.size ||
          fa?.odds?.[1]?.size ||
          0,

        LaySize2: 0,
        LaySize3: 0,

        RunnerName: fa?.nat,
        SelectionId: fa?.sid,

        ballsess: "1",

        gtype: f?.gtype,

        GameStatus: fa?.gstatus,
        gtstatus: fa?.gstatus,

        max: "50000",
        min: "100",

        remm: fa?.rem,

        srno: fa?.sno?.toString(),

        mname: f?.mname,
      }))
    );
};

// =====================================================
// FANCY REDIS + SOCKET
// =====================================================

const formattedFancyData = async (
  match,
  providerData
) => {
  try {
    const matchId = String(match.matchId);

    if (!Array.isArray(providerData)) {
      return;
    }

    const fancydata = formatFancyData(
      providerData
    );

    const redisKey = `fancy-${matchId}`;

    const previousFancyStr =
      await publisher.get(redisKey);

    let previousFancy = [];

    if (previousFancyStr) {
      try {
        previousFancy = JSON.parse(
          previousFancyStr
        );
      } catch {
        previousFancy = [];
      }
    }

    if (!Array.isArray(previousFancy)) {
      previousFancy = [];
    }

    const currentSelectionIds = new Set(
      fancydata.map((item) =>
        String(item.SelectionId)
      )
    );

    const previousSelectionIds = new Set(
      previousFancy.map((item) =>
        String(item.SelectionId)
      )
    );

    const addedFancy = fancydata.filter(
      (item) =>
        !previousSelectionIds.has(
          String(item.SelectionId)
        )
    );

    const deactivatedFancy =
      previousFancy.filter(
        (item) =>
          !currentSelectionIds.has(
            String(item.SelectionId)
          )
      );

    await publisher.set(
      redisKey,
      JSON.stringify(fancydata),
      "EX",
      FANCY_TTL_SECONDS
    );

    for (const item of addedFancy) {
      io.emit("newFancyAdded", {
        fancy: {
          matchId: match.matchId,
          ...item,
        },
        matchId: match.matchId,
      });
    }

    if (deactivatedFancy.length > 0) {
      io.emit("deactivateFancy", {
        [match.matchId]:
          deactivatedFancy.map((item) =>
            item.SelectionId?.toString()
          ),
      });
    }
  } catch (error) {
    console.error(
      `Fancy processing error ${match.matchId}:`,
      error?.message || error
    );
  }
};

// =====================================================
// BOOKMAKER RUNNER TRANSFORM
// =====================================================

const transformRunners = (runners) => {
  return (runners || []).map((runner) => {
    const odds = runner?.odds || [];

    const backOdds = odds.filter(
      (odd) => odd.otype === "back"
    );

    const layOdds = odds.filter(
      (odd) => odd.otype === "lay"
    );

    const backoddsmain = [
      ...backOdds,
    ]
      .reverse()
      .map((odd) => ({
        size: odd.size,
        price: odd.odds,
      }));

    const layoddsmain = layOdds.map(
      (odd) => ({
        size: odd.size,
        price: odd.odds,
      })
    );

    return {
      selectionId: runner.sid,

      status: String(
        runner.gstatus || ""
      ).toUpperCase(),

      lastPriceTraded: null,

      runnerName: runner.nat,

      totalMatched: 0,

      ex: {
        availableToBack: backoddsmain,
        availableToLay: layoddsmain,
      },
    };
  });
};

// =====================================================
// BOOKMAKER REDIS + PUBSUB
// =====================================================

const BookMakerOddsData = async (
  match,
  providerData
) => {
  try {
    if (!Array.isArray(providerData)) {
      return;
    }

    const bData = providerData.filter(
      (item) => {
        const gtype = String(
          item?.gtype || ""
        ).toLowerCase();

        return (
          gtype.includes("match") ||
          gtype.includes("cricketcasino")
        );
      }
    );

    if (!bData.length) {
      return;
    }

    await Promise.allSettled(
      bData.map(async (Data) => {
        try {
          const marketPayload = {
            ...Data,

            runners: transformRunners(
              Data?.section
            ),

            marketName: Data?.mname,

            marketId:
              Data?.mid?.toString(),

            matchId:
              Data?.gmid?.toString(),
          };

          if (!marketPayload.marketId) {
            return;
          }

          const jsonMessage =
            JSON.stringify(marketPayload);

          await publisher.set(
            `odds-market-${marketPayload.marketId}`,
            jsonMessage,
            "EX",
            ODDS_TTL_SECONDS
          );

          await publisher.publish(
            "getMarketData",
            jsonMessage
          );
        } catch (error) {
          console.error(
            `Bookmaker market error ${match.matchId}:`,
            error?.message || error
          );
        }
      })
    );
  } catch (error) {
    console.error(
      `Bookmaker processing error ${match.matchId}:`,
      error?.message || error
    );
  }
};

// =====================================================
// POLL SINGLE MATCH
// =====================================================

const pollMatch = async (matchId, state) => {
  if (state.stopped) {
    return;
  }

  const startedAt = Date.now();

  try {
    const data = await fetchFancyData(
      matchId
    );

    if (state.stopped) {
      return;
    }

    FancyData[matchId] = data;

    // Parallel Redis processing
    await Promise.allSettled([
      formattedFancyData(
        state.match,
        data
      ),

      BookMakerOddsData(
        state.match,
        data
      ),
    ]);
  } catch (error) {
    console.error(
      `Provider error matchId=${matchId}:`,
      error?.message || error
    );
  } finally {
    if (!state.stopped) {
      const interval =
        getPollingInterval(state.match);

      const elapsed =
        Date.now() - startedAt;

      const nextDelay = Math.max(
        0,
        interval - elapsed
      );

      state.timer = setTimeout(
        () => {
          pollMatch(matchId, state);
        },
        nextDelay
      );
    }
  }
};

// =====================================================
// ACTIVE MATCHES SYNC
// =====================================================

const getMatches = async () => {
  if (matchSyncRunning) {
    return;
  }

  matchSyncRunning = true;

  try {
    const list = await Match.find({
      active: true,
    }).lean();

    matches = Array.isArray(list)
      ? list
      : [];

    const activeMatchIds = new Set(
      matches.map((match) =>
        String(match.matchId)
      )
    );

    // Stop inactive match polling
    for (const [matchId, state] of matchPollers) {
      if (!activeMatchIds.has(matchId)) {
        state.stopped = true;

        clearTimeout(state.timer);

        matchPollers.delete(matchId);

        delete FancyData[matchId];

        console.log(
          `Stopped match polling: ${matchId}`
        );
      }
    }

    // Create or update match pollers
    for (const match of matches) {
      if (
        match.matchId === null ||
        match.matchId === undefined
      ) {
        continue;
      }

      const matchId = String(
        match.matchId
      );

      const existing = matchPollers.get(
        matchId
      );

      if (existing) {
        existing.match = match;
        continue;
      }

      const state = {
        match,
        timer: null,
        stopped: false,
      };

      matchPollers.set(
        matchId,
        state
      );

      console.log(
        `Started ${matchId} | ${
          isInPlay(match)
            ? "INPLAY 300ms"
            : "UPCOMING 2000ms"
        }`
      );

      // Starts without waiting for other matches
      pollMatch(matchId, state);
    }
  } catch (error) {
    console.error(
      "Match sync error:",
      error?.message || error
    );
  } finally {
    matchSyncRunning = false;
  }
};

// =====================================================
// FANCY RESULT APIS
// =====================================================

const FANCY_APIS = [
  // "https://api.a2zlive.shop",
  // "https://sixapi.vkmster.com",
  // "https://api.star-99.com",
  "https://api.betx99.co"
];

// =====================================================
// PENDING FANCY LIST
// =====================================================

const getPendingFancyList = async () => {
  const responses =
    await Promise.allSettled(
      FANCY_APIS.map(
        async (baseUrl) => {
          const { data } =
            await axios.get(
              `${baseUrl}/api/get-business-fancy-list`,
              {
                timeout: 5000,
              }
            );

          const list =
            data?.data?.list || [];

          return list.map((item) => ({
            ...item,
            __baseUrl: baseUrl,
          }));
        }
      )
    );

  const finalList = [];

  responses.forEach(
    (response, index) => {
      if (
        response.status === "fulfilled"
      ) {
        finalList.push(
          ...response.value
        );
      } else {
        console.error(
          "Pending Fancy Error:",
          FANCY_APIS[index],
          response.reason?.message
        );
      }
    }
  );

  return finalList;
};

// =====================================================
// GROUP FANCY BY MATCH
// =====================================================

const groupFancyByMatch = (list) => {
  return list.reduce(
    (acc, item) => {
      const matchId =
        String(item.matchId);

      if (!acc[matchId]) {
        acc[matchId] = [];
      }

      acc[matchId].push(item);

      return acc;
    },
    {}
  );
};

// =====================================================
// PROVIDER RESULT
// =====================================================

const getProviderResult = async (matchId) => {
  try {
    const { data } = await axios.get(
      `http://165.232.177.161:3088/data/v1?sportsid=4&gmid=${matchId}&key=lokesh8279`,
      {
        headers: {
          "x-api-key": "1cfdeb5a7b55d02111f3e2bd324f609f2330c928",
          "x-api-secret":
            "0e3be4c11c551261575a87b50a0b14da1c87c50aada2770c765a1ed6f2d5b84b",
        },
      }
    );

    return data?.markets || [];
  } catch (e) {
    console.log("Provider Error", matchId, e.message);
    return [];
  }
};
// =====================================================
// DECLARE FANCY RESULT
// =====================================================

const declareFancyResult = async (
  baseUrl,
  payload
) => {
  try {
    await axios.post(
      `${baseUrl}/api/update-fancy-result`,
      payload,
      {
        timeout: 5000,
      }
    );
  } catch (error) {
    console.error(
      "Declare Error:",
      baseUrl,
      payload?.matchId,
      payload?.runnerName,
      error?.message || error
    );
  }
};

// =====================================================
// PROCESS MATCH RESULT
// =====================================================

const processMatchResult = async (
  matchId,
  pendingFancy
) => {
  const markets =
    await getProviderResult(matchId);

  if (!markets.length) {
    return;
  }

  const jobs = [];

  for (const fancy of pendingFancy) {
    const market = markets.find(
      (item) =>
        item.marketName
          ?.trim()
          .toLowerCase() ===
        fancy.selectionName
          ?.trim()
          .toLowerCase()
    );

    if (
      !market ||
      market.status !== "SETTLE"
    ) {
      continue;
    }

    jobs.push(
      declareFancyResult(
        fancy.__baseUrl,
        {
          message: "ok",

          result: String(
            market.winnerId
          ),

          runnerName:
            fancy.selectionName,

          matchId: fancy.matchId,

          isRollback: false,
        }
      )
    );
  }

  await Promise.allSettled(
    jobs
  );
};

// =====================================================
// PROCESS PENDING FANCY RESULTS
// =====================================================

const processPendingFancyResult =
  async () => {
    if (resultProcessingRunning) {
      return;
    }

    resultProcessingRunning = true;

    try {
      const list =
        await getPendingFancyList();

      if (!list.length) {
        return;
      }

      const grouped =
        groupFancyByMatch(list);

      await Promise.allSettled(
        Object.entries(grouped).map(
          ([matchId, pendingFancy]) =>
            processMatchResult(
              Number(matchId),
              pendingFancy
            )
        )
      );
    } catch (error) {
      console.error(
        "Fancy result processing error:",
        error?.message || error
      );
    } finally {
      resultProcessingRunning = false;
    }
  };

// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/health", (req, res) => {
  const liveMatches = matches.filter(
    isInPlay
  ).length;

  res.json({
    status: "ok",
    database: "betx",
    redis: publisher.status,

    totalMatches: matches.length,
    liveMatches,

    upcomingMatches:
      matches.length - liveMatches,

    activePollers: matchPollers.size,

    polling: {
      live: LIVE_POLL_MS,
      upcoming: UPCOMING_POLL_MS,
    },
  });
});

// =====================================================
// START SERVER
// =====================================================

const start = async () => {
  await setConnection();

  // Initial active matches load
  await getMatches();

  // Refresh matches every 5 seconds
  setInterval(
    getMatches,
    MATCH_SYNC_MS
  );

  // Fancy result processing every 2 seconds
  setInterval(
    processPendingFancyResult,
    RESULT_POLL_MS
  );

  server.listen(PORT, () => {
    console.log(
      `Redis + Socket server running on port ${PORT}`
    );

    console.log(
      `Database: betx`
    );

    console.log(
      `Live polling: ${LIVE_POLL_MS}ms`
    );

    console.log(
      `Upcoming polling: ${UPCOMING_POLL_MS}ms`
    );
  });
};

start().catch((error) => {
  console.error(
    "Server startup error:",
    error
  );

  process.exit(1);
});

