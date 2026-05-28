import type { ReactNode } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SurfaceCardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export default function SurfaceCard({
  title,
  description,
  children,
  className,
  contentClassName,
}: SurfaceCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      {(title || description) && (
        <CardHeader className="border-b border-border/60">
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className={cn(title || description ? "pt-6" : "pt-6", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
