"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as authApi from "@/lib/api/auth";
import {
  type ForgotPasswordFormValues,
  forgotPasswordSchema,
} from "@/lib/validation/reset-password";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    // Backend always returns the same message regardless of whether the email
    // exists, so we don't need to branch on success/failure here.
    await authApi.forgotPassword(values.email).catch(() => {});
    setSent(true);
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-lg shadow-flat-soft">
      <h2 className="text-headline-lg text-on-surface mb-md">
        Reset your password
      </h2>

      {sent ? (
        <p className="text-body-md text-on-surface-variant">
          If that email exists, we&apos;ve sent a link to reset your password.
        </p>
      ) : (
        <form
          className="space-y-md"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <Input
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <Button
            type="submit"
            className="w-full mt-md"
            isLoading={isSubmitting}
          >
            Send reset link
          </Button>
        </form>
      )}

      <div className="text-center mt-md">
        <Link
          href="/login"
          className="text-body-sm text-primary-container hover:underline"
        >
          Back to log in
        </Link>
      </div>
    </div>
  );
}
