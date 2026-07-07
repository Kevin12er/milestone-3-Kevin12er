"use client";
import React from 'react';
import Link from "next/link";
import { useState } from 'react';
import { useAuth } from '@/app/context/Authcontext';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';


export default function RegisterPage() {


  const { register, handleSubmit } = useForm();
  const router = useRouter()

  const berhasilMasuk = async (info) => {


  if (info.password !== info.confirmPassword) {
    alert('password tidak cocok');
    return;
  }


  const dataKirim = {
    name: info.email.split('@')[0],
    email: info.email,
    password: info.password,
    avatar: 'https://i.imgur.com/yhW6Yw1.jpg'
  }



    try {

       const daftarAkun = await fetch(`https://api.escuelajs.co/api/v1/users/`, {
        method: 'POST',
        headers: {
                'Content-Type': 'application/json'},
        body: JSON.stringify(dataKirim)
      });

       if (!daftarAkun.ok) {
        throw new Error(`Register gagal, status: ${daftarAkun.status}`)
       };

       const masukKeAkun = await daftarAkun.json();
         router.push('/login')

    } catch (error) {
        alert(`Error: gagal mengirim data, ${error.message}`)
    }
  }



  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 md:p-6 shadow-4xl">
      <div className="bg-container p-6 md:p-8 rounded-3xl shadow-2xl max-w-md w-full border border-white/10">
        <h2 className="text-white font-scipio font-bold text-center tracking-wide mb-6 text-3xl">
          DAFTAR
        </h2>
        
        <form action="" className="space-y-5" onSubmit={handleSubmit(berhasilMasuk)}>

          <div>
            <label htmlFor="daftar-email" className="block text-white font-semibold uppercase text-xs tracking-widest mb-2">Email</label> 
            <input type="email" {...register('email')} id="daftar-email" placeholder="Masukkan Email anda" className="block w-full rounded-xl px-4 py-3 text-sm text-white bg-background focus:border-white/40 focus:outline-none border border-white/10" required/>
          </div>

          <div>
            <label htmlFor="password" className="block text-white font-semibold uppercase text-xs tracking-widest mb-2">Password</label>
            <input type="password" {...register('password')} id="password" placeholder="Masukkan password anda" className="block w-full rounded-xl px-4 py-3 text-sm text-white bg-background focus:border-white/40 focus:outline-none border border-white/10" required/>
          </div>

          <div>
            <label htmlFor="re-password" className="block text-white font-semibold uppercase text-xs tracking-widest mb-2">Konfirmasi Password</label>
            <input type="password" {...register('confirmPassword')} id="re-password" placeholder="Masukkan kembali password anda" className="block w-full rounded-xl px-4 py-3 text-sm text-white bg-background focus:border-white/40 focus:outline-none border border-white/10" required/>
          </div>

          <button 
            type="submit" 
            className="block font-scipio bg-background text-white font-medium py-3 rounded-xl mx-auto cursor-pointer active:scale-95 text-sm mt-6 hover:bg-teks hover:text-background transition-all duration-200 tracking-wider shadow-md w-[60%] md:w-[50%]"
          >
            Daftar
          </button>

        </form>

         <p className="text-center text-xs text-teks mt-6 font-sans">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-white font-semibold hover:underline">
            Masuk disini
          </Link>
        </p>

      </div>
    </div>
  );
}