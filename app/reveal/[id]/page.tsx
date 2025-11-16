'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

interface Assignment {
  name: string
  assignedTo: string
  revealUrl: string
}

export default function RevealPage() {
  const params = useParams()
  const id = params.id as string
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const response = await fetch(`/api/reveal/${id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch assignment')
        }

        setAssignment(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load assignment')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchAssignment()
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-4">🎅</div>
          <p className="text-gray-600">Loading your assignment...</p>
        </div>
      </div>
    )
  }

  if (error || !assignment) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Assignment Not Found</h1>
          <p className="text-gray-600">{error || 'This assignment link is invalid or has expired.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-lg shadow-lg p-12 max-w-2xl w-full relative">
        <div className="absolute top-6 right-6 text-4xl">🎅</div>
        
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">
            Hi {assignment.name},
          </h1>
          
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8 mb-6">
            <p className="text-lg text-gray-700 mb-4">
              You are the Secret Santa for:
            </p>
            <p className="text-4xl font-bold text-blue-700">
              {assignment.assignedTo}
            </p>
          </div>
          
          <p className="text-gray-600 text-sm">
            Keep this a secret until gift exchange day! 🎁
          </p>
        </div>
      </div>
    </div>
  )
}

