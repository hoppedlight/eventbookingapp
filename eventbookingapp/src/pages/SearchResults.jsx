import React, { useState, useEffect } from "react";
import { createPageUrl } from "../utils";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EventCard from "../components/EventCard";

export default function SearchResults() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialQuery = urlParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState("date");

  const { data: events, isLoading } = useQuery({
    queryKey: ['searchEvents', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];

      const allEvents = await api.entities.Event.filter(
        { status: "Published" }
      );

      // Search in title, description, city, location, tags
      const filtered = allEvents.filter(event => {
        const query = searchQuery.toLowerCase();
        return (
          event.title?.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query) ||
          event.city?.toLowerCase().includes(query) ||
          event.location?.toLowerCase().includes(query) ||
          event.category?.toLowerCase().includes(query) ||
          event.tags?.some(tag => tag.toLowerCase().includes(query))
        );
      });

      return filtered;
    },
    initialData: [],
  });

  const sortedEvents = [...events].sort((a, b) => {
    switch (sortBy) {
      case "date":
        return new Date(a.date) - new Date(b.date);
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "popularity":
        return (b.attendees_count || 0) - (a.attendees_count || 0);
      default:
        return 0;
    }
  });

  const handleSearch = (e) => {
    e.preventDefault();
    window.location.href = window.location.pathname + `?q=${encodeURIComponent(searchQuery)}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Search Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-6">Search Events</h1>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, category, location..."
              className="pl-12 pr-4 py-6 bg-[#472426] border-none text-white text-lg placeholder:text-white/50 focus-visible:ring-[#ea2a33]"
            />
            <Button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#ea2a33] hover:bg-[#ea2a33]/90 text-white"
            >
              Search
            </Button>
          </div>
        </form>

        {/* Results Info & Sort */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            {initialQuery && (
              <p className="text-white/60 text-lg">
                {isLoading ? (
                  "Searching..."
                ) : (
                  <>
                    Found <span className="text-[#ea2a33] font-semibold">{sortedEvents.length}</span> results for{" "}
                    <span className="text-white font-medium">"{initialQuery}"</span>
                  </>
                )}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <SlidersHorizontal className="w-5 h-5 text-white/60" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48 bg-[#472426] border-none text-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-[#472426] border-white/10 text-white">
                <SelectItem value="date">Date (Upcoming)</SelectItem>
                <SelectItem value="price-low">Price (Low to High)</SelectItem>
                <SelectItem value="price-high">Price (High to Low)</SelectItem>
                <SelectItem value="popularity">Popularity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results */}
      {!initialQuery ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 mx-auto mb-6 bg-[#472426] rounded-full flex items-center justify-center">
            <Search className="w-12 h-12 text-white/40" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Start Your Search</h3>
          <p className="text-white/60 text-lg max-w-md mx-auto">
            Enter keywords to find events by title, category, location, and more
          </p>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-[#472426] rounded-2xl h-96 animate-pulse" />
          ))}
        </div>
      ) : sortedEvents.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 mx-auto mb-6 bg-[#472426] rounded-full flex items-center justify-center">
            <Search className="w-12 h-12 text-white/40" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">No Results Found</h3>
          <p className="text-white/60 text-lg mb-8 max-w-md mx-auto">
            We couldn't find any events matching "<span className="text-white font-medium">{initialQuery}</span>". Try different keywords or browse all events.
          </p>
          <a href="/">
            <Button className="bg-[#ea2a33] hover:bg-[#ea2a33]/90 text-white">
              Browse All Events
            </Button>
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}