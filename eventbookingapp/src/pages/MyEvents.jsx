import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import {
  Calendar,
  MapPin,
  Users,
  Edit,
  Trash2,
  PlusCircle,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

export default function MyEvents() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetch(`http://127.0.0.1:8000/api/me/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("token");
        navigate(createPageUrl("Login"));
      });
  }, [token, navigate]);

  const { data: myEvents = [], isLoading } = useQuery({
    queryKey: ["myEvents"],
    enabled: !!user,
    queryFn: async () => {
      const res = await fetch(
        `http://127.0.0.1:8000/api/events/?created_by=me`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch events");
      return res.json();
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId) => {
      const res = await fetch(
        `http://127.0.0.1:8000/api/events/delete/${eventId}/`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["myEvents"]);
    },
  });

  const handleDelete = (id, title) => {
    if (window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      deleteEventMutation.mutate(id);
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto py-20 text-center text-white/60">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">My Events</h1>
          <p className="text-white/60">
            {isLoading ? "Loading..." : `You created ${myEvents.length} events`}
          </p>
        </div>

        <Link to={createPageUrl("CreateEvent")}>
          <Button className="bg-[#ea2a33] hover:bg-[#ea2a33]/90">
            <PlusCircle className="w-5 h-5 mr-2" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* Empty State */}
      {!isLoading && myEvents.length === 0 && (
        <div className="text-center py-20">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-white/40" />
          <h3 className="text-2xl font-bold text-white mb-2">No events yet</h3>
          <p className="text-white/60 mb-6">
            Create your first event to get started
          </p>
          <Link to={createPageUrl("CreateEvent")}>
            <Button className="bg-[#ea2a33]">
              <PlusCircle className="w-5 h-5 mr-2" />
              Create Event
            </Button>
          </Link>
        </div>
      )}

      {/* Events */}
      <div className="grid gap-6">
        {myEvents.map((event) => (
          <Card key={event.id} className="bg-[#472426] border-none">
            <CardContent className="p-6 flex flex-col md:flex-row gap-6">
              {/* Image */}
              <img
                src={event.image_url}
                alt={event.title}
                className="w-full md:w-64 h-40 object-cover rounded-xl"
              />

              {/* Info */}
              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  <h3 className="text-2xl font-bold text-white">
                    {event.title}
                  </h3>
                  <Badge>{event.status}</Badge>
                </div>

                <p className="text-white/70 mb-4 line-clamp-2">
                  {event.description}
                </p>

                <div className="grid sm:grid-cols-2 gap-3 text-sm text-white/70">
                  <div className="flex gap-2">
                    <Calendar className="w-4 h-4 text-[#ea2a33]" />
                    {format(new Date(event.date), "MMM d, yyyy")} {event.time}
                  </div>
                  <div className="flex gap-2">
                    <MapPin className="w-4 h-4 text-[#ea2a33]" />
                    {event.location}, {event.city}
                  </div>
                  <div className="flex gap-2">
                    <Users className="w-4 h-4 text-[#ea2a33]" />
                    {event.attendees_count || 0} attending
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                  <Link to={`${createPageUrl("EventDetails")}?id=${event.id}`}>
                    <Button variant="outline">
                      <Eye className="w-4 h-4 mr-2" /> View
                    </Button>
                  </Link>
                  {/* <Button variant="outline" disabled>
                    <Edit className="w-4 h-4" />
                  </Button> */}
                  <Button
                    variant="outline"
                    className="text-red-400 border-red-400"
                    onClick={() => handleDelete(event.id, event.title)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
