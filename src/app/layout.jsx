import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "NimbusVault | Intelligent Cloud Storage & Time-Adaptive Vault",
  description: "Secure Cloud Storage with Time-Adaptive Gradients & Built-in AI Assistant",
};

import { ThemeProvider } from "@/components/providers/theme-provider"
import { TimeGradientProvider } from "@/components/providers/time-gradient-provider"
import { ToastProvider } from "@/components/ui/toast"
import { ChatWidget } from "@/components/chat-widget"

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TimeGradientProvider>
            <ToastProvider>
              {children}
              <ChatWidget />
            </ToastProvider>
          </TimeGradientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
