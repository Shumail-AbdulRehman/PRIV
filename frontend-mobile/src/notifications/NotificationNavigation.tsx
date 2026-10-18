import { useEffect } from "react";
import { createNavigationContainerRef } from "@react-navigation/native";
import { useAuth } from "../auth/AuthContext";
import type { RootStackParamList } from "../types";
import { useNotifications } from "./NotificationProvider";
import { belongsToAccount, notificationDestination } from "./model";
import { acknowledgePhoneAlert } from "./api";
export const staffNavigation =
  createNavigationContainerRef<RootStackParamList>();
export function NotificationNavigation({ ready }: { ready: boolean }) {
  const { user, isBootstrapping } = useAuth(),
    { pending, consume } = useNotifications();
  useEffect(() => {
    if (
      !ready ||
      !staffNavigation.isReady() ||
      isBootstrapping ||
      !user ||
      !pending
    )
      return;
    if (!belongsToAccount(pending, user)) {
      consume();
      return;
    }
    staffNavigation.navigate("StaffTabs", {
      screen: notificationDestination(pending.kind),
    });
    void acknowledgePhoneAlert(pending.notificationId, `${user.companyId}_${user.id}`).catch(() => {});
    consume();
  }, [ready, isBootstrapping, user, pending, consume]);
  return null;
}
