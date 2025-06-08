"use client"
import React from "react";
import { Button } from "@/components/ui/button";
import {signIn} from "next-auth/react"

const LoginFacebook = () => {
  const handleFacebookLogin = async () => {
    // TODO: Implement Facebook authentication
    await signIn("facebook", {
      callbackUrl: "/create", // Redirect to dashboard after login
    });
    console.log("Facebook login initiated");
  };

  return (
    <div className="relative group">
      {/* Button glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-500" />
      
      <Button
        onClick={handleFacebookLogin}
        className="relative w-full bg-slate-800/90 border border-blue-400/50 text-blue-300 hover:text-white hover:border-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-300 font-mono uppercase tracking-wider py-6 cursor-pointer"
      >
        <div className="flex items-center justify-center gap-3">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span>Connect via Facebook</span>
        </div>
      </Button>
    </div>
  );
};

export default LoginFacebook;