import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type User = {
  id: string | number;
  FirstName?: string;
  LastName?: string;
  username?: string;
  email: string;
  age?: number;
  blood_group?: string;
  sex?: string;
  mobile?: string;
  whatsapp?: string;
  address?: string;
  wallet?: number;
  uploads?: string;
  subscriptions?: Array<{
    year: number;
    month: string;
    amount: number;
  }>;
  appointment?: {
    name?: string;
    date: string;
    time: string;
  };
  testResults?: Array<{
    testId?: number;
    testName: string;
    result: string;
    date: string;
  }>;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
};

type LoginData = {
  email: string;
  password: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  const formatName = (name: string | undefined | null): string => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };
  
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/user");
        return await res.json();
      } catch (error: any) {
        if (error?.message?.includes('401')) {
          return null;
        }
        throw error;
      }
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: async (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Welcome back!",
        description: `Good to see you, ${formatName(user.FirstName)}!`,
      });

      // Check health tips subscription status and redirect accordingly
      try {
        const subscription = await apiRequest("GET", "/api/health-tips-subscriptions/user");
        const subscriptionData = await subscription.json();
        
        if (!subscriptionData || subscriptionData.status !== 'active') {
          // Redirect to health tips subscription if no active subscription
          window.location.href = '/health-tips-subscription';
        } else {
          // Redirect to home if already subscribed
          window.location.href = '/';
        }
      } catch (error) {
        // If subscription check fails, redirect to subscription page for safety
        window.location.href = '/health-tips-subscription';
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials. Please check your email and password.",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}