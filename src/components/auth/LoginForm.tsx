
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginValues) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      toast({
        title: "Welcome back",
        description: "You have successfully logged in.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      
      toast({
        title: "Error",
        description: error.message || "Failed to log in. Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = () => {
    const email = form.getValues().email;
    
    if (!email || !z.string().email().safeParse(email).success) {
      toast({
        title: "Error",
        description: "Please enter a valid email address first.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
      .then(({ error }) => {
        if (error) throw error;
        
        toast({
          title: "Password reset email sent",
          description: "Check your email for a link to reset your password.",
        });
      })
      .catch((error) => {
        console.error("Password reset error:", error);
        
        toast({
          title: "Error",
          description: error.message || "Failed to send password reset email. Please try again.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Log in to your account</CardTitle>
        <CardDescription>
          Enter your email address and password to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="john@company.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-sm font-normal"
                      type="button"
                      onClick={handleResetPassword}
                      disabled={isLoading}
                    >
                      Forgot password?
                    </Button>
                  </div>
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full bg-forest hover:bg-forest-600" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in
                </>
              ) : (
                "Log in"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-center text-sm">
          Don't have an account?{" "}
          <Link to="/signup" className="text-forest hover:underline font-medium">
            Sign up
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
