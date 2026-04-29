import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-outfit",
});

export const metadata = {
  title: "Catalog Students - Student Marketplace",
  description: "Marketplace produk terbaik untuk mahasiswa. Jual dan beli produk kreatif dengan mudah, aman, dan menyenangkan.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${inter.variable} ${outfit.variable}`}>
      <body style={{ fontFamily: "var(--font-inter), sans-serif", margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
