import React, { useEffect, useState } from "react";
import { AiFillDelete } from "react-icons/ai";
import useCartStore from "../store/cartStore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const Cartitems = () => {
  const { items, removeFromCart, updateQty, syncCart, createOrder } = useCartStore((state) => state);

  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const shipping = 10000;
  const total = subtotal + shipping;
  const navigate = useNavigate();

  const [showEmpty, setShowEmpty] = useState(items.length === 0);
  const [shippingAddress, setShippingAddress] = useState("");
  const [notes, setNotes] = useState("");

    // Detecta si está autenticado
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(`${BASE_URL}/users/profile`, {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) navigate("/auth");
      } catch {
        navigate("/auth");
      }
    };
    checkSession();
  }, [navigate]);
  
  // Detecta cuándo queda vacío el carrito
  useEffect(() => {
    syncCart();
    if (items.length === 0) {
      const timeout = setTimeout(() => setShowEmpty(true), 250);
      return () => clearTimeout(timeout);
    } else {
      setShowEmpty(false);
    }
  }, [items.length, syncCart]);



  // Maneja la creación del pedido con los campos nuevos
  const handleCreateOrder = () => {
    const trimmedAddress = shippingAddress.trim();
    const trimmedNotes = notes.trim();

    if (!trimmedAddress) {
      toast.error("Por favor ingresa una dirección de envío.");
      return;
    }

    createOrder(trimmedAddress, trimmedNotes);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-6">
      <div className="text-center sm:text-left">
        <h1 className="text-3xl font-bold mb-1">Carrito de Compras</h1>
        <p className="text-sm text-gray-500">
          Hay {items.reduce((sum, i) => sum + i.quantity, 0)} ítems en tu carrito
        </p>
      </div>

      <section className="flex flex-col lg:flex-row gap-8 transition-all duration-300">
        {/* 🛒 Lista de productos */}
        <div className="flex-1 overflow-x-auto transition-all duration-300">
          {items.length > 0 ? (
            <table className="w-full border-separate border-spacing-y-3 transition-opacity duration-300 opacity-100">
              <thead className="hidden sm:table-header-group text-gray-600">
                <tr>
                  <th className="text-left pb-2">Producto</th>
                  <th className="text-left pb-2">Precio</th>
                  <th className="text-left pb-2">Cantidad</th>
                  <th className="text-left pb-2">Total</th>
                  <th className="text-center pb-2">Eliminar</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="bg-white shadow-sm rounded-xl sm:rounded-lg sm:table-row block mb-4 sm:mb-0 hover:shadow-md transition-all duration-200"
                  >
                    <td className="flex sm:table-cell items-center sm:items-start sm:space-x-4 sm:py-3 p-3">
                      <img
                        src={item.image[0]}
                        alt={item.title}
                        className="w-20 h-20 object-cover rounded-md border border-gray-100 mr-4"
                      />
                      <div>
                        <h1 className="font-semibold text-gray-800 text-base">
                          {item.title}
                        </h1>
                        <p className="text-xs text-gray-500">
                          Descripción breve del producto
                        </p>
                      </div>
                    </td>

                    <td className="p-3 text-gray-700 hidden sm:table-cell">
                      ${item.price.toFixed(2)}
                    </td>

                    <td className="p-3">
                      <div className="flex flex-col items-start sm:items-center">
                        <div className="flex items-center border rounded-full overflow-hidden">
                          <button
                            onClick={() => updateQty("decrement", item.id)}
                            className="px-3 py-1 text-gray-500 hover:text-gray-700 disabled:text-gray-300"
                            disabled={item.quantity <= 1}
                          >
                            −
                          </button>
                          <span className="px-4 text-sm font-medium text-gray-800 select-none">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQty("increment", item.id)}
                            className="px-3 py-1 text-blue-500 hover:text-blue-700"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </td>

                    <td className="p-3 font-medium text-gray-800 hidden sm:table-cell">
                      ${(item.price * item.quantity).toFixed(2)}
                    </td>

                    <td className="p-3 text-center">
                      <button
                        className="text-red-500 hover:text-red-700 transition"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <AiFillDelete size={"1.4rem"} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center text-gray-500 py-10 transition-all duration-300">
              Tu carrito está vacío 🛒
            </div>
          )}
        </div>

        {/* 💰 Resumen */}
        <div
          className={`lg:w-[35%] w-full h-fit shadow-lg rounded-xl p-6 space-y-5 sticky top-10 border transition-all duration-500 ${showEmpty
              ? "bg-gray-100 text-gray-400 border-gray-200"
              : "bg-white text-gray-800 border-transparent"
            }`}
        >
          {!showEmpty ? (
            <>
              <h2 className="text-xl font-semibold text-gray-800">
                Resumen de Compra
              </h2>

              {/* Dirección de envío */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección de envío
                </label>
                <input
                  type="text"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring focus:ring-blue-200 focus:border-blue-400 outline-none"
                  placeholder="Ej: Av. Siempre Viva 742"
                />
              </div>

              {/* Notas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas (opcional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring focus:ring-blue-200 focus:border-blue-400 outline-none"
                  placeholder="Ej: Entregar en portería"
                  rows={2}
                />
              </div>

              {/* Totales */}
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <span>Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <span>Envío</span>
                <span className="font-medium">${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-semibold pt-3">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <button
                className="w-full py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition"
                onClick={handleCreateOrder}
              >
                Finalizar Compra
              </button>
            </>
          ) : (
            <div className="text-center space-y-2 transition-opacity duration-300">
              <h2 className="text-xl font-semibold text-gray-500">
                Resumen vacío
              </h2>
              <p className="text-sm text-gray-400">
                No hay productos en el carrito actualmente.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Cartitems;
