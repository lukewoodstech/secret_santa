'use client'

import { useState } from 'react'

interface Participant {
  id: string
  name: string
  exclusions: string[]
}

interface Assignment {
  name: string
  assignedTo: string
  revealUrl: string
}

export default function Home() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [currentName, setCurrentName] = useState('')
  const [assignments, setAssignments] = useState<Record<string, Assignment> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [openExclusions, setOpenExclusions] = useState<Set<string>>(new Set())

  const addParticipant = () => {
    if (!currentName.trim()) {
      setError('Please enter a name')
      return
    }

    if (participants.some(p => p.name.toLowerCase() === currentName.trim().toLowerCase())) {
      setError('This name is already added')
      return
    }

    setParticipants([
      ...participants,
      {
        id: Date.now().toString(),
        name: currentName.trim(),
        exclusions: [],
      },
    ])
    setCurrentName('')
    setError(null)
  }

  const removeParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id))
    setAssignments(null)
  }

  const generateAssignments = async () => {
    if (participants.length < 3) {
      setError('At least 3 participants are required')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participants: participants.map(p => ({
            name: p.name,
            exclusions: p.exclusions,
          })),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate assignments')
      }

      setAssignments(data.assignments)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate assignments')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyLink = (url: string) => {
    const fullUrl = `${window.location.origin}${url}`
    navigator.clipboard.writeText(fullUrl)
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            🎅 Secret Santa Generator
          </h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {!assignments ? (
            <>
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Add Participants</h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={currentName}
                      onChange={(e) => setCurrentName(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addParticipant()
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter participant name"
                    />
                  </div>

                  <button
                    onClick={addParticipant}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium transition-colors"
                  >
                    Add Person
                  </button>
                </div>
              </div>

              {participants.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 text-gray-700">Participants</h2>
                  <div className="space-y-4">
                    {participants.map((participant) => {
                      const otherParticipants = participants.filter(p => p.id !== participant.id)
                      return (
                        <div
                          key={participant.id}
                          className="bg-gray-50 p-4 rounded-md border border-gray-200"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-medium text-gray-800">{participant.name}</span>
                            <button
                              onClick={() => removeParticipant(participant.id)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Remove
                            </button>
                          </div>
                          {otherParticipants.length > 0 && (
                            <div>
                              <button
                                type="button"
                                onClick={() => {
                                  const newOpen = new Set(openExclusions)
                                  if (newOpen.has(participant.id)) {
                                    newOpen.delete(participant.id)
                                  } else {
                                    newOpen.add(participant.id)
                                  }
                                  setOpenExclusions(newOpen)
                                }}
                                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <span>
                                  Exclusions {participant.exclusions.length > 0 && `(${participant.exclusions.length} selected)`}
                                </span>
                                <svg
                                  className={`w-4 h-4 transition-transform ${openExclusions.has(participant.id) ? 'transform rotate-180' : ''}`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                              {openExclusions.has(participant.id) && (
                                <div className="mt-2 border border-gray-300 rounded-md p-3 bg-white">
                                  {otherParticipants.map((other) => (
                                    <label key={other.id} className="flex items-center space-x-2 py-1 cursor-pointer hover:bg-gray-50 px-2 rounded">
                                      <input
                                        type="checkbox"
                                        checked={participant.exclusions.includes(other.name)}
                                        onChange={(e) => {
                                          const newExclusions = e.target.checked
                                            ? [...participant.exclusions, other.name]
                                            : participant.exclusions.filter(e => e !== other.name)
                                          setParticipants(participants.map(p => 
                                            p.id === participant.id 
                                              ? { ...p, exclusions: newExclusions }
                                              : p
                                          ))
                                          setAssignments(null)
                                        }}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                      />
                                      <span className="text-sm text-gray-700">{other.name}</span>
                                    </label>
                                  ))}
                                </div>
                              )}
                              {participant.exclusions.length > 0 && !openExclusions.has(participant.id) && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Excludes: {participant.exclusions.join(', ')}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <button
                onClick={generateAssignments}
                disabled={participants.length < 3 || isGenerating}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isGenerating ? 'Generating...' : 'Generate Assignments'}
              </button>
            </>
          ) : (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Assignments Generated!</h2>
              <p className="text-gray-600 mb-6">
                Share each person's unique link with them. They'll only see their own assignment.
              </p>
              
              <div className="space-y-4">
                {Object.entries(assignments).map(([id, assignment]) => {
                  const fullUrl = `${window.location.origin}${assignment.revealUrl}`
                  return (
                    <div
                      key={id}
                      className="bg-gray-50 p-4 rounded-md border border-gray-200"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800">{assignment.name}</p>
                          <p className="text-sm text-gray-600 mt-1 break-all">{fullUrl}</p>
                        </div>
                        <button
                          onClick={() => copyLink(assignment.revealUrl)}
                          className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-medium transition-colors whitespace-nowrap"
                        >
                          Copy Link
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              <button
                onClick={() => {
                  setAssignments(null)
                  setParticipants([])
                }}
                className="w-full mt-6 bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium transition-colors"
              >
                Start Over
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

