import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "localhost:3000";
  const protocol = headerStore.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const socialImage = `${protocol}://${host}/og.png`;

  return {
    title: "The Safe Garden｜给自闭症孩子的边界练习花园",
    description: "从小树（化名）的真实需要出发：一段具体、视觉化、可重复、不评分的身体边界亲子练习。",
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "32x32" },
        { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
        { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      ],
      apple: [{ url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" }],
    },
    openGraph: {
      title: "The Safe Garden",
      description: "给自闭症孩子和家长的一段具体、视觉化、可重复、不评分的身体边界练习。",
      type: "website",
      images: [{ url: socialImage, width: 1200, height: 630, alt: "Little Fox and a puppy practicing together in The Safe Garden" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "The Safe Garden",
      description: "给自闭症孩子和家长的一段具体、视觉化、可重复、不评分的身体边界练习。",
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
