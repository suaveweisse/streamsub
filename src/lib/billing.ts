import type { BillingCycle } from '../types'

function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

function startOfUTCDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setUTCDate(d.getUTCDate() + days)
  return d
}

/** Adds calendar months, clamping to the last day of the target month
 * (Jan 31 + 1 month -> Feb 28/29, not a rollover into March). */
function addMonthsClamped(date: Date, months: number): Date {
  const day = date.getUTCDate()
  const firstOfTarget = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1))
  const daysInTargetMonth = new Date(
    Date.UTC(firstOfTarget.getUTCFullYear(), firstOfTarget.getUTCMonth() + 1, 0),
  ).getUTCDate()
  firstOfTarget.setUTCDate(Math.min(day, daysInTargetMonth))
  return firstOfTarget
}

function addCadence(date: Date, cycle: BillingCycle): Date {
  switch (cycle) {
    case 'daily':
      return addDays(date, 1)
    case 'weekly':
      return addDays(date, 7)
    case 'monthly':
      return addMonthsClamped(date, 1)
    case 'quarterly':
      return addMonthsClamped(date, 3)
    case 'yearly':
      return addMonthsClamped(date, 12)
  }
}

/** The next occurrence of the billing cycle on or after `today`. */
export function nextRenewal(startDate: string, cycle: BillingCycle, today: Date = new Date()): Date {
  const todayUTC = startOfUTCDay(today)
  let d = parseDateOnly(startDate)
  if (d >= todayUTC) return d
  while (d < todayUTC) {
    d = addCadence(d, cycle)
  }
  return d
}

export type SubscriptionStatus =
  | { kind: 'active'; date: Date }
  | { kind: 'cancelled'; date: Date }
  | { kind: 'ended'; date: Date }

export function getStatus(
  sub: { start_date: string | null; billing_cycle: BillingCycle; end_date: string | null },
  today: Date = new Date(),
): SubscriptionStatus {
  if (sub.end_date) {
    const end = parseDateOnly(sub.end_date)
    return end < startOfUTCDay(today) ? { kind: 'ended', date: end } : { kind: 'cancelled', date: end }
  }
  return { kind: 'active', date: nextRenewal(sub.start_date ?? todayISO(today), sub.billing_cycle, today) }
}

function todayISO(date: Date): string {
  return startOfUTCDay(date).toISOString().slice(0, 10)
}
