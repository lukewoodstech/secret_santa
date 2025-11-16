import { NextRequest, NextResponse } from 'next/server'
import { getAssignment } from '@/lib/storage'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assignment = getAssignment(params.id)

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(assignment)
  } catch (error) {
    console.error('Error fetching assignment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assignment' },
      { status: 500 }
    )
  }
}

