"use client";
import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { SIGNUP_MUTATION } from "@/lib/gql/auth";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react"
import { useRouter } from "next/navigation";
import { GoogleSignupButton } from "./googleAuth";

// Validation utilities
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): { isValid: boolean; strength: number; feedback: string[] } => {
  const feedback: string[] = [];
  let strength = 0;

  if (password.length >= 8) strength += 1;
  else feedback.push("At least 8 characters");

  if (/[A-Z]/.test(password)) strength += 1;
  else feedback.push("One uppercase letter");

  if (/[a-z]/.test(password)) strength += 1;
  else feedback.push("One lowercase letter");

  if (/\d/.test(password)) strength += 1;
  else feedback.push("One number");

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;
  else feedback.push("One special character");

  return {
    isValid: strength >= 3,
    strength: (strength / 5) * 100,
    feedback,
  };
};

export function SignUpForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    avatarUrl: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const passwordValidation = validatePassword(formData.password);

  // Apollo mutation
  const [signup, { loading }] = useMutation(SIGNUP_MUTATION);


  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!passwordValidation.isValid) {
      newErrors.password = "Password does not meet requirements";
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  //avatar options
  const avatarOptions = Array.from({ length: 10 }, (_, i) =>
  `/avatars/avatar${i + 1}.svg`
);


 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validateForm()) return;

  const randomAvatar = avatarOptions[Math.floor(Math.random() * avatarOptions.length)];

  try {
    const { data } = await signup({
      variables: {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        avatarUrl: randomAvatar,
      },
    });

    if (data?.signup?.token) {
      localStorage.setItem("token", data.signup.token);
      toast("Registration successful!", {
        description: "Welcome to Prompt Stack. You can now start creating and sharing prompts.",
      });
      router.push("/dashboard");
    }
  } catch (err: any) {
    toast("Registration failed", {
      description: err.message || "An error occurred during registration.",
    });
  }
};



  const getPasswordStrengthColor = (strength: number) => {
    if (strength < 40) return "bg-red-500";
    if (strength < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = (strength: number) => {
    if (strength < 40) return "Weak";
    if (strength < 70) return "Medium";
    return "Strong";
  };

  


  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="bg-card border border-border shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-foreground">Welcome</CardTitle>
          <CardDescription className="text-muted-foreground">Continue with your Google account</CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <GoogleSignupButton />
              </div>
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-foreground">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className={errors.name ? "border-red-500 bg-muted text-foreground" : "bg-muted text-foreground"}
                    placeholder="Jhon Doe"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className={errors.email ? "border-red-500 bg-muted text-foreground" : "bg-muted text-foreground"}
                    placeholder="m@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password" className="text-foreground">Password</Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className={errors.password ? "border-red-500 bg-muted text-foreground" : "bg-muted text-foreground"}
                    placeholder="********"
                  />
                </div>
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Password strength</span>
                      <span
                        className={`font-medium ${
                          passwordValidation.strength < 40
                            ? "text-red-600"
                            : passwordValidation.strength < 70
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        {getPasswordStrengthText(passwordValidation.strength)}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(
                          passwordValidation.strength
                        )}`}
                        style={{ width: `${passwordValidation.strength}%` }}
                      />
                    </div>
                    {passwordValidation.feedback.length > 0 && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        Missing: {passwordValidation.feedback.join(", ")}
                      </div>
                    )}
                  </div>
                )}

                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}

                <Button
                  type="submit"
                  onClick={handleSubmit}
                  variant="ghost"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-background"
                >
                  {loading && <Loader2Icon className="animate-spin mr-2" />}
                  Register
                </Button>
              </div>
              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="underline underline-offset-4 text-primary hover:text-primary/50">
                  Login
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}