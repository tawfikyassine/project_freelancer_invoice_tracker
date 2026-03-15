import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "InvoiceFlow — Stop Chasing Payments",
  description:
    "InvoiceFlow helps freelancers create beautiful invoices, track payment status in real-time, and get paid faster. Try for free today.",
  openGraph: {
    title: "InvoiceFlow — Stop Chasing Payments",
    description: "Create, send, and track invoices like a pro. Built for freelancers.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
