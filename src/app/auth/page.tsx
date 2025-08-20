'use client';

import { useState } from 'react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateCUNYEmail = (email: string) => {
    const cunyPattern = /@(cuny\.edu|baruch\.cuny\.edu|brooklyn\.cuny\.edu|ccny\.cuny\.edu|hunter\.cuny\.edu|jjay\.cuny\.edu|lehman\.cuny\.edu|qc\.cuny\.edu|csi\.cuny\.edu|york\.cuny\.edu|citytech\.cuny\.edu|medgar\.cuny\.edu|bcc\.cuny\.edu|bmcc\.cuny\.edu|guttman\.cuny\.edu|hostos\.cuny\.edu|kbcc\.cuny\.edu|lagcc\.cuny\.edu|qcc\.cuny\.edu)/i;
    
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!cunyPattern.test(email)) {
      setEmailError('Please use a valid CUNY email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateCUNYEmail(email)) {
      console.log(isLogin ? 'Logging in...' : 'Signing up...', { email, password });
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-8"
      style={{ backgroundColor: '#f5f5f5' }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 
            className="text-4xl font-bold mb-2"
            style={{ color: '#1a73e8' }}
          >
            CUNYConnect
          </h1>
          <p style={{ color: '#5f6368' }}>
            Connect with fellow CUNY students
          </p>
        </div>

        <div 
          className="p-8 rounded-lg shadow-lg"
          style={{ backgroundColor: 'white' }}
        >
          <div className="flex mb-6">
            <button
              className={`flex-1 py-2 text-center font-medium border-b-2 transition-colors ${
                isLogin ? '' : 'opacity-60'
              }`}
              style={{
                borderColor: isLogin ? '#1a73e8' : 'transparent',
                color: isLogin ? '#202124' : '#5f6368'
              }}
              onClick={() => setIsLogin(true)}
            >
              Log In
            </button>
            <button
              className={`flex-1 py-2 text-center font-medium border-b-2 transition-colors ${
                !isLogin ? '' : 'opacity-60'
              }`}
              style={{
                borderColor: !isLogin ? '#1a73e8' : 'transparent',
                color: !isLogin ? '#202124' : '#5f6368'
              }}
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                onChange={(e) => {
                  setEmail(e.target.value);
                  validateCUNYEmail(e.target.value);
                }}
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
              />
              {emailError && (
                <p className="mt-1 text-sm text-red-500">{emailError}</p>
              )}
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
              />
            </div>

            {!isLogin && (
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
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2 px-4 rounded-md transition-all font-medium hover:shadow-lg"
              style={{ 
                backgroundColor: '#1a73e8',
                color: 'white'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1557b0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1a73e8';
              }}
            >
              {isLogin ? 'Log In' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm" style={{ color: '#5f6368' }}>
            {isLogin ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => setIsLogin(false)}
                  className="font-medium hover:underline"
                  style={{ color: '#1a73e8' }}
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => setIsLogin(true)}
                  className="font-medium hover:underline"
                  style={{ color: '#1a73e8' }}
                >
                  Log in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}