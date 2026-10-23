
import React, { useEffect, useState } from "react";

const CasinoTimer = (props: any) => {
  const { lastOdds } = props;

  const [counter, setCounter] = useState<number>(0);

  const slug = lastOdds?.slug;
  const autoTime = lastOdds?.autotime;

  const runners =
    lastOdds?.event_data?.market?.[0]?.Runners;

  // Normal casino timer
  useEffect(() => {
    if (slug === "Tp1Day") return;

    if (
      autoTime !== undefined &&
      autoTime !== null &&
      autoTime !== ""
    ) {
      const time = parseInt(String(autoTime), 10);

      if (Number.isFinite(time)) {
        setCounter(Math.max(0, time));
      }
    }
  }, [slug, autoTime]);

  // Tp1Day timer
  useEffect(() => {
    if (slug !== "Tp1Day") return;

    const runner0 = runners?.[0];
    const runner1 = runners?.[1];

    const timerNew =
      runner0?.gstatus !== "SUSPENDED"
        ? runner0?.lasttime
        : runner1?.lasttime;

    if (
      timerNew !== undefined &&
      timerNew !== null &&
      timerNew !== ""
    ) {
      const time = parseInt(String(timerNew), 10);

      if (Number.isFinite(time)) {
        setCounter(Math.max(0, time));
      }
    }
  }, [slug, runners]);

  // Two-digit timer
  const displayTime = String(Math.max(0, counter))
    .padStart(2, "0")
    .slice(-2);

  const firstDigit = displayTime[0];
  const secondDigit = displayTime[1];

  const renderDigit = (digit: string, key: number) => (
    <ul className="flip play" key={key}>
      <li className="flip-clock-before">
        <a>
          <div className="up">
            <div className="shadow" />
            <div className="inn">{digit}</div>
          </div>
          <div className="down">
            <div className="shadow" />
            <div className="inn">{digit}</div>
          </div>
        </a>
      </li>

      <li className="flip-clock-active">
        <a>
          <div className="up">
            <div className="shadow" />
            <div className="inn">{digit}</div>
          </div>
          <div className="down">
            <div className="shadow" />
            <div className="inn">{digit}</div>
          </div>
        </a>
      </li>
    </ul>
  );

  return (
    <>
      <style>
        {`
          /* Only change timer appearance.
             Keep original wrapper positioning. */

          .casino-timer-modern.flip-clock-wrapper ul {
            background: #15263e !important;
            border: 1px solid #405775 !important;
            border-radius: 6px !important;
            box-shadow: 0 2px 6px rgba(0,0,0,0.2) !important;
            overflow: hidden;
          }

          .casino-timer-modern.flip-clock-wrapper ul li a div div.inn {
            background: #203654 !important;
            color: #ffcf65 !important;
            text-shadow: 0 0 7px rgba(255,207,101,0.25) !important;
            border-radius: 5px !important;
            font-family: Arial, Helvetica, sans-serif !important;
            font-weight: 700 !important;
          }

          .casino-timer-modern.flip-clock-wrapper ul li a div.up {
            border-bottom: 1px solid rgba(0,0,0,0.45) !important;
          }

          .casino-timer-modern.flip-clock-wrapper ul li a div .shadow {
            background: transparent !important;
          }

          .casino-timer-modern.flip-clock-wrapper ul li a {
            cursor: default;
          }
        `}
      </style>

      <div
        className="clock clock2digit flip-clock-wrapper casino-timer-modern"
        role="timer"
        aria-label={`Casino timer ${counter}`}
      >
        {renderDigit(firstDigit, 0)}
        {renderDigit(secondDigit, 1)}
      </div>
    </>
  );
};

export default CasinoTimer;
