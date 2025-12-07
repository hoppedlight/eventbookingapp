import React, { useState } from "react";
import { api } from "@/api/client";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await api.auth.register(email, password, fullName);
      navigate("/"); // redirect to home after registration
    } catch (err) {
      setError("Registration failed. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#221112] text-white">
      <div className="bg-[#472426] p-8 rounded-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Register</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label>Full Name</label>
            <Input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>
          <div>
            <label>Email</label>
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label>Password</label>
            <Input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Your password"
              required
            />
          </div>
          <Button type="submit" className="w-full bg-[#ea2a33] hover:bg-[#ea2a33]/90">
            Register
          </Button>
        </form>
        <p className="mt-4 text-sm text-white/60">
          Already have an account?{" "}
          <Link to="/login" className="text-[#ea2a33] underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
