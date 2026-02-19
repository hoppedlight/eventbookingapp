import React, { useEffect, useState } from "react";
import { User, Heart, Calendar, Settings, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";

const categories = [
  "Music",
  "Sports",
  "Arts",
  "Family",
  "Food & Drink",
  "Business",
  "Technology",
  "Health",
  "Education",
];

export default function Profile() {
  const navigate = useNavigate();
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
      const token = localStorage.getItem("token");
      if (!token) {
        navigate(createPageUrl("Login"));
        return;
      }

      try {
        const res = await fetch("http://127.0.0.1:8000/api/me/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Unauthorized");

        const data = await res.json();
        setUser(data);
        setProfileData({
          full_name: data.full_name || "",
          phone: data.phone || "",
          city: data.city || "",
          favorite_categories: data.favorite_categories || [],
          avatar_url: data.avatar_url || "",
        });
      } catch {
        localStorage.removeItem("token");
        navigate(createPageUrl("Login"));
      }
    };

    fetchUser();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/me/update/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!res.ok) throw new Error("Update failed");

      alert("Profile updated successfully!");
      window.location.reload();
    } catch (e) {
      alert("Failed to update profile");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://127.0.0.1:8000/api/upload/", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error();

      const { file_url } = await res.json();
      setProfileData((prev) => ({ ...prev, avatar_url: file_url }));
    } catch {
      alert("Image upload failed");
    }
    setIsUploading(false);
  };

  const toggleCategory = (category) => {
    setProfileData((prev) => ({
      ...prev,
      favorite_categories: prev.favorite_categories.includes(category)
        ? prev.favorite_categories.filter((c) => c !== category)
        : [...prev.favorite_categories, category],
    }));
  };

  if (!user) {
    return (
      <div className="py-20 text-center text-white/60">Loading profile…</div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* HEADER */}
      <div className="text-center mb-12">
        <div className="relative inline-block mb-6">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-[#ea2a33] to-[#c89295] p-1">
            <div className="w-full h-full rounded-full bg-[#221112] flex items-center justify-center">
              {profileData.avatar_url ? (
                <img
                  src={profileData.avatar_url}
                  alt={user.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-16 h-16 text-white/60" />
              )}
            </div>
          </div>

          <label className="absolute bottom-0 right-0 w-10 h-10 bg-[#ea2a33] rounded-full flex items-center justify-center cursor-pointer">
            <Upload className="w-5 h-5 text-white" />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploading}
              className="hidden"
            />
          </label>
        </div>

        <h1 className="text-3xl font-bold text-white">{user.full_name}</h1>
        <p className="text-white/60">{user.email}</p>

        {user.role === "admin" && (
          <Badge className="mt-3 bg-[#ea2a33]">Admin</Badge>
        )}
      </div>

      {/* TABS */}
      <Tabs defaultValue="settings">
        <TabsList className="grid grid-cols-4 bg-[#472426]">
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="favorites">
            <Heart className="w-4 h-4 mr-2" />
            Favorites
          </TabsTrigger>
          <TabsTrigger value="events">
            <Calendar className="w-4 h-4 mr-2" />
            My Events
          </TabsTrigger>{" "}
          <TabsTrigger value="booked">
            <Calendar className="w-4 h-4 mr-2" />
            Booked Events
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <Card className="bg-[#472426] border-none">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label className="text-white">Full Name</Label>
                  <Input
                    value={profileData.full_name}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        full_name: e.target.value,
                      })
                    }
                    className="bg-[#221112] text-white"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Phone</Label>
                    <Input
                      value={profileData.phone}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          phone: e.target.value,
                        })
                      }
                      className="bg-[#221112] text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">City</Label>
                    <Input
                      value={profileData.city}
                      onChange={(e) =>
                        setProfileData({ ...profileData, city: e.target.value })
                      }
                      className="bg-[#221112] text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white">Favorite Categories</Label>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {categories.map((cat) => (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={`px-4 py-2 rounded-lg ${
                          profileData.favorite_categories.includes(cat)
                            ? "bg-[#ea2a33]"
                            : "bg-[#221112]"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full bg-[#ea2a33] py-6">
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="favorites" className="text-center">
          <Link to={createPageUrl("Favorites")}>
            <Button className="bg-[#ea2a33]">Go to Favorites</Button>
          </Link>
        </TabsContent>

        <TabsContent value="events" className="text-center">
          <Link to={createPageUrl("MyEvents")}>
            <Button className="bg-[#ea2a33]">Go to My Events</Button>
          </Link>
        </TabsContent>
        <TabsContent value="booked" className="text-center">
          <Link to="/booked-events">
            <Button className="bg-[#ea2a33]">Go to Booked Events</Button>
          </Link>
        </TabsContent>
      </Tabs>
    </div>
  );
}
