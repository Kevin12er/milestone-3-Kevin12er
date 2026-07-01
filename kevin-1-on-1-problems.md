# Kevin — Panduan Perbaikan 6 Masalah

---

## Masalah 1 — Role: User Bisa Akses Dashboard

### Akar Masalah

Cookie `revoshop_token` hanya menyimpan access token JWT — tidak ada info `role`. Jadi `proxy.js` tidak bisa membedakan admin dari user biasa.

### Solusi: Login via API Route + Session Cookie

Kita perlu 4 langkah:

---

**Langkah 1 — Buat `app/api/auth/login/route.js`**

```js
// app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // 1. Login ke escuelajs
    const loginRes = await fetch('https://api.escuelajs.co/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!loginRes.ok) {
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 });
    }

    const { access_token } = await loginRes.json();

    // 2. Ambil data profil (termasuk role)
    const profileRes = await fetch('https://api.escuelajs.co/api/v1/auth/profile', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const profile = await profileRes.json();

    // 3. Tentukan role — escuelajs pakai "admin" atau "customer"
    const role = profile.role === 'admin' ? 'admin' : 'user';

    const sessionData = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role,
      token: access_token,
    };

    // 4. Simpan ke httpOnly cookie (aman dari XSS)
    const cookieStore = await cookies();
    cookieStore.set('revoshop_session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 3 * 24 * 60 * 60,
    });

    return NextResponse.json(sessionData);
  } catch (err) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
```

---

**Langkah 2 — Buat `app/api/auth/logout/route.js`**

```js
// app/api/auth/logout/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set('revoshop_session', '', { maxAge: 0, path: '/' });
  return NextResponse.json({ success: true });
}
```

---

**Langkah 3 — Update `login/page.jsx`** (panggil API route, bukan escuelajs langsung)

```jsx
// Ganti bagian fetch di dalam berhasilLogin:
const berhasilLogin = async (data) => {
  setLoading(true);
  try {
    const res = await fetch('/api/auth/login', {        // ← panggil API route internal
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: data.email, password: data.password }),
    });

    if (!res.ok) throw new Error('Login gagal, cek email dan password kamu');

    const userData = await res.json();
    setUser(userData);                                  // { id, name, email, role, token }
    loginRouter.push('/');

  } catch (error) {
    alert(`ERROR: ${error.message}`);
  } finally {
    setLoading(false);
  }
};
```

---

**Langkah 4 — Update `AuthContext` dengan `logout` yang benar + rehydration**

```jsx
// app/context/Authcontext.jsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Rehydrate: cek apakah user masih login saat halaman di-refresh
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        }
      } catch {
        // session tidak ada, biarkan user = null
      }
    };
    checkSession();
  }, []);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
```

Kamu juga perlu buat endpoint `/api/auth/me` untuk cek session:

```js
// app/api/auth/me/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get('revoshop_session');
  if (!session) return NextResponse.json(null, { status: 401 });

  try {
    const userData = JSON.parse(session.value);
    return NextResponse.json(userData);
  } catch {
    return NextResponse.json(null, { status: 401 });
  }
}
```

---

**Langkah 5 — Ganti `src/middleware.jsx` → `src/proxy.js` dengan pengecekan role**

```js
// src/proxy.js  ← nama file harus proxy.js, bukan middleware.jsx
import { NextResponse } from 'next/server';

export function proxy(request) {           // ← nama fungsi harus proxy()
  const sessionCookie = request.cookies.get('revoshop_session');
  const { pathname } = request.nextUrl;

  // Belum login
  if (!sessionCookie) {
    if (['/dashboard', '/cart', '/checkout'].includes(pathname)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  const session = JSON.parse(sessionCookie.value);

  // Sudah login tapi buka halaman login → redirect ke home
  if (pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // User biasa mencoba buka dashboard → tolak
  if (pathname === '/dashboard' && session.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/dashboard', '/cart', '/checkout'],
};
```

---

**Langkah 6 — Update `NavigationHeader` di `layout.jsx` untuk pakai `logout` dari context**

```jsx
// Ganti bagian logout di NavigationHeader:
const { user, logout } = useAuth();

// Tombol Keluar:
<button onClick={logout} className="...">
  Keluar
</button>
```

---

## Masalah 2 — Tombol `+ Tambah` Redirect ke Cart

### Akar Masalah

```jsx
// SEBELUM — pakai <Link> yang langsung navigasi ke /cart
<Link onClick={() => addItem(product)} href="/cart" className="...">
  + Tambah
</Link>
```

### Solusi: Ganti ke `<button>` dengan animasi feedback

Buat komponen `AddToCartButton` baru di `page.jsx`:

```jsx
// Tambahkan komponen ini di atas fungsi Home()
function AddToCartButton({ product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleClick = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);     // reset setelah 1.5 detik
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-1 text-xs cursor-pointer border rounded-lg px-3 py-2 transition-all duration-200 whitespace-nowrap ${
        added
          ? 'bg-green-500/20 border-green-500/40 text-green-400 scale-95'
          : 'border-white/20 hover:bg-white/10 text-white'
      }`}
    >
      {added ? '✓ Ditambahkan!' : '+ Tambah'}
    </button>
  );
}
```

Lalu di dalam grid produk, ganti `<Link>` + Tambah dengan:

```jsx
// SESUDAH — pakai komponen AddToCartButton
<AddToCartButton product={product} />
```

Pastikan import `useState` sudah ada di bagian atas file.

---

## Masalah 3 — Tombol `-` di Cart Tidak Berfungsi

### Akar Masalah

`cart/page.jsx` memanggil `kurangiItem` dari context, tapi fungsi itu tidak pernah dibuat di `Cartcontext.jsx`.

### Solusi: Tambahkan `kurangiItem` ke CartContext

```jsx
// Tambahkan fungsi ini di dalam CartProvider, setelah hapusDariKeranjang:
const kurangiItem = (idProduk) => {
  const updateCart = cart
    .map((item) =>
      item.id === idProduk
        ? { ...item, quantity: item.quantity - 1 }
        : item
    )
    .filter((item) => item.quantity > 0);    // hapus otomatis kalau quantity jadi 0

  simpanKeStorage(updateCart);
};
```

Tambahkan `kurangiItem` ke `CartContext.Provider value`:

```jsx
// Sebelum:
<CartContext.Provider value={{ cart, addItem, hapusDariKeranjang, kosongkanKeranjang }}>

// Sesudah:
<CartContext.Provider value={{ cart, addItem, hapusDariKeranjang, kosongkanKeranjang, kurangiItem }}>
```

Setelah ini, tombol `-` di `cart/page.jsx` yang sudah ada langsung berfungsi karena kode-nya sudah benar — hanya fungsinya yang belum ada di context.

---

## Masalah 4 — Ikon Cart Tidak Hilang Setelah Checkout

### Akar Masalah

`checkout/page.jsx` saat ini hanya berisi `<h1>Checkout</h1>` dan tidak memanggil `kosongkanKeranjang()`. Jadi cart tidak pernah dikosongkan.

### Solusi: Implementasikan halaman Checkout yang memanggil kosongkanKeranjang

```jsx
// app/checkout/page.jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/app/context/Cartcontext';

export default function CheckoutPage() {
  const { cart, kosongkanKeranjang } = useCart();
  const router = useRouter();
  const [selesai, setSelesai] = useState(false);
  const [form, setForm] = useState({ nama: '', alamat: '', telepon: '' });

  const totalHarga = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const handleBayar = () => {
    // Validasi form
    if (!form.nama || !form.alamat || !form.telepon) {
      alert('Lengkapi semua data pengiriman dulu!');
      return;
    }

    // Kosongkan cart — ini yang membuat ikon cart jadi 0
    kosongkanKeranjang();
    setSelesai(true);
  };

  // Tampilan setelah checkout berhasil
  if (selesai) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-white p-8">
        <div className="text-6xl">✅</div>
        <h1 className="font-scipio text-3xl tracking-wide">PESANAN BERHASIL!</h1>
        <p className="text-sm text-white/60 text-center">
          Terima kasih sudah berbelanja di RevoShop. Pesanan kamu sedang diproses.
        </p>
        <Link
          href="/"
          className="border border-white/20 px-6 py-3 rounded-xl text-sm hover:bg-white/10 transition-colors"
        >
          Kembali Belanja
        </Link>
      </div>
    );
  }

  // Cart kosong
  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-white">
        <p className="text-white/60">Keranjang kamu kosong.</p>
        <Link href="/" className="border border-white/20 px-4 py-2 rounded-lg text-sm hover:bg-white/10">
          Mulai Belanja
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 text-white min-h-screen">
      <h1 className="font-scipio text-3xl mb-8">CHECKOUT</h1>

      {/* Ringkasan pesanan */}
      <div className="bg-(--container) border border-white/10 rounded-2xl p-6 mb-6 space-y-3">
        <h2 className="font-semibold text-sm uppercase tracking-wider mb-4">Ringkasan Pesanan</h2>
        {cart.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>{item.title} × {item.quantity}</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="border-t border-white/10 pt-3 flex justify-between font-bold">
          <span>Total</span>
          <span>${totalHarga.toFixed(2)}</span>
        </div>
      </div>

      {/* Form data pengiriman */}
      <div className="bg-(--container) border border-white/10 rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-sm uppercase tracking-wider mb-4">Data Pengiriman</h2>

        <div>
          <label className="text-xs text-white/60 block mb-1">Nama Lengkap</label>
          <input
            type="text"
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
            placeholder="John Doe"
            className="w-full bg-(--background) border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs text-white/60 block mb-1">Nomor Telepon</label>
          <input
            type="tel"
            value={form.telepon}
            onChange={(e) => setForm({ ...form, telepon: e.target.value })}
            placeholder="08xxxxxxxxxx"
            className="w-full bg-(--background) border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs text-white/60 block mb-1">Alamat Pengiriman</label>
          <textarea
            rows={3}
            value={form.alamat}
            onChange={(e) => setForm({ ...form, alamat: e.target.value })}
            placeholder="Jl. Contoh No. 1, Kota, Provinsi"
            className="w-full bg-(--background) border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none resize-none"
          />
        </div>

        <button
          onClick={handleBayar}
          className="w-full bg-white text-black font-bold py-3 rounded-xl text-sm hover:bg-white/90 transition-all mt-2"
        >
          BAYAR SEKARANG
        </button>
      </div>
    </div>
  );
}
```

---

## Masalah 5 — Ikon Cart Menampilkan Total Jumlah Produk, Bukan Total Jenis Produk

### Akar Masalah

Di `layout.jsx`:

```jsx
// SEBELUM — menjumlah semua quantity (misal: 3 apel + 2 jeruk = 5)
const totalItemDiKeranjang = cart ? cart.reduce((total, item) => total + item.quantity, 0) : 0;
```

### Solusi: Ganti ke `cart.length`

```jsx
// SESUDAH — menghitung jumlah jenis produk (misal: apel + jeruk = 2)
const totalItemDiKeranjang = cart ? cart.length : 0;
```

Satu baris perubahan — ganti `reduce(...)` dengan `.length`.

---

## Masalah 6 — Cart Tidak Dipisah per Akun User

### Akar Masalah

Semua user memakai kunci `localStorage` yang sama (`revoshop_cart`), sehingga cart tercampur antar akun.

### Solusi: Gunakan kunci dinamis `cart_${user.id}`

Karena `AuthProvider` membungkus `CartProvider` di `layout.jsx`, `CartContext` bisa menggunakan `useAuth()` langsung untuk mendapatkan `user.id`.

Update `Cartcontext.jsx` secara keseluruhan:

```jsx
// app/context/Cartcontext.jsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/app/context/Authcontext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);

  // Kunci storage unik per user — guest kalau belum login
  const storageKey = `revoshop_cart_${user?.id ?? 'guest'}`;

  // Load cart dari localStorage setiap kali storageKey berubah (login/logout)
  useEffect(() => {
    const tersimpan = localStorage.getItem(storageKey);
    setCart(tersimpan ? JSON.parse(tersimpan) : []);
  }, [storageKey]);               // ← bergantung pada storageKey, bukan []

  // Simpan ke localStorage pakai kunci yang sesuai
  const simpanKeStorage = (itemBaru) => {
    setCart(itemBaru);
    localStorage.setItem(storageKey, JSON.stringify(itemBaru));
  };

  const addItem = (produk) => {
    const produkAda = cart.find((item) => item.id === produk.id);
    if (produkAda) {
      const updateProduk = cart.map((item) =>
        item.id === produk.id ? { ...item, quantity: item.quantity + 1 } : item
      );
      simpanKeStorage(updateProduk);
    } else {
      simpanKeStorage([...cart, { ...produk, quantity: 1 }]);
    }
  };

  const hapusDariKeranjang = (idProduk) => {
    simpanKeStorage(cart.filter((item) => item.id !== idProduk));
  };

  const kurangiItem = (idProduk) => {
    const updateCart = cart
      .map((item) =>
        item.id === idProduk ? { ...item, quantity: item.quantity - 1 } : item
      )
      .filter((item) => item.quantity > 0);
    simpanKeStorage(updateCart);
  };

  const kosongkanKeranjang = () => {
    simpanKeStorage([]);
  };

  return (
    <CartContext.Provider value={{ cart, addItem, hapusDariKeranjang, kurangiItem, kosongkanKeranjang }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
```

### Cara Kerjanya

| Situasi | `storageKey` | Cart yang ditampilkan |
|---|---|---|
| Belum login | `revoshop_cart_guest` | Cart tamu |
| Login sebagai User A (id: 1) | `revoshop_cart_1` | Cart milik User A |
| Logout → Login sebagai User B (id: 5) | `revoshop_cart_5` | Cart milik User B |
| Logout | `revoshop_cart_guest` | Cart tamu (kosong) |

Setiap akun menyimpan cart-nya sendiri di localStorage. Kalau User A logout dan User B login, cart User A tidak hilang — hanya tersembunyi. Kalau User A login lagi, cart-nya kembali.

---

## Urutan Pengerjaan yang Disarankan

Kerjakan berurutan karena beberapa masalah saling bergantung:

```
Masalah 1 (Login API Route + proxy.js)
    ↓
Masalah 6 (Per-user cart — butuh user.id dari AuthContext yang sudah diperbaiki)
    ↓
Masalah 3 (kurangiItem — tambah ke CartContext yang sudah diupdate)
    ↓
Masalah 4 (Checkout page — pakai kosongkanKeranjang)
    ↓
Masalah 5 (cart.length — satu baris di layout.jsx)
    ↓
Masalah 2 (AddToCartButton — independent, bisa kapan saja)
```
