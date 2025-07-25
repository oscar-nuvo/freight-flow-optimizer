
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isDashboard = location.pathname.includes("/dashboard") || 
                      location.pathname.includes("/carriers") || 
                      location.pathname.includes("/bids") ||
                      location.pathname.includes("/routes") ||
                      location.pathname.includes("/analysis");
  
  const isHomePage = location.pathname === "/";

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
    if (isMenuOpen) setIsMenuOpen(false);
  };

  if (isDashboard) {
    return null; // Don't show regular navbar on dashboard pages
  }

  return (
    <nav className={`w-full py-4 ${isHomePage ? 'absolute top-0 left-0 z-10 text-white' : 'bg-white shadow-sm text-foreground'}`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold flex items-center">
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

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <button 
            onClick={() => scrollToSection("features")} 
            className="hover:opacity-80 transition-opacity"
          >
            Features
          </button>
          <button 
            onClick={() => scrollToSection("pricing")} 
            className="hover:opacity-80 transition-opacity"
          >
            Pricing
          </button>
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant={isHomePage ? "secondary" : "outline"} 
                className={isHomePage ? "border-2 border-white bg-transparent text-white hover:bg-white/20" : "border-forest text-forest hover:bg-forest/10"}>
                Log in
              </Button>
            </Link>
            <Link to="/signup">
              <Button className={isHomePage ? "bg-white text-forest hover:bg-gray-100" : "bg-forest text-white hover:bg-forest-600"}>
                Sign up
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={toggleMenu} aria-label="Menu">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className={`md:hidden absolute top-16 left-0 w-full z-20 p-4 shadow-md ${isHomePage ? 'bg-forest-500' : 'bg-white'}`}>
          <div className="flex flex-col space-y-4">
            <button 
              onClick={() => scrollToSection("features")} 
              className="py-2 hover:opacity-80"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection("pricing")} 
              className="py-2 hover:opacity-80"
            >
              Pricing
            </button>
            <Link to="/login" onClick={toggleMenu}>
              <Button variant={isHomePage ? "secondary" : "outline"} 
                className={`w-full ${isHomePage ? "border-2 border-white bg-transparent text-white hover:bg-white/20" : "border-forest text-forest hover:bg-forest/10"}`}>
                Log in
              </Button>
            </Link>
            <Link to="/signup" onClick={toggleMenu}>
              <Button className={`w-full ${isHomePage ? "bg-white text-forest hover:bg-gray-100" : "bg-forest text-white hover:bg-forest-600"}`}>
                Sign up
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
