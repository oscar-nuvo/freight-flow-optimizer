
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { getCarriers, Carrier } from "@/services/carriersService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CarrierCard } from "@/components/carriers/CarrierCard";
import { CarrierForm } from "@/components/carriers/CarrierForm";
import { Plus, Search, FileUp, Filter } from "lucide-react";

export function CarriersSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const { toast } = useToast();

  const loadCarriers = async () => {
    try {
      setIsLoading(true);
      const data = await getCarriers();
      setCarriers(data);
    } catch (error) {
      console.error("Failed to load carriers:", error);
      toast({
        title: "Error",
        description: "Failed to load carriers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCarriers();
  }, []);

  const handleCarrierCreated = () => {
    setFormOpen(false);
    loadCarriers();
  };

  const filteredCarriers = carriers.filter(carrier => 
    carrier.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCarriers = filteredCarriers.filter(carrier => carrier.status === 'active');
  const pendingCarriers = filteredCarriers.filter(carrier => carrier.status === 'pending');
  const inactiveCarriers = filteredCarriers.filter(carrier => carrier.status === 'inactive');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Carriers</h1>
          <p className="text-muted-foreground mt-1">Manage your transportation providers</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" className="sm:w-auto">
            <FileUp className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button 
            className="bg-forest hover:bg-forest-600 sm:w-auto"
            onClick={() => setFormOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Carrier
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <TabsList>
            <TabsTrigger value="all">All Carriers ({filteredCarriers.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({activeCarriers.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingCarriers.length})</TabsTrigger>
            <TabsTrigger value="inactive">Inactive ({inactiveCarriers.length})</TabsTrigger>
          </TabsList>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search carriers..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value="all">
          <Card>
            <CardHeader className="px-6 py-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">All Carriers</CardTitle>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
              <CardDescription>
                {filteredCarriers.length} carriers found
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : filteredCarriers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCarriers.map(carrier => (
                    <CarrierCard key={carrier.id} carrier={carrier} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No carriers found</p>
                  <Button 
                    className="mt-4"
                    onClick={() => setFormOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Carrier
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Carriers</CardTitle>
              <CardDescription>View and manage your active carriers</CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : activeCarriers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeCarriers.map(carrier => (
                    <CarrierCard key={carrier.id} carrier={carrier} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No active carriers found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Carriers</CardTitle>
              <CardDescription>Carriers waiting for approval or additional information</CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : pendingCarriers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingCarriers.map(carrier => (
                    <CarrierCard key={carrier.id} carrier={carrier} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No pending carriers found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="inactive">
          <Card>
            <CardHeader>
              <CardTitle>Inactive Carriers</CardTitle>
              <CardDescription>Carriers that are currently not in use</CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : inactiveCarriers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inactiveCarriers.map(carrier => (
                    <CarrierCard key={carrier.id} carrier={carrier} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No inactive carriers found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CarrierForm 
        open={formOpen} 
        onClose={() => setFormOpen(false)} 
        onSuccess={handleCarrierCreated}
      />
    </div>
  );
}
