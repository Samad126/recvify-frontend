"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { GoogleButton } from "@/components/auth/google-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as authApi from "@/lib/api/auth";
import { ApiError } from "@/lib/api/http";
import * as usersApi from "@/lib/api/users";
import { useAuthStore } from "@/lib/store/auth-store";
import { type LoginFormValues, loginSchema } from "@/lib/validation/auth";

export default function LoginPage() {
  const router = useRouter();
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setUser = useAuthStore((s) => s.setUser);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null);
    try {
      const { accessToken } = await authApi.login(values);
      setAccessToken(accessToken);
      setUser(await usersApi.getMe());
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(
          err.code === "UNAUTHORIZED"
            ? "Incorrect email or password."
            : err.message,
        );
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-lg shadow-flat-soft">
      <h2 className="text-headline-lg text-on-surface mb-md">Log in</h2>

      {formError && (
        <p className="mb-md rounded-lg border border-error bg-error-container px-sm py-sm text-body-sm text-on-error-container">
          {formError}
        </p>
      )}

      <form className="space-y-md" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <div>
          <Input
            id="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />
          <div className="text-right mt-xs">
            <Link
              href="/forgot-password"
              className="text-body-sm text-primary-container hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>
        <Button type="submit" className="w-full mt-md" isLoading={isSubmitting}>
          Log in
        </Button>
      </form>

      <div className="my-md flex items-center">
        <div className="grow border-t border-outline-variant" />
        <span className="px-sm text-body-sm text-on-surface-variant">or</span>
        <div className="grow border-t border-outline-variant" />
      </div>

      <GoogleButton />

      <div className="text-center mt-md">
        <p className="text-body-sm text-on-surface-variant">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="text-primary-container font-semibold hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
