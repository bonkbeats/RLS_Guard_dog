'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

export default function StudentDashboard() {
  const [progressList, setProgressList] = useState([])

  useEffect(() => {
    const fetchProgress = async () => {
      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError) return console.log('Error getting user:', userError)
      const user = userData?.user
      if (!user) return

      // Fetch progress for this student with classroom name
      const { data, error } = await supabase
        .from('classroom_progress')
        .select(`
          progress_percentage,
          classroom_progress_classroom_id_fkey(name)
        `)
        .eq('student_id', user.id)

      if (error) console.log('Error fetching progress:', error)
      else setProgressList(data)
    }

    fetchProgress()
  }, [])

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Classroom Progress</h1>

      {progressList.length === 0 ? (
        <p className="text-gray-500">No progress yet.</p>
      ) : (
        <table className="w-full table-auto border border-gray-300 rounded">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b">Classroom</th>
              <th className="py-2 px-4 border-b">Progress</th>
            </tr>
          </thead>
          <tbody>
            {progressList.map((p, idx) => (
              <tr key={idx} className="text-center border-b">
                <td className="py-2 px-4">
                  {p.classroom_progress_classroom_id_fkey?.name || 'Unknown'}
                </td>
                <td className="py-2 px-4">{p.progress_percentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Link href="/login" className="text-blue-500 mt-6 block">
        Logout
      </Link>
    </div>
  )
}
