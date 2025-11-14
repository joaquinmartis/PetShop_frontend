import React, { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import toast from "react-hot-toast";
import { CiLogout } from "react-icons/ci";
import { HiOutlineClipboardList } from "react-icons/hi";
import { AiOutlineEye, AiOutlineClose } from "react-icons/ai";

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  role: string;
}

interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface Order {
  id: number;
  userId: number;
  status: string;
  total: number;
  shippingMethod: string | null;
  shippingId: number | null;
  shippingAddress: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  notes: string | null;
  cancellationReason: string | null;
  cancelledAt: string | null;
  cancelledBy: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  PENDING: { label: 'Pendiente', color: 'text-yellow-800', bgColor: 'bg-yellow-100' },
  CONFIRMED: { label: 'Confirmado', color: 'text-blue-800', bgColor: 'bg-blue-100' },
  READY_TO_SHIP: { label: 'Listo para enviar', color: 'text-purple-800', bgColor: 'bg-purple-100' },
  SHIPPED: { label: 'Enviado', color: 'text-indigo-800', bgColor: 'bg-indigo-100' },
  DELIVERED: { label: 'Entregado', color: 'text-green-800', bgColor: 'bg-green-100' },
  CANCELLED: { label: 'Cancelado', color: 'text-red-800', bgColor: 'bg-red-100' },
  REJECTED: { label: 'Rechazado', color: 'text-gray-800', bgColor: 'bg-gray-100' },
};

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const profileRes = await fetch(`${BASE_URL}/users/profile`, {
          method: "GET",
          credentials: "include",
        });

        if (!profileRes.ok) {
          //toast.error("Debes iniciar sesión");
          navigate("/auth");
          return;
        }

        const userData = await profileRes.json();
        if (userData.role === "WAREHOUSE") {
          navigate("/backoffice");
          return;
        }

        setUser(userData);

        await fetchOrders();

      } catch (error) {
        toast.error("Error al cargar datos");
        navigate("/auth");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const ordersRes = await fetch(`${BASE_URL}/orders?page=0&size=20`, {
        credentials: "include",
      });

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData.content || []);
      }
    } catch (error) {
      console.error("Error al cargar órdenes:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${BASE_URL}/users/logout`, {
        method: "POST",
        credentials: "include",
      });
      toast.success("Sesión cerrada");
      navigate("/auth");
    } catch {
      toast.error("Error al cerrar sesión");
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    const reason = prompt('¿Por qué deseas cancelar este pedido?', 'Cambio de opinión');
    if (!reason || reason.trim() === '') {
      toast.error('Debes proporcionar una razón');
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/orders/${orderId}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason: reason.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al cancelar');
      }

      toast.success('Pedido cancelado exitosamente');
      setSelectedOrder(null);
      await fetchOrders();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al cancelar pedido');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const canCancelOrder = (status: string) => {
    return ['PENDING', 'CONFIRMED'].includes(status);
  };

  return (
    <div className=" min-h-screen bg-gray-100 py-6 sm:py-8 px-3 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-6">

        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-lg sm:text-xl font-bold">
                {user.firstName?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500">{user.email}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition"
            >
              <CiLogout size="1.1rem" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>

        {/* Órdenes */}
        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                <HiOutlineClipboardList size={"1.4rem"} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">Mis Pedidos</h3>
                <p className="text-xs sm:text-sm text-gray-500">
                  {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'}
                </p>
              </div>
            </div>
            <button
              onClick={fetchOrders}
              disabled={loadingOrders}
              className="px-3 sm:px-4 py-2 border rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 w-full sm:w-auto"
            >
              {loadingOrders ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>

          {/* Lista de órdenes */}
          {orders.length === 0 ? (
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 sm:p-8 text-center">
              <p className="text-gray-500 mb-4">No tienes pedidos aún</p>
              <NavLink
                to="/"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
              >
                Ir a la tienda
              </NavLink>
            </div>
          ) : (
            <div className="grid gap-4">
              {orders.map((order) => {
                const statusInfo = STATUS_CONFIG[order.status] || {
                  label: order.status, color: 'text-gray-800', bgColor: 'bg-gray-100'
                };
                return (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:shadow transition">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 text-sm sm:text-base">
                        Pedido #{order.id}
                      </h4>
                      <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                      <span className={`mt-1 inline-block text-xs px-2 py-1 rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                      <p className="text-sm font-bold text-gray-800">${order.total.toFixed(2)}</p>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center justify-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition"
                      >
                        <AiOutlineEye size={14} /> Ver
                      </button>
                      {canCancelOrder(order.status) && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-xs sm:text-sm hover:bg-red-100 transition"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal detalle */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-3 sm:p-6">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Pedido #{selectedOrder.id}</h2>
                <p className="text-xs sm:text-sm text-gray-500">{formatDate(selectedOrder.createdAt)}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <AiOutlineClose size={18} />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
              {/* Estado */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Estado</h3>
                <span className={`inline-block text-xs sm:text-sm font-medium px-3 py-1 rounded-full ${STATUS_CONFIG[selectedOrder.status]?.bgColor} ${STATUS_CONFIG[selectedOrder.status]?.color}`}>
                  {STATUS_CONFIG[selectedOrder.status]?.label || selectedOrder.status}
                </span>
              </div>

              {/* Info envío */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Envío</h3>
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2 text-xs sm:text-sm">
                  <p><span className="font-medium">Destinatario:</span> {selectedOrder.customerName}</p>
                  <p><span className="font-medium">Email:</span> {selectedOrder.customerEmail}</p>
                  {selectedOrder.customerPhone && <p><span className="font-medium">Teléfono:</span> {selectedOrder.customerPhone}</p>}
                  <p><span className="font-medium">Dirección:</span> {selectedOrder.shippingAddress}</p>
                  {selectedOrder.shippingMethod && <p><span className="font-medium">Método:</span> {selectedOrder.shippingMethod}</p>}
                </div>
              </div>

              {/* Productos */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Productos ({selectedOrder.items.length})</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 sm:gap-4 bg-gray-50 rounded-lg p-2 sm:p-3">
                      <img
                        src={item.productImage || "https://via.placeholder.com/60x60?text=Sin+Imagen"}
                        alt={item.productName}
                        className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded"
                      />
                      <div className="flex-1 text-xs sm:text-sm">
                        <h4 className="font-medium text-gray-800">{item.productName}</h4>
                        <p className="text-gray-500">{item.quantity} x ${item.unitPrice.toFixed(2)}</p>
                      </div>
                      <p className="font-semibold text-gray-800 text-xs sm:text-sm">
                        ${item.subtotal.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4 flex justify-between items-center text-base sm:text-lg font-bold">
                <span>Total</span>
                <span className="text-xl sm:text-2xl">${selectedOrder.total.toFixed(2)}</span>
              </div>

              {canCancelOrder(selectedOrder.status) && (
                <button
                  onClick={() => handleCancelOrder(selectedOrder.id)}
                  className="w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm sm:text-base font-medium"
                >
                  Cancelar pedido
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
