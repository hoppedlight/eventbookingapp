import React, { useState, useEffect } from "react";
import { api } from "@/api/client";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Upload, Calendar, MapPin, DollarSign, Image as ImageIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categories = [
  "Music", "Sports", "Arts", "Family", "Food & Drink",
  "Business", "Technology", "Health", "Education", "Other"
];

export default function CreateEvent() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    category: "Music",
    subcategory: "",
    date: "",
    time: "",
    location: "",
    city: "",
    address: "",
    price: 0,
    ticket_type: "Paid",
    capacity: "",
    organizer_name: "",
    organizer_email: "",
    organizer_phone: "",
    image_url: "",
    banner_url: "",
    tags: "",
    status: "Published",
    featured: false,
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await api.auth.me();
        setUser(currentUser);
        setEventData(prev => ({
          ...prev,
          organizer_name: currentUser.full_name,
          organizer_email: currentUser.email,
        }));
      } catch (error) {
        api.auth.redirectToLogin(window.location.href);
      }
    };
    fetchUser();
  }, []);

  const createEventMutation = useMutation({
    mutationFn: (data) => base44.entities.Event.create(data),
    onSuccess: (newEvent) => {
      alert("Event created successfully!");
      navigate(createPageUrl("EventDetails") + `?id=${newEvent.id}`);
    },
    onError: (error) => {
      alert("Failed to create event. Please try again.");
      console.error(error);
    },
  });

  const handleImageUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setEventData(prev => ({ ...prev, [field]: file_url }));
    } catch (error) {
      alert("Failed to upload image");
    }
    setIsUploading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const tagsArray = eventData.tags
      ? eventData.tags.split(",").map(tag => tag.trim()).filter(Boolean)
      : [];

    const finalData = {
      ...eventData,
      price: parseFloat(eventData.price) || 0,
      capacity: eventData.capacity ? parseInt(eventData.capacity) : null,
      tags: tagsArray,
    };

    createEventMutation.mutate(finalData);
  };

  const handleChange = (field, value) => {
    setEventData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-3">Create New Event</h1>
        <p className="text-white/60 text-lg">Fill in the details to publish your event</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card className="bg-[#472426] border-none">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#ea2a33]" />
                    Basic Information
                  </h2>

                  <div>
                    <Label className="text-white">Event Title *</Label>
                    <Input
                      required
                      value={eventData.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      placeholder="Summer Music Festival 2025"
                      className="bg-[#221112] border-white/10 text-white placeholder:text-white/40"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Description *</Label>
                    <Textarea
                      required
                      value={eventData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      placeholder="Tell people what makes your event special..."
                      rows={6}
                      className="bg-[#221112] border-white/10 text-white placeholder:text-white/40"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Category *</Label>
                      <Select
                        value={eventData.category}
                        onValueChange={(value) => handleChange("category", value)}
                      >
                        <SelectTrigger className="bg-[#221112] border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#472426] border-white/10 text-white">
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-white">Subcategory</Label>
                      <Input
                        value={eventData.subcategory}
                        onChange={(e) => handleChange("subcategory", e.target.value)}
                        placeholder="e.g., Rock Concert"
                        className="bg-[#221112] border-white/10 text-white placeholder:text-white/40"
                      />
                    </div>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="space-y-4 pt-6 border-t border-white/10">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#ea2a33]" />
                    Date & Time
                  </h2>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Event Date *</Label>
                      <Input
                        required
                        type="date"
                        value={eventData.date}
                        onChange={(e) => handleChange("date", e.target.value)}
                        className="bg-[#221112] border-white/10 text-white"
                      />
                    </div>

                    <div>
                      <Label className="text-white">Event Time *</Label>
                      <Input
                        required
                        type="time"
                        value={eventData.time}
                        onChange={(e) => handleChange("time", e.target.value)}
                        className="bg-[#221112] border-white/10 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-4 pt-6 border-t border-white/10">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#ea2a33]" />
                    Location
                  </h2>

                  <div>
                    <Label className="text-white">Venue Name *</Label>
                    <Input
                      required
                      value={eventData.location}
                      onChange={(e) => handleChange("location", e.target.value)}
                      placeholder="Madison Square Garden"
                      className="bg-[#221112] border-white/10 text-white placeholder:text-white/40"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">City *</Label>
                      <Input
                        required
                        value={eventData.city}
                        onChange={(e) => handleChange("city", e.target.value)}
                        placeholder="New York"
                        className="bg-[#221112] border-white/10 text-white placeholder:text-white/40"
                      />
                    </div>

                    <div>
                      <Label className="text-white">Full Address</Label>
                      <Input
                        value={eventData.address}
                        onChange={(e) => handleChange("address", e.target.value)}
                        placeholder="123 Main St"
                        className="bg-[#221112] border-white/10 text-white placeholder:text-white/40"
                      />
                    </div>
                  </div>
                </div>

                {/* Tickets */}
                <div className="space-y-4 pt-6 border-t border-white/10">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-[#ea2a33]" />
                    Tickets
                  </h2>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-white">Ticket Type *</Label>
                      <Select
                        value={eventData.ticket_type}
                        onValueChange={(value) => handleChange("ticket_type", value)}
                      >
                        <SelectTrigger className="bg-[#221112] border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#472426] border-white/10 text-white">
                          <SelectItem value="Free">Free</SelectItem>
                          <SelectItem value="Paid">Paid</SelectItem>
                          <SelectItem value="Donation">Donation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-white">Price *</Label>
                      <Input
                        required
                        type="number"
                        min="0"
                        step="0.01"
                        value={eventData.price}
                        onChange={(e) => handleChange("price", e.target.value)}
                        className="bg-[#221112] border-white/10 text-white"
                        disabled={eventData.ticket_type === "Free"}
                      />
                    </div>

                    <div>
                      <Label className="text-white">Capacity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={eventData.capacity}
                        onChange={(e) => handleChange("capacity", e.target.value)}
                        placeholder="Unlimited"
                        className="bg-[#221112] border-white/10 text-white placeholder:text-white/40"
                      />
                    </div>
                  </div>
                </div>

                {/* Images */}
                <div className="space-y-4 pt-6 border-t border-white/10">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-[#ea2a33]" />
                    Images
                  </h2>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Event Image</Label>
                      <div className="mt-2">
                        <label className="cursor-pointer">
                          <div className="border-2 border-dashed border-white/20 rounded-lg p-4 hover:border-[#ea2a33] smooth-transition text-center">
                            {eventData.image_url ? (
                              <img src={eventData.image_url} alt="Preview" className="w-full h-32 object-cover rounded-lg mb-2" />
                            ) : (
                              <Upload className="w-8 h-8 mx-auto mb-2 text-white/40" />
                            )}
                            <p className="text-sm text-white/60">
                              {isUploading ? "Uploading..." : "Click to upload"}
                            </p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, "image_url")}
                            className="hidden"
                            disabled={isUploading}
                          />
                        </label>
                      </div>
                    </div>

                    <div>
                      <Label className="text-white">Banner Image</Label>
                      <div className="mt-2">
                        <label className="cursor-pointer">
                          <div className="border-2 border-dashed border-white/20 rounded-lg p-4 hover:border-[#ea2a33] smooth-transition text-center">
                            {eventData.banner_url ? (
                              <img src={eventData.banner_url} alt="Preview" className="w-full h-32 object-cover rounded-lg mb-2" />
                            ) : (
                              <Upload className="w-8 h-8 mx-auto mb-2 text-white/40" />
                            )}
                            <p className="text-sm text-white/60">
                              {isUploading ? "Uploading..." : "Click to upload"}
                            </p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, "banner_url")}
                            className="hidden"
                            disabled={isUploading}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional */}
                <div className="space-y-4 pt-6 border-t border-white/10">
                  <div>
                    <Label className="text-white">Tags (comma separated)</Label>
                    <Input
                      value={eventData.tags}
                      onChange={(e) => handleChange("tags", e.target.value)}
                      placeholder="concert, live music, outdoor"
                      className="bg-[#221112] border-white/10 text-white placeholder:text-white/40"
                    />
                  </div>
                </div>

                {/* Submit */}
                <div className="flex gap-4 pt-6">
                  <Button
                    type="submit"
                    disabled={createEventMutation.isPending || isUploading}
                    className="flex-1 bg-[#ea2a33] hover:bg-[#ea2a33]/90 text-white text-lg py-6 accent-glow"
                  >
                    {createEventMutation.isPending ? "Creating..." : "Publish Event"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(createPageUrl("Home"))}
                    className="border-white/20 text-white hover:bg-[#221112]"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <Card className="bg-[#472426] border-none">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-white mb-4">Live Preview</h3>
                <div className="bg-[#221112] rounded-2xl overflow-hidden">
                  <div className="h-40 bg-gradient-to-br from-[#ea2a33] to-[#c89295] relative">
                    {eventData.image_url && (
                      <img src={eventData.image_url} alt="Preview" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="p-4 space-y-3">
                    <h4 className="text-lg font-bold text-white line-clamp-2">
                      {eventData.title || "Your Event Title"}
                    </h4>
                    <p className="text-sm text-white/60 line-clamp-2">
                      {eventData.description || "Event description will appear here..."}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <span className="text-sm text-[#c89295]">{eventData.category}</span>
                      <span className="text-lg font-bold text-[#ea2a33]">
                        {eventData.ticket_type === "Free" ? "Free" : `$${eventData.price || 0}`}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}