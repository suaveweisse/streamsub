import { useState } from 'react'
import { getStatus, formatDate, parseDateOnly } from '../lib/billing'
import { CommentThread } from './CommentThread'
import type { Subscription, SubscriptionComment } from '../types'

interface SubscriptionListProps {
  subscriptions: Subscription[]
  comments: SubscriptionComment[]
  onEdit: (subscription: Subscription) => void
  onDelete: (id: string) => void
  onAddComment: (subscriptionId: string, body: string) => Promise<void>
  onUpdateComment: (id: string, body: string) => Promise<void>
  onDeleteComment: (id: string) => Promise<void>
}

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

function formatStartDate(value: string | null) {
  return value ? formatDate(parseDateOnly(value)) : '—'
}

const statusLabel = {
  active: 'Next payment/renewal',
  cancelled: 'Cancelled — ends',
  ended: 'Ended',
} as const
const statusClass = {
  active: 'text-zinc-400',
  cancelled: 'text-amber-400',
  ended: 'text-zinc-600',
} as const

export function SubscriptionList({
  subscriptions,
  comments,
  onEdit,
  onDelete,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
}: SubscriptionListProps) {
  if (subscriptions.length === 0) {
    return <p className="mt-10 text-center text-sm text-zinc-500">No subscriptions yet. Add your first one.</p>
  }

  const ended = subscriptions.filter((sub) => getStatus(sub).kind === 'ended')
  const current = subscriptions.filter((sub) => getStatus(sub).kind !== 'ended')

  const cardProps = { onEdit, onDelete, onAddComment, onUpdateComment, onDeleteComment }
  const parentName = (sub: Subscription) =>
    subscriptions.find((s) => s.id === sub.parent_subscription_id)?.service_name

  return (
    <div className="mt-4 space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {current.map((sub) => (
          <SubscriptionCard
            key={sub.id}
            subscription={sub}
            parentName={parentName(sub)}
            comments={comments.filter((c) => c.subscription_id === sub.id)}
            {...cardProps}
          />
        ))}
      </div>

      {ended.length > 0 && (
        <details>
          <summary className="cursor-pointer text-sm font-medium text-zinc-500">
            Ended ({ended.length})
          </summary>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ended.map((sub) => (
              <SubscriptionCard
                key={sub.id}
                subscription={sub}
                parentName={parentName(sub)}
                comments={comments.filter((c) => c.subscription_id === sub.id)}
                {...cardProps}
              />
            ))}
          </div>
        </details>
      )}
    </div>
  )
}

function SubscriptionCard({
  subscription,
  parentName,
  comments,
  onEdit,
  onDelete,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
}: {
  subscription: Subscription
  parentName?: string
  comments: SubscriptionComment[]
  onEdit: (subscription: Subscription) => void
  onDelete: (id: string) => void
  onAddComment: (subscriptionId: string, body: string) => Promise<void>
  onUpdateComment: (id: string, body: string) => Promise<void>
  onDeleteComment: (id: string) => Promise<void>
}) {
  const [revealPassword, setRevealPassword] = useState(false)
  const status = getStatus(subscription)
  const ended = status.kind === 'ended'

  return (
    <div
      className={`rounded-xl border border-zinc-800 bg-zinc-900 p-4 shadow-lg shadow-black/20 ${ended ? 'opacity-50' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-zinc-50">{subscription.service_name}</h3>
          <p className="text-sm text-zinc-500">{subscription.payment_source || 'No payment source set'}</p>
          <p className={`mt-0.5 text-xs text-violet-400 ${parentName ? '' : 'invisible'}`}>
            Bundled with: {parentName || 'placeholder'}
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-zinc-50">{currency.format(subscription.cost)}</p>
          <p className="text-xs uppercase tracking-wide text-zinc-500">{subscription.billing_cycle}</p>
        </div>
      </div>

      <dl className="mt-3 space-y-1 text-sm text-zinc-400">
        <Row label="Started">{formatStartDate(subscription.start_date)}</Row>
        <Row label={statusLabel[status.kind]}>
          <span className={statusClass[status.kind]}>{formatDate(status.date)}</span>
        </Row>
        <Row label="Email">{subscription.account_email || '—'}</Row>
        <Row label="Username">{subscription.account_username || '—'}</Row>
        <Row label="Password">
          <button
            type="button"
            onClick={() => setRevealPassword((v) => !v)}
            className="font-mono text-zinc-300 underline decoration-dotted"
          >
            {subscription.account_password
              ? revealPassword
                ? subscription.account_password
                : '••••••••'
              : '—'}
          </button>
        </Row>
      </dl>

      <div className="mt-3 flex justify-end gap-3 border-t border-zinc-800 pt-2.5">
        <button
          onClick={() => onEdit(subscription)}
          className="text-sm font-medium text-zinc-400 hover:text-zinc-50"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(subscription.id)}
          className="text-sm font-medium text-rose-500 hover:text-rose-400"
        >
          Delete
        </button>
      </div>

      <CommentThread
        comments={comments}
        onAdd={(body) => onAddComment(subscription.id, body)}
        onUpdate={onUpdateComment}
        onDelete={onDeleteComment}
      />
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  )
}
