export function generateShareToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function createShareLink(projectId: string, token: string): string {
  return `/share/${projectId}/${token}`
}

export interface SharedProject {
  id: string
  projectId: string
  token: string
  createdAt: string
  expiresAt?: string
  isActive: boolean
}

export interface Comment {
  id: string;
  author: string;
  email: string;
  content: string;
  variationId: string;
  createdAt: string;
}
