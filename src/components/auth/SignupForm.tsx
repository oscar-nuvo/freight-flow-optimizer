
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const signupSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters" }),
  companyName: z.string().min(2, { message: "Company name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character" }),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and privacy policy",
  }),
});

type SignupValues = z.infer<typeof signupSchema>;

export function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      companyName: "",
      email: "",
      password: "",
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: SignupValues) => {
    setIsLoading(true);
    
    try {
      // 1. Create the user with Supabase auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          },
        },
      });

      if (authError) throw authError;
      
      if (!authData.user) {
        throw new Error("User creation failed");
      }

      // 2. Create an organization for the user
      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .insert([{ name: data.companyName }])
        .select()
        .single();

      if (orgError) throw orgError;

      // 3. Link the user to the organization with admin role and primary flag
      const { error: membershipError } = await supabase
        .from("org_memberships")
        .insert([{
          user_id: authData.user.id,
          org_id: orgData.id,
          role: "admin",
          is_primary: true,
        }]);

      if (membershipError) throw membershipError;

      toast({
        title: "Account created",
        description: "Welcome to FreightPro! Your account has been created successfully.",
      });

      // Redirect to dashboard after successful signup
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Signup error:", error);
      
      toast({
        title: "Error",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
        <CardDescription>
          Get started with FreightPro in just a few steps
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Acme Inc."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-gray-500">
                    Must be at least 8 characters with one uppercase letter, number, and special character.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="acceptTerms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-2 space-y-0 pt-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-normal">
                      I agree to the{" "}
                      <Link to="/terms" className="text-forest hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link to="/privacy" className="text-forest hover:underline">
                        Privacy Policy
                      </Link>
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full bg-forest hover:bg-forest-600" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-forest hover:underline font-medium">
            Log in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
