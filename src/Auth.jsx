import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      if (isSignUp) {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })

        if (error) throw error

        setMessage({
          type: 'success',
          text: 'Sikeres regisztráció! Jelentkezz be az email címeddel.',
        })
        setIsSignUp(false)
      } else {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        setMessage({
          type: 'success',
          text: 'Sikeres bejelentkezés!',
        })
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-sky-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">🧸 Tünetnapló</h1>
          <p className="text-slate-600">
            {isSignUp ? 'Készíts új fiókot' : 'Jelentkezz be'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email cím
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-sky-300"
              placeholder="pelda@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Jelszó
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-sky-300"
              placeholder="Minimum 6 karakter"
            />
          </div>

          {message.text && (
            <div
              className={`rounded-xl p-3 text-sm ${
                message.type === 'error'
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-sky-500 text-white font-semibold py-3 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading
              ? 'Folyamatban...'
              : isSignUp
              ? 'Regisztráció'
              : 'Bejelentkezés'}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp)
              setMessage({ type: '', text: '' })
            }}
            className="w-full text-sm text-sky-600 hover:text-sky-700 font-medium"
          >
            {isSignUp
              ? 'Már van fiókom - Bejelentkezés'
              : 'Nincs még fiókom - Regisztráció'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200 text-center text-xs text-slate-500">
          <p>🔒 Az adataid biztonságosan tárolva Supabase-ben</p>
          <p className="mt-1">Csak te férsz hozzá!</p>
        </div>
      </div>
    </div>
  )
}
