import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Art crawler",
  description: "주요 미술관·갤러리 전시 타임라인"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
