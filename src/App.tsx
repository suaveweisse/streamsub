import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { useAuth } from './lib/useAuth'
import { useSubscriptions } from './lib/useSubscriptions'
import { useComments } from './lib/useComments'
import { LoginScreen } from './components/LoginScreen'
import { SubscriptionList, type ViewMode } from './components/SubscriptionList'
import { SubscriptionForm } from './components/SubscriptionForm'
import { PlayGlyph } from './components/icons'
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
    <div className="min-h-dvh bg-zinc-950 pb-12 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-start justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-orange-500">
              <PlayGlyph className="h-5 w-5 text-white" />
            </div>
            <div className="flex min-w-0 flex-col">
              <div className="flex h-6 items-center">
                <h1 className="text-xl font-bold leading-none tracking-tight">
                  STREAM<span className="text-zinc-400">sub</span>
                </h1>
              </div>
              <div className="flex h-4 items-center">
                <p className="text-xs leading-none text-zinc-500">Streaming Subscription</p>
              </div>
              <div className="flex h-4 items-center">
                <p className="text-xs leading-none text-zinc-500">Management</p>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 flex-col text-right">
            <div className="flex h-6 items-center justify-end">
              <p className="text-xl font-bold leading-none tracking-tight text-zinc-100">Hi, {firstName}</p>
            </div>
            <div className="flex h-4 items-center justify-end">
              <p className="text-xs leading-none text-zinc-500">{session.user.email}</p>
            </div>
            <div className="flex h-4 items-center justify-end">
              <button
                onClick={signOut}
                className="text-right text-xs font-medium leading-none text-zinc-500 hover:text-zinc-100"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4">
        <div className="mt-4 flex items-start justify-between gap-3">
          <div className="flex flex-col gap-3">
            <h2 className="pl-2 py-1.5 text-lg font-semibold leading-5 text-zinc-100">
              Subscriptions ({subscriptions.length})
            </h2>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-300 focus:border-orange-500 focus:outline-none"
            >
              <option value="upcoming">Sort: Upcoming renewal</option>
              <option value="name">Sort: Name (A–Z)</option>
              <option value="cost">Sort: Cost (high to low)</option>
            </select>
          </div>

          <div className="flex flex-col items-stretch gap-3">
            <button
              onClick={() => setEditing('new')}
              className="rounded-lg bg-gradient-to-r from-red-600 to-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:from-red-500 hover:to-orange-400"
            >
              Add subscription
            </button>

            <div className="flex overflow-hidden rounded-lg border border-zinc-800 text-sm">
              {(['list', 'cards'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`flex-1 px-4 py-1.5 font-medium capitalize ${
                    viewMode === mode ? 'bg-zinc-800 text-zinc-50' : 'text-zinc-500 hover:text-zinc-200'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
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
