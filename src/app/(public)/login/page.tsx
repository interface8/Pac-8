"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sun, Mail, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";

export default function LoginPage() {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await login({ email, password });
  }

  return (
    <Card className="w-full p-6 md:p-8 gap-0">

      {/* Back to Home */}
      <Button variant="ghost" className="self-start h-8 px-3 gap-1.5 mb-6" asChild>
        <Link href="/">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
      </Button>

      {/* Logo */}
      <div className="flex items-center justify-center gap-2 mb-6 md:mb-8">
        <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl shadow-lg">
          <Sun className="w-7 h-7 md:w-8 md:h-8 text-white" />
        </div>
        <span className="text-xl md:text-2xl font-semibold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
          Power - 8
        </span>
      </div>

      {/* Heading */}
      <h1 className="text-xl md:text-2xl font-semibold text-center mb-2">
        Welcome Back
      </h1>
      <p className="text-sm md:text-base text-gray-600 text-center mb-6 md:mb-8">
        Login to your account
      </p>

      {/* Error */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-10"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
        >
          {loading ? "Signing in..." : "Login"}
        </Button>
      </form>

      {/* Register link */}
      <div className="mt-6 text-center text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-orange-500 hover:text-orange-600 font-medium">
          Register here
        </Link>
      </div>

      {/* Demo credentials */}
      <div className="mt-6 md:mt-8 p-3 md:p-4 bg-blue-50 rounded-lg">
        <p className="text-xs font-medium text-blue-800 mb-2">Demo Credentials:</p>
        <p className="text-xs text-blue-700">Admin: admin@power8.com / admin123</p>
        <p className="text-xs text-blue-700">Customer: any email / any password</p>
      </div>

    </Card>
  );
}
