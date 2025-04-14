
import { 
  Users, 
  FileSpreadsheet, 
  Map, 
  BarChart
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "Carrier Management",
    description: "Easily onboard and manage transportation providers with detailed profiles.",
    icon: Users,
  },
  {
    title: "Streamlined RFPs",
    description: "Create and manage bids across multiple lanes and carriers efficiently.",
    icon: FileSpreadsheet,
  },
  {
    title: "Route Optimization",
    description: "View and analyze all your routes and associated rates in one place.",
    icon: Map,
  },
  {
    title: "Data-Driven Insights",
    description: "Access detailed dashboards and analytics about carriers, bids, and routes.",
    icon: BarChart,
  },
];

export function Features() {
  return (
    <section id="features" className="landing-section bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Powerful Features for Logistics Professionals
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive platform helps you streamline transportation procurement, 
            save costs, and make informed decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="bg-forest-50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-forest" />
                </div>
                <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
