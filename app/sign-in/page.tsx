import LoginFacebook from "@/components/LoginFacebook";
import LoginGoogle from "@/components/LoginGoogle";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import React from "react";

const Login = async () => {
  // const { data: session, status } = useSession();
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/create"); // ✅ Redirect if authenticated
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center pt-20">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Holographic container */}
        <div className="relative group">
          {/* Outer glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000" />

          {/* Main container */}
          <div className="relative bg-slate-900/80 backdrop-blur-xl border border-cyan-400/30 rounded-lg p-8 shadow-2xl">
            {/* Scanner line effect */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />

            {/* Title with holographic effect */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent tracking-wide font-mono mb-2">
                SIGN IN
              </h1>
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent mx-auto" />
              <p className="text-gray-400 text-sm mt-4 uppercase tracking-widest">
                Initialize Authentication
              </p>
            </div>

            {/* Login components */}
            <div className="space-y-4">
              <LoginGoogle />
              <LoginFacebook />
            </div>

            {/* Bottom scanner line */}
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-pulse delay-500" />
          </div>
        </div>

        {/* Additional holographic elements */}
        <div className="absolute -top-4 -right-4 w-8 h-8 border-2 border-cyan-400/50 rotate-45 animate-pulse" />
        <div className="absolute -bottom-4 -left-4 w-6 h-6 border-2 border-purple-500/50 rotate-45 animate-pulse delay-700" />
      </div>
    </div>
  );
};

export default Login;
