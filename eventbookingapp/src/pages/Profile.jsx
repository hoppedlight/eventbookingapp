import React, { useState, useEffect } from "react";
import { api } from "@/api/client";
import { useMutation } from "@tanstack/react-query";
import { User, Mail, Phone, MapPin, Heart, Calendar, Settings, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";

const categories = [
  "Music", "Sports", "Arts", "Family", "Food & Drink",
  "Business", "Technology", "Health", "Education"
];

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: "",
    phone: "",
    city: "",
    favorite_categories: [],
    avatar_url: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await api.auth.me();
        setUser(currentUser);
        setProfileData({
          full_name: currentUser.full_name || "",
          phone: currentUser.phone || "",
          city: currentUser.city || "",
          favorite_categories: currentUser.favorite_categories || [],
          avatar_url: currentUser.avatar_url || "",
        });
      } catch (error) {
        api.auth.redirectToLogin(window.location.href);
      }
    };
    fetchUser();
  }, []);

  const updateProfileMutation = useMutation({
    mutationFn: (data) => api.auth.updateMe(data),
    onSuccess: () => {
      alert("Profile updated successfully!");
      window.location.reload();
    },
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await api.integrations.Core.UploadFile()
      setProfileData(prev => ({ ...prev, avatar_url: file_url }));
    } catch (error) {
      alert("Failed to upload image");
    }
    setIsUploading(false);
  };

  const toggleCategory = (category) => {
    setProfileData(prev => {
      const categories = prev.favorite_categories || [];
      if (categories.includes(category)) {
        return { ...prev, favorite_categories: categories.filter(c => c !== category) };
      } else {
        return { ...prev, favorite_categories: [...categories, category] };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="relative inline-block mb-6">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-[#ea2a33] to-[#c89295] p-1">
            <div className="w-full h-full rounded-full overflow-hidden bg-[#221112] flex items-center justify-center">
              {profileData.avatar_url ? (
                <img src={profileData.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-16 h-16 text-white/60" />
              )}
            </div>
          </div>
          <label className="absolute bottom-0 right-0 w-10 h-10 bg-[#ea2a33] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#ea2a33]/90 smooth-transition accent-glow">
            <Upload className="w-5 h-5 text-white" />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={isUploading}
            />
          </label>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">{user.full_name}</h1>
        <p className="text-white/60">{user.email}</p>
        {user.role === "admin" && (
          <Badge className="mt-3 bg-[#ea2a33] border-none">Admin</Badge>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="settings" className="space-y-8">
        <TabsList className="grid w-full grid-cols-3 bg-[#472426]">
          <TabsTrigger value="settings" className="data-[state=active]:bg-[#ea2a33]">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="favorites" className="data-[state=active]:bg-[#ea2a33]">
            <Heart className="w-4 h-4 mr-2" />
            Favorites
          </TabsTrigger>
          <TabsTrigger value="events" className="data-[state=active]:bg-[#ea2a33]">
            <Calendar className="w-4 h-4 mr-2" />
            My Events
          </TabsTrigger>
        </TabsList>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card className="bg-[#472426] border-none">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-white mb-4">Personal Information</h2>

                  <div>
                    <Label className="text-white">Full Name</Label>
                    <Input
                      value={profileData.full_name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                      className="bg-[#221112] border-white/10 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Email</Label>
                    <Input
                      value={user.email}
                      disabled
                      className="bg-[#221112]/50 border-white/10 text-white/50"
                    />
                    <p className="text-xs text-white/40 mt-1">Email cannot be changed</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Phone</Label>
                      <Input
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+1 (555) 123-4567"
                        className="bg-[#221112] border-white/10 text-white placeholder:text-white/40"
                      />
                    </div>

                    <div>
                      <Label className="text-white">City</Label>
                      <Input
                        value={profileData.city}
                        onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="New York"
                        className="bg-[#221112] border-white/10 text-white placeholder:text-white/40"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-white/10">
                  <h2 className="text-xl font-bold text-white mb-4">Favorite Categories</h2>
                  <p className="text-white/60 text-sm mb-4">
                    Select categories to get personalized event recommendations
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {categories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => toggleCategory(category)}
                        className={`px-4 py-2 rounded-lg font-medium smooth-transition ${
                          profileData.favorite_categories?.includes(category)
                            ? "bg-[#ea2a33] text-white"
                            : "bg-[#221112] text-white/70 hover:bg-[#221112]/70"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="w-full bg-[#ea2a33] hover:bg-[#ea2a33]/90 text-white text-lg py-6 accent-glow"
                >
                  {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Favorites Tab */}
        <TabsContent value="favorites">
          <Card className="bg-[#472426] border-none">
            <CardContent className="p-8 text-center">
              <Heart className="w-16 h-16 mx-auto mb-4 text-white/40" />
              <h3 className="text-xl font-bold text-white mb-2">View Your Favorites</h3>
              <p className="text-white/60 mb-6">
                See all the events you've saved
              </p>
              <Link to={createPageUrl("Favorites")}>
                <Button className="bg-[#ea2a33] hover:bg-[#ea2a33]/90 text-white">
                  Go to Favorites
                </Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Events Tab */}
        <TabsContent value="events">
          <Card className="bg-[#472426] border-none">
            <CardContent className="p-8 text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-white/40" />
              <h3 className="text-xl font-bold text-white mb-2">Manage Your Events</h3>
              <p className="text-white/60 mb-6">
                View and edit the events you've created
              </p>
              <Link to={createPageUrl("MyEvents")}>
                <Button className="bg-[#ea2a33] hover:bg-[#ea2a33]/90 text-white">
                  Go to My Events
                </Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}