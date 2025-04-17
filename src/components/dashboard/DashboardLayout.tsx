
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Home, 
  Truck, 
  FileSpreadsheet, 
  Map, 
  BarChart, 
  LogOut, 
  Menu, 
  X, 
  User 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/context/AuthContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  title: string;
  icon: React.ElementType;
  path: string;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    icon: Home,
    path: "/dashboard",
  },
  {
    title: "Carriers",
    icon: Truck,
    path: "/carriers",
  },
  {
    title: "Bids",
    icon: FileSpreadsheet,
    path: "/bids",
  },
  {
    title: "Routes",
    icon: Map,
    path: "/routes",
  },
  {
    title: "Analysis",
    icon: BarChart,
    path: "/analysis",
  },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { profile, organization, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Get user display name
  const userName = profile?.full_name || profile?.email || "User";
  
  // Get organization name
  const orgName = organization?.name || "Personal Account";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b p-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
        <Link to="/dashboard" className="text-xl font-bold flex items-center text-forest">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6 mr-2"
          >
            <rect x="3" y="8" width="18" height="12" rx="2" />
            <path d="M10 8V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v3" />
            <path d="M7 12h.01" />
            <path d="M17 12h.01" />
            <path d="M7 16h10" />
          </svg>
          FreightPro
        </Link>
        <div className="w-9"></div> {/* Empty div for layout balance */}
      </div>

      {/* Sidebar */}
      <aside 
        className={`
          ${sidebarOpen || !isMobile ? "block" : "hidden"} 
          md:block bg-sidebar text-sidebar-foreground 
          w-full md:w-64 md:min-h-screen md:sticky md:top-0 
          fixed md:relative inset-0 z-20 md:z-auto
          ${isMobile && sidebarOpen ? "bg-black/50" : ""}
        `}
      >
        <div 
          className={`
            ${isMobile ? "w-3/4 bg-sidebar min-h-screen" : "w-full"} 
            flex flex-col h-full
          `}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-sidebar-border">
            <Link to="/dashboard" className="text-xl font-bold flex items-center text-sidebar-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6 mr-2"
              >
                <rect x="3" y="8" width="18" height="12" rx="2" />
                <path d="M10 8V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v3" />
                <path d="M7 12h.01" />
                <path d="M17 12h.01" />
                <path d="M7 16h10" />
              </svg>
              FreightPro
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`
                      flex items-center p-2 rounded-md transition-colors
                      ${location.pathname === item.path 
                        ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                        : "hover:bg-sidebar-accent/50"}
                    `}
                    onClick={() => isMobile && setSidebarOpen(false)}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Section */}
          <div className="border-t border-sidebar-border p-4">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
                <User className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="font-medium">{userName}</p>
                <p className="text-sm text-sidebar-foreground/80">{orgName}</p>
              </div>
            </div>
            <Button 
              variant="destructive" 
              className="w-full justify-start bg-red-600 hover:bg-red-700 text-white" 
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log out
            </Button>
          </div>
        </div>

        {/* Click outside to close on mobile */}
        {isMobile && sidebarOpen && (
          <div 
            className="absolute inset-0 z-0"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
