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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 animate-pulse">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium">Loading your assignment...</p>
        </div>
      </div>
    )
  }

  if (error || !assignment) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Assignment Not Found</h1>
          <p className="text-gray-600 text-sm">{error || 'This assignment link is invalid or has expired.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white rounded-2xl shadow-lg p-10 md:p-12 max-w-2xl w-full">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hi {assignment.name}!
          </h1>
          <p className="text-gray-500 text-sm mb-10">Your Secret Santa assignment</p>
          
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-xl p-10 mb-8">
            <p className="text-base text-gray-600 mb-6 font-medium">
              You are the Secret Santa for:
            </p>
            <p className="text-5xl font-bold text-blue-700 mb-2">
              {assignment.assignedTo}
            </p>
          </div>
          
          <p className="text-gray-500 text-sm">
            Keep this a secret until gift exchange day
          </p>
        </div>
      </div>
    </div>
  )
}

