
import { 
  Truck, 
  DollarSign, 
  ClipboardCheck, 
  Clock 
} from "lucide-react";

const benefits = [
  {
    title: "Save Time & Resources",
    description: "Reduce the time spent on administrative tasks by up to 70% and focus on strategic decisions.",
    icon: Clock,
  },
  {
    title: "Reduce Transportation Costs",
    description: "Customers report an average 15% reduction in overall transportation spend.",
    icon: DollarSign,
  },
  {
    title: "Improve Carrier Compliance",
    description: "Maintain detailed information on carrier capabilities, performance, and compliance in one place.",
    icon: Truck,
  },
  {
    title: "Enhance Procurement Visibility",
    description: "Track team activities and ensure follow-up with carriers during the entire bidding process.",
    icon: ClipboardCheck,
  },
];

export function Benefits() {
  return (
    <section id="benefits" className="landing-section bg-forest-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Benefits That Drive Results
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join hundreds of logistics professionals who are transforming their transportation management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="bg-forest text-white p-3 rounded-full">
                <benefit.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
