import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Iwill - Your Digital Last Laughs",
  description:
    "Find out what you've been willed before it's too late. Iwill — where your last wishes go viral.",
  openGraph: {
    title: "💀 Someone left you something in their Will",
    description:
      "Find out what you've been willed before it's too late. Iwill — where your last wishes go viral.",
    type: "website",
    siteName: "Iwill",
    url: "https://gotwilled.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "💀 Someone left you something in their Will",
    description:
      "Find out what you've been willed before it's too late. Iwill — where your last wishes go viral.",
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
