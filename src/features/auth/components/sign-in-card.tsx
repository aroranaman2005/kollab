"use client";

import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { TriangleAlert } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SignInFlow } from "../types";

interface SignInCardProps {
  setState: (state: SignInFlow) => void;
}

export const SignInCard = ({ setState }: SignInCardProps) => {
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState("");

  const form = useForm({
    defaultValues: { email: "", password: "" },
  });

  const handlePasswordSignIn = form.handleSubmit(async ({ email, password }) => {
    setSigningIn(true);
    setError("");
    const result = await signIn("credentials", {
      email,
      password,
      flow: "signIn",
      redirect: false,
    });
    setSigningIn(false);
    if (result?.error) {
      setError("Invalid email or password");
    } else {
      window.location.href = "/";
    }
  });

  const handleProviderSignIn = (provider: "github" | "google") => () => {
    setSigningIn(true);
    signIn(provider, { callbackUrl: "/" });
  };

  return (
    <Card className="w-full h-full p-8">
      <CardHeader className="px-0 pt-0">
        <CardTitle>Login to continue</CardTitle>
        <CardDescription>Use your email or another service to continue</CardDescription>
      </CardHeader>
      {error && (
        <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive mb-6">
          <TriangleAlert className="size-4" />
          <p>{error}</p>
        </div>
      )}
      <CardContent className="space-y-5 px-0 pb-0">
        <form className="space-y-2.5" onSubmit={handlePasswordSignIn}>
          <Input {...form.register("email", { required: true })} disabled={signingIn} placeholder="Email" type="email" />
          <Input {...form.register("password", { required: true })} disabled={signingIn} placeholder="Password" type="password" />
          <Button type="submit" className="w-full" size="lg" disabled={signingIn}>
            Continue
          </Button>
        </form>
        <Separator />
        <div className="flex flex-col gap-y-2.5">
          <Button disabled={signingIn} onClick={handleProviderSignIn("google")} variant="outline" size="lg" className="w-full relative">
            <FcGoogle className="size-5 absolute top-3 left-2.5" />
            Continue with Google
          </Button>
          <Button disabled={signingIn} onClick={handleProviderSignIn("github")} variant="outline" size="lg" className="w-full relative">
            <FaGithub className="size-5 absolute top-3 left-2.5" />
            Continue with Github
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Don&apos;t have an account?{" "}
          <span className="text-sky-700 hover:underline cursor-pointer" onClick={() => setState("signUp")}>
            Sign up
          </span>
        </p>
      </CardContent>
    </Card>
  );
};
