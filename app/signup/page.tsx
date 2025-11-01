'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface SignupFormData {
  name: string
  email: string
  password: string
  phone?: string
}

interface UserResponse {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  role: string
  listId?: string | null
  createdAt: string
  updatedAt: string
}

interface LoginResponse {
  id: string
  name: string
  email: string
  role: string
  listId: string | null
}

export default function SignupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [justSaved, setJustSaved] = useState(false)
  const [formData, setFormData] = useState<SignupFormData>({
    name: '',
    email: '',
    password: '',
    phone: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateForm = (): boolean => {
    // Check required fields
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields')
      return false
    }

    // Validate name length
    if (formData.name.trim().length < 2) {
      toast.error('Name must be at least 2 characters long')
      return false
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address')
      return false
    }

    // Validate password length
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!validateForm()) {
        setIsLoading(false)
        return
      }

      // Create user
      const createUserResponse = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || undefined,
        }),
      })

      if (!createUserResponse.ok) {
        let errorMessage = 'Failed to create account'
        try {
          const errorData = await createUserResponse.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          errorMessage = `Failed to create account with status ${createUserResponse.status}`
        }
        throw new Error(errorMessage)
      }

      const userData: UserResponse = await createUserResponse.json()
      toast.success('Account created successfully!')

      // Auto-login the user
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      if (!loginResponse.ok) {
        let errorMessage = 'Login failed'
        try {
          const errorData = await loginResponse.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          errorMessage = `Login failed with status ${loginResponse.status}`
        }
        throw new Error(errorMessage)
      }

      const loginData: LoginResponse = await loginResponse.json()
      toast.success('Logged in successfully!')

      setJustSaved(true)
      setTimeout(() => setJustSaved(false), 1000)

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during signup'
      toast.error(errorMessage)
      console.error('Signup error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold text-center">Create account</CardTitle>
          <CardDescription className="text-center">
            Join CampusFlow and get started today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              />
              <p className="text-xs text-muted-foreground">
                Password must be at least 6 characters long
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className={`w-full ${justSaved ? 'animate-flash-green' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Sign up'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
