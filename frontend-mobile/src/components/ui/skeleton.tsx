import * as React from "react";
import { View, type ViewProps } from "react-native";
import { cn } from "../../lib/utils";

function Skeleton({ className, ...props }: ViewProps) {
  return (
    <View
      className={cn("bg-muted animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton };
