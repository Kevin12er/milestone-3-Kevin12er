"use client";
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  // Load user dari localStorage saat pertama kali
  useEffect(() => {
    const savedUser = localStorage.getItem('revoshop_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  // Simpan user ke localStorage setiap kali berubah
  const loginUser = (userData) => {
    setUser(userData)
    localStorage.setItem('revoshop_user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('revoshop_user')
    document.cookie = "revoshop_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loginUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}