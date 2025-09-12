'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

export default function TeacherDashboard() {
  const [classrooms, setClassrooms] = useState([])
  const [expanded, setExpanded] = useState({}) // track which classrooms are expanded

  // Fetch classrooms and students with progress
  const fetchClassrooms = async () => {
    const { data: classroomData, error } = await supabase
      .from('classroom')
      .select(`
        id,
        name,
        classroom_progress(
          id,
          student_id,
          progress_percentage,
          profiles(name)
        )
      `)

    if (error) console.log(error)
    else setClassrooms(classroomData)
  }

  // Update student progress
  const updateProgress = async (id, newValue) => {
    const { error } = await supabase
      .from('classroom_progress')
      .update({ progress_percentage: newValue })
      .eq('id', id)

    if (error) console.log(error)
    fetchClassrooms()
  }

  // Add student modal (simplified)
  const addStudent = async (classroomId) => {
    const email = prompt('Enter student email to add:')
    if (!email) return

    // Fetch user ID from email
    const { data: studentProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (profileError || !studentProfile) {
      alert('Student not found!')
      return
    }

    // Insert into classroom_progress with initial 0%
    const { error: insertError } = await supabase
      .from('classroom_progress')
      .insert([{
        classroom_id: classroomId,
        student_id: studentProfile.id,
        progress_percentage: 0
      }])

    if (insertError) console.log(insertError)
    fetchClassrooms()
  }

  // Toggle classroom expanded state
  const toggleClassroom = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  useEffect(() => { fetchClassrooms() }, [])

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
      {classrooms.map((classroom) => (
        <div key={classroom.id} className="border rounded-lg p-4 shadow-md">
          <div 
            className="flex justify-between items-center mb-2 cursor-pointer"
            onClick={() => toggleClassroom(classroom.id)}
          >
            <h2 className="text-xl font-semibold">{classroom.name}</h2>
            <span className="text-gray-500">{expanded[classroom.id] ? '▲' : '▼'}</span>
          </div>

          {expanded[classroom.id] && (
            <div>
              <button
                onClick={() => addStudent(classroom.id)}
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 mb-2"
              >
                Add Student
              </button>

              {classroom.classroom_progress.length === 0 ? (
                <p className="text-gray-500">No students yet.</p>
              ) : (
                <table className="w-full text-left border-t border-gray-300">
                  <thead>
                    <tr>
                      <th className="py-2 px-3">Student</th>
                      <th className="py-2 px-3">Progress</th>
                      <th className="py-2 px-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classroom.classroom_progress.map((p) => (
                      <tr key={p.id} className="border-t">
                        <td className="py-2 px-3">{p.profiles?.name || 'Unknown'}</td>
                        <td className="py-2 px-3">{p.progress_percentage}%</td>
                        <td className="py-2 px-3">
                          <button
                            onClick={() => updateProgress(p.id, p.progress_percentage + 10)}
                            className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                          >
                            +10%
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      ))}
      <Link href="/login" className="text-blue-500 mt-4 block">Logout</Link>
    </div>
  )
}
