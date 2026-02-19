import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Calendar, MapPin, Share2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import EventCard from "../components/EventCard";
import { format } from "date-fns";
import HallMatrix from "../components/HallMatrix";

export default function EventDetails() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const eventId = urlParams.get("id");
  const [user, setUser] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [numTickets, setNumTickets] = useState(1);
  const [isBooking, setIsBooking] = useState(false);

  const [reservedSeats, setReservedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!eventId || !token) return;

    const fetchReservedSeats = async () => {
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/api/events/${eventId}/reserved-seats/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log(res);
        const data = await res.json();
        setReservedSeats(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchReservedSeats();
  }, [eventId, token]);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) return;
      try {
        const res = await fetch("http://127.0.0.1:8000/api/me/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setUser(data);
        setIsFavorite(data.favorite_events?.includes(eventId) || false);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, [token, eventId]);

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      const res = await fetch(
        `http://127.0.0.1:8000/api/events/?id=${eventId}`
      );
      const data = await res.json();
      return data[0] || null;
    },
    enabled: !!eventId,
  });

  const { data: relatedEvents = [] } = useQuery({
    queryKey: ["relatedEvents", event?.category],
    queryFn: async () => {
      if (!event) return [];
      const res = await fetch(
        `http://127.0.0.1:8000/api/events/?status=Published&category=${event.category}`
      );
      const data = await res.json();
      return data.filter((e) => e._id !== event._id).slice(0, 4);
    },
    enabled: !!event,
  });

  const toggleFavorite = async () => {
    if (!user) {
      navigate(createPageUrl("Login"));
      return;
    }
    try {
      const newFavorites = isFavorite
        ? user.favorite_events.filter((id) => id !== event._id)
        : [...(user.favorite_events || []), event._id];

      await fetch("http://127.0.0.1:8000/api/me/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ favorite_events: newFavorites }),
      });

      setIsFavorite(!isFavorite);
      setUser((prev) => ({ ...prev, favorite_events: newFavorites }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookEvent = async () => {
    if (!user) {
      navigate(createPageUrl("Login"));
      return;
    }
    setIsBooking(true);
    try {
      await fetch("http://127.0.0.1:8000/api/bookings/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          event_id: event.id,
          seats: selectedSeats,
          user_email: user.email,
          user_name: user.full_name,
          event_title: event.title,
          event_date: event.date,
          event_time: event.time,
          event_location: `${event.location}, ${event.city}`,
          num_tickets: numTickets,
          total_price:
            event.ticket_type === "Free"
              ? 0
              : selectedSeats.length * event.price,
        }),
      });

      alert("Booking confirmed!");
      queryClient.invalidateQueries(["event", eventId]);
    } catch (err) {
      console.error(err);
      alert("Failed to book event.");
    }
    setIsBooking(false);
  };

  const handleShare = () => {
    if (!event) return;
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: `Check out this event: ${event.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied!");
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!event)
    return (
      <div className="text-center py-20">
        <h2 className="text-3xl text-white mb-4">Event Not Found</h2>
        <Link to={createPageUrl("Home")}>
          <Button>Back to Home</Button>
        </Link>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to={createPageUrl("Home")}>
        <Button variant="ghost" className="text-white mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Events
        </Button>
      </Link>

      <div className="relative h-[400px] rounded-3xl overflow-hidden mb-8">
        <img
          src={
            event.banner_url ||
            event.image_url ||
            "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920"
          }
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#221112] via-transparent to-transparent" />
        <div className="absolute top-6 right-6 flex gap-3">
          {/* <Button
            onClick={toggleFavorite}
            size="icon"
            className="bg-[#221112]/80 backdrop-blur-sm hover:bg-[#ea2a33]"
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorite ? "fill-[#ea2a33] text-[#ea2a33]" : ""
              }`}
            />
          </Button> */}
          {/* <Button
            onClick={handleShare}
            size="icon"
            className="bg-[#221112]/80 backdrop-blur-sm hover:bg-[#ea2a33]"
          >
            <Share2 className="w-5 h-5" />
          </Button> */}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="flex flex-wrap gap-3 mb-4">
            <Badge className="bg-[#ea2a33] hover:bg-[#ea2a33] text-white border-none px-4 py-1.5">
              {event.category}
            </Badge>
            {event.featured && (
              <Badge className="bg-[#c89295] text-white border-none px-4 py-1.5">
                Featured
              </Badge>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {event.title}
          </h1>
          <div className="flex flex-wrap gap-6 text-white/90">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>{format(new Date(event.date), "EEEE, MMMM d, yyyy")}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <span>
                {event.location}, {event.city}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Description & Details */}
          <Card className="bg-[#472426] border-none">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                About This Event
              </h2>
              <p className="text-white/80">
                {event.description || "No description available."}
              </p>
              {event.tags?.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {event.tags.map((tag, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="border-[#c89295] text-[#c89295]"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
              <HallMatrix
                reservedSeats={reservedSeats}
                selectedSeats={selectedSeats}
                setSelectedSeats={setSelectedSeats}
              />
            </CardContent>
          </Card>
        </div>

        {/* Booking Sidebar */}
        <div>
          <Card className="bg-[#472426] border-none sticky top-24">
            <CardContent className="p-8 space-y-6">
              <p className="text-white/60">Price per ticket</p>
              <p className="text-4xl font-bold text-[#ea2a33]">
                {event.ticket_type === "Free" ? "Free" : `$${event.price}`}
              </p>
              {event.ticket_type !== "Free" && (
                <>
                  <p className="text-sm text-white/60">
                    Total: ${(event.price * selectedSeats.length).toFixed(2)}
                  </p>
                </>
              )}
              <Button
                onClick={handleBookEvent}
                disabled={isBooking}
                className="w-full bg-[#ea2a33] hover:bg-[#ea2a33]/90 text-white text-lg py-6 accent-glow"
              >
                {isBooking ? "Processing..." : "Book Now"}
              </Button>
              <div className="pt-4 border-t border-white/10">
                <div className="flex justify-between text-sm text-white/60">
                  <span>Attending</span>
                  <span className="text-white font-medium">
                    {event.attendees_count || 0} people
                  </span>
                </div>
                {event.capacity && (
                  <div className="flex justify-between text-sm text-white/60">
                    <span>Capacity</span>
                    <span className="text-white font-medium">
                      {event.capacity}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Related Events */}
      {relatedEvents.length > 0 && (
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-white mb-8">
            More {event.category} Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedEvents.map((relatedEvent) => (
              <EventCard key={relatedEvent._id} event={relatedEvent} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
