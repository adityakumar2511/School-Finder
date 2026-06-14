import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "School admin sign in",
  robots: { index: false, follow: false },
};

export default function SchoolLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
