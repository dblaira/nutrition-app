"use client";

import { usePathname } from "next/navigation";
import { BottomTabBar } from "@/components/BottomTabBar";
import { PushPermissionPrompt } from "@/components/push-permission-prompt";
import { DebugOverlay } from "@/components/DebugOverlay";

export function RootChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideAppChrome = pathname.startsWith("/pitch");

  return (
    <>
      {children}
      {!hideAppChrome && <PushPermissionPrompt />}
      {!hideAppChrome && <BottomTabBar />}
      {!hideAppChrome && <DebugOverlay />}
    </>
  );
}
