import React, { useState, useEffect } from "react";
import { api } from "@/api/client";
import { useQuery } from "@tanstack/react-query";
import { Heart, Sparkles } from "lucide-react";
import EventCard from "../components/EventCard";

export default function Favorites() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await api.auth.me();
        setUser(currentUser);
      } catch (error) {
        api.auth.redirectToLogin(window.location.href);
      }
    };
    fetchUser();
  }, []);

  const { data: favoriteEvents, isLoading, refetch } = useQuery({
    queryKey: ['favoriteEvents', user?.id],
    queryFn: async () => {
      if (!user || !user.favorite_events || user.favorite_events.length === 0) {
        return [];
      }

      const allEvents = await api.entities.Event.list();
      return allEvents.filter(event => user.favorite_events.includes(event.id));
    },
    enabled: !!user,
    initialData: [],
  });

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#472426]/50 backdrop-blur-sm rounded-full border border-[#ea2a33]/20 mb-6">
          <Sparkles className="w-4 h-4 text-[#ea2a33]" />
          <span className="text-sm text-white/90">Your saved events</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <Heart className="w-10 h-10 text-[#ea2a33] fill-[#ea2a33]" />
          My Favorites
        </h1>
        <p className="text-xl text-white/60">
          {isLoading ? "Loading..." : `${favoriteEvents.length} saved events`}
        </p>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-[#472426] rounded-2xl h-96 animate-pulse" />
          ))}
        </div>
      ) : favoriteEvents.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 mx-auto mb-6 bg-[#472426] rounded-full flex items-center justify-center">
            <Heart className="w-12 h-12 text-white/40" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">No Favorites Yet</h3>
          <p className="text-white/60 text-lg mb-8 max-w-md mx-auto">
            Start exploring events and save your favorites by clicking the heart icon
          </p>
          <a href="/" className="inline-block">
            <button className="bg-[#ea2a33] hover:bg-[#ea2a33]/90 text-white px-8 py-3 rounded-lg font-semibold smooth-transition accent-glow">
              Discover Events
            </button>
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteEvents.map((event) => (
            <EventCard key={event.id} event={event} onFavoriteChange={refetch} />
          ))}
        </div>
      )}
    </div>
  );
}