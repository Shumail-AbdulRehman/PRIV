import * as React from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  type PressableProps,
  type ViewProps,
} from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { Icon, type LucideIconName } from "./icon";

const buttonVariants = cva(
  "flex-row items-center justify-center rounded-md gap-2 min-h-[44px] px-4 py-2",
  {
    variants: {
      variant: {
        default: "bg-primary",
        secondary: "bg-secondary",
        destructive: "bg-destructive",
        outline: "border border-input bg-background",
        ghost: "bg-transparent",
        link: "bg-transparent",
      },
      size: {
        default: "h-11",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const buttonTextVariants = cva("text-sm font-semibold", {
  variants: {
    variant: {
      default: "text-primary-foreground",
      secondary: "text-secondary-foreground",
      destructive: "text-destructive-foreground",
      outline: "text-foreground",
      ghost: "text-foreground",
      link: "text-primary",
    },
    size: {
      default: "text-sm",
      sm: "text-sm",
      lg: "text-base",
      icon: "text-sm",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface ButtonProps
  extends PressableProps,
    VariantProps<typeof buttonVariants> {
  children?: React.ReactNode;
  label?: string;
  loading?: boolean;
  iconLeft?: LucideIconName;
  iconRight?: LucideIconName;
}

const Button = React.forwardRef<View, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      children,
      label,
      loading,
      disabled,
      iconLeft,
      iconRight,
      ...props
    },
    ref
  ) => {
    const content = label ?? children;

    return (
      <Pressable
        ref={ref as any}
        disabled={disabled || loading}
        className={cn(
          buttonVariants({ variant, size }),
          (disabled || loading) && "opacity-50",
          className
        )}
        {...props}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === "default" ? "#FFFFFF" : "#18181B"}
          />
        ) : (
          <>
            {iconLeft ? (
              <Icon
                name={iconLeft}
                size={size === "icon" ? 18 : 16}
                className={cn(
                  "text-current",
                  variant === "default"
                    ? "text-primary-foreground"
                    : "text-foreground"
                )}
              />
            ) : null}
            {typeof content === "string" ? (
              <Text className={cn(buttonTextVariants({ variant, size }))}>
                {content}
              </Text>
            ) : (
              content
            )}
            {iconRight ? (
              <Icon
                name={iconRight}
                size={size === "icon" ? 18 : 16}
                className={cn(
                  "text-current",
                  variant === "default"
                    ? "text-primary-foreground"
                    : "text-foreground"
                )}
              />
            ) : null}
          </>
        )}
      </Pressable>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants, buttonTextVariants };
