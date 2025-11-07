"use client";

import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";


export function LoginPage(){
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

const handleSubmit = async (e) => {

  e.preventDefault();

      // 👇 Login de prueba
    if (email === "test@test.test" && password === "test") {
      const fakeToken = "FAKE_JWT_TOKEN_DEV_MODE";
      localStorage.setItem("accessToken", fakeToken);
      localStorage.setItem("userEmail", email);
      navigate("/"); // redirige al home
      return;
    }

  try {
    const res = await fetch("https://tu-backend.com/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // ✅ permite cookies HTTP-only
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Error al iniciar sesión");
    }

    const data = await res.json();
    toast.success("Inicio de sesión exitoso");
    console.log("Usuario logueado:", data.user);

    navigate("/");
  } catch (error) {
    
    console.error(error);
    toast.error(error.message);
  }
};

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {/* Contenedor principal */}
      <div className="bg-white rounded-2xl shadow-xl w-[350px] p-6">
        <h2 className="text-2xl font-semibold text-center mb-2">Iniciar Sesión</h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Ingresa tu correo y contraseña para continuar
        </p>

        {/* Formulario */}
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

        {/* Enlace a registro */}
        <p className="text-sm text-gray-600 text-center mt-4">
          ¿No tenés cuenta?{" "}
          <NavLink
            to="/register"
            className="text-blue-500 hover:underline font-medium"
          >
            Crear cuenta
          </NavLink>
        </p>
      </div>
    </div>
  );
};


