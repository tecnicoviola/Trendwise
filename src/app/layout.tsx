import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/data/store";
import { ThemeProvider } from "@/lib/theme";
import { ShellLayout } from "@/components/layout/ShellLayout";

export const metadata: Metadata = {
  title: "TRENDWISE — Fashion Intelligence & Trend Forecasting",
  description:
    "First-semester end-term fashion trend-intelligence prototype at NIFT. Comparing consumer search interest and retail fashion audits for 5 colour trends in India.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-canvas text-editorial-text antialiased min-h-screen">
        <ThemeProvider>
          <StoreProvider>
            <ShellLayout>{children}</ShellLayout>
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
