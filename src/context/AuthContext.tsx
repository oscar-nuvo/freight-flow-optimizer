
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  org_id: string;
  created_at: string;
  updated_at: string;
}

interface Organization {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  organization: Organization | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dataFetched, setDataFetched] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (event === "SIGNED_OUT") {
          setProfile(null);
          setOrganization(null);
          setDataFetched(false);
          localStorage.removeItem("authContext");
          navigate("/login");
        } else if (currentSession?.user && !dataFetched) {
          // Use setTimeout to prevent recursion in the auth state change handler
          setTimeout(() => {
            loadUserData(currentSession.user.id);
          }, 0);
        }
      }
    );

    // Initial session check
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user && !dataFetched) {
        loadUserData(currentSession.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, dataFetched]);

  // Save context to localStorage when it changes
  useEffect(() => {
    if (session && user && profile) {
      localStorage.setItem("authContext", JSON.stringify({
        user: {
          id: user.id,
          email: user.email,
        },
        profile,
        organization,
      }));
    }
  }, [session, user, profile, organization]);

  // Load user profile and organization data
  const loadUserData = async (userId: string) => {
    console.log("Loading user data for:", userId);
    setIsLoading(true);
    
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      
      if (profileError) throw profileError;
      
      setProfile(profileData);
      console.log("Profile loaded:", profileData);
      
      // If profile has an org_id, fetch the organization
      if (profileData.org_id) {
        const { data: orgData, error: orgError } = await supabase
          .from("organizations")
          .select("*")
          .eq("id", profileData.org_id)
          .single();
        
        if (orgError) throw orgError;
        
        setOrganization(orgData);
        console.log("Organization loaded:", orgData);
      }
      
      // Mark data as fetched to prevent duplicate loading
      setDataFetched(true);
    } catch (error) {
      console.error("Error loading user data:", error);
      toast({
        title: "Error",
        description: "Failed to load user data. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Reset state
      setProfile(null);
      setOrganization(null);
      setDataFetched(false);
      localStorage.removeItem("authContext");
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        organization,
        isLoading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
