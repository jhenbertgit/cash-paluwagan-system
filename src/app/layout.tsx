import { ClerkProvider } from "@clerk/nextjs";
import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Paluwagan - Transparent Cash Management",
  description:
    "Modern and transparent Paluwagan system for organized fund management",
  icons: {
    icon: "/assets/images/logo-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: { colorPrimary: "#3B82F6" },
        elements: {
          formButtonPrimary: "btn-primary",
          card: "glass-card",
          headerTitle: "h3-bold",
          headerSubtitle: "p-16-semibold text-gray-600",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body
          className={cn(
            "min-h-screen bg-background antialiased",
            poppins.variable
          )}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
