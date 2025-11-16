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
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-2 text-gray-900">
              Secret Santa
            </h1>
            <p className="text-gray-500 text-sm">Generate gift exchange assignments</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {!assignments ? (
            <>
              <div className="mb-10">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex-1">
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
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-400"
                        placeholder="Enter participant name"
                      />
                    </div>
                    <button
                      onClick={addParticipant}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium transition-all shadow-sm hover:shadow-md"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {participants.length > 0 && (
                <div className="mb-10">
                  <h2 className="text-lg font-semibold mb-4 text-gray-800">
                    Participants ({participants.length})
                  </h2>
                  <div className="space-y-3">
                    {participants.map((participant) => {
                      const otherParticipants = participants.filter(p => p.id !== participant.id)
                      return (
                        <div
                          key={participant.id}
                          className="bg-gray-50/50 p-5 rounded-xl border border-gray-200/60 hover:border-gray-300 transition-all"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <span className="font-semibold text-gray-900">{participant.name}</span>
                            <button
                              onClick={() => removeParticipant(participant.id)}
                              className="text-gray-400 hover:text-red-600 text-sm font-medium transition-colors"
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
                                className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                              >
                                <span className="text-gray-700">
                                  Exclusions {participant.exclusions.length > 0 && (
                                    <span className="text-blue-600 font-semibold">
                                      ({participant.exclusions.length})
                                    </span>
                                  )}
                                </span>
                                <svg
                                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${openExclusions.has(participant.id) ? 'transform rotate-180' : ''}`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                              {openExclusions.has(participant.id) && (
                                <div className="mt-3 border border-gray-200 rounded-lg p-3 bg-white">
                                  <div className="space-y-1">
                                    {otherParticipants.map((other) => (
                                      <label key={other.id} className="flex items-center space-x-3 py-2 px-2 cursor-pointer hover:bg-gray-50 rounded-md transition-colors">
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
                                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                                        />
                                        <span className="text-sm text-gray-700">{other.name}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {participant.exclusions.length > 0 && !openExclusions.has(participant.id) && (
                                <p className="text-xs text-gray-500 mt-2 ml-1">
                                  Excludes: <span className="font-medium">{participant.exclusions.join(', ')}</span>
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
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-semibold transition-all shadow-md hover:shadow-lg disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {isGenerating ? 'Generating...' : 'Generate Assignments'}
              </button>
            </>
          ) : (
            <div>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2 text-gray-900">Assignments Generated!</h2>
                <p className="text-gray-600 text-sm">
                  Share each person's unique link. They'll only see their own assignment.
                </p>
              </div>
              
              <div className="space-y-3 mb-8">
                {Object.entries(assignments).map(([id, assignment]) => {
                  const fullUrl = `${window.location.origin}${assignment.revealUrl}`
                  return (
                    <div
                      key={id}
                      className="bg-gray-50/50 p-5 rounded-xl border border-gray-200/60 hover:border-gray-300 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 mb-1">{assignment.name}</p>
                          <p className="text-xs text-gray-500 break-all font-mono">{fullUrl}</p>
                        </div>
                        <button
                          onClick={() => copyLink(assignment.revealUrl)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-medium transition-all shadow-sm hover:shadow-md whitespace-nowrap flex-shrink-0"
                        >
                          Copy
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
                  setOpenExclusions(new Set())
                }}
                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 font-medium transition-all"
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

