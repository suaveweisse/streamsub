interface LoginScreenProps {
  onSignIn: () => void
}

export function LoginScreen({ onSignIn }: LoginScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">STREAMsub</h1>
        <p className="mt-2 text-sm text-slate-500">
          Sign in with the Google account your family uses to access this app.
        </p>
        <button
          onClick={onSignIn}
          className="mt-6 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  )
}
