"use client";

import { useState } from "react";
import Login from "@/components/auth/Login";
import Register from "@/components/auth/Register";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold mb-3 bg-clip-text text-transparent" style={{
            backgroundImage: `linear-gradient(to right, rgb(26, 115, 232), rgb(21, 101, 208))`
          }}>
            CUNYConnect
          </h1>
          <p className="text-gray-600 text-lg font-medium">
            Connect with fellow CUNY students
          </p>
          <div className="w-20 h-1 mx-auto mt-4 rounded-full" style={{
            backgroundColor: "rgb(26, 115, 232)"
          }}></div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg">
          <div className="relative flex mb-8 bg-gray-100 rounded-xl p-1">
            {/* Sliding indicator */}
            <div
              className="absolute top-1 bottom-1 rounded-lg transition-all duration-300 ease-out shadow-md"
              style={{
                backgroundColor: "rgb(26, 115, 232)",
                width: "calc(50% - 4px)",
                left: isLogin ? "4px" : "calc(50% + 0px)",
              }}
            ></div>

            <button
              className={`relative z-10 flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-all duration-300 ${
                isLogin ? "text-white" : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setIsLogin(true)}
            >
              Sign In
            </button>
            <button
              className={`relative z-10 flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-all duration-300 ${
                !isLogin ? "text-white" : "text-gray-500 hover:text-gray-700"
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
  );
}
