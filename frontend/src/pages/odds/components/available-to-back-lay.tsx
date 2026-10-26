import React from "react";

import { IBetOn, IBetType } from "../../../models/IBet";
import IRunner from "../../../models/IRunner";
import IMarket, { OddsType } from "../../../models/IMarket";

import { betPopup } from "../../../redux/actions/bet/betSlice";

import { selectCurrentMatch } from "../../../redux/actions/sports/sportSlice";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";

import authService from "../../../services/auth.service";
import { selectUserData } from "../../../redux/actions/login/loginSlice";
import { RoleType } from "../../../models/User";

type Props = {
  selections: any;
  selectionsPrev: any;
  runner: IRunner;
  market: IMarket;
};

type OddsItem = {
  price: number;
  size: number;
  changed?: boolean;
};

export const AvailableToBackLay = React.memo(
  ({ selections, market, runner }: Props) => {
    const dispatch = useAppDispatch();

    const getCurrentMatch = useAppSelector(
      selectCurrentMatch
    );

    const userState = useAppSelector(
      selectUserData
    );

    // ----------------------------------------
    // CUSTOM TOSS MARKET
    // ----------------------------------------

    const isTossMarket =
      market.marketName?.toLowerCase() === "toss" &&
      String(market.marketId) === `toss_${market.matchId}`;

    const TOSS_PRICE = 95;
    const TOSS_SIZE = 100000;

    // Toss mein sirf BACK 95.
    const tossSelections = {
      availableToBack: [
        {
          price: TOSS_PRICE,
          size: TOSS_SIZE,
          changed: false,
        },
      ],

      availableToLay: [],
    };

    const currentSelections = isTossMarket
      ? tossSelections
      : selections;

    // Existing markets ke liye suspension logic.
    const allowSuspension =
      !isTossMarket &&
      (market.runners?.length || 0) < 3;

    // ----------------------------------------
    // BET POPUP
    // ----------------------------------------

    const onBet = (
      isBack: boolean,
      back: OddsItem
    ) => {
      // Toss mein Lay betting allowed nahi.
      if (isTossMarket && !isBack) {
        return;
      }

      if (
        market.oddsType === OddsType.BM &&
        back.size === 0
      ) {
        return;
      }

      const price = Number(back.price);
      const size = Number(back.size);

      if (!Number.isFinite(price) || !Number.isFinite(size)) {
        return;
      }

      if (size <= 0 || price < 1) {
        return;
      }

      if (allowSuspension && price > 100) {
        return;
      }

      if (userState?.user?.role !== RoleType.user) {
        return;
      }

      const ipAddress = authService.getIpAddress();

      // Display 95 -> Actual decimal odds 1.95
      const decimalOdds = isTossMarket
        ? 1.95
        : parseFloat(((price + 100) / 100).toFixed(4));

      dispatch(
        betPopup({
          isOpen: true,

          betData: {
            isBack,
            odds: decimalOdds,
            volume: size,

            marketId: market.marketId,
            marketName: market.marketName,
            matchId: market.matchId,

            selectionName: runner.runnerName,
            selectionId: runner.selectionId,

            pnl: 0,
            stack: 0,

            currentMarketOdds: decimalOdds,

            eventId: market.sportId,
            exposure: 0,
            ipAddress,

            type: IBetType.Match,
            matchName: getCurrentMatch?.name,
            betOn: IBetOn.MATCH_ODDS,
            oddsType: market.oddsType,
          },
        })
      );
    };

    // ----------------------------------------
    // AVAILABLE TO BACK (LAGAI)
    // ----------------------------------------

    const availableToBack = () => {
      return currentSelections?.availableToBack?.map(
        (back: OddsItem, index: number) => {
          // Toss ka Back box Bookmaker jaisa.
          const cls = isTossMarket
            ? "back"
            : index === 2
            ? "back"
            : `back${2 - index}`;

          const blinkCls = back.changed ? "blink" : "";

          if (
            !isTossMarket &&
            market.oddsType === OddsType.BM &&
            index !== 2
          ) {
            return null;
          }

          const classforbox =
            isTossMarket || market.oddsType === OddsType.BM
              ? "box-2"
              : "box-1";

          const price = Number(back.price);

          const suspended =
            !isTossMarket &&
            allowSuspension &&
            (price > 100 || price === 1 || price === 0);

          const displayPrice = isTossMarket
            ? "95"
            : suspended
            ? "0"
            : Number.isFinite(price)
            ? price.toFixed(0)
            : "-";

          return (
            <div
              key={index}
              onClick={() => {
                if (suspended) return;
                onBet(true, back);
              }}
              className={`${classforbox} text-center ${cls} ${blinkCls}`}
              style={{
                cursor: suspended ? "not-allowed" : "pointer",
              }}
            >
              <span className="odd d-block">
                {displayPrice}
              </span>
            </div>
          );
        }
      );
    };

    // ----------------------------------------
    // AVAILABLE TO LAY (KHAI)
    // ----------------------------------------

    const availableToLay = () => {
      // Toss mein Khai box Bookmaker jaisa,
      // lekin odds nahi aur click disabled.
      if (isTossMarket) {
        return (
          <div
            className="box-2 text-center lay"
            style={{
              cursor: "not-allowed",
              opacity: 0.65,
            }}
          >
            <span className="odd d-block">—</span>
          </div>
        );
      }

      return currentSelections?.availableToLay?.map(
        (lay: OddsItem, index: number) => {
          const cls =
            index === 0
              ? "lay"
              : `lay${index}`;

          const blinkCls = lay.changed ? "blink" : "";

          if (
            market.oddsType === OddsType.BM &&
            index !== 0
          ) {
            return null;
          }

          const classforbox =
            market.oddsType !== OddsType.BM
              ? "box-1"
              : "box-2";

          const price = Number(lay.price);

          const suspended =
            allowSuspension &&
            (price > 100 || price === 0);

          const displayPrice = suspended
            ? "0"
            : Number.isFinite(price)
            ? price.toFixed(0)
            : "-";

          return (
            <div
              key={index}
              onClick={() => {
                if (suspended) return;
                onBet(false, lay);
              }}
              className={`${classforbox} text-center ${cls} ${blinkCls}`}
              style={{
                cursor: suspended ? "not-allowed" : "pointer",
              }}
            >
              <span
                className="odd d-block"
                style={{ width: "67px" }}
              >
                {displayPrice}
              </span>
            </div>
          );
        }
      );
    };

    return (
      <>
        {availableToBack()}
        {availableToLay()}
      </>
    );
  }
);