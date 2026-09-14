import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { useAuth } from './lib/useAuth'
import { useSubscriptions } from './lib/useSubscriptions'
import { useComments } from './lib/useComments'
import { LoginScreen } from './components/LoginScreen'
import { SubscriptionList, type ViewMode } from './components/SubscriptionList'
import { SubscriptionForm } from './components/SubscriptionForm'
import { PlayIcon } from './components/icons'
import type { SortOption } from './lib/billing'
import type { Subscription } from './types'

function firstNameOf(user: User): string {
  const fullName = (user.user_metadata?.full_name ?? user.user_metadata?.name) as string | undefined
  if (fullName) return fullName.split(' ')[0]
  return user.email?.split('@')[0] ?? 'there'
}

function usePersistedState<T extends string>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      return (localStorage.getItem(key) as T) ?? defaultValue
    } catch {
      return defaultValue
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(key, value)
    } catch {
      // ignore (private browsing, storage disabled, etc.)
    }
  }, [key, value])
  return [value, setValue] as const
}

function App() {
  const { session, loading: authLoading, signInWithGoogle, signOut } = useAuth()
  const { subscriptions, loading, error, addSubscription, updateSubscription, deleteSubscription } =
    useSubscriptions()
  const { comments, addComment, updateComment, deleteComment } = useComments()
  const [editing, setEditing] = useState<Subscription | 'new' | null>(null)
  const [viewMode, setViewMode] = usePersistedState<ViewMode>('streamsub-view-mode', 'list')
  const [sortBy, setSortBy] = usePersistedState<SortOption>('streamsub-sort', 'upcoming')

  if (authLoading) return null

  if (!session) {
    return <LoginScreen onSignIn={signInWithGoogle} />
  }

  const firstName = firstNameOf(session.user)

  return (
    <div className="min-h-screen bg-zinc-950 pb-12 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-start justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <h1 className="flex items-center gap-1.5 text-lg font-bold tracking-tight">
              <PlayIcon className="h-4 w-4" />
              STREAM<span className="text-zinc-400">sub</span>
            </h1>
            <p className="text-[11px] text-zinc-500">Streaming Subscription Management</p>
          </div>
          <div className="shrink-0 text-right leading-tight">
            <p className="text-sm font-medium text-zinc-100">Hi, {firstName}</p>
            <p className="text-xs text-zinc-500">{session.user.email}</p>
            <button
              onClick={signOut}
              className="mt-0.5 text-xs font-medium text-zinc-500 hover:text-zinc-100"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4">
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-zinc-400">
            {subscriptions.length} subscription{subscriptions.length === 1 ? '' : 's'} tracked
          </p>
          <button
            onClick={() => setEditing('new')}
            className="rounded-lg bg-gradient-to-r from-red-600 to-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:from-red-500 hover:to-orange-400"
          >
            Add subscription
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-zinc-300 focus:border-orange-500 focus:outline-none"
          >
            <option value="upcoming">Sort: Upcoming</option>
            <option value="name">Sort: Name (A–Z)</option>
            <option value="cost">Sort: Cost (high to low)</option>
          </select>

          <div className="flex overflow-hidden rounded-lg border border-zinc-800 text-xs">
            {(['list', 'cards'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 font-medium capitalize ${
                  viewMode === mode ? 'bg-zinc-800 text-zinc-50' : 'text-zinc-500 hover:text-zinc-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        {loading ? (
          <p className="mt-10 text-center text-sm text-zinc-500">Loading…</p>
        ) : (
          <SubscriptionList
            subscriptions={subscriptions}
            comments={comments}
            viewMode={viewMode}
            sortBy={sortBy}
            onEdit={(sub) => setEditing(sub)}
            onDelete={(id) => {
              if (confirm('Delete this subscription?')) deleteSubscription(id)
            }}
            onAddComment={addComment}
            onUpdateComment={updateComment}
            onDeleteComment={deleteComment}
          />
        )}
      </main>

      {editing && (
        <SubscriptionForm
          initial={editing === 'new' ? undefined : editing}
          subscriptions={subscriptions}
          onCancel={() => setEditing(null)}
          onSubmit={async (input) => {
            if (editing === 'new') await addSubscription(input)
            else await updateSubscription(editing.id, input)
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}

export default App
