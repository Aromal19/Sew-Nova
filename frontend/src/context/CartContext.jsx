import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "sewnova_cart_v1";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (_) {}
  }, [items]);

  const addFabricToCart = (fabric) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((it) => it.type === "fabric" && it.id === fabric.id);
      if (existingIndex !== -1) {
        const next = [...prev];
        next[existingIndex] = { ...next[existingIndex], quantity: (next[existingIndex].quantity || 1) + (fabric.quantity || 1) };
        return next;
      }
      return [...prev, { type: "fabric", quantity: 1, ...fabric }];
    });
  };

  const removeItem = (id, type) => {
    setItems((prev) => prev.filter((it) => !(it.id === id && it.type === type)));
  };

  const updateQuantity = (id, type, quantity) => {
    setItems((prev) => prev.map((it) => (it.id === id && it.type === type ? { ...it, quantity: Math.max(1, quantity) } : it)));
  };

  const clearCart = () => setItems([]);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 1), 0);
    return { subtotal, total: subtotal };
  }, [items]);

  const value = useMemo(
    () => ({ items, addFabricToCart, removeItem, updateQuantity, clearCart, totals }),
    [items, totals]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};

