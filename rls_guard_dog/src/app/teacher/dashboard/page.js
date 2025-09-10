'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import ProgressList from '@/components/ProgressList'
import Link from 'next/link'

export default function TeacherDashboard() {
  const [progress, setProgress] = useState([])

  const fetchProgress = async () => {
    const { data, error } = await supabase
      .from('classroom_progress')
      .select('*')

    if (error) console.log(error)
    else setProgress(data)
  }

  const updateProgress = async (id, newValue) => {
    const { error } = await supabase
      .from('classroom_progress')
      .update({ progress_percentage: newValue })
      .eq('id', id)

    if (error) console.log(error)
    fetchProgress()
  }

  useEffect(() => { fetchProgress() }, [])

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">All Student Progress</h1>
      <ProgressList progress={progress} onUpdate={updateProgress} />
      <Link href="/login" className="text-blue-500 mt-4 block">Logout</Link>
    </div>
  )
}
