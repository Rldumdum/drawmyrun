"use client";
import { Button } from "@/components/ui/button";
import { Download, MapPin, Share2 } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function Home() {

  const fetchData = async () => {
    try {
      const response = await fetch("/api/user/downloads-count");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
    } catch (error) {
      console.error("Error fetching run files count:", error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section with Futuristic Design */}
      <div className="pt-20 min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Animated background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.1)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse" />

        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-cyan-400/20 to-purple-500/20 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-xl animate-pulse delay-1000" />

        <div className="text-center relative z-10 max-w-4xl mx-auto px-6">
          <h1 className="text-6xl md:text-8xl font-extrabold mb-8 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-mono">
            DRAW MY RUN
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Sketch your perfect run, export it as a run file, and sync it with
            Strava
          </p>

          {/* Glowing CTA Button */}
          <div className="relative inline-block">
            <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-lg blur opacity-50 animate-pulse" />
            <Link href="/create">
              <Button className="relative bg-gradient-to-r from-slate-800 to-slate-700 text-cyan-400 border border-cyan-400 hover:border-cyan-300 hover:text-white px-8 py-4 rounded-lg font-mono uppercase tracking-wider text-lg hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all duration-300">
                Start Drawing
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6 relative">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-purple-900/50" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.05)_1px,transparent_1px)] bg-[size:30px_30px]" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-mono">
              HOW IT WORKS
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Create your perfect running route in just a few simple steps
            </p>
          </div>

          {/* Demo Video Section */}
          <div className="mb-20">
            <div className="relative max-w-4xl mx-auto">
              <div className="absolute -inset-4 bg-gradient-to-r from-cyan-400/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-60" />
              <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-cyan-400/30 rounded-2xl overflow-hidden">
                {/* Video embed */}
                <div className="aspect-video bg-gradient-to-br from-slate-700 to-slate-800 relative">
                  <video
                    className="w-full h-full object-cover rounded-2xl"
                    controls
                    poster="/video-poster.jpg" // Optional: add a preview image
                  >
                    <source src="/draw_my_run_demo.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <div className="absolute bottom-4 left-6 right-6 z-10">
                    <h3 className="text-xl font-bold text-white mb-2 font-mono">
                      Watch Demo: Creating Your First Route
                    </h3>
                    <p className="text-gray-300 text-sm">
                      See how easy it is to draw, customize, and export your
                      running routes
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: MapPin,
                title: "Draw Your Route",
                description:
                  "Use our intuitive map interface to sketch your perfect running path. Click and drag to create waypoints and customize your route.",
                step: "01",
              },
              {
                icon: Download,
                title: "Export Run File",
                description:
                  "Download your route as a Run file compatible with all major running apps and GPS devices. Your route is ready to use instantly.",
                step: "02",
              },
              {
                icon: Share2,
                title: "Sync with Strava",
                description:
                  "Upload your Run file to Strava here: https://www.strava.com/upload/select or any other fitness platform. Share your custom routes with the running community.",
                step: "03",
              },
            ].map((item, index) => (
              <div key={index} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                <div className="relative bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-cyan-400/20 group-hover:border-cyan-400/40 rounded-2xl p-8 transition-all duration-300">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="text-6xl font-mono font-extrabold bg-gradient-to-r from-cyan-400/30 to-purple-500/30 bg-clip-text text-transparent">
                      {item.step}
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 font-mono">
                    {item.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-16">
            <div className="relative inline-block">
              <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-lg blur opacity-40 animate-pulse" />
              <Link href="/create">
                <Button className="relative bg-gradient-to-r from-slate-800 to-slate-700 text-cyan-400 border border-cyan-400 hover:border-cyan-300 hover:text-white px-8 py-4 rounded-lg font-mono uppercase tracking-wider text-lg hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all duration-300">
                  Try It Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
