import { create } from 'zustand';
import type { SoccerCall } from '../data/soccerCalls';

export interface RefereeCall {
  id: string;
  callId: string;
  callName: string;
  minute: number;
  userId: string;
  userName: string;
  timestamp: number;
  team?: string;
  player?: string;
  location?: { lat: number; lng: number };
  agree: number;
  disagree: number;
  media?: string[];
  isOfficial?: boolean;
}

export interface Game {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  minute: number;
  status: 'pre' | 'live' | 'ht' | 'ft' | 'et' | 'pens';
  leagueId: string;
  venueName: string;
  venueLocation?: { lat: number; lng: number };
  date: string;
  calls: RefereeCall[];
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  minute: number;
  location?: { lat: number; lng: number };
  caption?: string;
  userId: string;
  timestamp: number;
  tags: string[];
}

interface GameStore {
  currentGame: Game | null;
  selectedCall: SoccerCall | null;
  cardType: 'yellow' | 'red' | null;
  showCard: boolean;
  activeTab: 'referee' | 'compare' | 'leagues' | 'timeline' | 'studio';
  mediaItems: MediaItem[];
  userCalls: RefereeCall[];
  allCalls: RefereeCall[];
  activeCategory: string;
  localLeagues: Array<{ id: string; name: string; country: string; ageGroup: string; teams: string[] }>;

  setCurrentGame: (game: Game | null) => void;
  setSelectedCall: (call: SoccerCall | null) => void;
  showCardOverlay: (type: 'yellow' | 'red') => void;
  dismissCard: () => void;
  setActiveTab: (tab: GameStore['activeTab']) => void;
  addMedia: (item: MediaItem) => void;
  makeCall: (call: RefereeCall) => void;
  voteCall: (callId: string, vote: 'agree' | 'disagree') => void;
  setActiveCategory: (cat: string) => void;
  addLocalLeague: (league: GameStore['localLeagues'][0]) => void;
}

// Simulated fan calls for demo
const DEMO_CALLS: RefereeCall[] = [
  { id: '1', callId: 'foul', callName: 'Foul', minute: 23, userId: 'fan1', userName: 'SoccerFan_UK', timestamp: Date.now() - 3600000, agree: 847, disagree: 203, isOfficial: false },
  { id: '2', callId: 'yellow', callName: 'Yellow Card', minute: 23, userId: 'official', userName: '🏅 Official Referee', timestamp: Date.now() - 3600000 + 5000, agree: 1204, disagree: 89, isOfficial: true },
  { id: '3', callId: 'offside', callName: 'Offside', minute: 37, userId: 'fan2', userName: 'GoalMachine99', timestamp: Date.now() - 2800000, agree: 1567, disagree: 445, isOfficial: false },
  { id: '4', callId: 'penalty', callName: 'Penalty', minute: 67, userId: 'fan3', userName: 'RefWatcher', timestamp: Date.now() - 1200000, agree: 2341, disagree: 1102, isOfficial: false },
  { id: '5', callId: 'var_check', callName: 'VAR Check', minute: 67, userId: 'official', userName: '🏅 Official VAR', timestamp: Date.now() - 1195000, agree: 987, disagree: 234, isOfficial: true },
];

export const useGameStore = create<GameStore>((set) => ({
  currentGame: {
    id: 'g1',
    homeTeam: 'Arsenal',
    awayTeam: 'Chelsea',
    homeScore: 2,
    awayScore: 1,
    minute: 67,
    status: 'live',
    leagueId: 'epl',
    venueName: 'Emirates Stadium',
    venueLocation: { lat: 51.5549, lng: -0.1084 },
    date: '2026-05-25',
    calls: DEMO_CALLS,
  },
  selectedCall: null,
  cardType: null,
  showCard: false,
  activeTab: 'referee',
  mediaItems: [],
  userCalls: [],
  allCalls: DEMO_CALLS,
  activeCategory: 'all',
  localLeagues: [],

  setCurrentGame: (game) => set({ currentGame: game }),
  setSelectedCall: (call) => set({ selectedCall: call }),
  showCardOverlay: (type) => set({ cardType: type, showCard: true }),
  dismissCard: () => set({ showCard: false, cardType: null }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  addMedia: (item) => set((s) => ({ mediaItems: [...s.mediaItems, item] })),
  makeCall: (call) => set((s) => ({
    userCalls: [...s.userCalls, call],
    allCalls: [...s.allCalls, call],
  })),
  voteCall: (callId, vote) => set((s) => ({
    allCalls: s.allCalls.map((c) =>
      c.id === callId
        ? { ...c, agree: vote === 'agree' ? c.agree + 1 : c.agree, disagree: vote === 'disagree' ? c.disagree + 1 : c.disagree }
        : c
    ),
  })),
  setActiveCategory: (cat) => set({ activeCategory: cat }),
  addLocalLeague: (league) => set((s) => ({ localLeagues: [...s.localLeagues, league] })),
}));
