
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Carriers from "./pages/Carriers";
import CarrierDetails from "./pages/CarrierDetails";
import Bids from "./pages/Bids";
import NewBid from "./pages/NewBid";
import BidDetails from "./pages/BidDetails";
import RoutesList from "./pages/RoutesList";
import Analysis from "./pages/Analysis";
import NotFound from "./pages/NotFound";
import EditBid from "./pages/EditBid";
import Pricing from "./pages/Pricing";
import CarrierOnboarding from "./pages/CarrierOnboarding";
import CarrierBidResponsePage from "./pages/CarrierBidResponsePage";
import AddRoutesToBid from "./pages/AddRoutesToBid";
import AuditLogs from "./pages/AuditLogs";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/carriers" element={<ProtectedRoute><Carriers /></ProtectedRoute>} />
            <Route path="/carriers/:id" element={<ProtectedRoute><CarrierDetails /></ProtectedRoute>} />
            <Route path="/bids" element={<ProtectedRoute><Bids /></ProtectedRoute>} />
            <Route path="/bids/new" element={<ProtectedRoute><NewBid /></ProtectedRoute>} />
            <Route path="/bids/:id" element={<ProtectedRoute><BidDetails /></ProtectedRoute>} />
            <Route path="/bids/:id/routes/new" element={<ProtectedRoute><AddRoutesToBid /></ProtectedRoute>} />
            <Route path="/bids/:id/edit" element={<ProtectedRoute><EditBid /></ProtectedRoute>} />
            <Route path="/routes" element={<ProtectedRoute><RoutesList /></ProtectedRoute>} />
            <Route path="/analysis" element={<ProtectedRoute><Analysis /></ProtectedRoute>} />
            <Route path="/audit-logs" element={<ProtectedRoute><AuditLogs /></ProtectedRoute>} />
            <Route path="/carrier-onboarding/:token" element={<CarrierOnboarding />} />
            <Route path="/bid/respond/:token" element={<CarrierBidResponsePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
