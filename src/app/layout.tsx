import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { MotionProvider } from "@/components/motion";
import { ThemeProvider } from "@/components/theme";
import { themeScript } from "@/lib/theme";

const poppins = localFont({
  src: [
    { path: "./fonts/poppins-regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/poppins-medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/poppins-semibold.ttf", weight: "600", style: "normal" },
    { path: "./fonts/poppins-bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Perishables Black Box | Cold-chain audit workspace",
  description:
    "Evidence-first cold-chain auditing. Monitor cargo, understand thermal events, and prepare fair settlement recommendations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={poppins.variable}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <ThemeProvider>
          <MotionProvider>{children}</MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
