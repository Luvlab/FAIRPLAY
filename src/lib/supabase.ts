import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[FAIRPLAY] Supabase env vars not set — running in offline mode')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase: SupabaseClient<any> | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        realtime: { params: { eventsPerSecond: 10 } },
      })
    : null

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function signInAnon() {
  if (!supabase) return null
  const { data, error } = await supabase.auth.signInAnonymously()
  if (error) console.error('[Auth]', error)
  return data?.user ?? null
}

export async function signUp(email: string, password: string, displayName: string) {
  if (!supabase) return { error: 'Offline mode' }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  })
  if (error) return { error: error.message }
  return { user: data.user }
}

export async function signIn(email: string, password: string) {
  if (!supabase) return { error: 'Offline mode' }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }
  return {
    user: data.user,
    displayName: data.user?.user_metadata?.display_name as string | undefined,
  }
}

export async function signOut() {
  if (!supabase) return
  await supabase.auth.signOut()
}

export async function getSession() {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session
}

// ── Referee calls ─────────────────────────────────────────────────────────────

export interface CallInsert {
  game_id: string
  call_id: string
  call_name: string
  minute: number
  user_id: string
  user_name: string
  is_official?: boolean
  lat?: number
  lng?: number
}

export async function submitCall(call: CallInsert) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('referee_calls')
    .insert(call)
    .select()
    .single()
  if (error) console.error('[submitCall]', error)
  return data
}

export async function voteOnCall(callDbId: string, vote: 'agree' | 'disagree') {
  if (!supabase) return null
  const col = vote === 'agree' ? 'agree_count' : 'disagree_count'
  const { error } = await supabase.rpc('increment_vote', {
    p_call_id: callDbId,
    p_col: col,
  })
  if (error) console.error('[voteOnCall]', error)
}

export async function getGameCalls(gameId: string) {
  if (!supabase) return []
  const { data } = await supabase
    .from('referee_calls')
    .select('*')
    .eq('game_id', gameId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export function subscribeToGameCalls(
  gameId: string,
  onCall: (call: Record<string, unknown>) => void
) {
  if (!supabase) return null
  return supabase
    .channel(`game:${gameId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'referee_calls', filter: `game_id=eq.${gameId}` },
      (payload: { new: Record<string, unknown> }) => onCall(payload.new)
    )
    .subscribe()
}

// ── Media uploads ─────────────────────────────────────────────────────────────

export async function uploadMedia(file: File, gameId: string, userId: string): Promise<string | null> {
  if (!supabase) return null
  const ext = file.name.split('.').pop()
  const path = `${gameId}/${userId}/${Date.now()}.${ext}`
  const { error } = await supabase.storage
    .from('match-media')
    .upload(path, file, { cacheControl: '3600', upsert: false })
  if (error) { console.error('[Upload]', error); return null }
  return supabase.storage.from('match-media').getPublicUrl(path).data.publicUrl
}

export async function insertMediaRecord(item: {
  game_id: string
  user_id: string
  type: 'image' | 'video'
  url: string
  minute: number
  caption?: string
  lat?: number
  lng?: number
}) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('match_media')
    .insert(item)
    .select()
    .single()
  if (error) console.error('[insertMedia]', error)
  return data
}

// ── Local leagues ──────────────────────────────────────────────────────────────

export async function createLocalLeague(league: {
  name: string
  country: string
  age_group: string
  teams: string[]
  created_by: string
}) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('local_leagues')
    .insert(league)
    .select()
    .single()
  if (error) console.error('[createLeague]', error)
  return data
}

export async function getLocalLeagues(userId: string) {
  if (!supabase) return []
  const { data } = await supabase
    .from('local_leagues')
    .select('*')
    .or(`created_by.eq.${userId},is_public.eq.true`)
    .order('created_at', { ascending: false })
  return data ?? []
}
