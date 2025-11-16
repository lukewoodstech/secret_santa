import { NextRequest, NextResponse } from 'next/server'
import { decodeAssignment } from '@/lib/encode'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assignment = decodeAssignment(params.id)

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      name: assignment.name,
      assignedTo: assignment.assignedTo,
      revealUrl: `/reveal/${params.id}`,
    })
  } catch (error) {
    console.error('Error fetching assignment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assignment' },
      { status: 500 }
    )
  }
}

