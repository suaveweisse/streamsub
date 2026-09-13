import { useState, type FormEvent } from 'react'
import type { BillingCycle, Subscription, SubscriptionInput } from '../types'

interface SubscriptionFormProps {
  initial?: Subscription
  onCancel: () => void
  onSubmit: (input: SubscriptionInput) => Promise<void>
}

const emptyForm: SubscriptionInput = {
  service_name: '',
  payment_source: '',
  cost: 0,
  billing_cycle: 'monthly',
  start_date: '',
  end_date: '',
  account_email: '',
  account_username: '',
  account_password: '',
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function SubscriptionForm({ initial, onCancel, onSubmit }: SubscriptionFormProps) {
  const [form, setForm] = useState<SubscriptionInput>(initial ?? emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    const email = form.account_email?.trim() ?? ''
    if (email && !emailPattern.test(email)) {
      setError('Please enter a valid account email address.')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        ...form,
        end_date: form.end_date || null,
        account_email: email || null,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-slate-900/40 px-4">
      <form
        onSubmit={handleSubmit}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-lg"
      >
        <h2 className="text-lg font-semibold text-slate-900">
          {initial ? 'Edit subscription' : 'Add subscription'}
        </h2>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <Field label="Service" className="col-span-2">
            <input
              required
              value={form.service_name}
              onChange={(e) => setForm({ ...form, service_name: e.target.value })}
              placeholder="Netflix"
              className={inputClass}
            />
          </Field>

          <Field label="Paid from" className="col-span-2">
            <input
              value={form.payment_source ?? ''}
              onChange={(e) => setForm({ ...form, payment_source: e.target.value })}
              placeholder="Dad's Visa"
              className={inputClass}
            />
          </Field>

          <Field label="Cost">
            <div className="relative mt-1">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-slate-400">
                $
              </span>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
                className={`${inputClass} !mt-0 pl-6`}
              />
            </div>
          </Field>

          <Field label="Billing cycle">
            <select
              value={form.billing_cycle}
              onChange={(e) => setForm({ ...form, billing_cycle: e.target.value as BillingCycle })}
              className={inputClass}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </Field>

          <Field label="Start date">
            <input
              required
              type="date"
              value={form.start_date ?? ''}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              className={inputClass}
            />
          </Field>

          <Field label="End date (if cancelled)" className="col-span-2">
            <input
              type="date"
              value={form.end_date ?? ''}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              className={inputClass}
            />
            <p className="mt-1 text-xs font-normal text-slate-400">
              Leave blank for an active subscription that keeps auto-renewing. Set this to the last day
              it's paid through once you've cancelled — it'll show as active until then, then move to
              ended.
            </p>
          </Field>

          <Field label="Account email" className="col-span-2">
            <input
              type="email"
              value={form.account_email ?? ''}
              onChange={(e) => setForm({ ...form, account_email: e.target.value })}
              className={inputClass}
            />
          </Field>

          <Field label="Username">
            <input
              value={form.account_username ?? ''}
              onChange={(e) => setForm({ ...form, account_username: e.target.value })}
              className={inputClass}
            />
          </Field>

          <Field label="Password">
            <input
              value={form.account_password ?? ''}
              onChange={(e) => setForm({ ...form, account_password: e.target.value })}
              className={inputClass}
            />
          </Field>
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {submitting ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  )
}

const inputClass =
  'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none'

function Field({
  label,
  children,
  className = '',
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <label className={`block text-sm font-medium text-slate-700 ${className}`}>
      {label}
      {children}
    </label>
  )
}
