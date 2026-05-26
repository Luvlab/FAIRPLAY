import { create } from 'zustand';
import type { SoccerCall } from '../data/soccerCalls';
import {
  supabase,
  signInAnon,
  submitCall as sbSubmitCall,
  voteOnCall as sbVoteOnCall,
  getGameCalls,
  subscribeToGameCalls,
  uploadMedia as sbUploadMedia,
  insertMediaRecord,
  createLocalLeague as sbCreateLeague,
  getLocalLeagues,
} from '../lib/supabase';

export interface RefereeCall {
  id: string;
  callId: string;
  callName: string;
  minute: number;
  userId: string;
  userName: string;
  timestamp: number;
  location?: { lat: number; lng: number };
  agree: number;
  disagree: number;
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
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  minute: number;
  location?: { lat: number; lng: number };
  caption?: string;
  userId: string;
  timestamp: number;
  tags: string[];
}

export interface LocalLeague {
  id: string;
  name: string;
  country: string;
  ageGroup: string;
  teams: string[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToCall(row: any): RefereeCall {
  return {
    id: row.id,
    callId: row.call_id,
    callName: row.call_name,
    minute: row.minute,
    userId: row.user_id,
    userName: row.user_name,
    timestamp: new Date(row.created_at).getTime(),
    agree: row.agree_count ?? 0,
    disagree: row.disagree_count ?? 0,
    isOfficial: row.is_official ?? false,
    location: row.lat && row.lng ? { lat: row.lat, lng: row.lng } : undefined,
  };
}

const DEMO_GAME_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

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
  localLeagues: LocalLeague[];
  userId: string | null;
  isOnline: boolean;
  isLoading: boolean;

  init: () => Promise<void>;
  setCurrentGame: (game: Game | null) => void;
  setSelectedCall: (call: SoccerCall | null) => void;
  showCardOverlay: (type: 'yellow' | 'red') => void;
  dismissCard: () => void;
  setActiveTab: (tab: GameStore['activeTab']) => void;
  addMedia: (item: MediaItem) => void;
  uploadAndAddMedia: (file: File, minute: number, caption: string, location: { lat: number; lng: number } | null) => Promise<void>;
  makeCall: (call: RefereeCall) => void;
  submitLiveCall: (callId: string, callName: string, minute: number, location?: { lat: number; lng: number }) => Promise<void>;
  voteCall: (callId: string, vote: 'agree' | 'disagree') => void;
  setActiveCategory: (cat: string) => void;
  addLocalLeague: (league: Omit<LocalLeague, 'id'>) => Promise<void>;
  loadLocalLeagues: () => Promise<void>;
}

export const useGameStore = create<GameStore>((set, get) => ({
  currentGame: {
    id: DEMO_GAME_ID,
    homeTeam: 'Arsenal',
    awayTeam: 'Chelsea',
    homeScore: 2,
    awayScore: 1,
    minute: 67,
    status: 'live',
    leagueId: 'epl',
    venueName: 'Emirates Stadium',
    venueLocation: { lat: 51.5549, lng: -0.1084 },
    date: '2026-05-26',
  },
  selectedCall: null,
  cardType: null,
  showCard: false,
  activeTab: 'referee',
  mediaItems: [],
  userCalls: [],
  allCalls: [],
  activeCategory: 'all',
  localLeagues: [],
  userId: null,
  isOnline: false,
  isLoading: true,

  init: async () => {
    set({ isLoading: true });

    // 1. Anon sign-in
    const user = await signInAnon();
    if (user) set({ userId: user.id, isOnline: true });

    // 2. Fetch existing calls
    const rows = await getGameCalls(DEMO_GAME_ID);
    if (rows.length > 0) set({ allCalls: rows.map(rowToCall) });

    // 3. Realtime subscription
    subscribeToGameCalls(DEMO_GAME_ID, (row) => {
      const call = rowToCall(row);
      set((s) => {
        // Deduplicate: ignore if we already have this id
        if (s.allCalls.find((c) => c.id === call.id)) return s;
        return { allCalls: [call, ...s.allCalls] };
      });
    });

    // 4. Local leagues
    if (user) await get().loadLocalLeagues();

    set({ isLoading: false });
  },

  setCurrentGame: (game) => set({ currentGame: game }),
  setSelectedCall: (call) => set({ selectedCall: call }),
  showCardOverlay: (type) => set({ cardType: type, showCard: true }),
  dismissCard: () => set({ showCard: false, cardType: null }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  addMedia: (item) => set((s) => ({ mediaItems: [item, ...s.mediaItems] })),

  uploadAndAddMedia: async (file, minute, caption, location) => {
    const { userId, currentGame } = get();
    const uid = userId ?? 'anon';
    const gameId = currentGame?.id ?? DEMO_GAME_ID;

    const localUrl = URL.createObjectURL(file);
    const localItem: MediaItem = {
      id: `local-${Date.now()}`,
      type: file.type.startsWith('video') ? 'video' : 'image',
      url: localUrl,
      minute,
      caption,
      userId: uid,
      timestamp: Date.now(),
      tags: [],
      location: location ?? undefined,
    };
    set((s) => ({ mediaItems: [localItem, ...s.mediaItems] }));

    if (supabase) {
      const publicUrl = await sbUploadMedia(file, gameId, uid);
      if (publicUrl) {
        await insertMediaRecord({
          game_id: gameId,
          user_id: uid,
          type: localItem.type,
          url: publicUrl,
          minute,
          caption: caption || undefined,
          lat: location?.lat,
          lng: location?.lng,
        });
        set((s) => ({
          mediaItems: s.mediaItems.map((m) =>
            m.id === localItem.id ? { ...m, url: publicUrl } : m
          ),
        }));
      }
    }
  },

  makeCall: (call) => set((s) => ({
    userCalls: [call, ...s.userCalls],
    allCalls: [call, ...s.allCalls],
  })),

  submitLiveCall: async (callId, callName, minute, location) => {
    const { userId, currentGame } = get();
    const uid = userId ?? `fan-${Math.random().toString(36).slice(2, 8)}`;
    const gameId = currentGame?.id ?? DEMO_GAME_ID;
    const optId = `opt-${Date.now()}`;

    const optimistic: RefereeCall = {
      id: optId, callId, callName, minute,
      userId: uid, userName: 'You',
      timestamp: Date.now(), agree: 1, disagree: 0,
      isOfficial: false, location,
    };
    set((s) => ({ userCalls: [optimistic, ...s.userCalls], allCalls: [optimistic, ...s.allCalls] }));

    if (supabase) {
      const row = await sbSubmitCall({
        game_id: gameId, call_id: callId, call_name: callName,
        minute, user_id: uid, user_name: 'Fan',
        lat: location?.lat, lng: location?.lng,
      });
      if (row) {
        const real = rowToCall(row);
        set((s) => ({
          allCalls: s.allCalls.map((c) => c.id === optId ? real : c),
          userCalls: s.userCalls.map((c) => c.id === optId ? real : c),
        }));
      }
    }
  },

  voteCall: (callId, vote) => {
    set((s) => ({
      allCalls: s.allCalls.map((c) =>
        c.id === callId
          ? { ...c, agree: vote === 'agree' ? c.agree + 1 : c.agree, disagree: vote === 'disagree' ? c.disagree + 1 : c.disagree }
          : c
      ),
    }));
    if (supabase) sbVoteOnCall(callId, vote);
  },

  setActiveCategory: (cat) => set({ activeCategory: cat }),

  addLocalLeague: async (league) => {
    const { userId } = get();
    const local: LocalLeague = { id: `local-${Date.now()}`, ...league };
    set((s) => ({ localLeagues: [...s.localLeagues, local] }));

    if (supabase && userId) {
      const row = await sbCreateLeague({
        name: league.name, country: league.country,
        age_group: league.ageGroup, teams: league.teams,
        created_by: userId,
      });
      if (row) {
        set((s) => ({
          localLeagues: s.localLeagues.map((l) => l.id === local.id ? { ...l, id: row.id } : l),
        }));
      }
    }
  },

  loadLocalLeagues: async () => {
    const { userId } = get();
    if (!userId) return;
    const rows = await getLocalLeagues(userId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    set({ localLeagues: rows.map((r: any) => ({ id: r.id, name: r.name, country: r.country, ageGroup: r.age_group, teams: r.teams ?? [] })) });
  },
}));
