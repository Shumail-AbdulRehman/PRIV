import { useForm } from "react-hook-form";
import { useCreateManager } from "./queries.js";
import { useState } from "react";
import type { SignUpForm } from "./types.js";
import { Link } from "react-router-dom";
import AuthShell from "@/components/common/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      onError: (error: any) => {
        setErr(error.response?.data?.message || "Something went wrong");
      },
    });
  };

  return (
    <AuthShell
      title="Create your workspace"
      subtitle="Set up your manager account and start organizing teams, locations, and recurring operational tasks."
      footer={
        <p>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:text-primary/80">
            Log in
          </Link>
        </p>
      }
    >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Full Name
            </label>
            <Input
              {...register("name", { required: "Name is required" })}
              placeholder="Alice Johnson"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Company Name
            </label>
            <Input
              {...register("companyName", {
                required: "Company Name is required",
              })}
              placeholder="Sparkle Clean Co."
            />
            {errors.companyName && (
              <p className="mt-1 text-xs text-red-500">
                {errors.companyName.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Email
            </label>
            <Input
              type="email"
              {...register("email", { required: "Email is required" })}
              placeholder="alice@company.com"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Password
            </label>
            <Input
              type="password"
              {...register("password", {
                required: "Password is required",
              })}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          {err && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {err}
            </div>
          )}

          <Button
            type="submit"
            disabled={createManager.isPending}
            className="h-11 w-full rounded-2xl"
          >
            {createManager.isPending ? "Creating..." : "Create account"}
          </Button>
        </form>
    </AuthShell>
  );
};

export default SignUp;
