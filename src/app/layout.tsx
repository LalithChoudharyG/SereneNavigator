import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Travel Safety & Health Advisor",
  description: "Personalized safety and health guidance by destination.",
};

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/destination", label: "Destination" },
  { href: "/plan", label: "Plan" },
  { href: "/about", label: "About" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header style={{ padding: "16px 24px", borderBottom: "1px solid #ddd" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <strong>Travel Advisor</strong>
            <nav style={{ display: "flex", gap: 12 }}>
              {navLinks.map((l) => (
                <Link key={l.href} href={l.href} style={{ textDecoration: "none" }}>
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main style={{ padding: 24 }}>{children}</main>

        <footer style={{ padding: "16px 24px", borderTop: "1px solid #ddd", opacity: 0.8 }}>
          © {new Date().getFullYear()} Travel Safety & Health Advisor
        </footer>
      </body>
    </html>
  );
}
