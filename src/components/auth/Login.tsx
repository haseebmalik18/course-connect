'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('Signing in with Supabase...', { email })
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password,
      })

      if (signInError) {
        console.error('Supabase signin error:', signInError)
        throw new Error(signInError.message)
      }

      if (data.user) {
        console.log('User signed in successfully:', data.user)
        router.push('/dashboard')
      } else {
        throw new Error('No user data returned')
      }

    } catch (err) {
      console.error('Login error:', err)
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
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
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}