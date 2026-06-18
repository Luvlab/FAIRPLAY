import { create } from 'zustand';
import type { SoccerCall } from '../data/soccerCalls';
import { getSavedWhistleId, saveWhistleId } from '../lib/whistle';
import {
  supabase,
  signInAnon,
  signUp as sbSignUp,
  signIn as sbSignIn,
  signOut as sbSignOut,
  submitCall as sbSubmitCall,
  voteOnCall as sbVoteOnCall,
  getGameCalls,
  subscribeToGameCalls,
  uploadMedia as sbUploadMedia,
  insertMediaRecord,
  createLocalLeague as sbCreateLeague,
  getLocalLeagues,
} from '../lib/supabase';
import { type LiveMatch, matchToGame } from '../lib/footballApi';

export interface RefereeCall {
  id: string;
  callId: string;
  callName: string;
  minute: number;
  userId: string;
  userName: string;
  playerName?: string;
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

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  isAnon: boolean;
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
    playerName: row.player_name ?? undefined,
    timestamp: new Date(row.created_at).getTime(),
    agree: row.agree_count ?? 0,
    disagree: row.disagree_count ?? 0,
    isOfficial: row.is_official ?? false,
    location: row.lat && row.lng ? { lat: row.lat, lng: row.lng } : undefined,
  };
}

/** True when calls can be submitted (game is actively playing) */
export function isGameLive(status?: string): boolean {
  return status === 'live' || status === 'ht' || status === 'et' || status === 'pens';
}

/** Compute current live minute from a fetched base minute + elapsed wall time */
export function computeLiveMinute(baseMinute: number, fetchedAt: number, status?: string): number {
  if (status === 'ht') return 45;
  if (status === 'live' || status === 'et' || status === 'pens') {
    return Math.min(120, baseMinute + Math.floor((Date.now() - fetchedAt) / 60_000));
  }
  return baseMinute;
}

// No mock game — users start with null and pick a real match or create one

interface GameStore {
  // Game
  currentGame: Game | null;
  /** Wall-clock ms when currentGame.minute was last captured — drives live clock */
  clockFetchedAt: number;
  // Calls
  selectedCall: SoccerCall | null;
  cardType: 'yellow' | 'red' | null;
  showCard: boolean;
  activeTab: 'referee' | 'compare' | 'leagues' | 'timeline' | 'vision' | 'market' | 'impact';
  compareFilter: 'all' | 'official' | 'fans' | 'mine';
  mediaItems: MediaItem[];
  userCalls: RefereeCall[];
  allCalls: RefereeCall[];
  activeCategory: string;
  localLeagues: LocalLeague[];
  // Live matches notification
  liveMatchCount: number;
  // Custom match timer
  matchTimerPaused: boolean;
  matchTimerFrozenMinute: number;
  // Whistle
  whistleType: string;
  setWhistleType: (id: string) => void;
  // Auth
  userId: string | null;
  userProfile: UserProfile | null;
  authModal: 'hidden' | 'login' | 'register';
  // Impact Thermometer
  impactGame: {
    id: string;
    homeTeam: string;
    awayTeam: string;
    league: string;
    leagueId: string;
    status: string;
    minute?: number;
  } | null;

  // Network
  isOnline: boolean;
  isLoading: boolean;

  // Actions
  init: () => Promise<void>;
  setCurrentGame: (game: Game | null) => void;
  selectMatch: (match: LiveMatch) => void;
  setCustomMatch: (homeTeam: string, awayTeam: string, leagueName?: string) => void;
  setSelectedCall: (call: SoccerCall | null) => void;
  showCardOverlay: (type: 'yellow' | 'red') => void;
  dismissCard: () => void;
  setActiveTab: (tab: GameStore['activeTab']) => void;
  setCompareFilter: (f: GameStore['compareFilter']) => void;
  addMedia: (item: MediaItem) => void;
  /** Remove a call locally (soft-deleted; stays in DB for other users) */
  deleteCall: (id: string) => void;
  /** Update call type and optional player name locally */
  updateCallData: (id: string, callId: string, callName: string, playerName?: string) => void;
  uploadAndAddMedia: (file: File, minute: number, caption: string, location: { lat: number; lng: number } | null) => Promise<void>;
  makeCall: (call: RefereeCall) => void;
  submitLiveCall: (callId: string, callName: string, minute: number, location?: { lat: number; lng: number }, playerName?: string) => Promise<void>;
  voteCall: (callId: string, vote: 'agree' | 'disagree') => void;
  setActiveCategory: (cat: string) => void;
  addLocalLeague: (league: Omit<LocalLeague, 'id'>) => Promise<void>;
  loadLocalLeagues: () => Promise<void>;
  // Custom match timer
  pauseMatchTimer: () => void;
  resumeMatchTimer: () => void;
  addMatchMinutes: (mins: number) => void;
  endCustomMatch: () => void;
  setImpactGame: (game: { id: string; homeTeam: string; awayTeam: string; league: string; leagueId: string; status: string; minute?: number } | null) => void;
  // Auth actions
  openAuthModal: (mode: 'login' | 'register') => void;
  closeAuthModal: () => void;
  doSignUp: (email: string, password: string, name: string) => Promise<{ error?: string } | undefined>;
  doSignIn: (email: string, password: string) => Promise<{ error?: string } | undefined>;
  doSignOut: () => Promise<void>;
}

export const useGameStore = create<GameStore>((set, get) => ({
  currentGame: null,
  clockFetchedAt: Date.now(),
  whistleType: getSavedWhistleId(),
  selectedCall: null,
  cardType: null,
  showCard: false,
  activeTab: 'referee',
  compareFilter: 'all',
  mediaItems: [],
  userCalls: [],
  allCalls: [],
  activeCategory: 'all',
  localLeagues: [],
  liveMatchCount: 0,
  matchTimerPaused: false,
  matchTimerFrozenMinute: 0,
  impactGame: null,
  userId: null,
  userProfile: null,
  authModal: 'hidden',
  isOnline: false,
  isLoading: true,

  init: async () => {
    set({ isLoading: true });

    // 1. Check existing session (persisted login)
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && !session.user.is_anonymous) {
        const meta = session.user.user_metadata;
        set({
          userId: session.user.id,
          isOnline: true,
          userProfile: {
            userId: session.user.id,
            email: session.user.email ?? '',
            displayName: meta?.display_name ?? session.user.email?.split('@')[0] ?? 'Referee',
            isAnon: false,
          },
        });
      } else if (session?.user?.is_anonymous) {
        set({ userId: session.user.id, isOnline: true });
      } else {
        const user = await signInAnon();
        if (user) set({ userId: user.id, isOnline: true });
      }
    }

    // 2. No default game — fetch live count from top leagues for notification badge
    const { fetchAllMatches } = await import('../lib/footballApi');
    fetchAllMatches().then((matches) => {
      const liveCount = matches.filter((m) => m.status === 'live' || m.status === 'ht').length;
      set({ liveMatchCount: liveCount });
    }).catch(() => {});

    // 3. Auth + local leagues
    const { userId: uid } = get();
    if (uid) {
      await get().loadLocalLeagues();
    }

    set({ isLoading: false });

    // 4. Refresh live count every 5 minutes
    setInterval(async () => {
      const { fetchAllMatches: fetchFn } = await import('../lib/footballApi');
      fetchFn().then((matches) => {
        const liveCount = matches.filter((m) => m.status === 'live' || m.status === 'ht').length;
        set({ liveMatchCount: liveCount });
      }).catch(() => {});
    }, 5 * 60 * 1000);
  },

  selectMatch: (match) => {
    const game = matchToGame(match);
    set({ currentGame: game, allCalls: [], userCalls: [], clockFetchedAt: Date.now() });
    // Subscribe to calls for the new game
    getGameCalls(game.id).then((rows) => {
      if (rows.length > 0) set({ allCalls: rows.map(rowToCall) });
    });
    subscribeToGameCalls(game.id, (row) => {
      const call = rowToCall(row);
      set((s) => {
        if (s.allCalls.find((c) => c.id === call.id)) return s;
        return { allCalls: [call, ...s.allCalls] };
      });
    });
  },

  setCurrentGame: (game) => set({ currentGame: game }),

  setCustomMatch: (homeTeam, awayTeam, leagueName = 'Custom') => {
    const game: Game = {
      id: `custom-${Date.now()}`,
      homeTeam,
      awayTeam,
      homeScore: 0,
      awayScore: 0,
      minute: 0,
      status: 'live',
      leagueId: 'custom',
      venueName: leagueName,
      date: new Date().toISOString(),
    };
    set({ currentGame: game, allCalls: [], userCalls: [], clockFetchedAt: Date.now() });
    subscribeToGameCalls(game.id, (row) => {
      const call = rowToCall(row);
      set((s) => {
        if (s.allCalls.find((c) => c.id === call.id)) return s;
        return { allCalls: [call, ...s.allCalls] };
      });
    });
  },

  setSelectedCall: (call) => set({ selectedCall: call }),
  showCardOverlay: (type) => set({ cardType: type, showCard: true }),
  dismissCard: () => set({ showCard: false, cardType: null }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  addMedia: (item) => set((s) => ({ mediaItems: [item, ...s.mediaItems] })),

  uploadAndAddMedia: async (file, minute, caption, location) => {
    const { userId, currentGame } = get();
    const uid = userId ?? 'anon';
    const gameId = currentGame?.id ?? 'no-game';

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
        await insertMediaRecord({ game_id: gameId, user_id: uid, type: localItem.type, url: publicUrl, minute, caption: caption || undefined, lat: location?.lat, lng: location?.lng });
        set((s) => ({ mediaItems: s.mediaItems.map((m) => m.id === localItem.id ? { ...m, url: publicUrl } : m) }));
      }
    }
  },

  makeCall: (call) => set((s) => ({ userCalls: [call, ...s.userCalls], allCalls: [call, ...s.allCalls] })),

  submitLiveCall: async (callId, callName, minute, location, playerName) => {
    const { userId, currentGame, userProfile } = get();

    // Block calls on non-live games
    if (currentGame && !isGameLive(currentGame.status)) return;

    const uid = userId ?? `fan-${Math.random().toString(36).slice(2, 8)}`;
    const gameId = currentGame?.id ?? 'no-game';
    const displayName = userProfile?.displayName ?? 'Fan';
    const optId = `opt-${Date.now()}`;

    const optimistic: RefereeCall = {
      id: optId, callId, callName, minute,
      userId: uid, userName: 'You',
      playerName: playerName?.trim() || undefined,
      timestamp: Date.now(), agree: 1, disagree: 0,
      isOfficial: false, location,
    };
    set((s) => ({ userCalls: [optimistic, ...s.userCalls], allCalls: [optimistic, ...s.allCalls] }));

    if (supabase) {
      const row = await sbSubmitCall({
        game_id: gameId, call_id: callId, call_name: callName,
        minute, user_id: uid, user_name: displayName,
        player_name: playerName?.trim() || undefined,
        lat: location?.lat, lng: location?.lng,
      });
      if (row) {
        const real = rowToCall(row);
        set((s) => ({ allCalls: s.allCalls.map((c) => c.id === optId ? real : c), userCalls: s.userCalls.map((c) => c.id === optId ? real : c) }));
      }
    }
  },

  voteCall: (callId, vote) => {
    set((s) => ({ allCalls: s.allCalls.map((c) => c.id === callId ? { ...c, agree: vote === 'agree' ? c.agree + 1 : c.agree, disagree: vote === 'disagree' ? c.disagree + 1 : c.disagree } : c) }));
    if (supabase) sbVoteOnCall(callId, vote);
  },

  setActiveCategory: (cat) => set({ activeCategory: cat }),

  setWhistleType: (id) => {
    saveWhistleId(id);
    set({ whistleType: id });
  },

  setCompareFilter: (f) => set({ compareFilter: f }),

  deleteCall: (id) => set((s) => ({
    allCalls: s.allCalls.filter((c) => c.id !== id),
    userCalls: s.userCalls.filter((c) => c.id !== id),
  })),

  updateCallData: (id, callId, callName, playerName) => set((s) => ({
    allCalls: s.allCalls.map((c) => c.id === id ? { ...c, callId, callName, playerName: playerName ?? c.playerName } : c),
    userCalls: s.userCalls.map((c) => c.id === id ? { ...c, callId, callName, playerName: playerName ?? c.playerName } : c),
  })),

  pauseMatchTimer: () => {
    const { currentGame, clockFetchedAt } = get();
    if (!currentGame) return;
    const frozenMinute = Math.min(120, currentGame.minute + Math.floor((Date.now() - clockFetchedAt) / 60_000));
    set({ matchTimerPaused: true, matchTimerFrozenMinute: frozenMinute });
  },

  resumeMatchTimer: () => {
    const { matchTimerFrozenMinute, currentGame } = get();
    if (!currentGame) return;
    // Adjust clockFetchedAt so that elapsed time resumes from frozen minute
    const newFetchedAt = Date.now() - (matchTimerFrozenMinute - currentGame.minute) * 60_000;
    set({ matchTimerPaused: false, clockFetchedAt: newFetchedAt });
  },

  addMatchMinutes: (mins) => {
    // Shift clockFetchedAt back by mins*60s — makes computeLiveMinute return a larger value (NO whistle)
    set((s) => ({ clockFetchedAt: s.clockFetchedAt - mins * 60_000 }));
  },

  endCustomMatch: () => set((s) => ({
    currentGame: s.currentGame ? { ...s.currentGame, status: 'ft' } : null,
    matchTimerPaused: false,
  })),

  addLocalLeague: async (league) => {
    const { userId } = get();
    const local: LocalLeague = { id: `local-${Date.now()}`, ...league };
    set((s) => ({ localLeagues: [...s.localLeagues, local] }));
    if (supabase && userId) {
      const row = await sbCreateLeague({ name: league.name, country: league.country, age_group: league.ageGroup, teams: league.teams, created_by: userId });
      if (row) set((s) => ({ localLeagues: s.localLeagues.map((l) => l.id === local.id ? { ...l, id: row.id } : l) }));
    }
  },

  loadLocalLeagues: async () => {
    const { userId } = get();
    if (!userId) return;
    const rows = await getLocalLeagues(userId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    set({ localLeagues: rows.map((r: any) => ({ id: r.id, name: r.name, country: r.country, ageGroup: r.age_group, teams: r.teams ?? [] })) });
  },

  // ── Impact ────────────────────────────────────────────────────────────────

  setImpactGame: (game) => set({ impactGame: game }),

  // ── Auth ──────────────────────────────────────────────────────────────────

  openAuthModal: (mode) => set({ authModal: mode }),
  closeAuthModal: () => set({ authModal: 'hidden' }),

  doSignUp: async (email, password, name) => {
    const res = await sbSignUp(email, password, name);
    if (!res || 'error' in res && res.error) return { error: (res as { error: string }).error };
    // After sign-up Supabase sends confirmation email; don't update userId yet
    return undefined;
  },

  doSignIn: async (email, password) => {
    const res = await sbSignIn(email, password);
    if (!res || 'error' in res && res.error) return { error: (res as { error: string }).error };
    if ('user' in res && res.user) {
      const u = res.user;
      const displayName = res.displayName ?? u.email?.split('@')[0] ?? 'Referee';
      set({
        userId: u.id,
        isOnline: true,
        userProfile: { userId: u.id, email: u.email ?? '', displayName, isAnon: false },
      });
    }
    return undefined;
  },

  doSignOut: async () => {
    await sbSignOut();
    set({ userProfile: null });
    // Re-init anon session
    const user = await signInAnon();
    if (user) set({ userId: user.id });
  },
}));
