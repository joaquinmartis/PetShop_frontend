import React, { useState } from "react";
import { CiShoppingCart } from "react-icons/ci";
import useCartStore from "../store/cartStore";
import { Product } from "../types/types";
import { useNavigate } from "react-router-dom";

function ProductCard({ product }: { product: Product }) {
  const addToCart = useCartStore((state) => state.addToCart);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleAddToCart = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/users/profile", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        navigate("/auth");
        return;
      }

      addToCart(product);
    } catch (error) {
      console.error("Error al verificar sesión:", error);
      navigate("/auth");
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
            src={product.imageUrl?.[0] || "/placeholder.png"}
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
            <p className="text-xl font-bold text-gray-800">${product.price}.00</p>
            <button
              className="p-2 rounded-full hover:bg-gray-200 transition"
              onClick={(e) => {
                e.stopPropagation(); // Evita abrir el modal
                handleAddToCart();
              }}
            >
              <CiShoppingCart size={"1.4rem"} />
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
                  src={product.imageUrl?.[0] || "/placeholder.png"}
                  alt={product.name}
                  className="object-contain max-h-96 rounded-xl"
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
                </div>

                <div className="mt-4">
                  <p className="text-2xl font-bold text-gray-900 mb-4">
                    ${product.price}.00
                  </p>
                  <button
                    className="bg-black text-white px-6 py-3 rounded-xl w-full hover:bg-gray-800 transition"
                    onClick={() => {
                      handleAddToCart();
                      setShowModal(false);
                    }}
                  >
                    <CiShoppingCart className="inline mr-2" />
                    Agregar al carrito
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
