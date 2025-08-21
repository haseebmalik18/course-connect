"use client";

import { useState } from "react";
import Login from "@/components/auth/Login";
import Register from "@/components/auth/Register";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white to-blue-50/20 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl -translate-y-48 translate-x-48 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-200/15 rounded-full blur-3xl translate-y-40 -translate-x-40 pointer-events-none"></div>
      
      <div className="flex items-center justify-center min-h-screen p-6 relative z-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom duration-1000">
            <h1 className="text-3xl font-semibold mb-2 text-blue-600">
              CUNYConnect
            </h1>
            <p className="text-gray-600">
              Connect with fellow CUNY students
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-xl animate-in fade-in slide-in-from-bottom duration-1000 delay-300">
            <div className="relative flex mb-8 bg-gray-50/80 rounded-2xl p-1.5 backdrop-blur-sm">
              <div
                className="absolute top-1.5 bottom-1.5 rounded-xl transition-all duration-500 ease-out shadow-lg bg-gradient-to-r from-blue-600 to-blue-700"
                style={{
                  width: "calc(50% - 6px)",
                  left: isLogin ? "6px" : "calc(50% + 0px)",
                }}
              ></div>

              <button
                className={`relative z-10 flex-1 py-3 px-6 text-sm font-medium rounded-xl transition-all duration-300 ${
                  isLogin ? "text-white" : "text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => setIsLogin(true)}
              >
                Sign In
              </button>
              <button
                className={`relative z-10 flex-1 py-3 px-6 text-sm font-medium rounded-xl transition-all duration-300 ${
                  !isLogin ? "text-white" : "text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => setIsLogin(false)}
              >
                Sign Up
              </button>
            </div>

            <div className="min-h-[350px]">
              {isLogin ? <Login /> : <Register />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
