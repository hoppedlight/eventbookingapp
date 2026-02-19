import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Calendar, MapPin, Ticket, ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function BookedEvents() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      if (!token) {
        navigate(createPageUrl("Login"));
        return [];
      }

      const res = await fetch("http://127.0.0.1:8000/api/bookings/get/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch bookings");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="py-20 text-center text-white/60">
        Loading booked events...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <Link to={createPageUrl("Profile")}>
        <Button variant="ghost" className="text-white mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Profile
        </Button>
      </Link>

      <h1 className="text-4xl font-bold text-white mb-10">My Booked Events</h1>

      {bookings.length === 0 && (
        <div className="text-center py-20 text-white/60">
          You have not booked any events yet.
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {bookings.map((booking) => (
          <Card
            key={booking.id}
            className="bg-[#472426] border-none hover:scale-[1.02] transition"
          >
            <CardContent className="p-6 space-y-4">
              <Badge className="bg-[#ea2a33] text-white border-none">
                Booked
              </Badge>

              <h2 className="text-xl font-bold text-white">
                {booking.event_title}
              </h2>

              <div className="space-y-2 text-white/80 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(booking.event_date), "PPP")}</span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{booking.event_location}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{booking.num_tickets} tickets</span>
                </div>

                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4" />
                  <span>
                    {booking.total_price === 0
                      ? "Free"
                      : `$${booking.total_price}`}
                  </span>
                </div>
              </div>

              <Link
                to={`${createPageUrl("EventDetails")}?id=${booking.event_id}`}
              >
                <Button className="w-full bg-[#ea2a33] hover:bg-[#ea2a33]/90">
                  View Event
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
