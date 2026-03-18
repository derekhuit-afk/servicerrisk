import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "ServicerRisk — Mortgage Servicer Performance Intelligence",
  description: "Servicer risk scores built from CFPB complaint data, HMDA servicing transfers, and Ginnie Mae/Fannie Mae servicer perfor",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: "#0A0600", color: "#E8EAF0", fontFamily: "monospace", margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
