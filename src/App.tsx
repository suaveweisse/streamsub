import { useState } from 'react'
import { useAuth } from './lib/useAuth'
import { useSubscriptions } from './lib/useSubscriptions'
import { LoginScreen } from './components/LoginScreen'
import { SubscriptionList } from './components/SubscriptionList'
import { SubscriptionForm } from './components/SubscriptionForm'
import type { Subscription } from './types'

function App() {
  const { session, loading: authLoading, signInWithGoogle, signOut } = useAuth()
  const { subscriptions, loading, error, addSubscription, updateSubscription, deleteSubscription } =
    useSubscriptions()
  const [editing, setEditing] = useState<Subscription | 'new' | null>(null)

  if (authLoading) return null

  if (!session) {
    return <LoginScreen onSignIn={signInWithGoogle} />
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <h1 className="text-lg font-semibold text-slate-900">STREAMsub</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">{session.user.email}</span>
            <button onClick={signOut} className="text-sm font-medium text-slate-500 hover:text-slate-900">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4">
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {subscriptions.length} subscription{subscriptions.length === 1 ? '' : 's'} tracked
          </p>
          <button
            onClick={() => setEditing('new')}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Add subscription
          </button>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        {loading ? (
          <p className="mt-10 text-center text-sm text-slate-500">Loading…</p>
        ) : (
          <SubscriptionList
            subscriptions={subscriptions}
            onEdit={(sub) => setEditing(sub)}
            onDelete={(id) => {
              if (confirm('Delete this subscription?')) deleteSubscription(id)
            }}
          />
        )}
      </main>

      {editing && (
        <SubscriptionForm
          initial={editing === 'new' ? undefined : editing}
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
