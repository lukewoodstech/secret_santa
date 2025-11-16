// Encode/decode assignment data for URL storage

interface AssignmentData {
  name: string
  assignedTo: string
}

export function encodeAssignment(data: AssignmentData): string {
  const json = JSON.stringify(data)
  return Buffer.from(json).toString('base64url')
}

export function decodeAssignment(encoded: string): AssignmentData | null {
  try {
    const json = Buffer.from(encoded, 'base64url').toString('utf-8')
    return JSON.parse(json)
  } catch {
    return null
  }
}

