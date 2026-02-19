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
  const [allEvents, setAllEvents] = useState([]);

  const { isLoading, refetch } = useQuery({
    queryKey: ["searchEvents", searchQuery],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:8000/api/events/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch events");
      const data = await res.json();
      setAllEvents(data);
      return data;
    },
    enabled: false,
  });

  useEffect(() => {
    if (initialQuery) refetch();
  }, [initialQuery, refetch]);

  const filteredEvents = allEvents.filter((event) => {
    const q = searchQuery.toLowerCase();
    return (
      event.title?.toLowerCase().includes(q) ||
      event.description?.toLowerCase().includes(q) ||
      event.city?.toLowerCase().includes(q) ||
      event.location?.toLowerCase().includes(q) ||
      event.category?.toLowerCase().includes(q) ||
      (event.tags || []).some((tag) => tag.toLowerCase().includes(q))
    );
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case "date":
        return new Date(a.date) - new Date(b.date);
      case "price-low":
        return (a.price || 0) - (b.price || 0);
      case "price-high":
        return (b.price || 0) - (a.price || 0);
      case "popularity":
        return (b.attendees_count || 0) - (a.attendees_count || 0);
      default:
        return 0;
    }
  });

  const handleSearch = (e) => {
    e.preventDefault();
    window.history.replaceState(
      null,
      "",
      `?q=${encodeURIComponent(searchQuery)}`
    );
    refetch();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Search Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-6">Search Events</h1>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6 relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, category, location..."
            className="pl-12 pr-24 py-6 bg-[#472426] border-none text-white text-lg placeholder:text-white/50 focus-visible:ring-[#ea2a33]"
          />
          <Button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#ea2a33] hover:bg-[#ea2a33]/90 text-white"
          >
            Search
          </Button>
        </form>

        {/* Results Info & Sort */}
        {searchQuery && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <p className="text-white/60 text-lg">
              {isLoading
                ? "Searching..."
                : `Found ${sortedEvents.length} results for "${searchQuery}"`}
            </p>

            <div className="flex items-center gap-3">
              <SlidersHorizontal className="w-5 h-5 text-white/60" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 bg-[#472426] border-none text-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-[#472426] border-white/10 text-white">
                  <SelectItem value="date">Date (Upcoming)</SelectItem>
                  <SelectItem value="price-low">Price (Low to High)</SelectItem>
                  <SelectItem value="price-high">
                    Price (High to Low)
                  </SelectItem>
                  <SelectItem value="popularity">Popularity</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-[#472426] rounded-2xl h-96 animate-pulse"
            />
          ))}
        </div>
      ) : sortedEvents.length === 0 ? (
        <div className="text-center py-20">
          <h3 className="text-2xl font-bold text-white mb-3">
            No Results Found
          </h3>
          <p className="text-white/60 text-lg mb-8">
            Try different keywords or browse all events.
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
