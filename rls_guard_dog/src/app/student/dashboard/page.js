'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import ProgressList from '@/components/ProgressList'
import Link from 'next/link'

export default function StudentDashboard() {
  const [progress, setProgress] = useState([])

  useEffect(() => {
    const fetchProgress = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user
      if (!user) return

      const { data, error } = await supabase
        .from('classroom_progress')
        .select('*')
        .eq('student_id', user.id)

      if (error) console.log(error)
      else setProgress(data)
    }

    fetchProgress()
  }, [])

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Progress</h1>
      <ProgressList progress={progress} />
      <Link href="/login" className="text-blue-500 mt-4 block">Logout</Link>
    </div>
  )
}
