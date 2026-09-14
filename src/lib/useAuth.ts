import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  const signInWithGoogle = () =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        // Always show the account picker instead of silently reusing
        // whichever Google account is already signed into this browser —
        // matters on a shared family device where different people need
        // to switch accounts after signing out.
        queryParams: { prompt: 'select_account' },
      },
    })

  const signOut = () => supabase.auth.signOut()

  return { session, loading, signInWithGoogle, signOut }
}
