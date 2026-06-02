import type { Metadata } from "next";
import "@/app/globals.css";
import { AppStateProvider } from "@/components/app-state-provider";

export const metadata: Metadata = {
  title: "JEE Advanced Tracker",
  description: "Apple-inspired preparation tracker for serious JEE Advanced aspirants."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppStateProvider>{children}</AppStateProvider>
      </body>
    </html>
  );
}

