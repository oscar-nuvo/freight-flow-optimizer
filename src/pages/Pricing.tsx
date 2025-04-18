
import { Link } from "react-router-dom";
import { Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const freeTierFeatures = [
  "Create 1 transportation bid",
  "Up to 5 lanes per bid",
  "Basic analytics",
  "Up to 10 carrier invitations",
  "Standard bid templates",
  "Email support"
];

const premiumTierFeatures = [
  "Unlimited transportation bids",
  "Unlimited lanes per bid",
  "Advanced analytics & reporting",
  "Unlimited carrier invitations",
  "Custom bid templates",
  "Priority email support",
  "Bulk lane import/export",
  "Bid comparison tools",
  "Historical bid data access",
  "Integration with ERP systems"
];

const planComparison = [
  {
    feature: "Number of bids",
    free: "1",
    premium: "Unlimited"
  },
  {
    feature: "Lanes per bid",
    free: "Up to 5",
    premium: "Unlimited"
  },
  {
    feature: "Carrier invitations",
    free: "Up to 10",
    premium: "Unlimited"
  },
  {
    feature: "Analytics",
    free: "Basic",
    premium: "Advanced"
  },
  {
    feature: "Bid templates",
    free: "Standard only",
    premium: "Custom templates"
  },
  {
    feature: "Support",
    free: "Email support",
    premium: "Priority support"
  },
  {
    feature: "Bulk operations",
    free: "No",
    premium: "Yes"
  },
  {
    feature: "Bid comparison",
    free: "No",
    premium: "Yes"
  },
  {
    feature: "Historical data",
    free: "Limited (30 days)",
    premium: "Full access"
  },
  {
    feature: "ERP integration",
    free: "No",
    premium: "Yes"
  }
];

export default function Pricing() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Choose Your Plan</h1>
                <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mx-auto">
                  Select the plan that works best for your transportation procurement needs
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-5xl py-12">
              <Tabs defaultValue="cards" className="w-full">
                <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                  <TabsTrigger value="cards">Plan Cards</TabsTrigger>
                  <TabsTrigger value="comparison">Feature Comparison</TabsTrigger>
                </TabsList>
                <TabsContent value="cards" className="w-full">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Free Tier Card */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-2xl">Free</CardTitle>
                        <div className="mt-2">
                          <span className="text-3xl font-bold">$0</span>
                          <span className="text-gray-600 ml-1">/month</span>
                        </div>
                        <CardDescription className="mt-2">
                          Get started with basic bid management for small-scale projects
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {freeTierFeatures.map((feature, i) => (
                            <li key={i} className="flex items-start">
                              <Check className="h-5 w-5 text-forest shrink-0 mr-2" />
                              <span className="text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Link to="/signup" className="w-full">
                          <Button variant="outline" className="w-full">
                            Get Started Free
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                    
                    {/* Premium Tier Card */}
                    <Card className="border-forest shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-forest text-white px-3 py-1 text-sm font-medium">
                        Recommended
                      </div>
                      <CardHeader>
                        <CardTitle className="text-2xl">Premium</CardTitle>
                        <div className="mt-2">
                          <span className="text-3xl font-bold">$149</span>
                          <span className="text-gray-600 ml-1">/month</span>
                        </div>
                        <CardDescription className="mt-2">
                          Unlock unlimited bids and advanced features for serious logistics professionals
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {premiumTierFeatures.map((feature, i) => (
                            <li key={i} className="flex items-start">
                              <Check className="h-5 w-5 text-forest shrink-0 mr-2" />
                              <span className="text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Link to="/signup" className="w-full">
                          <Button className="w-full bg-forest hover:bg-forest-600">
                            Upgrade to Premium
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  </div>
                </TabsContent>
                <TabsContent value="comparison" className="w-full">
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-1/2">Feature</TableHead>
                          <TableHead>Free</TableHead>
                          <TableHead>Premium</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {planComparison.map((item, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{item.feature}</TableCell>
                            <TableCell>{item.free}</TableCell>
                            <TableCell className="font-medium text-forest">{item.premium}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <Alert className="mt-6 bg-blue-50 border-blue-200">
                    <Info className="h-5 w-5 text-blue-500" />
                    <AlertDescription className="text-blue-800">
                      Enterprise plans with custom features and dedicated account managers are also available. 
                      <Link to="/contact" className="underline ml-1">Contact us</Link> for more information.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="mt-8 flex justify-center">
                    <Link to="/signup">
                      <Button className="bg-forest hover:bg-forest-600">
                        Get Started Today
                      </Button>
                    </Link>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
