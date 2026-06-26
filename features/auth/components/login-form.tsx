"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon, LogInIcon, AlertCircleIcon } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { loginSchema, type LoginSchemaInput } from "@/shared/validators";
import { ROUTES } from "@/shared/constants";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchemaInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await login(values);
      toast.success("Welcome back!");
      router.push(ROUTES.INVOICES);
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(message);
    }
  });

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="flex flex-col gap-5"
      aria-label="Sign in form"
    >
      {error ? (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Sign in failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="username">Email or username</Label>
        <Input
          id="username"
          type="text"
          autoComplete="username"
          placeholder="you@example.com"
          aria-invalid={errors.username ? "true" : "false"}
          aria-describedby={errors.username ? "username-error" : undefined}
          {...register("username")}
        />
        {errors.username ? (
          <p
            id="username-error"
            className="text-xs text-[#EF4444] dark:text-[#FCA5A5]"
          >
            {errors.username.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            href="#"
            className="text-sm font-medium font-heading text-[#1256E6] underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256E6]/30 dark:text-white/70 dark:hover:text-white dark:focus-visible:ring-white/30 rounded-sm"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            aria-invalid={errors.password ? "true" : "false"}
            aria-describedby={errors.password ? "password-error" : undefined}
            className="pr-11"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#94A3B8] transition-colors hover:text-[#334155] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256E6]/30 dark:text-white/40 dark:hover:text-white dark:focus-visible:ring-white/30 rounded-r-[10px]"
          >
            {showPassword ? (
              <EyeOffIcon className="size-4" />
            ) : (
              <EyeIcon className="size-4" />
            )}
          </button>
        </div>
        {errors.password ? (
          <p
            id="password-error"
            className="text-xs text-[#EF4444] dark:text-[#FCA5A5]"
          >
            {errors.password.message}
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        variant="gradient"
        size="default"
        disabled={isSubmitting}
        className="mt-1"
      >
        {isSubmitting ? (
          <span className="inline-flex items-center gap-2">
            <span
              aria-hidden="true"
              className="size-4 animate-spin rounded-full border-2 border-white/40 border-r-white"
            />
            Signing in…
          </span>
        ) : (
          <span className="inline-flex items-center gap-2">
            <LogInIcon className="size-4" />
            Sign in
          </span>
        )}
      </Button>
    </form>
  );
}