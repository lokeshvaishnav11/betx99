



/* eslint-disable */
import React from 'react';
import LFancy from '../../../models/LFancy';
import { FancyType, IFancy } from '../../../models/IFancy';
import { SocketContext } from '../../../context/webSocket';
import { FancyList } from './fancy/fancy-list';
import { connect } from 'react-redux';
import { setFancyType } from '../../../redux/actions/bet/betSlice';
import { setRules } from '../../../redux/actions/common/commonSlice';
import sportsService from '../../../services/sports.service';
import './match-detail-mobile.css';

type GroupKey = 'blank' | 'overBallNo' | 'ballRun';
type FancyGroups = Record<GroupKey, LFancy[]>;
type Props = {
  fancies: LFancy[];
  matchId: string;
  fancyType: string;
  socketUser: any;
  setRules: (data: { open: boolean; type: string }) => void;
};
type State = {
  fancies: FancyGroups;
  fancyUpdate: Record<string, IFancy>;
};

const emptyGroups = (): FancyGroups => ({ blank: [], overBallNo: [], ballRun: [] });

class Fancy extends React.Component<Props, State> {
  static contextType = SocketContext;
  context!: React.ContextType<typeof SocketContext>;
  interval?: ReturnType<typeof setInterval>;
  private socketConnection?: any;
  private userConnection?: any;
  private connectHandler = () => this.socketConnection?.emit('joinRoom', this.props.matchId);

  constructor(props: Props) {
    super(props);
    this.state = {
      fancies: this.groupFancies(props.fancies || []),
      fancyUpdate: this.initialUpdates(props.fancies || []),
    };
  }


private groupType = (fancyName: string): GroupKey => {
  const name = String(fancyName || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

  // Over By Over: "Only" compulsory
  if (/^only\s+\d+(?:st|nd|rd|th)?\s+over\b/.test(name)) {
    return 'overBallNo';
  }

  // Ball By Ball
  if (/\bball\s+(?:run|no)\b/.test(name)) {
    return 'ballRun';
  }

  // All remaining fancies
  return 'blank';
};


  private groupFancies = (items: LFancy[]): FancyGroups => {
    const groups = emptyGroups();
    [...items].sort((a: any, b: any) => Number(a.sr_no || 0) - Number(b.sr_no || 0))
      .forEach(item => groups[this.groupType(item.fancyName)].push(item));
    return groups;
  };

  private initialUpdates = (items: LFancy[]): Record<string, IFancy> => {
    const updates: Record<string, IFancy> = {};
    items.forEach(item => {
      updates[String(item.marketId)] = {
        gtype: item.gtype as FancyType,
        SelectionId: item.marketId,
        RunnerName: item.fancyName,
      } as IFancy;
    });
    return updates;
  };

  componentDidMount() {
    this.bindSockets();
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.matchId !== this.props.matchId ||
        prevProps.socketUser !== this.props.socketUser) {
      this.unbindSockets(prevProps.matchId);
      this.setState({
        fancies: this.groupFancies(this.props.fancies || []),
        fancyUpdate: this.initialUpdates(this.props.fancies || []),
      });
      this.bindSockets();
    } else if (prevProps.fancies !== this.props.fancies) {
      this.setState(state => ({
        fancies: this.groupFancies(this.props.fancies || []),
        fancyUpdate: { ...this.initialUpdates(this.props.fancies || []), ...state.fancyUpdate },
      }));
    }
  }

  componentWillUnmount() {
    this.unbindSockets(this.props.matchId);
  }

  private bindSockets = () => {
    this.socketConnection = this.context?.socket;
    this.userConnection = this.props.socketUser;
    this.socketConnection?.emit('joinRoom', this.props.matchId);
    this.socketConnection?.on('connect', this.connectHandler);
    this.userConnection?.emit('joinRoomMatchIdWUserId', this.props.matchId);
    this.userConnection?.on('addNewFancy', this.handleAdd);
    this.userConnection?.on('removeFancy', this.handleRemove);
    this.userConnection?.on('suspendedFancy', this.handleSuspend);
    this.pollFancy();
    this.interval = setInterval(this.pollFancy, 200);
  };

  private unbindSockets = (matchId: string) => {
    if (this.interval) clearInterval(this.interval);
    this.socketConnection?.off('connect', this.connectHandler);
    this.socketConnection?.emit('leaveRoom', matchId);
    this.userConnection?.off('addNewFancy', this.handleAdd);
    this.userConnection?.off('removeFancy', this.handleRemove);
    this.userConnection?.off('suspendedFancy', this.handleSuspend);
  };

  private pollFancy = async () => {
    try {
      const { data } = await sportsService.fancyData(+this.props.matchId);
      const items: IFancy[] = Array.isArray(data?.data) ? data.data : [];
      this.setState(state => {
        const updated = { ...state.fancyUpdate };
        items.forEach(item => {
          updated[String(item.SelectionId)] = {
            ...updated[String(item.SelectionId)],
            ...item,
          };
        });
        return { fancyUpdate: updated };
      });
    } catch (error) {
      console.error('Fancy price update failed:', error);
    }
  };

  private handleAdd = ({ newFancy, fancy }: any) => {
    if (!newFancy || !fancy) return;
    if (this.props.fancyType && this.props.fancyType !== newFancy.gtype) return;
    const group = this.groupType(fancy.RunnerName || newFancy.fancyName);
    this.setState(state => {
      if (state.fancies[group].some(x => String(x.marketId) === String(newFancy.marketId))) return null;
      const list = [...state.fancies[group], newFancy].sort(
        (a: any, b: any) => Number(a.sr_no || 0) - Number(b.sr_no || 0)
      );
      return {
        fancies: { ...state.fancies, [group]: list },
        fancyUpdate: { ...state.fancyUpdate, [String(fancy.SelectionId)]: fancy },
      };
    });
  };

  private handleRemove = (fancy: any) => {
    if (!fancy) return;
    this.setState(state => {
      const fancies = emptyGroups();
      (Object.keys(fancies) as GroupKey[]).forEach(key => {
        fancies[key] = state.fancies[key].filter(
          item => String(item.marketId) !== String(fancy.marketId)
        );
      });
      const fancyUpdate = { ...state.fancyUpdate };
      delete fancyUpdate[String(fancy.marketId)];
      return { fancies, fancyUpdate };
    });
  };

  private handleSuspend = (data: any) => {
    const fancy = data?.fancy;
    if (!fancy) return;
    this.setState(state => {
      const fancies = { ...state.fancies };
      (Object.keys(fancies) as GroupKey[]).forEach(key => {
        fancies[key] = state.fancies[key].map(item => {
          if (String(item.marketId) !== String(fancy.marketId)) return item;
          return {
            ...item,
            ...(data.type === 'active'
              ? { active: fancy.active }
              : { GameStatus: fancy.GameStatus, isSuspend: fancy.isSuspend }),
          };
        });
      });
      return { fancies };
    });
  };

  renderSection = (title: string, items: LFancy[]) => {
    if (!items.length) return null;
    return (
      <section className="betx-fancy-section">
        <div className="betx-market-heading">{title}</div>
        <div className="betx-fancy-columns" aria-hidden="true">
          <div className="betx-fancy-name-column" />
          <div className="betx-fancy-no-column">No</div>
          <div className="betx-fancy-yes-column">Yes</div>
        </div>
        <div className="betx-fancy-list">
          <FancyList fancies={items} fancyUpdate={this.state.fancyUpdate} />
        </div>
      </section>
    );
  };

  render() {
    const { blank, overBallNo, ballRun } = this.state.fancies;
    return (
      <div className="betx-fancy-root">
        {this.renderSection('Normal Fancy', blank)}
        {this.renderSection('Over By Over', overBallNo)}
        {this.renderSection('Ball By Ball', ballRun)}
      </div>
    );
  }
}

const mapStateToProps = (state: any) => ({ fancyType: state.betReducer.fancyType });
export default connect(mapStateToProps, { setFancyType, setRules })(Fancy);
