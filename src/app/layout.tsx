import type { Metadata } from "next";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "DTOT Prep — Diplomatic Technology Officer Test",
  description:
    "Timed practice tests, auto-graded quizzes, STAR-L narrative practice, and a readiness dashboard for the Diplomatic Technology Officer Test (DTOT).",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="gov-stripe h-1.5 w-full" />
        <Nav user={user ? { id: user.id, name: user.name } : null} />
        <main className="container py-8">{children}</main>
        <footer className="border-t py-6 text-center text-xs text-muted-foreground">
          DTOT Prep · An independent study &amp; practice tool · Not affiliated
          with any government agency
        </footer>
      </body>
    </html>
  );
}
