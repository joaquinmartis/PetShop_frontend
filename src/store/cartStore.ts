// useCartStore.ts
import toast from "react-hot-toast";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "../types/types";

// =================================================================
// 1. INTERFACES Y TIPOS
// =================================================================

// 💡 Tipo local de Item de Carrito para la UI (Mantenido)
interface CartItem {
  quantity: number;
  id: number;         // Usamos el ID del Producto
  title: string;
  price: number;
  image: string[];
}

// 💡 Nuevo: Interfaz para el Item de Carrito que viene del Backend
interface BackendCartItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  imageUrl: string;
  addedAt: string;
  updatedAt: string;
}

// 💡 Nuevo: Interfaz para la respuesta completa del Backend (Endpoint: GET /api/cart)
interface CartApiResponse {
  id: number;
  userId: number;
  items: BackendCartItem[]; // El array que buscábamos
  totalItems: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

interface CartSate {
  items: CartItem[];
  isLoaded: boolean;
  syncCart: () => Promise<void>;
  addToCart: (product: Product) => Promise<void>;
  removeFromCart: (id: number) => Promise<void>;
  updateQty: (type: "increment" | "decrement", id: number) => Promise<void>;
  createOrder: (shippingAddress: string, notes: string) => Promise<void>;
}

const BASE_URL = 'http://localhost:8080';

const useCartStore = create<CartSate>()(
  persist(
    (set, get) => ({
      items: [],
      isLoaded: false,

      // =================================================================
      // 🟢 1. SINCRONIZACIÓN INICIAL CON EL BACKEND (GET /api/cart)
      // =================================================================
      syncCart: async () => {
        const backendUrl = `${BASE_URL}/api/cart`;

        try {
          const response = await fetch(backendUrl, {
            method: 'GET',
            credentials: 'include',
          });

          if (!response.ok) {
            const isAuthError = response.status === 401;
            set({ items: [], isLoaded: true });
            if (!isAuthError) {
              console.error(`Fallo al sincronizar el carrito: Status ${response.status}`);
            }
            return;
          }

          const cartData: CartApiResponse = await response.json();

          // 💡 LA CORRECCIÓN CLAVE: Acceder a la propiedad 'items' del objeto cartData
          const backendItems = cartData.items;
          console.log("Backend cart items:", backendItems);
          // Transformamos la respuesta del backend (BackendCartItem) al formato local (CartItem)
          const newLocalItems: CartItem[] = backendItems.map(item => ({
            quantity: item.quantity,
            id: item.productId, // Usamos el ID del Producto para tracking local
            title: item.productName,
            price: item.subtotal,
            image: [item.imageUrl],
          }));

          set({ items: newLocalItems, isLoaded: true });

        } catch (error) {
          console.error("Error de red al sincronizar el carrito:", error);
          set({ items: [], isLoaded: true }); // Fallback
          // Propagamos el error de red para ser manejado por la aplicación si es necesario
          throw error;
        }
      },


      // =================================================================
      // 🟢 2. AGREGAR AL CARRITO (POST /api/cart/items)
      // =================================================================
      addToCart: async (product: Product) => {
        const productId = product.id;
        const quantity = 1;
        const backendUrl = `${BASE_URL}/api/cart/items`;

        // La lógica de verificación de existencia ya no es necesaria, 
        // ya que el backend debería manejar si es una adición o un incremento.

        try {
          const response = await fetch(backendUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ productId: productId, quantity: quantity }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido del servidor' }));
            if (response.status === 401) throw new Error("401. Debes iniciar sesión.");
            throw new Error(errorData.message || `Error al agregar: Status ${response.status}`);
          }

          // Sincronizamos el estado local después de un cambio exitoso
          await get().syncCart();

          toast.success(`${product.name} agregado al carrito`);

        } catch (error) {
          throw error;
        }
      },

      // =================================================================
      // 🟢 3. ELIMINAR DEL CARRITO (DELETE /api/cart/items/{id})
      // =================================================================
      removeFromCart: async (id: number) => {
        // Usamos el product ID para encontrar el item de carrito ID
        const cartItem = get().items.find((item) => item.id === id);
        if (!cartItem) return;

        // 💡 NOTA: Asumo que el endpoint DELETE requiere el ID del Producto,
        // o que tu API es lo suficientemente inteligente para mapear el Producto ID
        // con el item del carrito. Si tu API requiere el ID del *CartItem*,
        // deberás guardar ese ID en el estado local. Por ahora, seguimos con el ID del producto.

        const backendUrl = `${BASE_URL}/api/cart/items/${id}`;

        try {
          const response = await fetch(backendUrl, {
            method: 'DELETE',
            credentials: 'include',
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido del servidor' }));
            if (response.status === 401) throw new Error("401. Debes iniciar sesión.");
            throw new Error(errorData.message || `Error al eliminar: Status ${response.status}`);
          }

          // Sincronizamos el estado local después de un cambio exitoso
          await get().syncCart();

          toast.success("Producto eliminado del carrito");

        } catch (error) {
          throw error;
        }
      },

      // =================================================================
      // 🟢 4. ACTUALIZAR CANTIDAD (PATCH /api/cart/items)
      // =================================================================
      updateQty: async (type: "increment" | "decrement", id: number) => {
        const item = get().items.find((item) => item.id === id);
        if (!item) return;

        let newQuantity = item.quantity + (type === "increment" ? 1 : -1);

        // Si la nueva cantidad es 0, llamamos a removeFromCart
        if (newQuantity <= 0) {
          if (type === "decrement") {
            await get().removeFromCart(id);
          }
          return;
        }

        const backendUrl = `${BASE_URL}/api/cart/items/${item.id}`;

        try {
          const response = await fetch(backendUrl, {
            method: 'PATCH', // Usamos PATCH para actualizar parcialmente
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ quantity: newQuantity }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido del servidor' }));
            if (response.status === 401) throw new Error("401. Debes iniciar sesión.");
            throw new Error(errorData.message || `Error al actualizar: Status ${response.status}`);
          }

          // Sincronizamos el estado local después de un cambio exitoso
          await get().syncCart();

        } catch (error) {
          throw error;
        }
      },
      createOrder: async (shippingAddress: string, notes: string) => {
        const backendUrl = `${BASE_URL}/api/orders`;
        const ShippingAddress = shippingAddress;
        const Notes = notes;
        try {
          const response = await fetch(backendUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ shippingAddress: ShippingAddress, notes: Notes }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido del servidor' }));
            if (response.status === 401) throw new Error("401. Debes iniciar sesión.");
            throw new Error(errorData.message || `Error al crear: Status ${response.status}`);
          }

          // Sincronizamos el estado local después de un cambio exitoso
          await get().syncCart();

          toast.success(`Orden Creada`);

        } catch (error) {
          throw error;
        }
      },
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export default useCartStore;