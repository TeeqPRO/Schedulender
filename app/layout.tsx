import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "schedulender — plan with clarity",
  description: "A simple calendar for focused days.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="en"><body>{children}</body></html>;
}
