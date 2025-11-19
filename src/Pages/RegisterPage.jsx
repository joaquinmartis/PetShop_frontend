import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import toast from "react-hot-toast";


const BASE_URL = import.meta.env.VITE_BACKEND_URL;


export function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return; // Prevenir múltiples submissions

    setIsLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al crear la cuenta");
      }

      toast.success("Cuenta creada exitosamente");
      navigate("/login");
    } catch (error) {
      console.error(error);
      console.log("Error details:", formData);
      toast.error(error.message);
      setIsLoading(false); // Solo reseteamos si hay error
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-[350px]">
        <h2 className="text-2xl font-semibold text-center mb-2">Crear cuenta</h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Completá tus datos para registrarte
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <div className="flex flex-col">
            <label htmlFor="firstName" className="text-sm font-medium mb-1 text-gray-700">
              Nombre
            </label>
            <input
              id="firstName"
              type="text"
              placeholder="Tu nombre"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="lastName" className="text-sm font-medium mb-1 text-gray-700">
              Apellido
            </label>
            <input
              id="lastName"
              type="text"
              placeholder="Tu apellido"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="email" className="text-sm font-medium mb-1 text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="ejemplo@mail.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="password" className="text-sm font-medium mb-1 text-gray-700">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              placeholder="********"
              value={formData.password}
              onChange={handleChange}
              required
              className="p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="phone" className="text-sm font-medium mb-1 text-gray-700">
              Teléfono
            </label>
            <input
              id="phone"
              type="text"
              placeholder="Ej: +54 11 1234-5678"
              value={formData.phone}
              onChange={handleChange}
              required
              className="p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="address" className="text-sm font-medium mb-1 text-gray-700">
              Dirección
            </label>
            <input
              id="address"
              type="text"
              placeholder="Calle y número"
              value={formData.address}
              onChange={handleChange}
              required
              className="p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Creando...</span>
              </>
            ) : (
              "Crear Cuenta"
            )}
          </button>
        </form>

        <p className="text-sm text-gray-600 text-center mt-4">
          ¿Ya tenés una cuenta?{" "}

          {isLoading ? (
            <span className="text-blue-500 hover:underline font-medium cursor-pointer">Iniciar sesión</span>
          ) : (
            <NavLink to="/login" className="text-blue-500 hover:underline font-medium">Iniciar sesión</NavLink>
          )}
        </p>
      </div>
    </div>
  );
}
