import { useLanguage } from "../../i18n/LanguageProvider";
import * as React from "react";
import { TextInput, View, type TextInputProps } from "react-native";
import { Icon, type LucideIconName } from "./icon";
import { cn } from "../../lib/utils";

export interface InputProps extends TextInputProps {
  iconLeft?: LucideIconName;
  iconRight?: LucideIconName;
  containerClassName?: string;
}

const Input = React.forwardRef<TextInput, InputProps>(
  ({ className, containerClassName, iconLeft, iconRight, ...props }, ref) => {
    const { isRTL } = useLanguage();
    return (
      <View
        style={{ flexDirection: isRTL ? "row-reverse" : "row" }}
        className={cn(
          "flex-row items-center rounded-md border border-input bg-background px-3",
          containerClassName,
        )}
      >
        {iconLeft ? (
          <Icon
            name={iconLeft}
            size={18}
            className="mr-2 text-muted-foreground"
          />
        ) : null}
        <TextInput
          ref={ref}
          className={cn(
            "flex-1 min-h-[52px] py-2.5 text-base text-foreground",
            className,
          )}
          placeholderTextColor="#71717A"
          {...props}
          style={[
            {
              textAlign:
                props.keyboardType === "email-address" ||
                props.keyboardType === "url"
                  ? "left"
                  : isRTL
                    ? "right"
                    : "left",
              writingDirection:
                props.keyboardType === "email-address" ||
                props.keyboardType === "url"
                  ? "ltr"
                  : isRTL
                    ? "rtl"
                    : "ltr",
            },
            props.style,
          ]}
        />
        {iconRight ? (
          <Icon
            name={iconRight}
            size={18}
            className="ml-2 text-muted-foreground"
          />
        ) : null}
      </View>
    );
  },
);
Input.displayName = "Input";

export { Input };
