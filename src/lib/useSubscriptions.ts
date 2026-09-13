import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'
import { getStatus } from './billing'
import type { Subscription, SubscriptionInput } from '../types'

function byUpcomingDate(a: Subscription, b: Subscription) {
  const rank = { active: 0, cancelled: 0, ended: 1 }
  const statusA = getStatus(a)
  const statusB = getStatus(b)
  if (rank[statusA.kind] !== rank[statusB.kind]) return rank[statusA.kind] - rank[statusB.kind]
  return statusA.date.getTime() - statusB.date.getTime()
}

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('subscriptions').select('*')

    if (error) setError(error.message)
    else setSubscriptions([...data].sort(byUpcomingDate))
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addSubscription = async (input: SubscriptionInput) => {
    const { error } = await supabase.from('subscriptions').insert(input)
    if (error) throw error
    await refresh()
  }

  const updateSubscription = async (id: string, input: SubscriptionInput) => {
    const { error } = await supabase.from('subscriptions').update(input).eq('id', id)
    if (error) throw error
    await refresh()
  }

  const deleteSubscription = async (id: string) => {
    const { error } = await supabase.from('subscriptions').delete().eq('id', id)
    if (error) throw error
    await refresh()
  }

  return { subscriptions, loading, error, addSubscription, updateSubscription, deleteSubscription }
}
