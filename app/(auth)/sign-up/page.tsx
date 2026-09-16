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
import { type RegisterFormValues, registerSchema } from "@/lib/validation/auth";

export default function SignUpPage() {
  const router = useRouter();
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setUser = useAuthStore((s) => s.setUser);
  const [formError, setFormError] = useState<string[] | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterFormValues) => {
    setFormError(null);
    try {
      const { accessToken } = await authApi.register(values);
      setAccessToken(accessToken);
      setUser(await usersApi.getMe());
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(
          err.code === "CONFLICT"
            ? ["An account with this email already exists."]
            : err.fieldMessages,
        );
      } else {
        setFormError(["Something went wrong. Please try again."]);
      }
    }
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-lg shadow-flat-soft">
      <h2 className="text-headline-lg text-on-surface mb-md">Create account</h2>

      {formError && (
        <ul className="mb-md rounded-lg border border-error bg-error-container px-sm py-sm text-body-sm text-on-error-container list-disc list-inside">
          {formError.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}

      <form className="space-y-md" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-2 gap-sm">
          <Input
            id="firstName"
            label="First name"
            autoComplete="given-name"
            error={errors.firstName?.message}
            {...register("firstName")}
          />
          <Input
            id="lastName"
            label="Last name"
            autoComplete="family-name"
            error={errors.lastName?.message}
            {...register("lastName")}
          />
        </div>
        <Input
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <Button type="submit" className="w-full mt-md" isLoading={isSubmitting}>
          Create account
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
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary-container font-semibold hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
