import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#221112] via-[#472426] to-[#221112] py-20 md:py-32">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#ea2a33] rounded-full opacity-10 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#c89295] rounded-full opacity-10 blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#472426]/50 backdrop-blur-sm rounded-full border border-[#ea2a33]/20">
            <Sparkles className="w-4 h-4 text-[#ea2a33]" />
            <span className="text-sm text-white/90">Your next adventure awaits</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-white via-[#c89295] to-white bg-clip-text text-transparent">
              Discover Unforgettable
            </span>
            <br />
            <span className="bg-gradient-to-r from-[#ea2a33] to-[#c89295] bg-clip-text text-transparent">
              Events Near You
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            Connect with experiences that inspire. From concerts to conferences, find events that match your passion.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Button
              asChild
              size="lg"
              className="bg-[#ea2a33] hover:bg-[#ea2a33]/90 text-white text-lg px-8 py-6 accent-glow group"
            >
              <a href="#events" className="flex items-center gap-2">
                Explore Events
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 smooth-transition" />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-2 border-[#c89295] text-white hover:bg-[#472426] text-lg px-8 py-6"
            >
              <Link to={createPageUrl("CreateEvent")}>
                Create Event
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-12">
            <div className="space-y-1">
              <p className="text-3xl md:text-4xl font-bold text-white">500+</p>
              <p className="text-sm text-white/60">Active Events</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl md:text-4xl font-bold text-white">50K+</p>
              <p className="text-sm text-white/60">Happy Attendees</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl md:text-4xl font-bold text-white">100+</p>
              <p className="text-sm text-white/60">Cities</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}