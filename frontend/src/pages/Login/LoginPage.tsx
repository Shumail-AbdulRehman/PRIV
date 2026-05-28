import { useForm } from "react-hook-form";
import type { LoginForm } from "./types";
import { useState } from "react";
import { useLogin } from "./queries";
import { Link } from "react-router-dom";
import AuthShell from "@/components/common/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Login = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginForm>();
  const [err, setErr] = useState<string | null>(null);
  const login = useLogin();

  const onSubmit = (data: LoginForm) => {
    setErr(null);
    login.mutate(data, {
      onSuccess: () => reset(),
      onError: (error: any) => {
        setErr(error.response?.data?.message || "Something went wrong");
      },
    });
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to monitor locations, review attendance, and keep work flowing without noise."
      footer={
        <p>
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="font-medium text-primary hover:text-primary/80">
            Sign up
          </Link>
        </p>
      }
    >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Email
            </label>
            <Input
              type="email"
              {...register("email", { required: "Email is required" })}
              placeholder="alice@sparkleclean.com"
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
              {...register("password", { required: "Password is required" })}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Role
            </label>
            <select
              {...register("role", { required: "Please select a role" })}
              className="flex h-11 w-full rounded-2xl border border-border/80 bg-background/90 px-4 py-2 text-sm shadow-xs outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
            >
              <option value="">Select role</option>
              <option value="Manager">Manager</option>
              <option value="Staff">Staff</option>
            </select>
            {errors.role && (
              <p className="mt-1 text-xs text-red-500">
                {errors.role.message}
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
            disabled={login.isPending}
            className="h-11 w-full rounded-2xl"
          >
            {login.isPending ? "Signing in..." : "Sign in"}
          </Button>
        </form>
    </AuthShell>
  );
};

export default Login;
