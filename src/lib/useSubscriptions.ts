import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { Subscription, SubscriptionInput } from '../types'

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('renewal_date', { ascending: true })

    if (error) setError(error.message)
    else setSubscriptions(data)
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
