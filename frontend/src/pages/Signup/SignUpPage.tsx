import { useForm } from "react-hook-form";
import { useCreateManager } from "./queries.js";
import { useState } from "react";
import type { SignUpForm } from "./types.js";
import { Link } from "react-router-dom";
import AuthShell from "@/components/common/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const SignUp = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SignUpForm>();
  const [err, setErr] = useState<string | null>(null);
  const createManager = useCreateManager();

  const onSubmit = (data: SignUpForm) => {
    setErr(null);
    createManager.mutate(data, {
      onSuccess: () => reset(),
      onError: (error: unknown) => {
        setErr(
          (error as ApiError).response?.data?.message || "Something went wrong",
        );
      },
    });
  };

  return (
    <AuthShell
      title="Create your workspace"
      subtitle="Step 1 of 2: create your account. Next, choose a plan to activate your workspace."
      footer={
        <p>
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-primary hover:text-primary/80"
          >
            Log in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Full Name
          </label>
          <Input
            id="name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
            autoComplete="name"
            {...register("name", { required: "Name is required" })}
            placeholder="Alice Johnson"
          />
          {errors.name && (
            <p
              id="name-error"
              role="alert"
              className="mt-1 text-xs text-red-500"
            >
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="companyName"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Company Name
          </label>
          <Input
            id="companyName"
            aria-invalid={!!errors.companyName}
            aria-describedby={
              errors.companyName ? "companyName-error" : undefined
            }
            autoComplete="organization"
            {...register("companyName", {
              required: "Company Name is required",
            })}
            placeholder="Sparkle Clean Co."
          />
          {errors.companyName && (
            <p
              id="companyName-error"
              role="alert"
              className="mt-1 text-xs text-red-500"
            >
              {errors.companyName.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Email
          </label>
          <Input
            type="email"
            id="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            autoComplete="email"
            {...register("email", { required: "Email is required" })}
            placeholder="alice@company.com"
          />
          {errors.email && (
            <p
              id="email-error"
              role="alert"
              className="mt-1 text-xs text-red-500"
            >
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Password
          </label>
          <Input
            type="password"
            id="password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
            autoComplete="new-password"
            {...register("password", {
              required: "Password is required",
            })}
            placeholder="••••••••"
          />
          {errors.password && (
            <p
              id="password-error"
              role="alert"
              className="mt-1 text-xs text-red-500"
            >
              {errors.password.message}
            </p>
          )}
        </div>

        {err && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            {err}
          </div>
        )}

        <Button
          type="submit"
          disabled={createManager.isPending}
          className="h-11 w-full rounded-lg"
        >
          {createManager.isPending
            ? "Creating..."
            : "Create account & choose plan"}
        </Button>
      </form>
    </AuthShell>
  );
};

export default SignUp;
