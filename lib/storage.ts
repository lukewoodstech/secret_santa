// In-memory storage for Secret Santa assignments
interface Assignment {
  name: string
  assignedTo: string
  revealUrl: string
}

const assignments: Map<string, Assignment> = new Map()

export function storeAssignments(newAssignments: Record<string, Assignment>) {
  // Clear existing assignments
  assignments.clear()
  
  // Store new assignments
  Object.entries(newAssignments).forEach(([id, assignment]) => {
    assignments.set(id, assignment)
  })
}

export function getAssignment(id: string): Assignment | undefined {
  return assignments.get(id)
}

export function clearAssignments() {
  assignments.clear()
}

