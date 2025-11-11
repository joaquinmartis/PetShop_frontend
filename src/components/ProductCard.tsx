import React, { useState } from "react";
import { CiShoppingCart } from "react-icons/ci";
import useCartStore from "../store/cartStore";
import { Product } from "../types/types";
import { CartItem } from "../types/types";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCartStore();
  const [showModal, setShowModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const navigate = useNavigate();

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      // 🔹 Verificar sesión
      const authResponse = await fetch("http://localhost:8080/api/users/profile", {
        method: "GET",
        credentials: "include",
      });

      if (!authResponse.ok) {
        toast.error("Debes iniciar sesión");
        navigate("/auth");
        return;
      }

      // 🔹 Agregar al carrito usando el store (que llama al backend)
      await addToCart(product);
      console.log("Producto agregado al carrito:", product);


    } catch (error) {
      console.error("Error al agregar al carrito:", error);
      toast.error(error instanceof Error ? error.message : "Error al agregar al carrito");
    } finally {
      setAdding(false);
    }
  };

  return (
    <>
      {/* Tarjeta */}
      <div
        className="product bg-white shadow-lg rounded-2xl overflow-hidden flex flex-col transition-transform duration-200 hover:-translate-y-1 hover:shadow-2xl cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        <div className="w-full h-48 bg-gray-50 flex items-center justify-center overflow-hidden">
          <img
            src={product.imageUrl || "https://via.placeholder.com/300x300?text=Sin+Imagen"}
            alt={product.name}
            className="object-contain w-full h-full p-3"
          />
        </div>

        <div className="flex flex-col flex-grow p-3 justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-800 mb-1 truncate">
              {product.name}
            </h1>
            <p
              className="text-sm text-gray-600 line-clamp-2 overflow-hidden"
              title={product.description}
            >
              {product.description}
            </p>
          </div>

          <div className="flex justify-between items-center mt-3">
            <p className="text-xl font-bold text-gray-800">${product.price.toFixed(2)}</p>
            <button
              className={`p-2 rounded-full transition ${adding
                  ? 'bg-gray-300 cursor-wait'
                  : 'hover:bg-gray-200'
                }`}
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart();
              }}
              disabled={adding}
            >
              {adding ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <CiShoppingCart size={"1.4rem"} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-3xl w-11/12 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-black text-2xl"
            >
              &times;
            </button>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 flex justify-center items-center">
                <img
                  src={product.imageUrl || "https://via.placeholder.com/300x300?text=Sin+Imagen"}
                  alt={product.name}
                  className="object-contain w-full h-full p-3"
                />
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {product.name}
                  </h2>
                  <p className="text-gray-600 text-sm mb-4">
                    {product.description}
                  </p>

                  {product.stock !== undefined && (
                    <div className="mb-4">
                      {product.stock === 0 ? (
                        <span className="text-red-500 font-semibold">Sin stock</span>
                      ) : product.stock < 10 ? (
                        <span className="text-orange-500 font-semibold">
                          ¡Solo quedan {product.stock}!
                        </span>
                      ) : (
                        <span className="text-green-500 font-semibold">
                          En stock ({product.stock} disponibles)
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <p className="text-2xl font-bold text-gray-900 mb-4">
                    ${product.price.toFixed(2)}
                  </p>
                  <button
                    className={`px-6 py-3 rounded-xl w-full transition flex items-center justify-center gap-2 ${adding || product.stock === 0
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-black text-white hover:bg-gray-800'
                      }`}
                    onClick={() => {
                      handleAddToCart();
                      if (!adding) setShowModal(false);
                    }}
                    disabled={adding || product.stock === 0}
                  >
                    {adding ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Agregando...
                      </>
                    ) : product.stock === 0 ? (
                      'Sin stock'
                    ) : (
                      <>
                        <CiShoppingCart size={"1.4rem"} />
                        Agregar al carrito
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProductCard;