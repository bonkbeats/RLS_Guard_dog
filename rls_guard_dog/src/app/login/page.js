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

    // Redirect based on role
    if (profile.role === 'student') router.push('/student/dashboard')
    else router.push('/teacher/dashboard')

//        const res = await supabase.auth.signInWithPassword({ email, password })
// console.log('signIn result', res)

// const user = res.data?.user
// console.log('user id', user?.id)

// const { data: profile, error: profileError } = await supabase
//   .from('profiles')
//   .select('*')
//   .eq('id', user.id)
//   .single()
// console.log('profile', profile, 'profileError', profileError)


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
