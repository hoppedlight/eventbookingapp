import React, { useState, useEffect } from "react";
import { api } from "@/api/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import {
  Calendar,
  MapPin,
  Clock,
  User,
  Mail,
  Phone,
  Ticket,
  Users,
  Heart,
  Share2,
  ArrowLeft
} from "lucide-react";
import { Event } from "@/api/entities/Event";
import { Booking } from "@/api/entities/Booking";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import EventCard from "../components/EventCard";
import { format } from "date-fns";

export default function EventDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get("id");
  const [user, setUser] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [numTickets, setNumTickets] = useState(1);
  const [isBooking, setIsBooking] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await api.auth.me();
        setUser(currentUser);
        setIsFavorite(currentUser.favorite_events?.includes(eventId) || false);
      } catch (error) {
        setUser(null);
      }
    };
    fetchUser();
  }, [eventId]);

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const events = await Event.filter({ id: eventId });
      return events[0];
    },
    enabled: !!eventId,
  });
  const { data: relatedEvents } = useQuery({
    queryKey: ['relatedEvents', event?.category],
    queryFn: async () => {
      if (!event) return [];
      const events = await Event.filter(
        { category: event.category, status: "Published" },
        "-created_date",
        4
      );
      return events.filter(e => e.id !== eventId);
    },
    enabled: !!event,
    initialData: [],
  });

  const toggleFavorite = async () => {
    if (!user) {
      api.auth.redirectToLogin(window.location.href);
      return;
    }

    const favoriteEvents = user.favorite_events || [];
    const newFavorites = isFavorite
      ? favoriteEvents.filter(id => id !== eventId)
      : [...favoriteEvents, eventId];

    await api.auth.updateMe({ favorite_events: newFavorites });
    setIsFavorite(!isFavorite);
  };

  const handleBookEvent = async () => {
    if (!user) {
      api.auth.redirectToLogin(window.location.href);
      return;
    }

    setIsBooking(true);
    try {
      await Booking.create({
        event_id: event.id,
        event_title: event.title,
        event_date: event.date,
        event_time: event.time,
        event_location: event.location,
        user_email: user.email,
        user_name: user.full_name,
        num_tickets: numTickets,
        total_price: event.price * numTickets,
        booking_status: "Confirmed"
      });

      // Update attendees count
      await Event.update(event.id, {
        attendees_count: (event.attendees_count || 0) + numTickets
      });

      alert("Booking confirmed! Check your email for details.");
      queryClient.invalidateQueries(['event', eventId]);
    } catch (error) {
        console.log(error)
      alert("Failed to book event. Please try again.");
    }
    setIsBooking(false);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: `Check out this event: ${event.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-96 bg-[#472426] rounded-3xl" />
          <div className="h-40 bg-[#472426] rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Event Not Found</h2>
        <Link to={createPageUrl("Home")}>
          <Button className="bg-[#ea2a33] hover:bg-[#ea2a33]/90">
            Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link to={createPageUrl("Home")}>
        <Button variant="ghost" className="text-white hover:text-[#ea2a33] mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>
      </Link>

      {/* Banner */}
      <div className="relative h-[400px] rounded-3xl overflow-hidden mb-8">
        <img
          src={event.banner_url || event.image_url || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920"}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#221112] via-transparent to-transparent" />

        {/* Action Buttons */}
        <div className="absolute top-6 right-6 flex gap-3">
          <Button
            onClick={toggleFavorite}
            size="icon"
            className="bg-[#221112]/80 backdrop-blur-sm hover:bg-[#ea2a33]"
          >
            <Heart className={`w-5 h-5 ${isFavorite ? "fill-[#ea2a33] text-[#ea2a33]" : ""}`} />
          </Button>
          <Button
            onClick={handleShare}
            size="icon"
            className="bg-[#221112]/80 backdrop-blur-sm hover:bg-[#ea2a33]"
          >
            <Share2 className="w-5 h-5" />
          </Button>
        </div>

        {/* Event Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="flex flex-wrap gap-3 mb-4">
            <Badge className="bg-[#ea2a33] hover:bg-[#ea2a33] text-white border-none px-4 py-1.5">
              {event.category}
            </Badge>
            {event.featured && (
              <Badge className="bg-[#c89295] hover:bg-[#c89295] text-white border-none px-4 py-1.5">
                Featured
              </Badge>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{event.title}</h1>
          <div className="flex flex-wrap gap-6 text-white/90">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>{format(new Date(event.date), "EEEE, MMMM d, yyyy")}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <span>{event.location}, {event.city}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <Card className="bg-[#472426] border-none">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-white mb-4">About This Event</h2>
              <p className="text-white/80 text-lg leading-relaxed whitespace-pre-wrap">
                {event.description || "No description available."}
              </p>

              {event.tags && event.tags.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {event.tags.map((tag, idx) => (
                    <Badge key={idx} variant="outline" className="border-[#c89295] text-[#c89295]">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Event Details */}
          <Card className="bg-[#472426] border-none">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Event Details</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#ea2a33]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-[#ea2a33]" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Time</p>
                    <p className="text-white font-medium">{event.time}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#ea2a33]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Ticket className="w-5 h-5 text-[#ea2a33]" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Ticket Type</p>
                    <p className="text-white font-medium">{event.ticket_type}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#ea2a33]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-[#ea2a33]" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Capacity</p>
                    <p className="text-white font-medium">{event.capacity || "Unlimited"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#ea2a33]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-[#ea2a33]" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Address</p>
                    <p className="text-white font-medium">{event.address || event.location}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Organizer Info */}
          <Card className="bg-[#472426] border-none">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Organizer</h2>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#ea2a33] to-[#c89295] rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-semibold text-white">{event.organizer_name || "Event Organizer"}</p>
                  {event.organizer_email && (
                    <div className="flex items-center gap-2 text-white/70">
                      <Mail className="w-4 h-4" />
                      <a href={`mailto:${event.organizer_email}`} className="hover:text-[#ea2a33]">
                        {event.organizer_email}
                      </a>
                    </div>
                  )}
                  {event.organizer_phone && (
                    <div className="flex items-center gap-2 text-white/70">
                      <Phone className="w-4 h-4" />
                      <a href={`tel:${event.organizer_phone}`} className="hover:text-[#ea2a33]">
                        {event.organizer_phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Sidebar */}
        <div>
          <Card className="bg-[#472426] border-none sticky top-24">
            <CardContent className="p-8 space-y-6">
              <div>
                <p className="text-white/60 text-sm mb-2">Price per ticket</p>
                <p className="text-4xl font-bold text-[#ea2a33]">
                  {event.ticket_type === "Free" ? "Free" : `$${event.price}`}
                </p>
              </div>

              {event.ticket_type !== "Free" && (
                <div className="space-y-2">
                  <Label className="text-white">Number of Tickets</Label>
                  <Input
                    type="number"
                    min="1"
                    max={event.capacity || 10}
                    value={numTickets}
                    onChange={(e) => setNumTickets(parseInt(e.target.value) || 1)}
                    className="bg-[#221112] border-white/10 text-white"
                  />
                  <p className="text-sm text-white/60">
                    Total: ${(event.price * numTickets).toFixed(2)}
                  </p>
                </div>
              )}

              <Button
                onClick={handleBookEvent}
                disabled={isBooking}
                className="w-full bg-[#ea2a33] hover:bg-[#ea2a33]/90 text-white text-lg py-6 accent-glow"
              >
                {isBooking ? "Processing..." : "Book Now"}
              </Button>

              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Attending</span>
                  <span className="text-white font-medium">{event.attendees_count || 0} people</span>
                </div>
                {event.capacity && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Capacity</span>
                    <span className="text-white font-medium">{event.capacity} seats</span>
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
          <h2 className="text-3xl font-bold text-white mb-8">More {event.category} Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedEvents.map((relatedEvent) => (
              <EventCard key={relatedEvent.id} event={relatedEvent} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}