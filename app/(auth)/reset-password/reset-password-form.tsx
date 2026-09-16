"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as authApi from "@/lib/api/auth";
import { ApiError } from "@/lib/api/http";
import {
  type ResetPasswordFormValues,
  resetPasswordSchema,
} from "@/lib/validation/reset-password";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const token = searchParams.get("token");
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  if (!userId || !token) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-lg shadow-flat-soft">
        <p className="text-body-md text-on-surface-variant">
          This reset link is missing or invalid. Request a new one from the{" "}
          <Link
            href="/forgot-password"
            className="text-primary-container hover:underline"
          >
            forgot password
          </Link>{" "}
          page.
        </p>
      </div>
    );
  }

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setFormError(null);
    try {
      await authApi.resetPassword({
        userId,
        token,
        newPassword: values.newPassword,
      });
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? "This reset link is invalid or has expired."
          : "Something went wrong. Please try again.",
      );
    }
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-lg shadow-flat-soft">
      <h2 className="text-headline-lg text-on-surface mb-md">
        Set a new password
      </h2>

      {done ? (
        <p className="text-body-md text-on-surface-variant">
          Password updated. Redirecting you to log in…
        </p>
      ) : (
        <>
          {formError && (
            <p className="mb-md rounded-lg border border-error bg-error-container px-sm py-sm text-body-sm text-on-error-container">
              {formError}
            </p>
          )}
          <form
            className="space-y-md"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <Input
              id="newPassword"
              label="New password"
              type="password"
              autoComplete="new-password"
              error={errors.newPassword?.message}
              {...register("newPassword")}
            />
            <Button
              type="submit"
              className="w-full mt-md"
              isLoading={isSubmitting}
            >
              Update password
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
