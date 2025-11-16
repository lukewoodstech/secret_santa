// Secret Santa assignment algorithm
import { encodeAssignment } from './encode'

interface Participant {
  id: string
  name: string
  exclusions: string[] // Array of participant IDs
}

interface AssignmentResult {
  [participantId: string]: {
    name: string
    assignedTo: string
    revealUrl: string
  }
}

/**
 * Shuffles an array using Fisher-Yates algorithm
 */
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Validates if an assignment is valid (no self-assignment and respects exclusions)
 */
function isValidAssignment(
  participants: Participant[],
  assignment: Map<string, string>
): boolean {
  const assignedIds = new Set<string>()
  
  for (const participant of participants) {
    const assignedToId = assignment.get(participant.id)
    
    if (!assignedToId) {
      return false // Missing assignment
    }
    
    // Check self-assignment
    if (assignedToId === participant.id) {
      return false
    }
    
    // Check exclusions
    if (participant.exclusions.includes(assignedToId)) {
      return false
    }
    
    // Check for duplicate assignments (each person should be assigned to exactly once)
    if (assignedIds.has(assignedToId)) {
      return false
    }
    
    assignedIds.add(assignedToId)
  }
  
  // Ensure all participants are assigned to
  return assignedIds.size === participants.length
}

/**
 * Generates a valid Secret Santa assignment
 */
export function generateAssignments(
  participants: Participant[]
): AssignmentResult {
  if (participants.length < 3) {
    throw new Error('At least 3 participants are required')
  }

  // Maximum retries to find a valid assignment
  const maxRetries = 1000
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    // Create a shuffled list of participant IDs
    const shuffledIds = shuffle(participants.map(p => p.id))
    
    // Create assignment map: participantId -> assignedToId
    const assignment = new Map<string, string>()
    
    for (let i = 0; i < participants.length; i++) {
      const participant = participants[i]
      const assignedToId = shuffledIds[i]
      assignment.set(participant.id, assignedToId)
    }
    
    // Validate the assignment
    if (isValidAssignment(participants, assignment)) {
      // Convert to result format
      const result: AssignmentResult = {}
      
      for (const participant of participants) {
        const assignedToId = assignment.get(participant.id)!
        const assignedTo = participants.find(p => p.id === assignedToId)!
        
        const encoded = encodeAssignment({
          name: participant.name,
          assignedTo: assignedTo.name,
        })
        
        result[participant.id] = {
          name: participant.name,
          assignedTo: assignedTo.name,
          revealUrl: `/reveal/${encoded}`,
        }
      }
      
      return result
    }
  }
  
  throw new Error('Unable to generate valid assignment. Please check your exclusions.')
}

