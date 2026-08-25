import { View } from "react-native";
import { Skeleton } from "./ui/skeleton";

type LoadingStateProps = {
  fullScreen?: boolean;
  title?: string;
  message?: string;
};

export function LoadingState({ fullScreen = false }: LoadingStateProps) {
  return (
    <View
      className={
        fullScreen
          ? "flex-1 items-center justify-center px-5"
          : "items-center justify-center px-5 py-8"
      }
    >
      <View className="w-full max-w-sm gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
        <Skeleton className="h-6 w-3/5" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-2/3" />
        <View className="mt-2 gap-3">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </View>
      </View>
    </View>
  );
}
