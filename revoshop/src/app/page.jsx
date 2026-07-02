"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from 'react';
import { useCart } from '@/app/context/Cartcontext'; 


export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();


  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('https://api.escuelajs.co/api/v1/products?offset=0&limit=24');

        if (!res.ok) {
          throw new Error(`Gagal mengambil data, status: ${res.status}`);
        }

        const data = await res.json();
        
        const cleanedData = data.map((item) => {
          let mainImage = "https://placehold.co/400x320";
          if (Array.isArray(item.images) && item.images.length > 0) {
            mainImage = item.images[0].replace(/[\[\]"']/g, "").trim();
          }
          return { ...item, cleanedImage: mainImage };
        });

        setProducts(cleanedData);
        setLoading(false);
      } catch (error) {
        console.log(`ERROR: ${error.message}`);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p className="text-(--teks) text-center text-sm md:text-2xl py-8">Halaman sedang dimuat...</p>;
  
  return (
    <main className="min-h-screen bg-(--background) flex flex-col items-center p-4 md:p-6 text-(--teks)">
      
      <div className="space-y-2 mb-8 text-center">
        <h1 className="font-scipio text-4xl tracking-tight">RevoShop</h1>
        <p className="text-(--teks) opacity-80 text-sm md:text-base">
          Jelajahi produk kami dan dapatkan diskon sebesar{" "}
          <span className="font-bold italic opacity-100">20%</span>
        </p>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 bg-(--container) p-4 md:p-8 rounded-2xl shadow-xl w-full border border-white/10">
        {products.map((product) => (
          <article
            key={product.id}
            className="bg-(--background) border border-white/10 rounded-2xl overflow-hidden flex flex-col h-full text-white"
          >
            

           <div className="relative w-full h-64 overflow-hidden bg-white/5">
              <Image
                    src={product.cleanedImage}
                    alt={product.title}
                    width={400}
                    height={256}
                    className="w-full h-full object-cover transition duration-300 hover:scale-105 cursor-pointer"
                    unoptimized 
              />
              <span className="absolute top-2 left-2 bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                    -20%
              </span>
          </div>

            <div className="flex flex-col flex-1 p-4 justify-between gap-3">
              <div>
                <h2 className="capitalize font-semibold text-sm md:text-base leading-snug line-clamp-2 min-h-[40px] md:min-h-[48px] text-white overflow-hidden text-ellipsis break-words">
                  {product.title}
                </h2>
                <p className="text-xs md:text-sm text-neutral-400 line-clamp-2 leading-relaxed mt-1 min-h-[36px] md:min-h-[40px] overflow-hidden text-ellipsis break-words">
                  {product.description}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 mt-auto bg-white/[0.01]">
              <div className="flex flex-col">
                <span className="font-semibold text-sm text-white">${product.price}</span>
              </div>

              <div className="flex gap-2">
                <Link 
                  href={`/products/${product.id}`} 
                  className="text-center text-xs cursor-pointer border border-white/20 rounded-lg px-3 py-2 hover:bg-white/10 transition-colors whitespace-nowrap text-white"
                >
                  Lihat Produk
                </Link>
                
                <button 
                    onClick={() => {
                    addItem(product)}} 
                    className="flex items-center gap-1 text-xs cursor-pointer border border-white/20 rounded-lg px-3 py-2 hover:bg-white/10 transition-colors whitespace-nowrap text-white"
                > + Tambah </button>
              </div>
            </div>

          </article>
        ))}
      </section>
    </main>
  );
}