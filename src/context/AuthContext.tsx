
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  profile: any | null;
  organization: any | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [organization, setOrganization] = useState<any | null>(null);
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
      
      try {
        // Fetch primary organization membership using maybeSingle to handle case with no memberships
        const { data: membershipData, error: membershipError } = await supabase
          .from("org_memberships")
          .select("*, organizations(*)")
          .eq("user_id", userId)
          .eq("is_primary", true)
          .maybeSingle();
        
        if (membershipError && membershipError.code !== "PGRST116") {
          // PGRST116 is "No rows returned" error, which is fine if the user doesn't have a primary org yet
          console.warn("Non-critical membership error:", membershipError);
        }
        
        if (membershipData) {
          setOrganization(membershipData.organizations);
          console.log("Organization loaded:", membershipData.organizations);
        }
      } catch (orgError) {
        console.error("Error loading organization:", orgError);
        // This is non-critical, so we'll continue without an organization
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
