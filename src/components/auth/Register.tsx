'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      setLoading(false)
      return
    }

    try {
      console.log('Signing up with Supabase...', { email, password })
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      })

      if (signUpError) {
        console.error('Supabase signup error:', signUpError)
        throw new Error(signUpError.message)
      }

      if (data.user) {
        console.log('User created successfully:', data.user)
        setSuccess(true)
        setTimeout(() => {
          router.push('/verify-email?email=' + encodeURIComponent(email))
        }, 2000)
      } else {
        throw new Error('No user data returned')
      }

    } catch (err) {
      console.error('Registration error:', err)
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Registration successful! Please check your email for verification.
        </div>
        <p className="text-sm text-gray-600">
          Redirecting you to email verification...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium mb-1"
              style={{ color: '#202124' }}
            >
              CUNY Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 transition-colors"
              style={{ 
                border: '1px solid #dadce0',
                backgroundColor: 'white',
                color: '#202124'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#1a73e8';
                e.target.style.boxShadow = '0 0 0 2px rgba(26, 115, 232, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#dadce0';
                e.target.style.boxShadow = 'none';
              }}
              placeholder="your.name@cuny.edu"
              required
            />
          </div>
          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium mb-1"
              style={{ color: '#202124' }}
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 transition-colors"
              style={{ 
                border: '1px solid #dadce0',
                backgroundColor: 'white',
                color: '#202124'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#1a73e8';
                e.target.style.boxShadow = '0 0 0 2px rgba(26, 115, 232, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#dadce0';
                e.target.style.boxShadow = 'none';
              }}
              placeholder="••••••••"
              required
            />
          </div>
          <div>
            <label 
              htmlFor="confirmPassword" 
              className="block text-sm font-medium mb-1"
              style={{ color: '#202124' }}
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 transition-colors"
              style={{ 
                border: '1px solid #dadce0',
                backgroundColor: 'white',
                color: '#202124'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#1a73e8';
                e.target.style.boxShadow = '0 0 0 2px rgba(26, 115, 232, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#dadce0';
                e.target.style.boxShadow = 'none';
              }}
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 rounded-md transition-all font-medium hover:shadow-lg disabled:opacity-50"
          style={{ 
            backgroundColor: '#1a73e8',
            color: 'white'
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = '#1557b0';
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = '#1a73e8';
          }}
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </div>
  )
}