import { cn } from "@/lib/utils";

type SpinnerSize = "small" | "default" | "large";

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  fullScreen?: boolean;
  overlay?: boolean;
  color?: string;
  thickness?: number;
}

const sizeMap: Record<SpinnerSize, string> = {
  small: "size-5",
  default: "size-10",
  large: "size-14",
};

const dotMap: Record<SpinnerSize, string> = {
  small: "size-1.5",
  default: "size-2",
  large: "size-2.5",
};

export default function LoadingSpinner({
  size = "default",
  fullScreen = false,
  overlay = false,
  color,
  thickness = 3,
}: LoadingSpinnerProps) {
  const spinnerColor = color ?? "var(--primary)";
  const trackColor = color ? `${color}24` : "color-mix(in oklab, var(--primary) 16%, white)";

  const Spinner = () => (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div
          className={cn("animate-spin rounded-full", sizeMap[size])}
          style={{
            borderWidth: thickness,
            borderStyle: "solid",
            borderColor: trackColor,
            borderTopColor: spinnerColor,
            borderRightColor: spinnerColor,
          }}
        />
        <div
          className={cn(
            "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--primary)]/12",
            dotMap[size],
          )}
          style={{ backgroundColor: color ?? undefined }}
        />
      </div>
      {!color && size !== "small" ? (
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
          Loading
        </p>
      ) : null}
    </div>
  );

  if (!fullScreen && !overlay) {
    return <Spinner />;
  }

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.08),transparent_28%),rgba(248,250,252,0.82)] px-4 backdrop-blur-md">
        <div className="flex min-w-[180px] flex-col items-center gap-4 rounded-[1.75rem] border border-white/80 bg-white/88 px-8 py-7 shadow-[0_30px_90px_-45px_rgba(15,23,42,0.35)]">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground">
            CO
          </div>
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[inherit] bg-background/70 backdrop-blur-sm">
      <div className="rounded-3xl border border-border/70 bg-card/92 px-6 py-5 shadow-[0_20px_60px_-36px_rgba(15,23,42,0.35)]">
        <Spinner />
      </div>
    </div>
  );
}
