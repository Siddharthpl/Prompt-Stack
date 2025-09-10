"use client";
import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { LOGIN_MUTATION } from "@/lib/gql/auth";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { GoogleSignupButton } from "./googleAuth";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [login, { loading }] = useMutation(LOGIN_MUTATION);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!formData.email) {
      setErrors((prev) => ({ ...prev, email: "Email is required" }));
      return;
    }
    if (!formData.password) {
      setErrors((prev) => ({ ...prev, password: "Password is required" }));
      return;
    }
    try {
      const { data } = await login({
        variables: {
          email: formData.email,
          password: formData.password,
        },
      });
      if (data?.login?.token) {
        localStorage.setItem("token", data.login.token);
        document.cookie = `token=${data.login.token}; path=/; max-age=604800`;
        if (data.login.user && typeof data.login.user === "object") {
          localStorage.setItem("user", JSON.stringify(data.login.user));
        }
        toast("Login successful!", {
          description: "Welcome back to Prompt Stack.",
        });
        router.push("/dashboard");
      }
    } catch (err: any) {
      toast("Login failed", {
        description: err.message || "An error occurred during login.",
      });
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="bg-card border border-border shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-foreground">
            Welcome back
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Login with your Google account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid gap-6 ">
              <GoogleSignupButton />
              <div className=" relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
              <div className="grid gap-6 ">
                <div className="grid gap-2 ">
                  <Label htmlFor="email" className="text-foreground">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    className="bg-muted text-foreground border-border"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password" className="text-foreground">
                      Password
                    </Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    placeholder="********"
                    className="bg-muted text-foreground border-border"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.password}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    setFormData({
                      email: "siddharth@gmail.com",
                      password: "Siddharth@123",
                    })
                  }
                >
                  Use Test Credentials
                </Button>

                <Button
                  type="submit"
                  variant="ghost"
                  onClick={handleSubmit}
                  className="mt-2 w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={loading}
                >
                  {loading && <Loader2Icon className="animate-spin mr-2" />}
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </div>
              <div className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="underline underline-offset-4 text-primary hover:text-primary/50"
                >
                  Sign up
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
