import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  name: string;
  email: string;
  phone: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
}

export function useAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMessage = data.message ?? "Login failed";
        setError(errorMessage);
        return { success: false, message: errorMessage };
      }

      toast.success(data.message ?? "Login successful");
      router.push("/dashboard");
      router.refresh();
      return { success: true };
    } catch (err) {
      const errorMessage = "Something went wrong" + (err instanceof Error ? `: ${err.message}` : "");
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMessage = data.message ?? "Registration failed";
        setError(errorMessage);
        return { success: false, message: errorMessage };
      }

      toast.success(data.message ?? "Registration successful");
      router.push("/dashboard");
      router.refresh();
      return { success: true };
    } catch (err) {
      const errorMessage = "Something went wrong" + (err instanceof Error ? `: ${err.message}` : "");
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<AuthResponse> => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        const errorMessage = data.message ?? "Logout failed";
        setError(errorMessage);
        return { success: false, message: errorMessage };
      }

      router.push("/login");
      router.refresh();
      return { success: true };
    } catch (err) {
      const errorMessage = "Something went wrong" + (err instanceof Error ? `: ${err.message}` : "");
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError("");

  return {
    login,
    register,
    logout,
    loading,
    error,
    clearError,
  };
}
