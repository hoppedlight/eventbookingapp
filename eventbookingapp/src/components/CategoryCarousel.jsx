import React from "react";
import { Music, Trophy, Palette, Users, UtensilsCrossed, Briefcase, Cpu, HeartPulse, GraduationCap } from "lucide-react";

const categories = [
  { name: "Music", icon: Music, color: "from-purple-500 to-pink-500" },
  { name: "Sports", icon: Trophy, color: "from-green-500 to-emerald-500" },
  { name: "Arts", icon: Palette, color: "from-orange-500 to-red-500" },
  { name: "Family", icon: Users, color: "from-blue-500 to-cyan-500" },
  { name: "Food & Drink", icon: UtensilsCrossed, color: "from-yellow-500 to-orange-500" },
  { name: "Business", icon: Briefcase, color: "from-gray-500 to-slate-500" },
  { name: "Technology", icon: Cpu, color: "from-indigo-500 to-purple-500" },
  { name: "Health", icon: HeartPulse, color: "from-red-500 to-pink-500" },
  { name: "Education", icon: GraduationCap, color: "from-teal-500 to-green-500" },
];

export default function CategoryCarousel({ onSelectCategory }) {
  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Browse by Category
          </h2>
          <p className="text-white/60 text-lg">
            Find events that match your interests
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => onSelectCategory(category.name)}
              className="group relative overflow-hidden bg-[#472426] rounded-2xl p-6 smooth-transition hover:scale-105 hover:shadow-lg hover:shadow-[#ea2a33]/20"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 smooth-transition`}></div>

              <div className="relative flex flex-col items-center gap-3">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center smooth-transition group-hover:scale-110`}>
                  <category.icon className="w-7 h-7 text-white" />
                </div>
                <span className="text-white font-semibold text-sm group-hover:text-[#ea2a33] smooth-transition">
                  {category.name}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}