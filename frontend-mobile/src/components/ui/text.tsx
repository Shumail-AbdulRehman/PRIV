import * as React from "react";
import { Text as RNText, Platform, type TextProps } from "react-native";
import { useLanguage } from "../../i18n/LanguageProvider";
import { translateText } from "../../i18n/translations";
import { cn } from "../../lib/utils";

const Text = React.forwardRef<RNText, TextProps>(
  ({ className, children, style, ...props }, ref) => {
    const { language, isRTL } = useLanguage();
    const content =
      typeof children === "string"
        ? translateText(children, language)
        : Array.isArray(children) &&
            children.every(
              (v) => typeof v === "string" || typeof v === "number",
            )
          ? translateText(children.join(""), language)
          : children;
    return (
      <RNText
        ref={ref}
        className={cn("text-foreground", className)}
        {...props}
        style={[
          {
            fontFamily: Platform.OS === "web" ? "system-ui, -apple-system, sans-serif" : Platform.OS === "android" ? "sans-serif" : "System",
            writingDirection: isRTL ? "rtl" : "ltr",
            textAlign: isRTL ? "right" : "left",
          },
          style,
        ]}
      >
        {content}
      </RNText>
    );
  },
);
Text.displayName = "Text";

export { Text };
