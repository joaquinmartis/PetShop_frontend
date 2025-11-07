import React from "react";
import { useNavigate, NavLink } from "react-router-dom";
import toast from "react-hot-toast";
import { CiLogout } from "react-icons/ci";
import { HiOutlineClipboardList } from "react-icons/hi";

export function ProfilePage () {
  const navigate = useNavigate();

  // Leer usuario/token (adaptalo a cómo guardás los datos)
  const userEmail = typeof window !== "undefined" ? localStorage.getItem("userEmail") : null;
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const handleLogout = () => {
    // Si en producción usás cookies httponly -> llamar al endpoint logout del backend
    // Aquí limpiamos localStorage para el modo dev / test
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userEmail");
    toast.success("Sesión cerrada");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-start justify-center py-16 px-4">
      <div className="w-full max-w-3xl">
        {/* Card perfil */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xl font-bold">
                {userEmail ? userEmail.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {userEmail ? userEmail : "Usuario invitado"}
                </h2>
                <p className="text-sm text-gray-500">
                  {token ? "Autenticado" : "No autenticado"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate("/orders")}
                className="px-4 py-2 border rounded-lg text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 transition"
              >
                Mis pedidos
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                <CiLogout size="1.1rem" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>

        {/* Orders card (estado vacío) */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                <HiOutlineClipboardList size={"1.4rem"} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Orders</h3>
                <p className="text-sm text-gray-500">Historial de pedidos</p>
              </div>
            </div>
            <NavLink
              to="/orders"
              className="text-sm text-indigo-600 hover:underline"
            >
              Ver todos
            </NavLink>
          </div>

          {/* Empty state */}
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 flex flex-col items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-14 w-14 text-gray-300 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7h18M5 7v12a2 2 0 002 2h10a2 2 0 002-2V7M9 7V5a3 3 0 016 0v2" />
            </svg>
            <h4 className="text-lg font-medium text-gray-800 mb-1">Ninguna orden activa</h4>
            <p className="text-sm text-gray-500 mb-4">Cuando realices una compra, aparecerá aquí el resumen del pedido.</p>
            <div className="flex items-center gap-3">
              <NavLink
                to="/"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Seguir comprando
              </NavLink>
              <button
                onClick={() => toast("Aún no hay pedidos", { icon: "ℹ️" })}
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Pie con info */}
        <div className="text-center text-xs text-gray-400 mt-6">
          <p>Si querés probar el flujo rápido, usá usuario <strong>test</strong> / contraseña <strong>test</strong>.</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
