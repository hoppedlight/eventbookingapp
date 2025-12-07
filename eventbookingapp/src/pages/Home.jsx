import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Event } from "@/api/entities/Event"; // Your Event entity
import HeroSection from "../components/HeroSection";
import CategoryCarousel from "../components/CategoryCarousel";
import FilterSidebar from "../components/FilterSidebar";
import EventCard from "../components/EventCard";

export default function Home() {
  const [filters, setFilters] = useState({
    category: "All",
    date: null,
    maxPrice: 500,
    city: ""
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Get category from URL if present
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get("category");
    if (categoryParam) {
      setFilters(prev => ({ ...prev, category: categoryParam }));
      setAppliedFilters(prev => ({ ...prev, category: categoryParam }));
    }
  }, []);

  // Fetch events using the entity
  const { data: events, isLoading, refetch } = useQuery({
    queryKey: ["events", appliedFilters],
    queryFn: async () => {
      let allEvents = await Event.filter({ status: "Published" });


      // Frontend filters
      if (appliedFilters.category !== "All") {
        allEvents = allEvents.filter(
          e => e.category === appliedFilters.category
        );
      }

      if (appliedFilters.date) {
        const dateStr = appliedFilters.date.toISOString().split("T")[0];
        allEvents = allEvents.filter(e => e.date === dateStr);
      }

      if (appliedFilters.maxPrice < 500) {
        allEvents = allEvents.filter(e => e.price <= appliedFilters.maxPrice);
      }

      if (appliedFilters.city) {
        allEvents = allEvents.filter(e =>
          e.city?.toLowerCase().includes(appliedFilters.city.toLowerCase())
        );
      }

      return allEvents;
    },
    initialData: [],
  });


  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    setShowMobileFilters(false);
  };

  const handleClearFilters = () => {
    const defaultFilters = {
      category: "All",
      date: null,
      maxPrice: 500,
      city: ""
    };
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setShowMobileFilters(false);
  };

  const handleSelectCategory = (category) => {
    setFilters(prev => ({ ...prev, category }));
    setAppliedFilters(prev => ({ ...prev, category }));
  };

  return (
    <div>
      <HeroSection />
      <CategoryCarousel onSelectCategory={handleSelectCategory} />

      <div id="events" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {appliedFilters.category === "All" ? "All Events" : `${appliedFilters.category} Events`}
            </h2>
            <p className="text-white/60">
              {isLoading ? "Loading..." : `${events.length} events found`}
            </p>
          </div>

          <Button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="lg:hidden bg-[#472426] hover:bg-[#ea2a33] text-white"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <FilterSidebar
              filters={filters}
              setFilters={setFilters}
              onApply={handleApplyFilters}
              onClear={handleClearFilters}
            />
          </div>

          {/* Mobile Sidebar */}
          {showMobileFilters && (
            <div className="lg:hidden fixed inset-0 bg-[#221112]/95 backdrop-blur-sm z-50 overflow-y-auto p-4">
              <div className="max-w-md mx-auto">
                <FilterSidebar
                  filters={filters}
                  setFilters={setFilters}
                  onApply={handleApplyFilters}
                  onClear={handleClearFilters}
                  onClose={() => setShowMobileFilters(false)}
                />
              </div>
            </div>
          )}

          {/* Events Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-[#472426] rounded-2xl h-96 animate-pulse" />
                ))}
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-20">
                <h3 className="text-2xl font-bold text-white mb-2">No Events Found</h3>
                <p className="text-white/60 mb-6">Try adjusting your filters to see more results</p>
                <Button onClick={handleClearFilters} className="bg-[#ea2a33] hover:bg-[#ea2a33]/90 text-white">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {events.map((event) => (
                  <EventCard key={event._id} event={event} onFavoriteChange={refetch} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
