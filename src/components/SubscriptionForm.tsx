import { useEffect, useState, type FormEvent } from 'react'
import { ChevronIcon } from './icons'
import type { BillingCycle, Subscription, SubscriptionInput } from '../types'

interface SubscriptionFormProps {
  initial?: Subscription
  subscriptions: Subscription[]
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
  parent_subscription_id: null,
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function SubscriptionForm({ initial, subscriptions, onCancel, onSubmit }: SubscriptionFormProps) {
  const [form, setForm] = useState<SubscriptionInput>(initial ?? emptyForm)
  const [costText, setCostText] = useState((initial?.cost ?? 0).toFixed(2))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Only offer subscriptions that aren't themselves a child, and never the
  // record being edited — keeps the parent/child relationship one level deep.
  const parentOptions = subscriptions.filter(
    (sub) => sub.parent_subscription_id === null && sub.id !== initial?.id,
  )

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    const email = form.account_email?.trim() ?? ''
    if (email && !emailPattern.test(email)) {
      setError('Please enter a valid account email address.')
      return
    }

    if (!form.start_date) {
      setError('Please enter a valid start date (MM/DD/YYYY).')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        ...form,
        end_date: form.end_date || null,
        account_email: email || null,
        parent_subscription_id: form.parent_subscription_id || null,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/60 px-4">
      <form
        onSubmit={handleSubmit}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-900 p-4 shadow-xl"
      >
        <h2 className="text-lg font-semibold text-zinc-50">
          {initial ? 'Edit subscription' : 'Add subscription'}
        </h2>

        <div className="mt-3 grid grid-cols-2 gap-2">
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

          <Field label="Included via (optional)" className="col-span-2">
            <Select
              value={form.parent_subscription_id ?? ''}
              onChange={(e) => setForm({ ...form, parent_subscription_id: e.target.value || null })}
            >
              <option value="">None — independent subscription</option>
              {parentOptions.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.service_name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Cost">
            <div className="relative mt-1">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-zinc-500">
                $
              </span>
              <input
                required
                type="text"
                inputMode="decimal"
                value={costText}
                onChange={(e) => {
                  const raw = e.target.value
                  if (!/^\d*\.?\d{0,2}$/.test(raw)) return
                  setCostText(raw)
                  setForm({ ...form, cost: raw === '' || raw === '.' ? 0 : Number(raw) })
                }}
                onBlur={() => setCostText(form.cost.toFixed(2))}
                className={`${inputClass} !mt-0 pl-6`}
              />
            </div>
          </Field>

          <Field label="Billing cycle">
            <Select
              value={form.billing_cycle}
              onChange={(e) => setForm({ ...form, billing_cycle: e.target.value as BillingCycle })}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </Select>
          </Field>

          <Field label="Start date">
            <DateField value={form.start_date ?? ''} onChange={(value) => setForm({ ...form, start_date: value })} />
          </Field>

          <Field label="End date">
            <DateField value={form.end_date ?? ''} onChange={(value) => setForm({ ...form, end_date: value })} />
          </Field>

          <p className="col-span-2 -mt-1 text-xs text-zinc-500">
            Leave end date blank while active; set it to the last paid-through day once cancelled.
          </p>

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

        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

        <div className="mt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-gradient-to-r from-red-600 to-orange-500 px-4 py-2 text-sm font-medium text-white hover:from-red-500 hover:to-orange-400 disabled:opacity-50"
          >
            {submitting ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  )
}

const inputClass =
  'mt-1 w-full min-w-0 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none'

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
    <label className={`block min-w-0 text-sm font-medium text-zinc-300 ${className}`}>
      {label}
      {children}
    </label>
  )
}

// Native <select> chrome (arrow, reserved padding) renders slightly
// narrower than a plain input at the same declared width in some browsers.
// Stripping the native appearance and drawing our own chevron keeps every
// field pixel-identical in width.
function Select({
  value,
  onChange,
  children,
}: {
  value: string
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
  children: React.ReactNode
}) {
  return (
    <div className="relative mt-1">
      <select value={value} onChange={onChange} className={`${inputClass} !mt-0 appearance-none pr-8`}>
        {children}
      </select>
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        <ChevronIcon className="h-4 w-4 rotate-90 text-zinc-500" />
      </span>
    </div>
  )
}

function isoToDisplay(iso: string): string {
  const [year, month, day] = iso.split('-')
  if (!year || !month || !day) return ''
  return `${month}/${day}/${year}`
}

/** Parses "MM/DD/YYYY" to an ISO "YYYY-MM-DD" string, or null if incomplete/invalid. */
function displayToISO(display: string): string | null {
  const match = display.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return null
  const [, mm, dd, yyyy] = match
  const month = Number(mm)
  const day = Number(dd)
  const year = Number(yyyy)
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null
  return `${yyyy}-${mm}-${dd}`
}

// A plain masked text field standing in for <input type="date">, which has
// a real WebKit bug (affecting every iOS browser, since Apple requires them
// all to use WebKit): a dark color-scheme can make the native control's
// segment text and calendar icon render invisible while its paint area
// still overflows its box. A custom field sidesteps native date-control
// rendering entirely rather than continuing to chase that bug.
function DateField({ value, onChange }: { value: string; onChange: (isoValue: string) => void }) {
  const [text, setText] = useState(isoToDisplay(value))

  useEffect(() => setText(isoToDisplay(value)), [value])

  const handleChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 8)
    let formatted = digits
    if (digits.length > 4) formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
    else if (digits.length > 2) formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`
    setText(formatted)

    const iso = displayToISO(formatted)
    if (iso) onChange(iso)
    else if (formatted === '') onChange('')
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      placeholder="MM/DD/YYYY"
      value={text}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={() => setText(isoToDisplay(value))}
      className={inputClass}
    />
  )
}
