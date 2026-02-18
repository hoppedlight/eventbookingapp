import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, MapPin, Heart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createPageUrl } from "../utils";
import { format } from "date-fns";

export default function EventCard({ event, onFavoriteChange }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchUser = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/me/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Unauthorized");

        const data = await res.json();
        setUser(data);

        setIsFavorite(data.favorite_events?.includes(event._id) || false);
      } catch {
        setUser(null);
      }
    };

    fetchUser();
  }, [event._id]);

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    setIsTogglingFavorite(true);

    try {
      const currentFavorites = user?.favorite_events || [];
      const updatedFavorites = isFavorite
        ? currentFavorites.filter((id) => id !== event._id)
        : [...currentFavorites, event._id];

      const res = await fetch("http://127.0.0.1:8000/api/me/update/", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ favorite_events: updatedFavorites }),
      });

      if (!res.ok) throw new Error("Failed to update favorites");

      setIsFavorite(!isFavorite);

      if (onFavoriteChange) onFavoriteChange();
    } catch (err) {
      console.error("Favorite update error:", err);
    }

    setIsTogglingFavorite(false);
  };

  return (
    <Link to={createPageUrl("EventDetails") + `?id=${event.id}`}>
      <div className="group relative bg-[#472426] rounded-2xl overflow-hidden smooth-transition hover:scale-[1.02] hover:shadow-xl hover:shadow-[#ea2a33]/10">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={
              event.image_url ||
              "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800"
            }
            alt={event.title}
            className="w-full h-full object-cover smooth-transition group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#221112] via-transparent to-transparent opacity-60" />

          {/* Favorite Button */}
          {/* <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 bg-[#221112]/80 backdrop-blur-sm hover:bg-[#ea2a33] smooth-transition"
            onClick={toggleFavorite}
            disabled={isTogglingFavorite}
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorite ? "fill-[#ea2a33] text-[#ea2a33]" : "text-white"
              }`}
            />
          </Button> */}

          {/* Featured Badge */}
          {event.featured && (
            <Badge className="absolute top-3 left-3 bg-[#ea2a33] border-none">
              Featured
            </Badge>
          )}

          {/* Category Badge */}
          <Badge className="absolute bottom-3 left-3 bg-[#472426]/90 border-none">
            {event.category}
          </Badge>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          {/* Date & Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-[#c89295]">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(event.date), "MMM d, yyyy")}</span>
            </div>

            <div className="text-lg font-bold text-[#ea2a33]">
              {event.ticket_type === "Free" ? "Free" : `$${event.price}`}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-white line-clamp-2 group-hover:text-[#ea2a33] smooth-transition">
            {event.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-white/70">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="line-clamp-1">
              {event.location}, {event.city}
            </span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Users className="w-4 h-4" />
              <span>{event.attendees_count || 0} attending</span>
            </div>

            <span className="text-sm text-[#c89295] font-medium group-hover:text-[#ea2a33] smooth-transition">
              View Details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
