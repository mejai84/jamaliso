
"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import type { Product } from "@/lib/data"

export type CartItem = Product & {
    quantity: number
    uniqueId: string
    restaurantId: string
}

type CartContextType = {
    items: CartItem[]
    restaurantId: string | null
    addItem: (product: Product, restaurantId: string) => void
    removeItem: (uniqueId: string) => void
    updateQuantity: (uniqueId: string, quantity: number) => void
    clearCart: () => void
    cartCount: number
    cartTotal: number
    isCartOpen: boolean
    toggleCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])
    const [restaurantId, setRestaurantId] = useState<string | null>(null)
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [isMounted, setIsMounted] = useState(false)

    // Persistir en localStorage
    useEffect(() => {
        setIsMounted(true)
        const savedCart = localStorage.getItem("jamali-os-cart")
        if (savedCart) {
            try {
                const parsed = JSON.parse(savedCart)
                setItems(parsed.items || [])
                setRestaurantId(parsed.restaurantId || null)
            } catch (e) {
                console.error("Error loading cart", e)
            }
        }
    }, [])

    useEffect(() => {
        if (isMounted) {
            localStorage.setItem("jamali-os-cart", JSON.stringify({ items, restaurantId }))
        }
    }, [items, restaurantId, isMounted])

    const addItem = (product: Product, rId: string) => {
        setItems((prev) => {
            // Si el carrito ya tiene items de OTRO restaurante, lo limpiamos para evitar mezclas
            if (restaurantId && restaurantId !== rId && prev.length > 0) {
                if (!confirm("Tienes productos de otro restaurante en tu carrito. ¿Deseas vaciarlo para añadir este plato?")) {
                    return prev
                }
                setRestaurantId(rId)
                return [{ ...product, quantity: 1, uniqueId: crypto.randomUUID(), restaurantId: rId }]
            }

            if (!restaurantId || prev.length === 0) {
                setRestaurantId(rId)
            }

            const existing = prev.find((item) => item.id === product.id)
            if (existing) {
                return prev.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            }
            return [...prev, { ...product, quantity: 1, uniqueId: crypto.randomUUID(), restaurantId: rId }]
        })
        setIsCartOpen(true)
    }

    const removeItem = (uniqueId: string) => {
        setItems((prev) => prev.filter((item) => item.uniqueId !== uniqueId))
    }

    const updateQuantity = (uniqueId: string, quantity: number) => {
        if (quantity < 1) {
            removeItem(uniqueId)
            return
        }
        setItems((prev) =>
            prev.map((item) =>
                item.uniqueId === uniqueId ? { ...item, quantity } : item
            )
        )
    }

    const clearCart = () => {
        setItems([])
        setRestaurantId(null)
    }

    const toggleCart = () => setIsCartOpen(!isCartOpen)

    const cartCount = items.reduce((acc, item) => acc + item.quantity, 0)
    const cartTotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)

    return (
        <CartContext.Provider
            value={{
                items,
                restaurantId,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                cartCount,
                cartTotal,
                isCartOpen,
                toggleCart,
            }}
        >
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider")
    }
    return context
}
