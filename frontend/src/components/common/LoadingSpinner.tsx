import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/context";
import { useContext } from "react";
import { WorkspaceTheme } from "./WorkspaceTheme";

type SpinnerSize = "small" | "default" | "large";

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  fullScreen?: boolean;
  overlay?: boolean;
  color?: string;
  thickness?: number;
}

interface SpinnerGlyphProps {
  size: SpinnerSize;
  color?: string;
  thickness: number;
}

const sizeMap: Record<SpinnerSize, string> = {
  small: "size-5",
  default: "size-6",
  large: "size-8",
};

function SpinnerGlyph({ size, color, thickness }: SpinnerGlyphProps) {
  const { t } = useLanguage();
  const spinnerColor = color ?? "var(--primary)";
  const trackColor = color
    ? `${color}24`
    : "color-mix(in oklab, var(--primary) 16%, white)";

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-3 text-sm text-muted-foreground"
    >
      <div
        aria-hidden="true"
        className={cn(
          "shrink-0 animate-spin motion-reduce:animate-none rounded-full",
          sizeMap[size],
        )}
        style={{
          borderWidth: thickness,
          borderStyle: "solid",
          borderColor: trackColor,
          borderTopColor: spinnerColor,
        }}
      />
      <span className={color || size === "small" ? "sr-only" : undefined}>
        {t("Loading…")}
      </span>
    </div>
  );
}

export default function LoadingSpinner({
  size = "default",
  fullScreen = false,
  overlay = false,
  color,
  thickness = 3,
}: LoadingSpinnerProps) {
  const workspace = useContext(WorkspaceTheme);
  const { t } = useLanguage();
  if (workspace && fullScreen) {
    return (
      <div
        className="workspace-loading"
        role="status"
        aria-label={t("Loading…")}
      >
        <span className="sr-only">{t("Loading…")}</span>
        <div className="workspace-loading-title" />
        <div className="workspace-loading-metrics">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} />
          ))}
        </div>
        <div className="workspace-loading-table">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} />
          ))}
        </div>
      </div>
    );
  }
  if (!fullScreen && !overlay) {
    return <SpinnerGlyph size={size} color={color} thickness={thickness} />;
  }

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background px-4">
        <SpinnerGlyph size={size} color={color} thickness={thickness} />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[inherit] bg-background/90">
      <SpinnerGlyph size={size} color={color} thickness={thickness} />
    </div>
  );
}
