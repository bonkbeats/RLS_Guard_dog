'use client'

export default function ProgressList({ progress = [], onUpdate }) {
  if (!progress || progress.length === 0) {
    return <p>No progress yet.</p>
  }

  return (
    <ul>
      {progress.map((p) => (
        <li key={p.id} className="mb-2">
          <span>Classroom: {p.classroom_id} — {p.progress_percentage}%</span>
          {onUpdate && (
            <button
              onClick={() => onUpdate(p.id, p.progress_percentage + 10)}
              className="ml-2 bg-green-500 text-white px-2 rounded"
            >
              +10%
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}
