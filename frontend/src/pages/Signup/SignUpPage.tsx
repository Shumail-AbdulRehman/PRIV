import { useLanguage } from "@/i18n/context";
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
  const {t}=useLanguage();
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
          (error as ApiError).response?.data?.message || "Account creation could not finish. Check your details and try again.",
        );
      },
    });
  };

  return (
    <AuthShell
      title={t("Create your workspace")}
      subtitle={t("Create your company owner account, then review the available plans.")}
      footer={
        <p>
          {t("Already have an account?")}{" "}
          <Link
            to="/login"
            className="font-medium text-primary hover:text-primary/80"
          >
            {t("Log in")}
          </Link>
        </p>
      }
    >
      {createManager.isSuccess && createManager.data.sessionEstablished === false ? (
        <div role="status" className="space-y-3">
          <p>{t("Account created. Sign in to continue.")}</p>
          <Button asChild><Link to="/login">{t("Sign in")}</Link></Button>
        </div>
      ) : <form onSubmit={handleSubmit(onSubmit)} aria-busy={createManager.isPending}>
        <div>
          <label
            htmlFor="name"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            {t("Full Name")}
          </label>
          <Input
            id="name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
            autoComplete="name"
            {...register("name", { required: "Name is required" })}
            placeholder={t("Your name")}
          />
          {errors.name && (
            <p
              id="name-error"
              role="alert"
              className="mt-1 text-xs text-destructive"
            >
              {t(errors.name.message??"Check this field.")}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="companyName"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            {t("Company Name")}
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
            placeholder={t("Your company")}
          />
          {errors.companyName && (
            <p
              id="companyName-error"
              role="alert"
              className="mt-1 text-xs text-destructive"
            >
              {t(errors.companyName.message??"Check this field.")}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            {t("Email")}
          </label>
          <Input
            type="email"
            dir="ltr"
            id="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            autoComplete="email"
            {...register("email", { required: "Email is required" })}
            placeholder="you@example.com"
          />
          {errors.email && (
            <p
              id="email-error"
              role="alert"
              className="mt-1 text-xs text-destructive"
            >
              {t(errors.email.message??"Check this field.")}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            {t("Password")}
          </label>
          <Input
            type="password"
            dir="ltr"
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
              className="mt-1 text-xs text-destructive"
            >
              {t(errors.password.message??"Check this field.")}
            </p>
          )}
        </div>

        {err && (
          <div
            role="alert"
            className="v5-auth-error"
          >
            {t(err)}
          </div>
        )}

        <Button
          type="submit"
          disabled={createManager.isPending}
          className="h-11 w-full rounded-lg"
        >
          {t(createManager.isPending ? "Creating…" : "Create account & choose plan")}
        </Button>
      </form>}
    </AuthShell>
  );
};

export default SignUp;
