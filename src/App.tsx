import { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { useAuth } from './lib/useAuth'
import { useSubscriptions } from './lib/useSubscriptions'
import { useComments } from './lib/useComments'
import { LoginScreen } from './components/LoginScreen'
import { SubscriptionList } from './components/SubscriptionList'
import { SubscriptionForm } from './components/SubscriptionForm'
import type { Subscription } from './types'

function firstNameOf(user: User): string {
  const fullName = (user.user_metadata?.full_name ?? user.user_metadata?.name) as string | undefined
  if (fullName) return fullName.split(' ')[0]
  return user.email?.split('@')[0] ?? 'there'
}

function App() {
  const { session, loading: authLoading, signInWithGoogle, signOut } = useAuth()
  const { subscriptions, loading, error, addSubscription, updateSubscription, deleteSubscription } =
    useSubscriptions()
  const { comments, addComment, updateComment, deleteComment } = useComments()
  const [editing, setEditing] = useState<Subscription | 'new' | null>(null)

  if (authLoading) return null

  if (!session) {
    return <LoginScreen onSignIn={signInWithGoogle} />
  }

  const firstName = firstNameOf(session.user)

  return (
    <div className="min-h-screen bg-zinc-950 pb-12 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <h1 className="flex items-center gap-1.5 text-lg font-bold tracking-tight">
            <span className="bg-gradient-to-br from-rose-500 to-violet-500 bg-clip-text text-transparent">
              ▶
            </span>
            STREAM<span className="text-zinc-400">sub</span>
          </h1>
          <div className="flex items-center gap-3">
            <div className="text-right leading-tight">
              <p className="text-sm font-medium text-zinc-100">Hi, {firstName}</p>
              <p className="text-xs text-zinc-500">{session.user.email}</p>
            </div>
            <button onClick={signOut} className="text-sm font-medium text-zinc-500 hover:text-zinc-100">
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
            className="rounded-lg bg-gradient-to-r from-rose-600 to-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:from-rose-500 hover:to-violet-500"
          >
            Add subscription
          </button>
        </div>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        {loading ? (
          <p className="mt-10 text-center text-sm text-zinc-500">Loading…</p>
        ) : (
          <SubscriptionList
            subscriptions={subscriptions}
            comments={comments}
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
