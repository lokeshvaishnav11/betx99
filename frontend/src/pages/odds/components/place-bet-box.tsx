import "./place-bet-popup.css";
import React, { MouseEvent } from "react";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { shallowEqual } from "react-redux";
import {
  betPopup,
  selectBetCount,
  selectBetPopup,
  selectPlaceBet,
  setBetCount,
} from "../../../redux/actions/bet/betSlice";
import { IUserBetStake } from "../../../models/IUserStake";
import IBet, { IBetOn, IBetType } from "../../../models/IBet";
import { getPlaceBetAction } from "../../../redux/actions/bet/bet.action";
import { IApiStatus } from "../../../models/IApiStatus";
import { useWebsocketUser } from "../../../context/webSocketUser";
import { OddsType } from "../../../models/IMarket";
import userService from "../../../services/user.service";
import { AxiosResponse } from "axios";
import { setBalance } from "../../../redux/actions/balance/balanceSlice";



const PlaceBetBox = ({ stake }: { stake: IUserBetStake }) => {
  //console.log(stake,"stake")
  const [betObj, setBetObj] = React.useState<IBet>({} as IBet);
  const betValues = useAppSelector(selectBetPopup, shallowEqual);
  const getPlaceBet = useAppSelector(selectPlaceBet, shallowEqual);
  const betCount = useAppSelector(selectBetCount);
  const { socketUser } = useWebsocketUser();

  const dispatch = useAppDispatch();

  React.useEffect(() => {
    setBetObj({
      ...betValues.betData,
      odds:
        typeof betValues.betData.odds === "string"
          ? parseFloat(betValues.betData.odds)
          : betValues.betData.odds,
    });
  }, [betValues.betData]);

  React.useEffect(() => {
    if (getPlaceBet.status === IApiStatus.Done) {
      socketUser.emit("place-bet", getPlaceBet.bet);
      // dispatch(setBookMarketList({}))
      dispatch(betPopup({ isOpen: false, betData: {} as IBet }));
      dispatch(setBetCount(betCount + 1));
      userService.getUserBalance().then((res: AxiosResponse) => {
        dispatch(setBalance(res.data.data));
      });
    }
  }, [getPlaceBet.status]);

  const reset = () => {
    setBetObj({ ...betObj, stack: 0, pnl: 0 });
    dispatch(
      betPopup({
        ...betValues,
        betData: { ...betValues.betData, stack: 0, pnl: 0 },
      })
    );
  };

  const onStack = (stack: number) => {
    const betObjItem = { ...betObj };
    betObjItem.stack = betObjItem.stack + stack;
    const calPnl = calculatePnlF(betObjItem);

    betObjItem.pnl = calPnl.pnl;
    betObjItem.exposure = calPnl.exposure;
    setBetObj(betObjItem);
    dispatch(betPopup({ ...betValues, betData: { ...betObjItem } }));
  };

  const incrementDecrementOdds = (type = "inc") => {
    const betObjItem = { ...betObj };

    if (
      betObjItem.oddsType === OddsType.BM ||
      betObjItem.oddsType === OddsType.F
    ) {
      return true;
    }
    switch (type) {
      case "inc":
        betObjItem.odds = parseFloat((betObjItem.odds + 0.01).toFixed(4));
        break;
      case "dec":
        betObjItem.odds = parseFloat((betObjItem.odds - 0.01).toFixed(4));
        break;
    }
    const calPnl = calculatePnlF(betObjItem);
    betObjItem.pnl = calPnl.pnl;
    betObjItem.exposure = calPnl.exposure;
    betObjItem.type =
      betObjItem.odds !== betObjItem.currentMarketOdds
        ? IBetType.UnMatch
        : IBetType.Match;
    dispatch(betPopup({ ...betValues, betData: { ...betObjItem } }));

    setBetObj(betObjItem);
  };

  const calculatePnlF = (betValue: IBet) => {
    let pnl = 0,
      exposure = 0;
    if (Object.keys(betValue).length > 0) {
      if (betValue.betOn == IBetOn.MATCH_ODDS || betValue.gtype === "fancy1") {
        if (betValue.isBack) {
          pnl = betValue.odds * betValue.stack - betValue.stack;
          exposure = -1 * betValue.stack;
        } else {
          pnl = betValue.stack;
          exposure = -1 * (betValue.odds * betValue.stack - betValue.stack);
        }
      } else if (betValue.betOn != IBetOn.CASINO) {
        if (betValue.isBack) {
          pnl = (betValue.volume * betValue.stack) / 100;
          exposure = -betValue.stack;
        } else {
          exposure = -((betValue.volume * betValue.stack) / 100);
          pnl = betValue.stack;
        }
      } else if (betValue.betOn == IBetOn.CASINO) {
        if (betValue.matchId == 33) {
          //// specific condition for cmeter game
          pnl = 0;
          exposure = -50 * betValue.stack * 1.0;
        } else if (betValue.matchId == 9) {
          //// specific condition for tp1day game
          if (betValue.isBack) {
            pnl = (betValue.odds / 100) * betValue.stack;
            exposure = -betValue.stack;
          } else {
            pnl = betValue.stack;
            exposure = -1 * (betValue.odds * betValue.stack - betValue.stack);
          }
        } else if (betValue.fancystatus == "yes") {
          //// specific condition for cmeter game
          if (betValue.isBack) {
            pnl = (betValue.volume * betValue.stack) / 100;
            exposure = -betValue.stack;
          } else {
            exposure = -((betValue.volume * betValue.stack) / 100);
            pnl = betValue.stack;
          }
        } else {
          if (betValue.isBack) {
            pnl = betValue.odds * betValue.stack - betValue.stack;
            exposure = -1 * betValue.stack;
          } else {
            pnl = betValue.stack;
            exposure = -1 * (betValue.odds * betValue.stack - betValue.stack);
          }
        }
      }
    }
    return {
      pnl: parseInt(pnl.toFixed()),
      exposure: parseInt(exposure.toFixed()),
    };
  };

  const onChangeStack = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBetObj({ ...betObj, stack: parseInt(e.target.value) });
  };

  const onBlurStack = () => {
    onStack(0);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(getPlaceBetAction(betObj));
  };

  const renderStakeButtons = () => {
    const max = betValues?.betData?.betOn === "MATCH_ODDS" ? 13 : 11;
    return Array.from({ length: max }, (_, i) => i + 1).map((index) => (
      <button
        key={index}
        type="button"
        className="pb-stake-preset"
        onClick={() => onStack(Number((stake as any)[`value${index}`]) || 0)}
      >
        {(stake as any)[`name${index}`] || ""}
      </button>
    ));
  };

  const [seconds, setSeconds] = React.useState<number>(7);
  const [editingStakes, setEditingStakes] = React.useState(false);

  const closeBetPopup = () => {
    dispatch(betPopup({
      ...betValues,
      isOpen: false,
      betData: { ...betValues.betData, stack: 0, pnl: 0 },
    }));
  };

  React.useEffect(() => {
    if (!betValues.isOpen || ["CASINO", "MATKA"].includes(betValues.betData?.betOn)) return;
    setSeconds(7);
    const interval = setInterval(() => {
      setSeconds((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [betValues.isOpen, betValues.betData?.betOn]);

  React.useEffect(() => {
    if (seconds === 0 && betValues.isOpen && !["CASINO", "MATKA"].includes(betValues.betData?.betOn)) {
      closeBetPopup();
    }
  }, [seconds, betValues.isOpen]);

  const onBackDrop = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    closeBetPopup();
  };

  const odds = Number(betObj.odds);
  const oddsText = Number.isFinite(odds) ? String(Number(odds.toFixed(4))) : "";

  return (
    <>
      {betValues.isOpen && (
        <>
          <div className="backdrop-custom pb-overlay" onClick={onBackDrop} />
          <div
            className={`place-bet pb-popup ${betObj.isBack ? "pb-back" : "pb-lay"}`}
            role="dialog"
            aria-modal="true"
            aria-label="Place Bet"
          >
            <div className="pb-header">
              <span className="pb-heading">Place Bet</span>
              <button type="button" className="pb-close" onClick={closeBetPopup} aria-label="Close">×</button>
            </div>
            <form className="pb-body" onSubmit={onSubmit}>
              <div className="pb-selection-row">
                <span className="pb-selection">{betObj.selectionName}</span>
                <input
                  className="pb-odds"
                  aria-label="Odds"
                  type="text"
                  value={oddsText}
                  readOnly
                />
              </div>
              <div className="pb-action-row">
                <input
                  className="pb-stake-input"
                  aria-label="Stake amount"
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={Number.isFinite(betObj.stack) ? betObj.stack : 0}
                  onBlur={onBlurStack}
                  onChange={onChangeStack}
                />
                <button
                  type="submit"
                  className="pb-submit"
                  disabled={getPlaceBet.status === IApiStatus.Loading}
                >
                  {getPlaceBet.status === IApiStatus.Loading ? "Submitting..." : "Submit"}
                </button>
                <button type="button" className="pb-cancel" onClick={reset}>Cancel</button>
              </div>
              <div className="pb-stake-grid">{renderStakeButtons()}</div>
              <div className="pb-bottom-row">
                <button
                  type="button"
                  className="pb-edit"
                  onClick={() => setEditingStakes((v) => !v)}
                >
                  Edit
                </button>
              </div>
              {editingStakes && (
                <p className="pb-edit-hint">Stake presets are managed in your stake settings.</p>
              )}
            </form>
          </div>
        </>
      )}
    </>
  );
};

export default React.memo(PlaceBetBox);
