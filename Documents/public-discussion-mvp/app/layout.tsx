import type { Metadata } from "next";
import { IBM_Plex_Mono, Outfit } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Infection Repurposing Explorer",
  description:
    "Clinician-centered exploration workspace for severe infection repurposing hypotheses, host-response evidence, and safety-aware review.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[color:var(--color-background)] text-[color:var(--color-foreground)]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
