
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const pricingPlans = [
  {
    name: "Starter",
    price: "$49",
    description: "Perfect for small businesses looking to optimize their transportation procurement.",
    features: [
      "Up to 5 team members",
      "Up to 25 carriers",
      "Up to 100 lanes",
      "Basic analytics",
      "Email support",
    ],
    cta: "Get started",
    highlighted: false
  },
  {
    name: "Professional",
    price: "$149",
    description: "Ideal for mid-sized companies with multiple procurement managers.",
    features: [
      "Up to 20 team members",
      "Up to 100 carriers",
      "Unlimited lanes",
      "Advanced analytics",
      "Priority email support",
      "Custom bid templates",
      "Integration with ERP systems"
    ],
    cta: "Try Professional",
    highlighted: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large companies with complex transportation networks.",
    features: [
      "Unlimited team members",
      "Unlimited carriers",
      "Unlimited lanes",
      "Premium analytics & reporting",
      "24/7 dedicated support",
      "Custom integrations",
      "Dedicated account manager",
      "On-site training"
    ],
    cta: "Contact sales",
    highlighted: false
  }
];

export function Pricing() {
  return (
    <section id="pricing" className="landing-section bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the plan that suits your business needs. No hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <Card 
              key={index} 
              className={`border ${plan.highlighted ? 'border-forest shadow-lg relative overflow-hidden' : 'border-gray-200'}`}
            >
              {plan.highlighted && (
                <div className="absolute top-0 right-0 bg-forest text-white px-3 py-1 text-sm font-medium">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.price !== "Custom" && <span className="text-gray-600 ml-1">/month</span>}
                </div>
                <CardDescription className="mt-2 text-gray-600">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="h-5 w-5 text-forest shrink-0 mr-2" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link to="/signup" className="w-full">
                  <Button 
                    className={`w-full ${plan.highlighted ? 'bg-forest hover:bg-forest-600 text-white' : ''}`}
                    variant={plan.highlighted ? 'default' : 'outline'}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
