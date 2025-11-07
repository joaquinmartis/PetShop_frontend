import React from "react";
import { NavLink } from "react-router-dom";

export function AuthPromptPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-semibold mb-3 text-gray-800">
          ¡Hola!
        </h1>
        <p className="text-gray-600 mb-6">
          Para agregar productos al carrito, primero ingresá a tu cuenta.
        </p>

        <div className="flex flex-col space-y-3">
          <NavLink
            to="/login"
            className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition"
          >
            Iniciar sesión
          </NavLink>

          <NavLink
            to="/register"
            className="w-full border border-blue-500 text-blue-500 py-2 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            Crear cuenta
          </NavLink>
        </div>
      </div>
    </div>
  );
};

