import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { SubscriptionComment } from '../types'

export function useComments() {
  const [comments, setComments] = useState<SubscriptionComment[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('subscription_comments')
      .select('*')
      .order('created_at', { ascending: true })

    if (!error) setComments(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addComment = async (subscriptionId: string, body: string) => {
    const { error } = await supabase.from('subscription_comments').insert({ subscription_id: subscriptionId, body })
    if (error) throw error
    await refresh()
  }

  const updateComment = async (id: string, body: string) => {
    const { error } = await supabase.from('subscription_comments').update({ body }).eq('id', id)
    if (error) throw error
    await refresh()
  }

  const deleteComment = async (id: string) => {
    const { error } = await supabase.from('subscription_comments').delete().eq('id', id)
    if (error) throw error
    await refresh()
  }

  return { comments, loading, addComment, updateComment, deleteComment }
}
