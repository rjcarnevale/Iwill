import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Iwill - Your Digital Last Laughs",
  description:
    "Wills, drama, and questionable inheritance decisions. Welcome to Iwill.",
  openGraph: {
    title: "💀 Someone left you something in their Will",
    description:
      "Wills, drama, and questionable inheritance decisions. Welcome to Iwill.",
    type: "website",
    siteName: "Iwill",
    url: "https://gotwilled.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "💀 Someone left you something in their Will",
    description:
      "Wills, drama, and questionable inheritance decisions. Welcome to Iwill.",
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
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
