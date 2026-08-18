'use client'

import { createContext, useContext, useEffect, useReducer, useState, type ReactNode } from 'react'
import { cartReducer, getItemCount, getSubtotal, type CartItem } from '@/lib/cart'

const STORAGE_KEY = 'natch-cart'

interface CartContextValue {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clear: () => void
  subtotal: number
  itemCount: number
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(cartReducer, [])
  const [hydrated, setHydrated] = useState(false)

  // Cart lives in localStorage, so the server and the client's first render
  // must both show an empty cart to avoid a hydration mismatch — the real
  // contents are loaded here, after mount, then persisted on every change.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) dispatch({ type: 'hydrate', items: JSON.parse(raw) as CartItem[] })
    } catch {
      // Corrupt or inaccessible storage — start from an empty cart.
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items, hydrated])

  const value: CartContextValue = {
    items,
    addItem: (item, quantity = 1) => dispatch({ type: 'add', item, quantity }),
    removeItem: (productId) => dispatch({ type: 'remove', productId }),
    updateQuantity: (productId, quantity) => dispatch({ type: 'updateQuantity', productId, quantity }),
    clear: () => dispatch({ type: 'clear' }),
    subtotal: getSubtotal(items),
    itemCount: getItemCount(items),
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
