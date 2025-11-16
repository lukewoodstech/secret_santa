import { NextRequest, NextResponse } from 'next/server'
import { generateAssignments } from '@/lib/assignment'
import { nanoid } from 'nanoid'

interface ParticipantInput {
  name: string
  exclusions: string[] // Array of participant names
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const participants: ParticipantInput[] = body.participants || []

    if (participants.length < 3) {
      return NextResponse.json(
        { error: 'At least 3 participants are required' },
        { status: 400 }
      )
    }

    // Convert to internal format with IDs
    const participantsWithIds = participants.map(p => ({
      id: nanoid(),
      name: p.name.trim(),
      exclusions: p.exclusions || [],
    }))

    // Create a name-to-id mapping for exclusions
    const nameToId = new Map<string, string>()
    participantsWithIds.forEach(p => {
      nameToId.set(p.name.toLowerCase(), p.id)
    })

    // Convert exclusion names to IDs
    const participantsWithExclusionIds = participantsWithIds.map(p => ({
      ...p,
      exclusions: p.exclusions
        .map(exclusionName => nameToId.get(exclusionName.trim().toLowerCase()))
        .filter((id): id is string => id !== undefined),
    }))

    // Generate assignments
    const assignments = generateAssignments(participantsWithExclusionIds)

    return NextResponse.json({ assignments })
  } catch (error) {
    console.error('Error generating assignments:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate assignments' },
      { status: 500 }
    )
  }
}

