
import { Link } from "react-router-dom";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="text-xl font-bold flex items-center text-forest">
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
            <p className="mt-4 text-gray-600">
              Simplifying transportation procurement for manufacturers worldwide.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
            <ul className="space-y-2">
              <li><Link to="/#features" className="text-gray-600 hover:text-forest">Features</Link></li>
              <li><Link to="/#pricing" className="text-gray-600 hover:text-forest">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-600 hover:text-forest">About</Link></li>
              <li><Link to="/" className="text-gray-600 hover:text-forest">Careers</Link></li>
              <li><Link to="/" className="text-gray-600 hover:text-forest">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-600 hover:text-forest">Privacy Policy</Link></li>
              <li><Link to="/" className="text-gray-600 hover:text-forest">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-12 pt-8">
          <p className="text-center text-gray-600">
            &copy; {currentYear} FreightPro. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
