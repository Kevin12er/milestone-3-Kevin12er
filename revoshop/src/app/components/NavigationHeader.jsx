"use client";
import Link from "next/link";
import { FaShoppingCart } from "react-icons/fa";
import { useCart } from "@/app/context/Cartcontext";
import { useAuth } from "@/app/context/Authcontext";
import { useState, useEffect } from 'react';

export default function NavigationHeader() {
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const [sudahLogin, setSudahLogin] = useState(false);
  const totalItemDiKeranjang = cart ? cart.length : 0;

  useEffect(() => {
    if (user) {
      setSudahLogin(true);
    } else {
      setSudahLogin(false);
    }
  }, [user]);

  return (
    <header className="flex justify-between items-center bg-container p-8 shadow-2xl">
      <h1 className="text-xl md:text-4xl text-white font-scipio">
        <Link href="/">RevoShop</Link>
      </h1>
      <nav className="flex items-center gap-6">
        <ul className="flex justify-between items-center gap-6 text-white list-none m-0 p-0">
          <li className="relative p-2">
            <Link href="/cart" className="text-white flex items-center gap-2 no-underline hover:opacity-80 transition-opacity">
              <div className="relative">
                <FaShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                {totalItemDiKeranjang > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                    {totalItemDiKeranjang}
                  </span>
                )}
              </div>
              <span className="hidden md:inline font-sans text-xs">Keranjang</span>
            </Link>
          </li>
          {sudahLogin ? (
            <>
              <li className="cursor-pointer font-scipio border border-white/20 text-xs md:text-sm py-1 px-4 rounded-2xl hover:bg-white/10 transition-all">
                <Link href="/dashboard" className="text-white no-underline">Dashboard</Link>
              </li>
              <li className="cursor-pointer font-scipio bg-red-600 hover:bg-red-700 text-xs md:text-sm py-1 px-4 rounded-2xl transition-colors">
                <button onClick={logout} className="text-white bg-transparent border-none p-0 cursor-pointer font-scipio">
                  Keluar
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="cursor-pointer font-scipio bg-background text-xs md:text-sm py-1 px-4 rounded-2xl hover:bg-opacity-80 transition-all">
                <Link href="/login" className="text-white no-underline">Masuk</Link>
              </li>
              <li className="cursor-pointer font-scipio text-xs md:text-sm text-background bg-white px-4 py-1 rounded-2xl hover:bg-opacity-90 transition-all">
                <Link href="/register" className="text-background font-bold no-underline">Daftar</Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}