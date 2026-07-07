"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, use } from 'react';
import ProdukTerkait from "./produkterkait"


export default function PageId({params}) {

        const { id } = use(params);
        const [product, setProduct] = useState(null);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);

        useEffect(() => {

  const fetchData = async () => {


  try {

    // https://api.escuelajs.co/api/v1/products' ---> URL YANG BENAR

    const products = await fetch(`https://api.escuelajs.co/api/v1/products/${id}`);

    if (!products.ok) {
      throw new Error(`Gagal mengambil data, status: ${products.status}`)
    };

    const data = await products.json();
    setProduct(data);
    setLoading(false);

    }  catch (error) {
    console.log(`ERROR: ${error.message}`)
  }

  }

  fetchData()

}, [])


    if (error) return <p className="text-black font-bold text-center py-8"> {error} </p>
    if (loading) return <p className="text-(--teks) text-center text-sm md:text-2xl py-8">Memuat halaman...</p>
      
    return (

        <section className="shadow-lg relative flex flex-col md:flex-row items-center">

            <article className="bg-(--background) border border-white/10 rounded-2xl overflow-hidden flex flex-col md:flex-row gap-4 p-2 m-8  flex justify-center items-center">

                <figure className="">
                    <Image 
                      src={product.images[0]}
                      alt={product.title}
                      width={400}
                      height={160}
                      className="w-700 object-cover h-130"
                    />
                </figure> 


                <div className="flex flex-col  text-left">
                  <h1 className="capitalize font-semibold  leading-relaxed text-white font-scipio text-xl md:text-3xl">{product.title}</h1>
                  <h2 className="leading-relaxed text-(--teks) text-sm md:text-xl">{product.description}</h2>
                  <span className="text-xl text-(--teks)">Kategori: {product.category.name}</span>
                  <span className="text-xl font-semibold text-white">${product.price}</span>
                </div>

            </article>  

            <ProdukTerkait category={product.category.name} />
            <Link href="/" className="absolute bottom-10 right-10 md:bottom-5 md:right-30  text-(--teks) text-center text-xs cursor-pointer border border-white/20 rounded-lg px-3 py-2 hover:bg-white/10 transition-colors">Kembali</Link>

        </section>



)}
