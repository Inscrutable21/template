import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import { PersonalizationProvider } from "@/hooks/usePersonalization";
import { WebVitals } from "@/components/analytics/WebVitals";
import { HeatmapTracker } from "@/components/analytics/HeatmapTracker";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import PersonalizedUI from "@/components/PersonalizedUI";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "MyApp - Location Tracking Made Simple",
  description: "A simple application with user authentication and location tracking",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <AuthProvider>
          <PersonalizationProvider>
            <WebVitals />
            <HeatmapTracker />
            <PersonalizedUI />
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
          </PersonalizationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
