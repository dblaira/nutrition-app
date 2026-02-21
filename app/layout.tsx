import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { BottomTabBar } from "@/components/BottomTabBar";
import { PushNotificationProvider } from "@/components/push-notification-provider";
import { PushPermissionPrompt } from "@/components/push-permission-prompt";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Nutrition Tracker",
  description: "Smart nutrition and supplement tracking",
  viewport: {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
  },
  themeColor: "#F2C744",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-background text-foreground`}
      >
        <PushNotificationProvider>
          {children}
          <PushPermissionPrompt />
          <BottomTabBar />
        </PushNotificationProvider>
      </body>
    </html>
  );
}
