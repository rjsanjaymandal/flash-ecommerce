"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/types/supabase";
import { useCartStore } from "@/store/use-cart-store";
import { useWishlistStore } from "@/store/use-wishlist-store";
import { toast } from "sonner";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  initialUser = null,
  initialSession = null,
  initialProfile = null,
}: {
  children: React.ReactNode;
  initialUser?: User | null;
  initialSession?: Session | null;
  initialProfile?: Profile | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [session, setSession] = useState<Session | null>(initialSession);
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [isLoading, setIsLoading] = useState(!initialUser); // If we have a user initially, we are not "loading"

  // Use a lazy initializer for the client to ensure it's created once per mount
  const [supabase] = useState(() => createClient());

  const fetchProfile = useCallback(
    async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();

        if (error) {
          console.error(
            "Error fetching profile:",
            JSON.stringify(error, null, 2),
          );
          // Only set profile to null if it's a real error, not just 'no rows' if we expect one (though .single() errors on no rows)
          setProfile(null);
        } else {
          console.log("Fetched Profile Success:", data);
          setProfile(data);
        }
      } catch (err) {
        console.error("Unexpected error fetching profile:", err);
      }
    },
    [supabase],
  );

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 1. Get initial session only if we didn't get it from server
        // (But actually we should verify it match)
        if (!initialSession) {
          const {
            data: { session: currentSession },
          } = await supabase.auth.getSession();
          console.log(
            "[AuthContext] Initial Session:",
            currentSession ? "Found" : "Missing",
            currentSession?.user?.email,
          );
          setSession(currentSession);
          setUser(currentSession?.user ?? null);

          if (currentSession?.user) {
            await fetchProfile(currentSession.user.id);
            // SYNC CART
            useCartStore.getState().syncWithUser(currentSession.user.id);
          }
        } else {
          console.log(
            "[AuthContext] Hydrated from Server:",
            initialUser?.email,
          );
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // 3. Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        await fetchProfile(currentSession.user.id);
        // SYNC CART
        useCartStore.getState().syncWithUser(currentSession.user.id);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, initialSession, initialUser, fetchProfile]);

  const signOut = async () => {
    try {
      // 1. Attempt API sign out with timeout
      const signOutPromise = supabase.auth.signOut();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Sign out timed out")), 5000),
      );

      await Promise.race([signOutPromise, timeoutPromise]).catch((err) => {
        console.warn(
          "[signOut] API sign out failed or timed out, proceeding with local cleanup:",
          err,
        );
      });

      // 2. Local Cleanup (Always runs)
      setUser(null);
      setSession(null);
      setProfile(null);

      // Clear stores
      useCartStore.getState().setItems([]);
      useWishlistStore.getState().setItems([]);

      localStorage.removeItem("flash-cart-storage");
      localStorage.removeItem("flash-wishlist-storage");

      toast.success("Signed out successfully");

      // 3. Force redirect and reload to clear any remaining in-memory state
      window.location.href = "/";
    } catch (error) {
      console.error("Sign out error:", error);
      // Even if everything fails, try to force redirect to home
      window.location.href = "/";
    }
  };

  const value = {
    user,
    session,
    profile,
    isLoading,
    isAdmin: profile?.role === "admin",
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
