import Link from 'next/link'

export default function Home() {
  return (
    <div className="p-4 text-center">
      <h1 className="text-3xl font-bold mb-4">RLS Guard Dog</h1>
      <p>
        <Link href="/login" className="text-blue-500">Login</Link> |{' '}
        <Link href="/signup" className="text-blue-500">Sign Up</Link>
      </p>
    </div>
  )
}
