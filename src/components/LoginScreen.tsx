import { PlayIcon } from './icons'

interface LoginScreenProps {
  onSignIn: () => void
}

export function LoginScreen({ onSignIn }: LoginScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center shadow-lg">
        <h1 className="flex items-center justify-center gap-1.5 text-2xl font-bold tracking-tight text-zinc-100">
          <PlayIcon className="h-5 w-5" />
          STREAM<span className="text-zinc-400">sub</span>
        </h1>
        <p className="mt-1 text-xs text-zinc-500">Streaming Subscription Management</p>
        <p className="mt-3 text-sm text-zinc-500">
          Sign in with the Google account your family uses to access this app.
        </p>
        <button
          onClick={onSignIn}
          className="mt-6 w-full rounded-lg bg-gradient-to-r from-red-600 to-orange-500 px-4 py-2.5 text-sm font-medium text-white transition hover:from-red-500 hover:to-orange-400"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  )
}
