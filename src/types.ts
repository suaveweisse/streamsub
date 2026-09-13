export type BillingCycle = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'

export interface Subscription {
  id: string
  service_name: string
  payment_source: string | null
  cost: number
  billing_cycle: BillingCycle
  start_date: string | null
  end_date: string | null
  account_email: string | null
  account_username: string | null
  account_password: string | null
  parent_subscription_id: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export type SubscriptionInput = Omit<
  Subscription,
  'id' | 'created_by' | 'created_at' | 'updated_at'
>

export interface SubscriptionComment {
  id: string
  subscription_id: string
  author_id: string | null
  author_email: string | null
  body: string
  created_at: string
  updated_at: string
}
