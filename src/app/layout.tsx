import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Honkai: Star Rail Gacha Simulator",
  description: "Faithful Warp simulator and statistical planner for Honkai: Star Rail.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090c15] text-slate-100 antialiased overflow-x-hidden selection:bg-amber-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
