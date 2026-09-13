import { useState } from 'react'
import type { Subscription } from '../types'

interface SubscriptionListProps {
  subscriptions: Subscription[]
  onEdit: (subscription: Subscription) => void
  onDelete: (id: string) => void
}

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

function formatDate(value: string | null) {
  if (!value) return '—'
  return dateFormat.format(new Date(`${value}T00:00:00`))
}

export function SubscriptionList({ subscriptions, onEdit, onDelete }: SubscriptionListProps) {
  if (subscriptions.length === 0) {
    return <p className="mt-10 text-center text-sm text-slate-500">No subscriptions yet. Add your first one.</p>
  }

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {subscriptions.map((sub) => (
        <SubscriptionCard key={sub.id} subscription={sub} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  )
}

function SubscriptionCard({
  subscription,
  onEdit,
  onDelete,
}: {
  subscription: Subscription
  onEdit: (subscription: Subscription) => void
  onDelete: (id: string) => void
}) {
  const [revealPassword, setRevealPassword] = useState(false)

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-slate-900">{subscription.service_name}</h3>
          <p className="text-sm text-slate-500">{subscription.payment_source || 'No payment source set'}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-slate-900">{currency.format(subscription.cost)}</p>
          <p className="text-xs uppercase tracking-wide text-slate-400">{subscription.billing_cycle}</p>
        </div>
      </div>

      <dl className="mt-4 space-y-1 text-sm text-slate-600">
        <Row label="Started">{formatDate(subscription.start_date)}</Row>
        <Row label="Renews">{formatDate(subscription.renewal_date)}</Row>
        <Row label="Email">{subscription.account_email || '—'}</Row>
        <Row label="Username">{subscription.account_username || '—'}</Row>
        <Row label="Password">
          <button
            type="button"
            onClick={() => setRevealPassword((v) => !v)}
            className="font-mono text-slate-700 underline decoration-dotted"
          >
            {subscription.account_password
              ? revealPassword
                ? subscription.account_password
                : '••••••••'
              : '—'}
          </button>
        </Row>
      </dl>

      <div className="mt-4 flex justify-end gap-3 border-t border-slate-100 pt-3">
        <button
          onClick={() => onEdit(subscription)}
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(subscription.id)}
          className="text-sm font-medium text-red-500 hover:text-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-slate-400">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  )
}
