import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "FleetCommand - Smart Fleet Management",
  description: "Modern fleet management platform for enterprise operations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="app-layout">
            <Sidebar />
            <div className="app-main">
              <Header />
              <main className="app-content">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
