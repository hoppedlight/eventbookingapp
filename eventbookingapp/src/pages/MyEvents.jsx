import React, { useState, useEffect } from "react";
import { api } from "@/api/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Calendar, MapPin, Users, Edit, Trash2, PlusCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

export default function MyEvents() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

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

  const { data: myEvents, isLoading } = useQuery({
    queryKey: ['myEvents', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await api.entities.Event.filter(
        { created_by: user.email },
        "-created_date"
      );
    },
    enabled: !!user,
    initialData: [],
  });

  const deleteEventMutation = useMutation({
    mutationFn: (eventId) => api.entities.Event.delete(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries(['myEvents']);
      alert("Event deleted successfully!");
    },
  });

  const handleDelete = (eventId, eventTitle) => {
    if (window.confirm(`Are you sure you want to delete "${eventTitle}"?`)) {
      deleteEventMutation.mutate(eventId);
    }
  };

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white mb-3">My Events</h1>
          <p className="text-white/60 text-lg">
            {isLoading ? "Loading..." : `Manage your ${myEvents.length} events`}
          </p>
        </div>
        <Link to={createPageUrl("CreateEvent")}>
          <Button className="bg-[#ea2a33] hover:bg-[#ea2a33]/90 text-white accent-glow">
            <PlusCircle className="w-5 h-5 mr-2" />
            Create New Event
          </Button>
        </Link>
      </div>

      {/* Events List */}
      {isLoading ? (
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-[#472426] rounded-2xl h-48 animate-pulse" />
          ))}
        </div>
      ) : myEvents.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 mx-auto mb-6 bg-[#472426] rounded-full flex items-center justify-center">
            <Calendar className="w-12 h-12 text-white/40" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">No Events Yet</h3>
          <p className="text-white/60 text-lg mb-8 max-w-md mx-auto">
            Create your first event and start connecting with your audience
          </p>
          <Link to={createPageUrl("CreateEvent")}>
            <Button className="bg-[#ea2a33] hover:bg-[#ea2a33]/90 text-white accent-glow">
              <PlusCircle className="w-5 h-5 mr-2" />
              Create Your First Event
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {myEvents.map((event) => (
            <Card key={event.id} className="bg-[#472426] border-none overflow-hidden group hover:shadow-xl hover:shadow-[#ea2a33]/10 smooth-transition">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Image */}
                  <div className="relative md:w-80 h-48 md:h-auto overflow-hidden flex-shrink-0">
                    <img
                      src={event.image_url || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800"}
                      alt={event.title}
                      className="w-full h-full object-cover smooth-transition group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#472426]/50" />
                    {event.featured && (
                      <Badge className="absolute top-4 left-4 bg-[#ea2a33] border-none">
                        Featured
                      </Badge>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-[#ea2a33] smooth-transition">
                            {event.title}
                          </h3>
                          <Badge className="bg-[#c89295]/20 text-[#c89295] border-none">
                            {event.category}
                          </Badge>
                        </div>
                        <Badge
                          variant="outline"
                          className={`${
                            event.status === "Published"
                              ? "border-green-500 text-green-500"
                              : event.status === "Draft"
                              ? "border-yellow-500 text-yellow-500"
                              : "border-red-500 text-red-500"
                          }`}
                        >
                          {event.status}
                        </Badge>
                      </div>

                      <p className="text-white/70 line-clamp-2 mb-4">
                        {event.description}
                      </p>

                      <div className="grid sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-white/70">
                          <Calendar className="w-4 h-4 text-[#ea2a33]" />
                          <span>{format(new Date(event.date), "MMM d, yyyy")} at {event.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/70">
                          <MapPin className="w-4 h-4 text-[#ea2a33]" />
                          <span>{event.location}, {event.city}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/70">
                          <Users className="w-4 h-4 text-[#ea2a33]" />
                          <span>{event.attendees_count || 0} attending</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/70">
                          <span className="text-[#ea2a33] font-bold text-lg">
                            {event.ticket_type === "Free" ? "Free" : `$${event.price}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
                      <Link to={createPageUrl("EventDetails") + `?id=${event.id}`} className="flex-1">
                        <Button
                          variant="outline"
                          className="w-full border-white/20 text-white hover:bg-[#221112] hover:border-[#ea2a33]"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="border-white/20 text-white hover:bg-[#221112] hover:border-[#ea2a33]"
                        onClick={() => alert("Edit functionality - coming soon!")}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        className="border-white/20 text-red-400 hover:bg-red-500/10 hover:border-red-500"
                        onClick={() => handleDelete(event.id, event.title)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}