import * as React from "react";
import { useEffect, useRef } from "react";
import { Animated, type ViewProps } from "react-native";
import { cn } from "../../lib/utils";

function Skeleton({ className, ...props }: ViewProps) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => {
      animation.stop();
    };
  }, [opacity]);

  return (
    <Animated.View
      className={cn("bg-muted rounded-md", className)}
      style={{ opacity }}
      {...props}
    />
  );
}

export { Skeleton };
