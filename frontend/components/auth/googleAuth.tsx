"use client";

import { GoogleLogin } from '@react-oauth/google';
import { toast } from "sonner";
import { useMutation } from "@apollo/client";
import { GOOGLE_AUTH_MUTATION } from "@/lib/gql/auth";
import { useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import { useState } from "react";

const avatarOptions = Array.from({ length: 10 }, (_, i) => `/avatars/avatar${i + 1}.svg`);

export function GoogleSignupButton() {
  const router = useRouter();
  const [googleAuth] = useMutation(GOOGLE_AUTH_MUTATION);
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (response: { credential?: string }) => {
    const idToken = response.credential;
    const randomAvatar = avatarOptions[Math.floor(Math.random() * avatarOptions.length)];

    if (!idToken) {
      toast.error("Google login failed: No credential returned.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await googleAuth({
        variables: {
          token: idToken,
          avatarUrl: randomAvatar,
        },
      });

      if (data?.googleAuth?.token) {
        localStorage.setItem("token", data.googleAuth.token);
        document.cookie = `token=${data.googleAuth.token}; path=/; max-age=604800`;
        localStorage.setItem("user", JSON.stringify(data.googleAuth.user));
        toast.success("Signed up with Google");
        router.push("/dashboard");
      } else {
        toast.error("Google signup failed: No token received");
      }
    } catch (err: any) {
      toast.error("Google sign-in failed", {
        description: err.message || "Could not authenticate with Google.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-center">
      {loading ? (
        <button
          className="w-full flex items-center justify-center gap-2 bg-muted text-foreground border border-border px-4 py-2 rounded-md cursor-not-allowed"
          disabled
        >
          <Loader2Icon className="w-4 h-4 animate-spin" />
          Signing in...
        </button>
      ) : (
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => toast.error("Google signin was canceled or failed.")}
          useOneTap={false}
          width="100%"
          theme="outline"
          size="large"
          text="continue_with"
        />
      )}
    </div>
  );
}

