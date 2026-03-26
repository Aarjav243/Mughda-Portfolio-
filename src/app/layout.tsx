import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "@/visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import CustomCursor from "@/components/CustomCursor";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Mugdha Kinhikar | PhD Researcher in Economics",
  description:
    "Official academic portfolio of Mugdha Kinhikar — PhD Researcher at IFMR-GSB, Krea University. Specialising in Environmental Economics, Groundwater Governance, Institutional Analysis, and Public Policy.",
  keywords: [
    "Mugdha Kinhikar",
    "PhD Researcher Economics",
    "Environmental Economics",
    "Groundwater Governance",
    "Resource Economics",
    "Public Policy",
    "Applied Causal Inference",
    "Krea University",
    "IFMR-GSB",
    "Climate Adaptation Policy",
    "Colonial Origins Groundwater",
    "Impact Evaluation",
  ],
  authors: [{ name: "Mugdha Kinhikar" }],
  creator: "Mugdha Kinhikar",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://phd-mugdha-portfolio.vercel.app/",
    title: "Mugdha Kinhikar | PhD Researcher in Economics",
    description:
      "Official academic portfolio of Mugdha Kinhikar — PhD Researcher at IFMR-GSB, Krea University. Specialising in Environmental Economics and Groundwater Governance.",
    siteName: "Mugdha Kinhikar Portfolio",
    images: [
      {
        url: "https://phd-mugdha-portfolio.vercel.app/profile-photo.jpg",
        width: 1200,
        height: 630,
        alt: "Mugdha Kinhikar — PhD Researcher in Economics",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mugdha Kinhikar | PhD Researcher in Economics",
    description:
      "Official academic portfolio of Mugdha Kinhikar — PhD Researcher at IFMR-GSB, Krea University.",
    images: ["https://phd-mugdha-portfolio.vercel.app/profile-photo.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "N3AwhgHf0M2fyTSXqFjR3B6fbui5myI7ebeUfzCCkDQ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/locomotive-scroll@4.1.4/dist/locomotive-scroll.min.css"
        />
      </head>
      <body className="antialiased">
        <Script
          id="orchids-browser-logs"
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts/orchids-browser-logs.js"
          strategy="afterInteractive"
          data-orchids-project-id="17378af7-a5d6-429e-b7e8-078e5524e67d"
        />
        <ErrorReporter />
        <Script
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
          strategy="afterInteractive"
          data-target-origin="*"
          data-message-type="ROUTE_CHANGE"
          data-include-search-params="true"
          data-only-in-iframe="true"
          data-debug="true"
          data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
        />
        {children}
        <div className="noise-overlay" />
        <VisualEditsMessenger />
        <CustomCursor />
        {/* External libs loaded after content */}
        <Script
          src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://cdn.jsdelivr.net/npm/locomotive-scroll@4.1.4/dist/locomotive-scroll.min.js"
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}
