'use client'

import { useState, useEffect } from 'react'

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

interface SavedList {
  id: string
  name: string
  participants: Participant[]
  createdAt: number
}

export default function Home() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [currentName, setCurrentName] = useState('')
  const [assignments, setAssignments] = useState<Record<string, Assignment> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [openExclusions, setOpenExclusions] = useState<Set<string>>(new Set())
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [savedLists, setSavedLists] = useState<SavedList[]>([])
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [listName, setListName] = useState('')
  const [showLoadConfirm, setShowLoadConfirm] = useState<SavedList | null>(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

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

  const copyLink = (url: string, id: string) => {
    const fullUrl = `${window.location.origin}${url}`
    navigator.clipboard.writeText(fullUrl)
    setCopiedId(id)
  }

  // Load saved lists from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('secretSantaLists')
      if (stored) {
        try {
          setSavedLists(JSON.parse(stored))
        } catch (e) {
          console.error('Error loading saved lists:', e)
        }
      }
    }
  }, [])

  // Save list to localStorage
  const saveList = () => {
    if (!listName.trim()) {
      setError('Please enter a list name')
      return
    }

    // Get participants - they should still be in state even after generating assignments
    const participantsToSave = participants.length > 0 ? participants : []
    
    if (participantsToSave.length === 0) {
      setError('No participants to save')
      return
    }

    const newList: SavedList = {
      id: Date.now().toString(),
      name: listName.trim(),
      participants: participantsToSave.map(p => ({ ...p })),
      createdAt: Date.now(),
    }

    const updatedLists = [...savedLists, newList]
    setSavedLists(updatedLists)
    localStorage.setItem('secretSantaLists', JSON.stringify(updatedLists))
    setListName('')
    setShowSaveModal(false)
    setError(null)
  }

  // Load a saved list
  const loadList = (list: SavedList) => {
    if (participants.length > 0) {
      setShowLoadConfirm(list)
    } else {
      setParticipants(list.participants.map(p => ({ ...p })))
      setAssignments(null)
      setOpenExclusions(new Set())
      setError(null)
    }
  }

  // Confirm load list
  const confirmLoadList = (list: SavedList) => {
    setParticipants(list.participants.map(p => ({ ...p })))
    setAssignments(null)
    setOpenExclusions(new Set())
    setError(null)
    setShowLoadConfirm(null)
  }

  // Clear current participants
  const clearParticipants = () => {
    if (participants.length > 0) {
      setShowClearConfirm(true)
    }
  }

  // Confirm clear
  const confirmClear = () => {
    setParticipants([])
    setAssignments(null)
    setOpenExclusions(new Set())
    setError(null)
    setShowClearConfirm(false)
  }

  // Go back to home/main view
  const goHome = () => {
    setParticipants([])
    setAssignments(null)
    setOpenExclusions(new Set())
    setError(null)
  }

  // Check if we're in edit mode (have participants or viewing assignments)
  const isEditMode = participants.length > 0 || assignments !== null

  // Delete a saved list
  const deleteList = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDeleteConfirm(id)
  }

  // Confirm delete list
  const confirmDeleteList = (id: string) => {
    const updatedLists = savedLists.filter(l => l.id !== id)
    setSavedLists(updatedLists)
    localStorage.setItem('secretSantaLists', JSON.stringify(updatedLists))
    setShowDeleteConfirm(null)
  }

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10 mb-6">
          <div className="text-center mb-10">
            {isEditMode && (
              <button
                onClick={goHome}
                className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </button>
            )}
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
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">
                      Participants ({participants.length})
                    </h2>
                    <button
                      onClick={clearParticipants}
                      className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
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
                <p className="text-gray-600 text-sm mb-4">
                  Share each person's unique link. They'll only see their own assignment.
                </p>
                <button
                  onClick={() => setShowSaveModal(true)}
                  className="px-6 py-2.5 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-2 mx-auto"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Save This List
                </button>
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
                          onClick={() => copyLink(assignment.revealUrl, id)}
                          className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 text-sm font-medium transition-all shadow-sm whitespace-nowrap flex-shrink-0 flex items-center gap-2 ${
                            copiedId === id
                              ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                              : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 hover:shadow-md'
                          }`}
                        >
                          {copiedId === id ? (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Copied
                            </>
                          ) : (
                            'Copy'
                          )}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              <button
                onClick={goHome}
                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 font-medium transition-all"
              >
                Start Over
              </button>
            </div>
          )}

          {/* Save Modal */}
          {showSaveModal && (
            <div 
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => {
                setShowSaveModal(false)
                setListName('')
                setError(null)
              }}
            >
              <div 
                className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold mb-4 text-gray-900">Save Participant List</h3>
                <div className="mb-4">
                  <label htmlFor="listName" className="block text-sm font-medium text-gray-700 mb-2">
                    List Name
                  </label>
                  <input
                    type="text"
                    id="listName"
                    value={listName}
                    onChange={(e) => setListName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        saveList()
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-400"
                    placeholder="e.g., Family 2024, Work Team"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowSaveModal(false)
                      setListName('')
                      setError(null)
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveList}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Load Confirmation Modal */}
          {showLoadConfirm && (
            <div 
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowLoadConfirm(null)}
            >
              <div 
                className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold mb-2 text-gray-900">Load Saved List?</h3>
                <p className="text-gray-600 text-sm mb-6">
                  This will replace your current {participants.length} participant{participants.length !== 1 ? 's' : ''}. Are you sure you want to continue?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowLoadConfirm(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => confirmLoadList(showLoadConfirm)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all"
                  >
                    Load List
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Clear Confirmation Modal */}
          {showClearConfirm && (
            <div 
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowClearConfirm(false)}
            >
              <div 
                className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold mb-2 text-gray-900">Clear All Participants?</h3>
                <p className="text-gray-600 text-sm mb-6">
                  This will remove all {participants.length} participant{participants.length !== 1 ? 's' : ''} and their exclusions. This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmClear}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium transition-all"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete List Confirmation Modal */}
          {showDeleteConfirm && (
            <div 
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowDeleteConfirm(null)}
            >
              <div 
                className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold mb-2 text-gray-900">Delete Saved List?</h3>
                <p className="text-gray-600 text-sm mb-6">
                  This will permanently delete "{savedLists.find(l => l.id === showDeleteConfirm)?.name}". This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => confirmDeleteList(showDeleteConfirm)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Saved Lists Widget - Only show when not in edit mode */}
        {!isEditMode && savedLists.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Saved Lists</h2>
            <div className="space-y-2">
              {savedLists.map((list) => (
                <div
                  key={list.id}
                  onClick={() => loadList(list)}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1 truncate">{list.name}</h3>
                    <p className="text-xs text-gray-500">
                      {list.participants.length} participant{list.participants.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <button
                    onClick={(e) => deleteList(list.id, e)}
                    className="ml-4 text-gray-400 hover:text-red-600 hover:shadow-md transition-all flex-shrink-0 p-1 rounded"
                    title="Delete list"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

