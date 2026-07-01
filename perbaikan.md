useEffect() with fetch API for client-side fetching — ❌ Not Pass: Data produk berasal dari file statis app/data/data.jsx — array JavaScript berisi produk Revou branded (buku,  tas,  jaket,  sepatu) dengan gambar lokal. Tidak ada useEffect dengan fetch ke FakeStoreAPI atau API eksternal lainnya untuk produk. Requirement menyebut "Fetch products and users from FakeStoreAPI" — tidak diimplementasikan.

Auth login menggunakan fetch ke Platzi API di login/page.jsx,  namun ini untuk auth bukan product fetching.

Handles loading states properly — ⚠️ Pass dengan Catatan: Dashboard page (dashboard/page.jsx) mengimplementasikan loading state. Namun karena produk dari data statis,  loading state tidak memiliki efek yang berarti pada produk. Untuk halaman login,  tidak ada loading state saat proses fetch berlangsung.

Handles API errors properly — ⚠️ Pass dengan Catatan: Dashboard page menggunakan try/catch dan console.error. Login menggunakan try/catch dengan alert() untuk error. Namun karena data produk statis,  tidak ada error handling yang relevan untuk product fetching.



===================



API routes for product management (GET,  POST,  PUT,  DELETE) — ❌ Not Pass: Tidak ada folder api/ di seluruh project. Tidak ada API Routes untuk operasi produk.

Dashboard page (dashboard/page.jsx) mengimplementasikan form CRUD dengan tanganiSubmit,  namun semua fetch URL salah — menggunakan 'https://escuelajs.co' (tanpa /api/v1/products) yang merupakan URL yang tidak valid. Semua operasi PUT,  POST,  dan DELETE di dashboard akan gagal silently karena URL endpoint yang keliru.

Ensures secure handling of API requests and responses — ❌ Not Pass: Tidak ada API Routes yang bisa dinilai.

Uses form validation to prevent invalid submissions — ⚠️ Pass dengan Catatan: Dashboard form memvalidasi field kosong dengan alert('Semua kolom formulir wajib diisi!') sebelum submit. Login menggunakan react-hook-form. Namun validasi hanya di level "field tidak boleh kosong" — tidak ada validasi format atau batasan nilai.

Updates UI dynamically when CRUD actions are performed — ⚠️ Pass dengan Catatan: Secara struktural,  kode update state sudah ada — setProducts(products.map(...)) untuk edit,  setProducts([newProduct,  ...products]) untuk create. Namun karena URL API salah,  operasi ini tidak pernah berhasil di praktik. Logika UI update-nya benar,  eksekusinya tidak.



</->MOCK data (admin); ---> dashboard, CRUD
- ROLE Dipisah (kalau user yang login, halaman dashboard tidak ditamppilkan, kalau admin yang login dashboard tampil, (produk sama cart tidak wajib))
- klik tambah produk itu jangan redirect ke cart cukup gambar cartnya aja yang menapilkan angka produk
- tombol minus di cart perbaiki
- halaman checkout (ketika dklik, angka yang ada dicart menghilang)
- angka dicart itu bukan quantity dari barang yang dipesan 
- keranjang tidak terupdate walau sudah login dengan akun yang berbeda 

