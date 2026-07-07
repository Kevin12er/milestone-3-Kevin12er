"use client";
import Link from "next/link";
import { useState } from 'react';
import { useAuth } from '@/app/context/Authcontext';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';


export default function LoginPage() {

  const { register, handleSubmit } = useForm();
  const loginRouter = useRouter();
  const { setUser } = useAuth()  

  const [isLoading, setLoading] = useState(false)


  const berhasilLogin = async (data) => {

  const infoKirim = {
    email: data.email,
    password: data.password,
  };

  setLoading(true)


  try {

    const dataRespon = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
                'Content-Type': 'application/json'},
      body: JSON.stringify(infoKirim)
    });

    if (!dataRespon.ok) {
      throw new Error(`Login bermasalah: status: ${dataRespon.status}`)
    };

    const hasilRespon = await dataRespon.json();
    setUser(hasilRespon)

    loginRouter.push('/')

  } catch (error) {
    alert(`ERROR: ${error.message}`)
    setLoading(false)
  }
}



  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 md:p-6 shadow-4xl">
      <div className="bg-container p-6 md:p-8 rounded-3xl shadow-2xl max-w-md w-full border border-white/10">
        
       
        <h2 className="font-scipio text-3xl font-bold text-white text-center mb-2 tracking-wide">
          MASUK
        </h2>
        <p className="text-center text-xs text-teks/80 mb-8 font-sans">
          Silakan masuk ke akun RevoShop Anda
        </p>

        <form className="space-y-5 font-sans" onSubmit={handleSubmit(berhasilLogin)}>
          <div>
            <label className="block text-xs font-semibold text-white mb-2 tracking-wide" htmlFor="email">
              EMAIL
            </label>
            <input 
              type="email" 
              {...register('email')}
              placeholder="Masukkan email anda" 
              className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-teks/40 focus:outline-none focus:border-white/40 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white mb-2 tracking-wide"> {/*disini saya pakai block karena label itu bersifat inline supaya input baru auto kebawah*/}
              KATA SANDI
            </label>
            <input 
              type="password" 
              {...register('password')}
              placeholder="••••••••" 
              className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-teks/40 focus:outline-none focus:border-white/40 transition-colors"
              required
            />
          </div>

          <button 
            type="submit" 
            className="block font-scipio bg-background text-white font-medium py-3 rounded-xl mx-auto cursor-pointer active:scale-95 text-sm mt-6 hover:bg-opacity-80 transition-all duration-200 tracking-wider shadow-md w-[60%] md:w-[50%]"
          >
            MASUK SEKARANG
          </button>
        </form>

        
        <p className="text-center text-xs text-teks mt-6 font-sans">
          Belum punya akun?{" "}
          <Link href="/register" className="text-white font-semibold hover:underline">
            Daftar disini
          </Link>
        </p>

      </div>
    </div>
  );
}