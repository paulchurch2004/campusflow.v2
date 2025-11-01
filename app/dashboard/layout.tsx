'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/sidebar'
import { SocketProvider } from '@/contexts/SocketContext'

interface User {
  id: string
  name: string
  email: string
  role: string
  listId: string | null
}

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/session')

        if (!response.ok) {
          router.push('/login')
          return
        }

        const userData: User | null = await response.json()

        if (!userData) {
          router.push('/login')
          return
        }

        setUser(userData)
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Authentication check failed:', error)
        router.push('/login')
      }
    }

    // Vérifier l'authentification une seule fois au montage
    checkAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5">
        <div className="flex flex-col items-center space-y-5">
          <div className="relative">
            <div className="h-14 w-14 animate-spin rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-1">
              <div className="h-full w-full rounded-full bg-background"></div>
            </div>
            <div className="absolute inset-0 h-14 w-14 animate-pulse rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-20 blur-xl"></div>
          </div>
          <p className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-sm font-semibold text-transparent">
            Chargement...
          </p>
        </div>
      </div>
    )
  }

  // Only render layout if authenticated
  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <SocketProvider listId={user.listId || 'default-list'} userId={user.id}>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </SocketProvider>
  )
}
