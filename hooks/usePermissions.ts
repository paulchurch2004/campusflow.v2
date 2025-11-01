'use client'

import { useState, useEffect, useCallback } from 'react'

type Role = 'PRESIDENT' | 'VICE_PRESIDENT' | 'TREASURER' | 'SECRETARY' | 'POLE_LEADER' | 'MEMBER'

interface Permissions {
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  canApprove: boolean
}

interface UsePermissionsReturn extends Permissions {
  isLoading: boolean
  error: Error | null
}

interface UserSession {
  id: string
  name: string
  email: string
  role: Role
  listId: string | null
}

/**
 * Hook to check user permissions based on their role
 * Fetches the current user session and determines permissions based on role hierarchy
 *
 * Permission rules:
 * - PRESIDENT: All permissions (create, edit, delete, approve)
 * - VICE_PRESIDENT: All permissions (create, edit, delete, approve)
 * - TREASURER: All permissions (create, edit, delete, approve)
 * - SECRETARY: Can create, edit, no approve or delete
 * - POLE_LEADER: Can create and edit (for their pole), no approve or delete
 * - MEMBER: Can create, others = false
 *
 * @param requiredRole - The role to check permissions for
 * @returns Object containing permission flags and loading/error states
 */
export function usePermissions(requiredRole?: Role): UsePermissionsReturn {
  const [permissions, setPermissions] = useState<Permissions>({
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canApprove: false,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const calculatePermissions = useCallback((userRole: Role): Permissions => {
    switch (userRole) {
      case 'PRESIDENT':
      case 'VICE_PRESIDENT':
        return {
          canCreate: true,
          canEdit: true,
          canDelete: true,
          canApprove: true,
        }

      case 'TREASURER':
        return {
          canCreate: true,
          canEdit: true,
          canDelete: true,
          canApprove: true,
        }

      case 'SECRETARY':
        return {
          canCreate: true,
          canEdit: true,
          canDelete: false,
          canApprove: false,
        }

      case 'POLE_LEADER':
        return {
          canCreate: true,
          canEdit: true,
          canDelete: false,
          canApprove: false,
        }

      case 'MEMBER':
        return {
          canCreate: true,
          canEdit: false,
          canDelete: false,
          canApprove: false,
        }

      default:
        return {
          canCreate: false,
          canEdit: false,
          canDelete: false,
          canApprove: false,
        }
    }
  }, [])

  useEffect(() => {
    const fetchUserSession = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch('/api/session', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch session: ${response.statusText}`)
        }

        const session: UserSession = await response.json()

        // Calculate permissions based on user's role
        const calculatedPermissions = calculatePermissions(session.role)
        setPermissions(calculatedPermissions)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch user session')
        setError(error)
        console.error('usePermissions error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserSession()
  }, [calculatePermissions])

  return {
    ...permissions,
    isLoading,
    error,
  }
}
