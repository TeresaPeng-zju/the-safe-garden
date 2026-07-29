import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "localhost:3000";
  const protocol = headerStore.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const socialImage = `${protocol}://${host}/og.png`;

  return {
    title: "The Safe Garden — Practice brave words together",
    description: "A gentle parent-and-child practice game for body boundaries, communication, and everyday safety.",
    openGraph: {
      title: "The Safe Garden",
      description: "Practice brave words together.",
      type: "website",
      images: [{ url: socialImage, width: 1200, height: 630, alt: "Little Fox and a puppy practicing together in The Safe Garden" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "The Safe Garden",
      description: "Practice brave words together.",
      images: [socialImage],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
