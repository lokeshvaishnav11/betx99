// /* eslint-disable */

// import "./match-detail-mobile.css";

// import React, { MouseEvent } from "react";
// import { connect } from "react-redux";

// import IMarket, { OddsType } from "../../../models/IMarket";
// import IRunner from "../../../models/IRunner";
// import IMatch from "../../../models/IMatch";
// import { RoleType } from "../../../models/User";

// import { SocketContext } from "../../../context/webSocket";
// import { AvailableToBackLay } from "./available-to-back-lay";

// import { betPopup } from "../../../redux/actions/bet/betSlice";
// import { setRules } from "../../../redux/actions/common/commonSlice";

// import PnlCalculate from "./pnl-calculate";
// import BookPopup from "./fancy/book-popup";
// import UserBookPopup from "./user-book-popup";

// interface Props {
//   data: IMarket[];
//   getMarketBook?: any;
//   bet?: any;
//   fancySelectionId?: any;
//   currentMatch?: IMatch;
//   setRules: (data: { open: boolean; type: string }) => void;
//   marketUserBookId?: any;
//   userState: any;
//   shared: any;
// }

// interface State {
//   runnersData: Record<string, IMarket>;
//   runnersDataPrev: Record<string, IMarket>;
//   profitLoss: Record<string, number>;
//   getMarketBook: any;
//   remarkMarket: Record<string, string>;
//   runnersName: Record<string, Record<string, string>>;
// }

// const isTossMarket = (market: IMarket): boolean => {
//   return (
//     market.marketName?.toLowerCase() === "toss" &&
//     String(market.marketId) === `toss_${market.matchId}`
//   );
// };

// class MatchOdds extends React.PureComponent<Props, State> {
//   static contextType = SocketContext;

//   context!: React.ContextType<typeof SocketContext>;

//   constructor(props: Props) {
//     super(props);

//     const selections: Record<string, IMarket> = {};
//     const profitLoss: Record<string, number> = {};
//     const remarkMarket: Record<string, string> = {};
//     const runnersName: Record<string, Record<string, string>> = {};

//     (props.data || []).forEach((market: IMarket) => {
//       selections[market.marketId] = market;
//       remarkMarket[market.marketId] = "";
//       runnersName[market.marketId] = {};

//       (market.runners || []).forEach((runner: IRunner) => {
//         runnersName[market.marketId][String(runner.selectionId)] =
//           runner.runnerName;

//         profitLoss[String(runner.selectionId)] = 0;
//       });
//     });

//     this.state = {
//       runnersData: selections,
//       runnersDataPrev: JSON.parse(JSON.stringify(selections)),
//       profitLoss,
//       getMarketBook: props.getMarketBook,
//       remarkMarket,
//       runnersName,
//     };
//   }

//   componentDidMount(): void {
//     this.socketEvents();
//   }

//   componentWillUnmount(): void {
//     this.context.socket.off("getMarketData", this.handleMarketData);
//     this.context.socket.off("connect", this.joinMarketRoom);
//     this.context.socket.off("reconnect", this.joinMarketRoom);

//     this.leaveMarketRoom();
//   }

//   componentDidUpdate(prevProps: Readonly<Props>): void {
//     if (prevProps.data !== this.props.data) {
//       this.setState(
//         (prev) => {
//           const runnersData = { ...prev.runnersData };
//           const runnersName = { ...prev.runnersName };

//           (this.props.data || []).forEach((market: IMarket) => {
//             if (!runnersData[market.marketId]) {
//               runnersData[market.marketId] = market;
//             }

//             runnersName[market.marketId] = {
//               ...(runnersName[market.marketId] || {}),
//             };

//             (market.runners || []).forEach((runner: IRunner) => {
//               runnersName[market.marketId][String(runner.selectionId)] =
//                 runner.runnerName;
//             });
//           });

//           return {
//             runnersData,
//             runnersName,
//           };
//         },
//         () => {
//           this.leaveMarketRoom(prevProps.data);
//           this.joinMarketRoom();
//         }
//       );
//     }
//   }

//   handleMarketData = (market: IMarket) => {
//     if (!market?.marketId) return;

//     // Toss market fixed hai; socket data se overwrite nahi karna.
//     if (isTossMarket(market)) return;

//     this.setState((prev) => ({
//       runnersData: {
//         ...prev.runnersData,
//         [market.marketId]: market,
//       },
//     }));
//   };

//   socketEvents = () => {
//     this.joinMarketRoom();

//     this.context.socket.off("getMarketData", this.handleMarketData);
//     this.context.socket.on("getMarketData", this.handleMarketData);

//     this.context.socket.off("connect", this.joinMarketRoom);
//     this.context.socket.off("reconnect", this.joinMarketRoom);

//     this.context.socket.on("connect", this.joinMarketRoom);
//     this.context.socket.on("reconnect", this.joinMarketRoom);
//   };

//   joinMarketRoom = () => {
//     if (this.props.currentMatch) {
//       this.context.socket.emit(
//         "joinRoom",
//         this.props.currentMatch.matchId
//       );
//     }

//     (this.props.data || []).forEach((market: IMarket) => {
//       if (isTossMarket(market)) return;

//       this.context.socket.emit(
//         "joinMarketRoom",
//         market.marketId
//       );
//     });
//   };

//   leaveMarketRoom = (markets: IMarket[] = this.props.data) => {
//     (markets || []).forEach((market: IMarket) => {
//       if (isTossMarket(market)) return;

//       this.context.socket.emit("leaveRoom", market.marketId);
//     });
//   };

//   offplaylimit = (market: IMarket) => {
//     const inplayLimit =
//       market.oddsType === OddsType.BM
//         ? this.props.currentMatch?.inPlayBookMaxLimit
//         : this.props.currentMatch?.inPlayMaxLimit;

//     const offplayLimit =
//       market.oddsType === OddsType.BM
//         ? this.props.currentMatch?.offPlayBookMaxLimit
//         : this.props.currentMatch?.offPlayMaxLimit;

//     return this.props.currentMatch?.inPlay
//       ? inplayLimit
//       : offplayLimit;
//   };

//   render(): React.ReactNode {
//     const { data, getMarketBook } = this.props;
//     const { runnersData } = this.state;

//     return (
//       <div className="betx-odds-root">
//         {(data || []).map((market: IMarket) => {
//           const selectionsPrev: any = {};

//           const toss = isTossMarket(market);

//           const oddsData = toss
//             ? market
//             : runnersData?.[market.marketId];

//           // Toss ko API odds ke bina bhi show karna hai.
//           const setVisibleMarketStatus =
//             toss || !!oddsData?.runners?.[0]?.ex;

//           if (!setVisibleMarketStatus) {
//             return null;
//           }

//           // Toss ki UI Bookmaker jaisi.
//           const classforheadingfirst =
//             toss || market.oddsType === OddsType.BM
//               ? "box-6"
//               : market.oddsType === OddsType.B
//               ? "box-4"
//               : "box-6";

//           const classforheading =
//             toss || market.oddsType === OddsType.BM
//               ? "box-2"
//               : market.oddsType === OddsType.B
//               ? "box-1"
//               : "box-2";

//           const runners: IRunner[] = toss
//             ? market.runners || []
//             : oddsData?.runners || [];

//           return (
//             <section
//               className="betx-odds-market"
//               key={market.marketId}
//             >
//               <div className="market-title betx-odds-title">
//                 <span className="betx-market-name">
//                   {market.marketName}
//                 </span>

//                 <a
//                   href="#Bookmaker-market"
//                   onClick={(e: MouseEvent<HTMLAnchorElement>) => {
//                     e.preventDefault();

//                     this.props.setRules({
//                       open: true,
//                       type:
//                         market.oddsType === OddsType.BM
//                           ? "Bookmaker"
//                           : market.oddsType,
//                     });
//                   }}
//                   className="game-rules-icon betx-market-rules"
//                   aria-label={`${market.marketName} rules`}
//                 >
//                   <i className="fa fa-info-circle" />
//                 </a>

//                 <span className="betx-cashout-badge">
//                   Cashout
//                 </span>
//               </div>

//               <div className="table-header betx-odds-header">
//                 <div
//                   className={`float-left country-name ${classforheadingfirst} min-max`}
//                 >
//                   <span className="betx-market-limits">
//                     Min:{" "}
//                     {(() => {
//                       const match: any = this.props.currentMatch;

//                       const setting =
//                         this.props.userState?.user?.userSetting?.[
//                           market.oddsType === OddsType.BM ? 1 : 0
//                         ];

//                       return (
//                         setting?.minBet ??
//                         (match?.inPlay
//                           ? market.oddsType === OddsType.BM
//                             ? match?.inPlayBookMinLimit
//                             : match?.inPlayMinLimit
//                           : market.oddsType === OddsType.BM
//                           ? match?.offPlayBookMinLimit
//                           : match?.offPlayMinLimit) ??
//                         "--"
//                       );
//                     })()}

//                     <span className="betx-limit-separator">
//                       {" "}Max:{" "}
//                     </span>

//                     {(() => {
//                       const setting =
//                         this.props.userState?.user?.userSetting?.[
//                           market.oddsType === OddsType.BM ? 1 : 0
//                         ];

//                       return (
//                         setting?.maxBet ??
//                         this.offplaylimit(market) ??
//                         "--"
//                       );
//                     })()}
//                   </span>
//                 </div>

//                 <div
//                   className={`back ${classforheading} float-left text-center`}
//                 >
//                   <b>Lagai</b>
//                 </div>

//                 <div
//                   className={`lay ${classforheading} float-left text-center`}
//                 >
//                   <b>Khai</b>
//                 </div>
//               </div>

//               {[...runners]
//                 .sort(
//                   (a: IRunner, b: IRunner) =>
//                     ((a as any)?.sortPriority ?? 0) -
//                     ((b as any)?.sortPriority ?? 0)
//                 )
//                 .map((runner: IRunner) => {
//                   const savedName =
//                     this.state.runnersName?.[market.marketId]?.[
//                       String(runner.selectionId)
//                     ];

//                   const currentRunner: IRunner = {
//                     ...runner,
//                     runnerName: savedName || runner.runnerName,
//                   };

//                   const bookKey =
//                     `${market.marketId}_${runner.selectionId}`;

//                   const bookValue = getMarketBook?.[bookKey] || 0;

//                   const userRole =
//                     this.props.userState?.user?.role;

//                   return (
//                     <div key={runner.selectionId}>
//                       <div
//                         data-title={runner.status}
//                         className={`table-row betx-odds-row ${
//                           runner.status === "SUSPENDED"
//                             ? "suspended"
//                             : ""
//                         }`}
//                       >
//                         <div
//                           className={`country-name ${classforheadingfirst}`}
//                         >
//                           <span className="team-name">
//                             <b>{currentRunner.runnerName}</b>
//                           </span>

//                           <p>
//                             {bookValue ? (
//                               <span
//                                 className={
//                                   bookValue > 0
//                                     ? userRole !== RoleType.user
//                                       ? "red"
//                                       : "green"
//                                     : userRole !== RoleType.user
//                                     ? "green"
//                                     : "red"
//                                 }
//                               >
//                                 {this.props.shared
//                                   ? (
//                                       bookValue *
//                                       (this.props.shared / 100)
//                                     ).toLocaleString()
//                                   : bookValue.toLocaleString()}
//                               </span>
//                             ) : (
//                               <span>(0)</span>
//                             )}

//                             <PnlCalculate
//                               marketId={market.marketId}
//                               selectionId={runner.selectionId}
//                             />
//                           </p>
//                         </div>

//                         <AvailableToBackLay
//                           selections={toss ? undefined : runner.ex}
//                           selectionsPrev={selectionsPrev}
//                           market={market}
//                           runner={currentRunner}
//                         />
//                       </div>
//                     </div>
//                   );
//                 })}

//               {this.state.remarkMarket[market.marketId] ? (
//                 <div className="table-remark text-right remark">
//                   {this.state.remarkMarket[market.marketId]}
//                 </div>
//               ) : null}
//             </section>
//           );
//         })}

//         {this.props.fancySelectionId && <BookPopup />}

//         {this.props.marketUserBookId && (
//           <UserBookPopup />
//         )}
//       </div>
//     );
//   }
// }

// const mapStateToProps = (state: any) => ({
//   bet: state.betReducer.bet,

//   getMarketBook:
//     state.betReducer.userBookMarketList &&
//     state.betReducer.userBookMarketList,

//   fancySelectionId:
//     state.betReducer.fancyMatchAndSelectionId,

//   currentMatch:
//     state.sportReducer.currentMatch,

//   marketUserBookId:
//     state.betReducer.marketBookAndSelectionId,
// });

// const actionCreators = {
//   betPopup,
//   setRules,
// };

// export default connect(
//   mapStateToProps,
//   actionCreators
// )(MatchOdds);




/* eslint-disable */

import "./match-detail-mobile.css";

import React, { MouseEvent } from "react";
import { connect } from "react-redux";

import IMarket, { OddsType } from "../../../models/IMarket";
import IRunner from "../../../models/IRunner";
import IMatch from "../../../models/IMatch";
import { RoleType } from "../../../models/User";

import { SocketContext } from "../../../context/webSocket";
import { AvailableToBackLay } from "./available-to-back-lay";

import { betPopup } from "../../../redux/actions/bet/betSlice";
import { setRules } from "../../../redux/actions/common/commonSlice";

import PnlCalculate from "./pnl-calculate";
import BookPopup from "./fancy/book-popup";
import UserBookPopup from "./user-book-popup";

interface Props {
  data: IMarket[];
  getMarketBook?: any;
  bet?: any;
  fancySelectionId?: any;
  currentMatch?: IMatch;
  setRules: (data: { open: boolean; type: string }) => void;
  marketUserBookId?: any;
  userState: any;
  shared: any;
}

interface State {
  runnersData: Record<string, IMarket>;
  runnersDataPrev: Record<string, IMarket>;
  profitLoss: Record<string, number>;
  getMarketBook: any;
  remarkMarket: Record<string, string>;
  runnersName: Record<string, Record<string, string>>;
  currentTime: number;
}

const isTossMarket = (market: IMarket): boolean => {
  return (
    market.marketName?.trim().toLowerCase() === "toss" &&
    String(market.marketId) === `toss_${market.matchId}`
  );
};

// Toss market match start se 1 hour pehle band hoga.
const TOSS_CUTOFF_MS = 60 * 60 * 1000;

class MatchOdds extends React.PureComponent<Props, State> {
  static contextType = SocketContext;

  context!: React.ContextType<typeof SocketContext>;

  private tossTimer: ReturnType<typeof setInterval> | null = null;

  constructor(props: Props) {
    super(props);

    const selections: Record<string, IMarket> = {};
    const profitLoss: Record<string, number> = {};
    const remarkMarket: Record<string, string> = {};
    const runnersName: Record<
      string,
      Record<string, string>
    > = {};

    (props.data || []).forEach((market: IMarket) => {
      selections[market.marketId] = market;
      remarkMarket[market.marketId] = "";
      runnersName[market.marketId] = {};

      (market.runners || []).forEach((runner: IRunner) => {
        runnersName[market.marketId][
          String(runner.selectionId)
        ] = runner.runnerName;

        profitLoss[String(runner.selectionId)] = 0;
      });
    });

    this.state = {
      runnersData: selections,
      runnersDataPrev: JSON.parse(
        JSON.stringify(selections)
      ),
      profitLoss,
      getMarketBook: props.getMarketBook,
      remarkMarket,
      runnersName,
      currentTime: Date.now(),
    };
  }

  componentDidMount(): void {
    this.socketEvents();

    // Har second cutoff check karega.
    this.tossTimer = setInterval(() => {
      this.setState({
        currentTime: Date.now(),
      });
    }, 1000);
  }

  componentWillUnmount(): void {
    if (this.tossTimer !== null) {
      clearInterval(this.tossTimer);
      this.tossTimer = null;
    }

    this.context.socket.off(
      "getMarketData",
      this.handleMarketData
    );

    this.context.socket.off(
      "connect",
      this.joinMarketRoom
    );

    this.context.socket.off(
      "reconnect",
      this.joinMarketRoom
    );

    this.leaveMarketRoom();
  }

  componentDidUpdate(
    prevProps: Readonly<Props>
  ): void {
    if (prevProps.data !== this.props.data) {
      this.setState(
        (prev) => {
          const runnersData = {
            ...prev.runnersData,
          };

          const runnersName = {
            ...prev.runnersName,
          };

          (this.props.data || []).forEach(
            (market: IMarket) => {
              if (!runnersData[market.marketId]) {
                runnersData[market.marketId] = market;
              }

              runnersName[market.marketId] = {
                ...(runnersName[market.marketId] || {}),
              };

              (market.runners || []).forEach(
                (runner: IRunner) => {
                  runnersName[market.marketId][
                    String(runner.selectionId)
                  ] = runner.runnerName;
                }
              );
            }
          );

          return {
            runnersData,
            runnersName,
          };
        },
        () => {
          this.leaveMarketRoom(prevProps.data);
          this.joinMarketRoom();
        }
      );
    }
  }

  // Match ka start time milliseconds mein.
  getMatchStartTime = (
    market: IMarket
  ): number | null => {
    const currentMatch: any =
      this.props.currentMatch;

    const marketData: any = market;

    const rawDate =
      currentMatch?.matchDateTime ??
      marketData?.marketStartTime;

    if (!rawDate) {
      return null;
    }

    // ISO string mein timezone hona chahiye.
    // Naive date strings ko assume nahi karenge.
    if (typeof rawDate === "string") {
      const dateString = rawDate.trim();

      const hasTimezone =
        /(?:Z|[+-]\d{2}:\d{2})$/i.test(
          dateString
        );

      if (!hasTimezone) {
        return null;
      }
    }

    const timestamp = new Date(
      rawDate
    ).getTime();

    if (!Number.isFinite(timestamp)) {
      return null;
    }

    return timestamp;
  };

  // Toss market open hai ya nahi.
  isTossOpen = (
    market: IMarket
  ): boolean => {
    if (!isTossMarket(market)) {
      return true;
    }

    const matchStartTime =
      this.getMatchStartTime(market);

    // Invalid date par Toss hide.
    if (matchStartTime === null) {
      return false;
    }

    const cutoffTime =
      matchStartTime - TOSS_CUTOFF_MS;

    return (
      this.state.currentTime < cutoffTime
    );
  };

  handleMarketData = (
    market: IMarket
  ) => {
    if (!market?.marketId) {
      return;
    }

    // Toss ka fixed data socket se overwrite nahi.
    if (isTossMarket(market)) {
      return;
    }

    this.setState((prev) => ({
      runnersData: {
        ...prev.runnersData,
        [market.marketId]: market,
      },
    }));
  };

  socketEvents = () => {
    this.joinMarketRoom();

    this.context.socket.off(
      "getMarketData",
      this.handleMarketData
    );

    this.context.socket.on(
      "getMarketData",
      this.handleMarketData
    );

    this.context.socket.off(
      "connect",
      this.joinMarketRoom
    );

    this.context.socket.off(
      "reconnect",
      this.joinMarketRoom
    );

    this.context.socket.on(
      "connect",
      this.joinMarketRoom
    );

    this.context.socket.on(
      "reconnect",
      this.joinMarketRoom
    );
  };

  joinMarketRoom = () => {
    if (this.props.currentMatch) {
      this.context.socket.emit(
        "joinRoom",
        this.props.currentMatch.matchId
      );
    }

    (this.props.data || []).forEach(
      (market: IMarket) => {
        if (isTossMarket(market)) {
          return;
        }

        this.context.socket.emit(
          "joinMarketRoom",
          market.marketId
        );
      }
    );
  };

  leaveMarketRoom = (
    markets: IMarket[] = this.props.data
  ) => {
    (markets || []).forEach(
      (market: IMarket) => {
        if (isTossMarket(market)) {
          return;
        }

        this.context.socket.emit(
          "leaveRoom",
          market.marketId
        );
      }
    );
  };

  offplaylimit = (
    market: IMarket
  ) => {
    const inplayLimit =
      market.oddsType === OddsType.BM
        ? this.props.currentMatch
            ?.inPlayBookMaxLimit
        : this.props.currentMatch
            ?.inPlayMaxLimit;

    const offplayLimit =
      market.oddsType === OddsType.BM
        ? this.props.currentMatch
            ?.offPlayBookMaxLimit
        : this.props.currentMatch
            ?.offPlayMaxLimit;

    return this.props.currentMatch?.inPlay
      ? inplayLimit
      : offplayLimit;
  };

  render(): React.ReactNode {
    const {
      data,
      getMarketBook,
    } = this.props;

    const {
      runnersData,
    } = this.state;

    return (
      <div className="betx-odds-root">
        {(data || []).map(
          (market: IMarket) => {
            const selectionsPrev: any = {};

            const toss =
              isTossMarket(market);

            // Toss cutoff check.
            if (
              toss &&
              !this.isTossOpen(market)
            ) {
              return null;
            }

            const oddsData = toss
              ? market
              : runnersData?.[
                  market.marketId
                ];

            const setVisibleMarketStatus =
              toss ||
              !!oddsData?.runners?.[0]?.ex;

            if (!setVisibleMarketStatus) {
              return null;
            }

            // Toss ki UI Bookmaker jaisi.
            const classforheadingfirst =
              toss ||
              market.oddsType === OddsType.BM
                ? "box-6"
                : market.oddsType === OddsType.B
                ? "box-4"
                : "box-6";

            const classforheading =
              toss ||
              market.oddsType === OddsType.BM
                ? "box-2"
                : market.oddsType === OddsType.B
                ? "box-1"
                : "box-2";

            const runners: IRunner[] =
              toss
                ? market.runners || []
                : oddsData?.runners || [];

            return (
              <section
                className="betx-odds-market"
                key={market.marketId}
              >
                <div className="market-title betx-odds-title">
                  <span className="betx-market-name">
                    {market.marketName}
                  </span>

                  <a
                    href="#Bookmaker-market"
                    onClick={(
                      e: MouseEvent<HTMLAnchorElement>
                    ) => {
                      e.preventDefault();

                      this.props.setRules({
                        open: true,
                        type:
                          market.oddsType ===
                          OddsType.BM
                            ? "Bookmaker"
                            : market.oddsType,
                      });
                    }}
                    className="game-rules-icon betx-market-rules"
                    aria-label={`${market.marketName} rules`}
                  >
                    <i className="fa fa-info-circle" />
                  </a>

                  <span className="betx-cashout-badge">
                    Cashout
                  </span>
                </div>

                <div className="table-header betx-odds-header">
                  <div
                    className={`float-left country-name ${classforheadingfirst} min-max`}
                  >
                    <span className="betx-market-limits">
                      Min:{" "}
                      {(() => {
                        const match: any =
                          this.props.currentMatch;

                        const setting =
                          this.props.userState
                            ?.user?.userSetting?.[
                            market.oddsType ===
                            OddsType.BM
                              ? 1
                              : 0
                          ];

                        return (
                          setting?.minBet ??
                          (match?.inPlay
                            ? market.oddsType ===
                              OddsType.BM
                              ? match?.inPlayBookMinLimit
                              : match?.inPlayMinLimit
                            : market.oddsType ===
                              OddsType.BM
                            ? match?.offPlayBookMinLimit
                            : match?.offPlayMinLimit) ??
                          "--"
                        );
                      })()}

                      <span className="betx-limit-separator">
                        {" "}Max:{" "}
                      </span>

                      {(() => {
                        const setting =
                          this.props.userState
                            ?.user?.userSetting?.[
                            market.oddsType ===
                            OddsType.BM
                              ? 1
                              : 0
                          ];

                        return (
                          setting?.maxBet ??
                          this.offplaylimit(
                            market
                          ) ??
                          "--"
                        );
                      })()}
                    </span>
                  </div>

                  <div
                    className={`back ${classforheading} float-left text-center`}
                  >
                    <b>Lagai</b>
                  </div>

                  <div
                    className={`lay ${classforheading} float-left text-center`}
                  >
                    <b>Khai</b>
                  </div>
                </div>

                {[...runners]
                  .sort(
                    (
                      a: IRunner,
                      b: IRunner
                    ) =>
                      ((a as any)
                        ?.sortPriority ?? 0) -
                      ((b as any)
                        ?.sortPriority ?? 0)
                  )
                  .map(
                    (runner: IRunner) => {
                      const savedName =
                        this.state.runnersName?.[
                          market.marketId
                        ]?.[
                          String(
                            runner.selectionId
                          )
                        ];

                      const currentRunner: IRunner = {
                        ...runner,
                        runnerName:
                          savedName ||
                          runner.runnerName,
                      };

                      const bookKey =
                        `${market.marketId}_${runner.selectionId}`;

                      const bookValue =
                        getMarketBook?.[
                          bookKey
                        ] || 0;

                      const userRole =
                        this.props.userState
                          ?.user?.role;

                      return (
                        <div
                          key={
                            runner.selectionId
                          }
                        >
                          <div
                            data-title={
                              runner.status
                            }
                            className={`table-row betx-odds-row ${
                              runner.status ===
                              "SUSPENDED"
                                ? "suspended"
                                : ""
                            }`}
                          >
                            <div
                              className={`country-name ${classforheadingfirst}`}
                            >
                              <span className="team-name">
                                <b>
                                  {
                                    currentRunner.runnerName
                                  }
                                </b>
                              </span>

                              <p>
                                {bookValue ? (
                                  <span
                                    className={
                                      bookValue >
                                      0
                                        ? userRole !==
                                          RoleType.user
                                          ? "red"
                                          : "green"
                                        : userRole !==
                                          RoleType.user
                                        ? "green"
                                        : "red"
                                    }
                                  >
                                    {this.props.shared
                                      ? (
                                          bookValue *
                                          (this.props.shared /
                                            100)
                                        ).toLocaleString()
                                      : bookValue.toLocaleString()}
                                  </span>
                                ) : (
                                  <span>
                                    (0)
                                  </span>
                                )}

                                <PnlCalculate
                                  marketId={
                                    market.marketId
                                  }
                                  selectionId={
                                    runner.selectionId
                                  }
                                />
                              </p>
                            </div>

                            <AvailableToBackLay
                              selections={
                                toss
                                  ? undefined
                                  : runner.ex
                              }
                              selectionsPrev={
                                selectionsPrev
                              }
                              market={
                                market
                              }
                              runner={
                                currentRunner
                              }
                            />
                          </div>
                        </div>
                      );
                    }
                  )}

                {this.state.remarkMarket[
                  market.marketId
                ] ? (
                  <div className="table-remark text-right remark">
                    {
                      this.state.remarkMarket[
                        market.marketId
                      ]
                    }
                  </div>
                ) : null}
              </section>
            );
          }
        )}

        {this.props.fancySelectionId && (
          <BookPopup />
        )}

        {this.props.marketUserBookId && (
          <UserBookPopup />
        )}
      </div>
    );
  }
}

const mapStateToProps = (
  state: any
) => ({
  bet: state.betReducer.bet,

  getMarketBook:
    state.betReducer.userBookMarketList &&
    state.betReducer.userBookMarketList,

  fancySelectionId:
    state.betReducer.fancyMatchAndSelectionId,

  currentMatch:
    state.sportReducer.currentMatch,

  marketUserBookId:
    state.betReducer.marketBookAndSelectionId,
});

const actionCreators = {
  betPopup,
  setRules,
};

export default connect(
  mapStateToProps,
  actionCreators
)(MatchOdds);
