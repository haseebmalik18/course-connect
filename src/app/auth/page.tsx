'use client';

import { useState } from 'react';
import Login from '@/components/auth/Login';
import Register from '@/components/auth/Register';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

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

          {/* Render the appropriate component based on the selected tab */}
          <div className="mt-6">
            {isLogin ? <Login /> : <Register />}
          </div>
        </div>
      </div>
    </div>
  );
}