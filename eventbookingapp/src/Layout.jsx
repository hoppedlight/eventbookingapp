import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { api } from "@/api/client";
import {
  Calendar,
  Heart,
  Search,
  User,
  Menu,
  X,
  Home,
  PlusCircle,
  List,
  LogOut,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await api.auth.me();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = createPageUrl("SearchResults") + `?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleLogout = async () => {
    await api.auth.logout();
  };

  const navLinks = [
    { name: "Home", path: "Home", icon: Home },
    { name: "Create Event", path: "CreateEvent", icon: PlusCircle },
    { name: "My Events", path: "MyEvents", icon: List },
  ];

  return (
    <div className="min-h-screen bg-[#221112] text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

        * {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        :root {
          --bg-primary: #221112;
          --bg-surface: #472426;
          --accent: #ea2a33;
          --highlight: #c89295;
          --text-primary: #ffffff;
        }

        body {
          background-color: var(--bg-primary);
        }

        .nav-link {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .nav-link:hover {
          color: var(--accent);
          transform: translateY(-2px);
        }

        .accent-glow {
          box-shadow: 0 0 20px rgba(234, 42, 51, 0.3);
        }

        .smooth-transition {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[#221112]/95 backdrop-blur-md border-b border-[#472426]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to={createPageUrl("Home")} className="flex items-center gap-3 smooth-transition hover:scale-105">
              <div className="w-10 h-10 bg-gradient-to-br from-[#ea2a33] to-[#c89295] rounded-xl flex items-center justify-center accent-glow">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-[#c89295] bg-clip-text text-transparent">
                Evently
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={createPageUrl(link.path)}
                  className={`nav-link flex items-center gap-2 text-sm font-medium ${
                    location.pathname === createPageUrl(link.path)
                      ? "text-[#ea2a33]"
                      : "text-white/80"
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden lg:flex items-center flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <Input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 bg-[#472426] border-none text-white placeholder:text-white/50 focus-visible:ring-[#ea2a33]"
                />
              </div>
            </form>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Link to={createPageUrl("Favorites")}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hidden md:flex text-white/80 hover:text-[#ea2a33] hover:bg-[#472426]"
                    >
                      <Heart className="w-5 h-5" />
                    </Button>
                  </Link>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hidden md:flex rounded-full hover:bg-[#472426]"
                      >
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.full_name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-br from-[#ea2a33] to-[#c89295] rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-[#472426] border-[#c89295]/20 text-white">
                      <div className="px-2 py-1.5">
                        <p className="text-sm font-medium">{user.full_name}</p>
                        <p className="text-xs text-white/60">{user.email}</p>
                      </div>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem asChild className="cursor-pointer hover:bg-[#221112]">
                        <Link to={createPageUrl("Profile")} className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="cursor-pointer hover:bg-[#221112]">
                        <Link to={createPageUrl("MyEvents")} className="flex items-center gap-2">
                          <List className="w-4 h-4" />
                          My Events
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="cursor-pointer hover:bg-[#221112]">
                        <Link to={createPageUrl("Favorites")} className="flex items-center gap-2">
                          <Heart className="w-4 h-4" />
                          Favorites
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer hover:bg-[#221112] text-[#ea2a33]">
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button
                  onClick={() => api.auth.redirectToLogin(window.location.href)}
                  className="hidden md:flex bg-[#ea2a33] hover:bg-[#ea2a33]/90 text-white accent-glow"
                >
                  Sign In
                </Button>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="lg:hidden pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <Input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 bg-[#472426] border-none text-white placeholder:text-white/50"
              />
            </div>
          </form>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#472426]/50 bg-[#221112]">
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={createPageUrl(link.path)}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 p-3 rounded-lg smooth-transition ${
                    location.pathname === createPageUrl(link.path)
                      ? "bg-[#ea2a33]/10 text-[#ea2a33]"
                      : "text-white/80 hover:bg-[#472426]"
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  {link.name}
                </Link>
              ))}
              {user && (
                <>
                  <Link
                    to={createPageUrl("Favorites")}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-lg text-white/80 hover:bg-[#472426] smooth-transition"
                  >
                    <Heart className="w-5 h-5" />
                    Favorites
                  </Link>
                  <Link
                    to={createPageUrl("Profile")}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-lg text-white/80 hover:bg-[#472426] smooth-transition"
                  >
                    <User className="w-5 h-5" />
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 p-3 rounded-lg text-[#ea2a33] hover:bg-[#472426] smooth-transition"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </>
              )}
              {!user && (
                <Button
                  onClick={() => api.auth.redirectToLogin(window.location.href)}
                  className="w-full bg-[#ea2a33] hover:bg-[#ea2a33]/90 text-white"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-20rem)]">{children}</main>

      {/* Footer */}
      <footer className="bg-[#472426]/30 border-t border-[#472426]/50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#ea2a33] to-[#c89295] rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">Evently</span>
              </div>
              <p className="text-white/60 text-sm">
                Discover unforgettable events near you. Connect, celebrate, and create memories.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-4 text-white">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to={createPageUrl("Home")} className="text-white/60 hover:text-[#ea2a33] text-sm smooth-transition">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl("CreateEvent")} className="text-white/60 hover:text-[#ea2a33] text-sm smooth-transition">
                    Create Event
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl("MyEvents")} className="text-white/60 hover:text-[#ea2a33] text-sm smooth-transition">
                    My Events
                  </Link>
                </li>
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h3 className="font-semibold mb-4 text-white">Categories</h3>
              <ul className="space-y-2">
                {["Music", "Sports", "Arts", "Business", "Food & Drink"].map((cat) => (
                  <li key={cat}>
                    <Link
                      to={createPageUrl("Home") + `?category=${cat}`}
                      className="text-white/60 hover:text-[#ea2a33] text-sm smooth-transition"
                    >
                      {cat}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Connect */}
            <div>
              <h3 className="font-semibold mb-4 text-white">Connect</h3>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="w-10 h-10 bg-[#472426] rounded-lg flex items-center justify-center hover:bg-[#ea2a33] smooth-transition"
                >
                  <span className="text-sm">𝕏</span>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-[#472426] rounded-lg flex items-center justify-center hover:bg-[#ea2a33] smooth-transition"
                >
                  <span className="text-sm">f</span>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-[#472426] rounded-lg flex items-center justify-center hover:bg-[#ea2a33] smooth-transition"
                >
                  <span className="text-sm">in</span>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-[#472426]/50 mt-8 pt-8 text-center text-white/60 text-sm">
            <p>© 2025 Evently. All rights reserved. Discover unforgettable moments.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}