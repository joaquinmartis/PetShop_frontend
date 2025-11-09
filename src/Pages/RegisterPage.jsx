import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import toast from "react-hot-toast";

export function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8080/api/users/register", {
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
            className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition"
          >
            Crear cuenta
          </button>
        </form>

        <p className="text-sm text-gray-600 text-center mt-4">
          ¿Ya tenés una cuenta?{" "}
          <NavLink to="/login" className="text-blue-500 hover:underline font-medium">
            Iniciar sesión
          </NavLink>
        </p>
      </div>
    </div>
  );
}
