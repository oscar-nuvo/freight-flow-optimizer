
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LoginForm } from "@/components/auth/LoginForm";

const Login = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-16 px-4 bg-gray-50">
        <div className="max-w-lg mx-auto">
          <LoginForm />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
