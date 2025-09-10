'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleSignup = async () => {
    // 1️⃣ Create auth user
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      alert(error.message)
      return
    }

    const user = data.user
    if (!user) {
      alert('Signup failed!')
      return
    }

    // 2️⃣ Insert profile with default role = student
    const { error: profileError } =await supabase
  .from('profiles')
  .insert([{
    id: user.id,
    role: 'student',
    name: name,
    email: email
  }]);
    

    if (profileError) {
      alert(profileError.message)
      return
    }

    alert('Account created! You are a student by default. Please check your email for confirmation.')
    router.push('/login')
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-4">
      <h1 className="text-2xl mb-4">Sign Up</h1>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={e => setName(e.target.value)}
        className="border p-2 w-full mb-2"
      />
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
      <button onClick={handleSignup} className="bg-blue-500 text-white px-4 py-2">
        Sign Up
      </button>
    </div>
  )
}
