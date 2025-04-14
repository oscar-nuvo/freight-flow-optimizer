
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="landing-section bg-forest text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Optimize Your Transportation Procurement?
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Join hundreds of logistics professionals who are saving time and money with FreightPro.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" className="bg-white text-forest hover:bg-gray-100 w-full sm:w-auto">
                Get started now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="secondary" className="border-2 border-white bg-white/10 text-white hover:bg-white/20 w-full sm:w-auto">
                Log in
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-white/80 text-sm">
            No credit card required. Start with a 14-day free trial.
          </p>
        </div>
      </div>
    </section>
  );
}
