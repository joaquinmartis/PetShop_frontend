"use client";

import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8080/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // 👈 necesario para enviar/recibir cookies HTTP-only
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al iniciar sesión");
      }

      toast.success("Inicio de sesión exitoso");
      navigate("/profile"); // redirige al perfil
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      toast.error(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white rounded-2xl shadow-xl w-[350px] p-6">
        <h2 className="text-2xl font-semibold text-center mb-2">Iniciar Sesión</h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Ingresá tu correo y contraseña para continuar
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <div className="flex flex-col">
            <label htmlFor="email" className="text-sm font-medium mb-1 text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="ejemplo@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition"
          >
            Iniciar sesión
          </button>
        </form>

        <p className="text-sm text-gray-600 text-center mt-4">
          ¿No tenés cuenta?{" "}
          <NavLink to="/register" className="text-blue-500 hover:underline font-medium">
            Crear cuenta
          </NavLink>
        </p>
      </div>
    </div>
  );
}
