'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return alert(error.message)

    const user = data.user
    if (!user) return alert('Login failed. Please try again.')

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) return alert('Profile not found. Contact admin.')

    // Replace current history entry with the dashboard route so login isn't left in history.
    try {
      if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
        const target = profile.role === 'student' ? '/student/dashboard' : '/teacher/dashboard'
        // Replace the current URL in history (extra safety) then call router.replace
        window.history.replaceState(null, '', target)
      }
    } catch (e) {
      // ignore if browser blocks replaceState
    }

    // Use router.replace so login page isn't added to history
    if (profile.role === 'student') router.replace('/student/dashboard')
    else router.replace('/teacher/dashboard')
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-4">
      <h1 className="text-2xl mb-4">Login</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="border p-2 w-full mb-2"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="border p-2 w-full mb-2"
      />
      <button onClick={handleLogin} className="bg-blue-500 text-white px-4 py-2">
        Login
      </button>
    </div>
  )
}
