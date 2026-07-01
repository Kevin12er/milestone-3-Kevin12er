"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './Authcontext';

const CartContext = createContext();

export function CartProvider({children}) {
  const { user } = useAuth()
  const cartKey = user ? `revoshop_cart_${user.id}` : 'revoshop_cart_guest'
  
  const [cart, setCart] = useState([])

  useEffect(() => {
    const revoCart = localStorage.getItem(cartKey);
    if (revoCart) {
      setCart(JSON.parse(revoCart));
    } else {
      setCart([])
    }
  }, [user])

  const simpanKeStorage = (itemBaru) => {
    setCart(itemBaru);
    localStorage.setItem(cartKey, JSON.stringify(itemBaru));
  };

  const addItem = (produk) => {
    const produkisAvailable = cart.find((item) => item.id === produk.id);
    if (produkisAvailable) {
      const updateProduk = cart.map((item) => item.id === produk.id ? { ...item, quantity: item.quantity + 1 } : item);
      simpanKeStorage(updateProduk)
    } else {
      const updateCart = [...cart, {...produk, quantity: 1 }];
      simpanKeStorage(updateCart);
    }
  };

  const hapusDariKeranjang = (idProduk) => {
    const updateCart = cart.filter((item) => item.id !== idProduk);
    simpanKeStorage(updateCart);
  }

  const kurangiItem = (idProduk) => {
  const produk = cart.find((item) => item.id === idProduk)
    if (produk.quantity === 1) {
      hapusDariKeranjang(idProduk)
    } else {
    const updateCart = cart.map((item) => 
      item.id === idProduk ? {...item, quantity: item.quantity - 1} : item
    )
    simpanKeStorage(updateCart)
  }
}

  const kosongkanKeranjang = () => {
    simpanKeStorage([]);
  };

  return (
    <CartContext.Provider value={{cart, addItem, kurangiItem, hapusDariKeranjang, kosongkanKeranjang}}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}