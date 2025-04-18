
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const pricingPlans = [
  {
    name: "Starter",
    price: "$0",
    description: "Perfect for small businesses looking to try our transportation procurement platform.",
    features: [
      "1 transportation bid",
      "Up to 5 lanes per bid",
      "Up to 10 carrier invitations",
      "Basic analytics",
      "Standard bid templates",
      "Email support",
    ],
    cta: "Get started free",
    highlighted: false,
    link: "/signup"
  },
  {
    name: "Professional",
    price: "$149",
    description: "Ideal for logistics professionals who need unlimited bids and advanced features.",
    features: [
      "Unlimited bids",
      "Unlimited lanes",
      "Unlimited carrier invitations",
      "Advanced analytics & reporting",
      "Custom bid templates",
      "Priority email support",
      "Bulk lane import/export",
      "Bid comparison tools"
    ],
    cta: "Upgrade to Premium",
    highlighted: true,
    link: "/signup"
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large companies with complex transportation networks and custom needs.",
    features: [
      "Everything in Premium",
      "Dedicated account manager",
      "Custom integrations",
      "On-site training",
      "Advanced security features",
      "SLA guarantees",
      "Multi-user management",
      "Custom reporting"
    ],
    cta: "Contact sales",
    highlighted: false,
    link: "/contact"
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
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
            Choose the plan that suits your business needs. No hidden fees.
          </p>
          <Link to="/pricing" className="text-forest hover:text-forest-600 underline">
            View detailed feature comparison
          </Link>
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
                <Link to={plan.link} className="w-full">
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
