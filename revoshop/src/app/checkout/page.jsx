"use client";
import { useCart } from '@/app/context/Cartcontext';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { cart, kosongkanKeranjang } = useCart();
  const router = useRouter();

  const totalHarga = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const handleCheckout = () => {
    kosongkanKeranjang();
    router.push('/');
    alert('Pesanan berhasil! Terima kasih telah berbelanja di RevoShop');
  };

  return (
    <div className="max-w-2xl mx-auto p-6 text-white min-h-[80vh]">
      <h1 className="text-3xl font-bold mb-8 font-scipio">CHECKOUT</h1>
      
      <div className="bg-(--container) p-6 rounded-2xl border border-white/10 space-y-4 mb-6">
        <h2 className="font-semibold text-lg border-b border-white/10 pb-3">Ringkasan Pesanan</h2>
        {cart.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>{item.title} x{item.quantity}</span>
            <span>${item.price * item.quantity}</span>
          </div>
        ))}
        <div className="flex justify-between font-bold border-t border-white/10 pt-3">
          <span>Total</span>
          <span>${totalHarga}</span>
        </div>
      </div>

      <button
        onClick={handleCheckout}
        className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-opacity-90 active:scale-95 transition-all text-sm tracking-wider"
      >
        KONFIRMASI PESANAN
      </button>
    </div>
  );
}