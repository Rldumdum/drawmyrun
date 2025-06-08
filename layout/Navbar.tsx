"use client";
import { Button } from "@/components/ui/button";
import { Zap, Rocket, LogOut, FileText } from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

const Navbar = () => {
  // Mock authentication state - replace with actual auth logic
  const { data: session } = useSession();

  return (
    <header className="fixed top-0 w-full backdrop-blur-xl bg-gradient-to-r from-slate-900/90 via-purple-900/90 to-slate-900/90 border-b border-cyan-400/30 shadow-2xl z-50">
      {/* Animated background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent animate-pulse" />

      <div className="container mx-auto flex items-center justify-between py-4 px-6 relative">
        {/* Logo Section with Glow */}
        <Link href="/">
          <div className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full blur-md opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative bg-slate-900 rounded-full p-2 border border-cyan-400/50 group-hover:border-cyan-400 transition-colors duration-300">
                <Zap className="w-6 h-6 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent tracking-wide font-mono">
              Draw My Run
            </span>
            <div className="h-6 w-px bg-gradient-to-b from-transparent via-cyan-400 to-transparent opacity-50" />
          </div>
        </Link>

        {/* Navigation Links with Holographic Effect */}
        <nav className="hidden md:flex items-center gap-8 text-sm">
          {["how-it-works"].map((section) => (
            <a
              key={section}
              href={`/#${section}`}
              className="relative group uppercase tracking-wider text-gray-300 hover:text-cyan-400 transition-all duration-300 cursor-pointer"
            >
              {/* Holographic underline effect */}
              <span className="relative z-10">
                {section.replace(/-/g, " ")}
              </span>
              <div className="absolute bottom-0 left-0 w-0 h-px bg-gradient-to-r from-cyan-400 to-purple-500 group-hover:w-full transition-all duration-500" />
              <div className="absolute -bottom-1 left-0 w-0 h-px bg-cyan-400/50 blur-sm group-hover:w-full transition-all duration-500 delay-100" />
            </a>
          ))}
        </nav>

        {/* Authentication Section */}
        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              {/* Downloads Button */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 via-cyan-500 to-purple-500 rounded-lg blur opacity-30 group-hover:opacity-70 transition duration-500" />
                <Link href="/downloads">
                  <Button
                    size="sm"
                    className="relative bg-gradient-to-r from-slate-800 to-slate-700 text-purple-400 border border-purple-400/50 hover:border-purple-400 hover:text-white hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all duration-300 font-mono uppercase tracking-wider"
                  >
                    <FileText className="w-4 h-4 mr-2 animate-pulse" />
                    Downloads
                  </Button>
                </Link>
              </div>

              {/* Sign Out Button */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-400 via-orange-500 to-red-500 rounded-lg blur opacity-30 group-hover:opacity-70 transition duration-500" />
                <Button
                  size="sm"
                  className="relative bg-gradient-to-r from-slate-800 to-slate-700 text-red-400 border border-red-400/50 hover:border-red-400 hover:text-white hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all duration-300 font-mono uppercase tracking-wider"
                  onClick={async () => {
                    // Sign out logic here
                    console.log("Signing out...");
                    await signOut({ redirect: true, callbackUrl: "/create" });
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2 animate-pulse" />
                  Sign Out
                </Button>
              </div>
            </>
          ) : (
            /* Login Button */
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-lg blur opacity-30 group-hover:opacity-70 transition duration-500" />

              <Link href="/sign-in">
                <Button
                  size="sm"
                  className="relative bg-gradient-to-r from-slate-800 to-slate-700 text-cyan-400 border border-cyan-400/50 hover:border-cyan-400 hover:text-white hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] transition-all duration-300 font-mono uppercase tracking-wider"
                >
                  <Rocket className="w-4 h-4 mr-2 animate-pulse" />
                  Login
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Bottom scanner line effect */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
      </div>
    </header>
  );
};

export default Navbar;
