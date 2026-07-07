import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import localFont from "next/font/local";
import { FaGithub, FaWhatsapp, FaInstagram } from "react-icons/fa";
import { AuthProvider } from "@/app/context/Authcontext";
import { CartProvider } from "@/app/context/Cartcontext";
import NavigationHeader from "@/app/components/NavigationHeader";

const scipio = localFont({
  src: "./fonts/Scipio-Regular-Exfontbff2.otf",
  variable: "--font-scipio",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "RevoShop",
  description: "Toko online RevoShop",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${scipio.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background m-0 p-0">
        <AuthProvider>
          <CartProvider>
            <NavigationHeader />
            <main className="flex-grow">{children}</main>
            <footer className="bg-container">
              <div className="flex justify-between px-8 py-4">
                <h2 className="font-scipio text-white text-xl md:text-3xl">RevoShop</h2>
                <ul className="flex justify-center items-center gap-4 list-none m-0 p-0">
                  <li>
                    <a href="https://github.com">
                      <FaGithub className="w-4 h-4 md:w-8 md:h-8 active:scale-95 transition transform text-teks hover:text-black"/>
                    </a>
                  </li>
                  <li>
                    <a href="">
                      <FaWhatsapp className="w-4 h-4 md:w-8 md:h-8 active:scale-95 transition transform text-teks hover:text-black"/>
                    </a>
                  </li>
                  <li>
                    <a href="https://instagram.com">
                      <FaInstagram className="w-4 h-4 md:w-8 md:h-8 active:scale-95 transition transform text-teks hover:text-black"/>
                    </a>
                  </li>
                </ul>
              </div>
              <hr className="text-white border-t border-white/10 m-0"/>
              <p className="text-xs md:text-sm text-center py-4 my-0 text-teks">© 2025 RevoShop. All rights reserved.</p>
            </footer>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}