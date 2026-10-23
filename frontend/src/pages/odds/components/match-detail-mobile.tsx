





/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import moment from 'moment';
import MyBetComponent from './my-bet.component';
import MyBetComponent22 from './my-bet-component22';
import MatchOdds from './match-odds';
import PlaceBetBox from './place-bet-box';
import Fancy from './fancy';
import { useAppSelector } from '../../../redux/hooks';
import { selectUserData } from '../../../redux/actions/login/loginSlice';
import { useWebsocketUser } from '../../../context/webSocketUser';
import { useParams } from 'react-router-dom';
import { CustomLink } from '../../_layout/elements/custom-link';
import './match-detail-mobile.css';

const MatchDetailWrapper = (props: any) => {
  const [tvVisible, setTvVisible] = React.useState(false);
  const { socketUser } = useWebsocketUser();
  const userState = useAppSelector(selectUserData);
  const shared = useParams().share;
  const myBetsRef = React.useRef<HTMLDivElement>(null);

  const scrollToMyBets = () => {
    myBetsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="betx-detail-root prelative">
      <div className="betx-detail-toolbar">
                <button type="button" >Game</button>

        <button type="button" onClick={scrollToMyBets}>Place Bets</button>
        <button type="button" aria-label="Toggle TV" onClick={() => setTvVisible(v => !v)}>
          TV      <i className="fa fa-tv" />
        </button>
      </div>

      {tvVisible && props.otherTv?.()}
      {props.scoreBoard?.()}
      {props.t10Tv?.(250)}

      <div className="betx-main-markets">
        {props.markets && (
          <MatchOdds data={props.markets} userState={userState} shared={shared} />
        )}
      </div>

      {props.fancies && props.currentMatch && String(props.currentMatch.sportId) === '4' && (
        <div className="betx-fancy-container">
          <Fancy socketUser={socketUser} fancies={props.fancies} matchId={props.matchId!} />
        </div>
      )}

      <div ref={myBetsRef} className="betx-my-bets">
        <div className="betx-market-heading">MY BETS</div>
        <MyBetComponent />
      </div>
      <div className="card m-b-10 my-bet betx-secondary-bets">
        <div className="card-body"><MyBetComponent22 /></div>
      </div>
      {props.marketDataList?.stake && <PlaceBetBox stake={props.marketDataList.stake} />}
      {/* <div className="back-main-menu my-2 betx-back-menu">
        {userState?.user?.role === 'user'
          ? <CustomLink to="/match/4">BACK TO INPLAY GAMES</CustomLink>
          : <CustomLink to="/market-analysis">BACK TO INPLAY GAMES</CustomLink>}
      </div> */}
    </div>
  );
};

export default React.memo(MatchDetailWrapper);
