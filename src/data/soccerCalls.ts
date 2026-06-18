export interface SoccerCall {
  id: string;
  name: string;
  shortName: string;
  emoji: string;
  category: 'foul' | 'card' | 'restart' | 'offside' | 'goal' | 'var' | 'injury' | 'time';
  color: string;
  description: string;
  signal?: string;
}

export const SOCCER_CALLS: SoccerCall[] = [
  // Fouls
  { id: 'foul', name: 'Foul', shortName: 'FOUL', emoji: '🦵', category: 'foul', color: '#ff6b35', description: 'Direct free kick foul', signal: 'Arm points to spot' },
  { id: 'handball', name: 'Handball', shortName: 'HAND', emoji: '✋', category: 'foul', color: '#ff6b35', description: 'Deliberate handball', signal: 'Tap shoulder' },
  { id: 'pushing', name: 'Pushing', shortName: 'PUSH', emoji: '👐', category: 'foul', color: '#ff6b35', description: 'Pushing an opponent', signal: 'Both hands push forward' },
  { id: 'tripping', name: 'Tripping', shortName: 'TRIP', emoji: '🤸', category: 'foul', color: '#ff6b35', description: 'Tripping an opponent', signal: 'Leg sweep gesture' },
  { id: 'charging', name: 'Charging', shortName: 'CHRG', emoji: '💪', category: 'foul', color: '#ff6b35', description: 'Illegal charging', signal: 'Arm out side' },
  { id: 'tackling', name: 'Dangerous Tackle', shortName: 'D.TACK', emoji: '⚠️', category: 'foul', color: '#ff4500', description: 'Reckless tackle from behind', signal: 'Point to spot' },
  { id: 'holding', name: 'Holding', shortName: 'HOLD', emoji: '🤝', category: 'foul', color: '#ff6b35', description: 'Holding an opponent', signal: 'Grab own wrist' },
  { id: 'shirt_pull', name: 'Shirt Pull', shortName: 'SHIRT', emoji: '👕', category: 'foul', color: '#ff6b35', description: 'Pulling the shirt', signal: 'Pull own shirt collar' },
  { id: 'spitting', name: 'Spitting', shortName: 'SPIT', emoji: '🤮', category: 'foul', color: '#ff0000', description: 'Spitting at a person', signal: 'Straight red' },
  { id: 'violent', name: 'Violent Conduct', shortName: 'VIO', emoji: '👊', category: 'foul', color: '#ff0000', description: 'Violent conduct', signal: 'Straight red' },
  { id: 'biting', name: 'Biting', shortName: 'BITE', emoji: '😬', category: 'foul', color: '#ff0000', description: 'Biting an opponent', signal: 'Straight red' },

  // Cards
  { id: 'yellow', name: 'Yellow Card', shortName: 'YELLOW', emoji: '🟨', category: 'card', color: '#FFD700', description: 'Caution / booking', signal: 'Show yellow card' },
  { id: 'second_yellow', name: '2nd Yellow → Red', shortName: '2ND YEL', emoji: '🟨🟥', category: 'card', color: '#FF8C00', description: 'Second yellow = dismissal', signal: 'Show yellow then red' },
  { id: 'red', name: 'Red Card', shortName: 'RED', emoji: '🟥', category: 'card', color: '#FF0000', description: 'Dismissal from game', signal: 'Show red card' },

  // Restarts
  { id: 'free_kick', name: 'Free Kick', shortName: 'FK', emoji: '⚽', category: 'restart', color: '#00d4ff', description: 'Direct free kick awarded', signal: 'Point to spot' },
  { id: 'indirect_fk', name: 'Indirect Free Kick', shortName: 'IFK', emoji: '🎯', category: 'restart', color: '#00aaff', description: 'Indirect free kick', signal: 'Arm raised upright' },
  { id: 'penalty', name: 'Penalty Kick', shortName: 'PEN', emoji: '🎯', category: 'restart', color: '#ff00ff', description: 'Penalty kick awarded', signal: 'Point to penalty spot' },
  { id: 'corner', name: 'Corner Kick', shortName: 'CRN', emoji: '🚩', category: 'restart', color: '#00d4ff', description: 'Corner kick', signal: 'Point to corner flag' },
  { id: 'goal_kick', name: 'Goal Kick', shortName: 'GK', emoji: '🥅', category: 'restart', color: '#00d4ff', description: 'Goal kick', signal: 'Point to goal area' },
  { id: 'throw_in', name: 'Throw In', shortName: 'TIN', emoji: '🙌', category: 'restart', color: '#00d4ff', description: 'Throw-in awarded', signal: 'Point to touchline' },
  { id: 'drop_ball', name: 'Drop Ball', shortName: 'DROP', emoji: '⬇️', category: 'restart', color: '#8888ff', description: 'Dropped ball restart', signal: 'Point down' },
  { id: 'kickoff', name: 'Kick Off', shortName: 'KO', emoji: '🔵', category: 'restart', color: '#4488ff', description: 'Kick off', signal: 'Circle both arms' },

  // Offside
  { id: 'offside', name: 'Offside', shortName: 'OFS', emoji: '🚫', category: 'offside', color: '#ff4444', description: 'Offside position', signal: 'Raise flag' },
  { id: 'offside_far', name: 'Offside Far Side', shortName: 'OFS-F', emoji: '↗️', category: 'offside', color: '#ff6666', description: 'Far side offside', signal: 'Flag horizontal far' },
  { id: 'offside_mid', name: 'Offside Middle', shortName: 'OFS-M', emoji: '↑', category: 'offside', color: '#ff6666', description: 'Middle offside', signal: 'Flag vertical' },
  { id: 'offside_near', name: 'Offside Near Side', shortName: 'OFS-N', emoji: '↙️', category: 'offside', color: '#ff6666', description: 'Near side offside', signal: 'Flag horizontal near' },

  // Goal
  { id: 'goal', name: 'Goal', shortName: 'GOAL', emoji: '⚽✅', category: 'goal', color: '#00ff88', description: 'Goal scored!', signal: 'Point to centre circle' },
  { id: 'no_goal', name: 'No Goal', shortName: 'NO-G', emoji: '🚫⚽', category: 'goal', color: '#ff4444', description: 'Goal disallowed', signal: 'Arms crossed' },
  { id: 'penalty_goal', name: 'Penalty Goal', shortName: 'PEN-G', emoji: '🎯✅', category: 'goal', color: '#00ff88', description: 'Penalty kick goal', signal: 'Point to centre' },
  { id: 'own_goal', name: 'Own Goal', shortName: 'OWN-G', emoji: '😬⚽', category: 'goal', color: '#ffaa00', description: 'Own goal', signal: 'Point to net' },

  // VAR
  { id: 'var_check', name: 'VAR Check', shortName: 'VAR', emoji: '📺', category: 'var', color: '#aa88ff', description: 'Video review initiated', signal: 'Draw rectangle' },
  { id: 'var_review', name: 'VAR Review', shortName: 'V-REV', emoji: '🔍', category: 'var', color: '#aa88ff', description: 'Referee going to review', signal: 'Ear signal + screen' },
  { id: 'var_upheld', name: 'Decision Upheld', shortName: 'V-OK', emoji: '✅', category: 'var', color: '#00ff88', description: 'VAR confirms decision', signal: 'OK signal' },
  { id: 'var_overturned', name: 'Decision Overturned', shortName: 'V-OVR', emoji: '🔄', category: 'var', color: '#ff6600', description: 'VAR overturns decision', signal: 'Circle motion' },

  // Injury / Time
  { id: 'injury', name: 'Injury / Stop', shortName: 'INJRY', emoji: '🏥', category: 'injury', color: '#ff8844', description: 'Injury stoppage', signal: 'Cross arms above head' },
  { id: 'substitution', name: 'Substitution', shortName: 'SUB', emoji: '🔄', category: 'injury', color: '#88ff88', description: 'Player substitution', signal: 'Raise board' },
  { id: 'time_added', name: 'Added Time', shortName: 'ADD-T', emoji: '⏱️', category: 'time', color: '#ffdd00', description: 'Additional time indicated', signal: 'Hold up board' },
  { id: 'halftime', name: 'Half Time', shortName: 'HT', emoji: '🏁', category: 'time', color: '#88aaff', description: 'End of first half', signal: 'Long whistle blast' },
  { id: 'fulltime', name: 'Full Time', shortName: 'FT', emoji: '🔔', category: 'time', color: '#ffaa00', description: 'End of match', signal: 'Long whistle blast x3' },
  { id: 'extra_time', name: 'Extra Time', shortName: 'ET', emoji: '⏰', category: 'time', color: '#ff8800', description: 'Extra time awarded', signal: 'Arms cross overhead' },
  { id: 'penalties', name: 'Penalty Shootout', shortName: 'PENS', emoji: '🎯🏆', category: 'time', color: '#ff00ff', description: 'Penalty shootout', signal: 'Point to penalty spot' },
  { id: 'advantage', name: 'Advantage', shortName: 'ADV', emoji: '➡️', category: 'foul', color: '#00dd88', description: 'Play advantage', signal: 'Both arms sweep forward' },
  { id: 'encroachment', name: 'Encroachment', shortName: 'ENCR', emoji: '↩️', category: 'foul', color: '#ffaa00', description: 'Player entered box early', signal: 'Retake signal' },
  { id: 'gk_hold', name: 'Keeper Held Ball', shortName: 'GK-H', emoji: '🧤', category: 'foul', color: '#ff6b35', description: 'Goalkeeper holding ball too long', signal: 'Clock hands' },
];

export const CALL_CATEGORIES = [
  { id: 'all', label: 'ALL', color: '#ffffff' },
  { id: 'foul', label: 'FOULS', color: '#ff6b35' },
  { id: 'card', label: 'CARDS', color: '#FFD700' },
  { id: 'restart', label: 'RESTART', color: '#00d4ff' },
  { id: 'offside', label: 'OFFSIDE', color: '#ff4444' },
  { id: 'goal', label: 'GOAL', color: '#00ff88' },
  { id: 'var', label: 'VAR', color: '#aa88ff' },
  { id: 'injury', label: 'INJURY', color: '#ff8844' },
  { id: 'time', label: 'TIME', color: '#ffdd00' },
];
