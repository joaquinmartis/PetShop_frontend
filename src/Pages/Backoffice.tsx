import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  AiOutlineClose,
  AiOutlineFilter,
  AiOutlineCheckCircle,
  AiOutlineClockCircle,
} from "react-icons/ai";
import { MdEmail, MdSms, MdLocalShipping } from "react-icons/md";
import { FaWhatsapp, FaTelegram } from "react-icons/fa";

import useUserManagement from "../store/userManagement";

interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface NotificationPreferences {
  emailEnabled: boolean;
  whatsappEnabled: boolean;
  whatsappNumber: string | null;
  smsEnabled: boolean;
  smsNumber: string | null;
  telegramEnabled: boolean;
  telegramChatId: string | null;
}

interface NotificationLog {
  id: number;
  userId: number;
  orderId: number;
  channel: 'EMAIL' | 'WHATSAPP' | 'SMS' | 'TELEGRAM';
  status: 'SENT' | 'FAILED';
  message: string;
  errorMessage: string | null;
  recipient: string;
  sentAt: string;
  whatsappLink: string | null;
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

const STATUS_CONFIG: Record<string, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  PENDING: { label: 'Pendiente', color: 'text-yellow-800', bgColor: 'bg-yellow-100' },
  CONFIRMED: { label: 'Confirmado', color: 'text-blue-800', bgColor: 'bg-blue-100' },
  READY_TO_SHIP: { label: 'Listo para enviar', color: 'text-purple-800', bgColor: 'bg-purple-100' },
  SHIPPED: { label: 'Enviado', color: 'text-indigo-800', bgColor: 'bg-indigo-100' },
  DELIVERED: { label: 'Entregado', color: 'text-green-800', bgColor: 'bg-green-100' },
  CANCELLED: { label: 'Cancelado', color: 'text-red-800', bgColor: 'bg-red-100' },
  REJECTED: { label: 'Rechazado', color: 'text-gray-800', bgColor: 'bg-gray-100' },
};

const SHIPPING_METHODS = {
  OWN_TEAM: "Equipo Propio",
  COURIER: "Courier"
};

const SHIPPING_COST = 10000; // Costo fijo de envío

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export function Backoffice() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  // NUEVO ESTADO: Para rastrear qué notificaciones de WhatsApp han sido clickeadas
  const [whatsappClicks, setWhatsappClicks] = useState<number[]>([]);

  const { loadUser, unloadUser } = useUserManagement((state) => state);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Verificar autorización y cargar órdenes
  useEffect(() => {
    const checkAuthAndLoadOrders = async () => {
      try {
        const profileRes = await fetch(`${BASE_URL}/users/profile`, {
          credentials: "include",
        });

        if (!profileRes.ok) {
          toast.error("Debes iniciar sesión");
          navigate("/auth");
          return;
        }

        const user = await profileRes.json();

        if (user.role !== "WAREHOUSE") {
          toast.error("No tienes permisos para acceder al backoffice");
          navigate("/");
          return;
        }

        await fetchOrders();
      } catch (error) {
        toast.error("Error al verificar permisos");
        navigate("/auth");
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoadOrders();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await fetch(`${BASE_URL}/users/logout`, {
        method: "POST",
        credentials: "include",
      });
      unloadUser();
      toast.success("Sesión cerrada");
      navigate("/auth");
    } catch {
      toast.error("Error al cerrar sesión");
    }
  };

  const fetchOrders = async () => {
    try {
      const url = statusFilter === "ALL"
        ? `${BASE_URL}/backoffice/orders?page=0&size=100`
        : `${BASE_URL}/backoffice/orders?status=${statusFilter}&page=0&size=100`;

      const response = await fetch(url, { credentials: "include" });

      if (!response.ok) throw new Error("Error al cargar órdenes");

      const data = await response.json();
      setOrders(data.content || []);
    } catch (error) {
      toast.error("Error al cargar órdenes");
    }
  };

  useEffect(() => {
    if (!loading) fetchOrders();
  }, [statusFilter]);

  // Limpiar el estado de clics de WhatsApp al cambiar de orden
  useEffect(() => {
    if (selectedOrder) {
      fetchOrderNotifications(selectedOrder.id);
      setWhatsappClicks([]); // Resetear al abrir una nueva orden
    }
  }, [selectedOrder]);

  const fetchOrderNotifications = async (orderId: number) => {
    setLoadingNotifications(true);
    try {
      const response = await fetch(
        `${BASE_URL}/backoffice/notifications/orders/${orderId}`,
        { credentials: "include" }
      );

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleReadyToShip = async (orderId: number) => {
    setActionLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/backoffice/orders/${orderId}/ready-to-ship`, {
        method: "PATCH",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      toast.success("Orden marcada como lista para enviar");
      await fetchOrders();

      const updatedOrder = await response.json();
      setSelectedOrder(updatedOrder);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al actualizar");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkShipped = async (orderId: number, order: Order) => {
    if (!order.shippingMethod) {
      toast.error("Debes asignar un método de envío antes de despachar");
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/backoffice/orders/${orderId}/ship`, {
        method: "PATCH",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      toast.success("Orden despachada");
      await fetchOrders();

      const updatedOrder = await response.json();
      setSelectedOrder(updatedOrder);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al actualizar");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkDelivered = async (orderId: number) => {
    setActionLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/backoffice/orders/${orderId}/deliver`, {
        method: "PATCH",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      toast.success("Orden entregada");
      await fetchOrders();

      const updatedOrder = await response.json();
      setSelectedOrder(updatedOrder);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al actualizar");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectOrder = async (orderId: number) => {
    const reason = prompt("Motivo del rechazo:", "Stock insuficiente");
    if (!reason || reason.trim() === "") {
      toast.error("Debes proporcionar un motivo");
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/backoffice/orders/${orderId}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reason: reason.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      toast.success("Orden rechazada");
      await fetchOrders();
      setSelectedOrder(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al rechazar");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateShippingMethod = async (orderId: number, method: string) => {
    setActionLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/backoffice/orders/${orderId}/shipping-method`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ shippingMethod: method }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      toast.success("Método de envío actualizado");
      await fetchOrders();

      const updatedOrder = await response.json();
      setSelectedOrder(updatedOrder);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al actualizar");
    } finally {
      setActionLoading(false);
    }
  };

  // NUEVA FUNCIÓN: Maneja el clic en el botón de WhatsApp
  const handleWhatsappClick = (notifId: number, link: string) => {
    // 1. Agregar el ID a los IDs clickeados para cambiar el estado de visualización
    setWhatsappClicks((prev) => {
      if (!prev.includes(notifId)) {
        return [...prev, notifId];
      }
      return prev;
    });

    // 2. Abrir el enlace en una nueva pestaña
    window.open(link, '_blank');
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

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'EMAIL':
        return <MdEmail className="text-lg text-red-500" />;
      case 'WHATSAPP':
        return <FaWhatsapp className="text-lg text-green-500" />;
      case 'SMS':
        return <MdSms className="text-lg text-purple-500" />;
      case 'TELEGRAM':
        return <FaTelegram className="text-lg text-blue-400" />;
      default:
        return null;
    }
  };

  const getChannelName = (channel: string) => {
    const names: Record<string, string> = {
      EMAIL: 'Email',
      WHATSAPP: 'WhatsApp',
      SMS: 'SMS',
      TELEGRAM: 'Telegram'
    };
    return names[channel] || channel;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando backoffice...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header con botón de cerrar sesión */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Backoffice - Gestión de Órdenes</h1>
            <p className="text-sm text-gray-500">
              {orders.length} órdenes{" "}
              {statusFilter !== "ALL" && `(${STATUS_CONFIG[statusFilter]?.label})`}
            </p>
          </div>

          <div className="flex gap-3 items-center">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none px-4 py-2 pr-10 border border-gray-300 rounded-lg bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Todos los estados</option>
                <option value="CONFIRMED">Confirmado</option>
                <option value="READY_TO_SHIP">Listo para enviar</option>
                <option value="SHIPPED">Enviado</option>
                <option value="DELIVERED">Entregado</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
              <AiOutlineFilter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            <button
              onClick={fetchOrders}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Actualizar
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>

        {/* Lista de órdenes */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay órdenes para mostrar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Método de envío</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => {
                    const statusInfo = STATUS_CONFIG[order.status];
                    return (
                      <tr key={order.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-semibold text-gray-800">#{order.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{order.customerName}</p>
                            <p className="text-xs text-gray-500">{order.customerEmail}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {order.shippingMethod ? (
                            <span className="text-sm text-gray-700">
                              {SHIPPING_METHODS[order.shippingMethod as keyof typeof SHIPPING_METHODS] || order.shippingMethod}
                            </span>
                          ) : (
                            <span className="text-xs text-red-500 font-medium">Sin asignar</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-semibold text-gray-800">${order.total.toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                          >
                            Ver detalle
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de detalle */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Orden #{selectedOrder.id}</h2>
                <span className={`inline-block text-xs font-medium px-2 py-1 rounded-full mt-1 ${STATUS_CONFIG[selectedOrder.status]?.bgColor} ${STATUS_CONFIG[selectedOrder.status]?.color}`}>
                  {STATUS_CONFIG[selectedOrder.status]?.label}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <AiOutlineClose size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Info del cliente */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Cliente</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-1">
                  <p className="text-sm"><span className="font-medium">Nombre:</span> {selectedOrder.customerName}</p>
                  <p className="text-sm"><span className="font-medium">Email:</span> {selectedOrder.customerEmail}</p>
                  {selectedOrder.customerPhone && (
                    <p className="text-sm"><span className="font-medium">Teléfono:</span> {selectedOrder.customerPhone}</p>
                  )}
                  <p className="text-sm"><span className="font-medium">Dirección:</span> {selectedOrder.shippingAddress}</p>
                </div>
              </div>

              {/* Costo de Envío */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <MdLocalShipping className="text-blue-500" />
                  Costo de Envío
                </h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-2xl font-bold text-blue-700">
                    ${SHIPPING_COST.toLocaleString()}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Costo fijo aplicado a todas las órdenes
                  </p>
                </div>
              </div>

              {/* Método de envío */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Método de envío</h3>
                {['CONFIRMED', 'READY_TO_SHIP'].includes(selectedOrder.status) ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateShippingMethod(selectedOrder.id, 'OWN_TEAM')}
                      disabled={actionLoading}
                      className={`flex-1 py-2 px-4 rounded-lg border-2 transition ${
                        selectedOrder.shippingMethod === 'OWN_TEAM'
                          ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      Equipo Propio
                    </button>
                    <button
                      onClick={() => handleUpdateShippingMethod(selectedOrder.id, 'COURIER')}
                      disabled={actionLoading}
                      className={`flex-1 py-2 px-4 rounded-lg border-2 transition ${
                        selectedOrder.shippingMethod === 'COURIER'
                          ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      Courier
                    </button>
                  </div>
                ) : (
                  <p className="text-sm bg-gray-50 rounded-lg p-3">
                    {selectedOrder.shippingMethod
                      ? SHIPPING_METHODS[selectedOrder.shippingMethod as keyof typeof SHIPPING_METHODS]
                      : "No asignado"}
                  </p>
                )}
              </div>

              {/* Preferencias de Notificaciones */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Estado de Notificaciones
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {loadingNotifications ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-500">Cargando notificaciones...</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">
                        No se han enviado notificaciones para esta orden aún
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Las notificaciones se envían automáticamente cuando la orden es entregada
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`flex items-start justify-between p-3 rounded-lg border-2 ${
                            notif.status === 'SENT'
                              ? 'bg-green-50 border-green-200'
                              : 'bg-red-50 border-red-200'
                          }`}
                        >
                          <div className="flex items-start gap-3 flex-1">
                            <div className="mt-0.5">
                              {getChannelIcon(notif.channel)}
                            </div>
                            <div className="flex-1 min-w-0">
                              {/* RENDERIZACIÓN ESTÁNDAR PARA NO-WHATSAPP O WHATSAPP FALLIDO */}
                              {!(notif.channel === 'WHATSAPP' && notif.status === 'SENT' && notif.whatsappLink) ? (
                                <>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium text-gray-800">
                                      {getChannelName(notif.channel)}
                                    </span>
                                    <span
                                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                        notif.status === 'SENT'
                                          ? 'bg-green-100 text-green-700'
                                          : 'bg-red-100 text-red-700'
                                      }`}
                                    >
                                      {notif.status === 'SENT' ? '✓ Enviada' : '✗ Falló'}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600 mb-1">
                                    <span className="font-medium">Para:</span> {notif.recipient}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {formatDate(notif.sentAt)}
                                  </p>
                                </>
                              ) : null}

                              {/* Mostrar error si falló */}
                              {notif.errorMessage && (
                                <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-700">
                                  <span className="font-medium">Error:</span> {notif.errorMessage}
                                </div>
                              )}

                              {/* LÓGICA ESPECIAL PARA WHATSAPP ENVIADO CON LINK */}
                              {notif.channel === 'WHATSAPP' && notif.whatsappLink && notif.status === 'SENT' && (
                                <div className="mt-2">
                                  {(() => {
                                    const isClicked = whatsappClicks.includes(notif.id);
                                    const statusDisplay = isClicked
                                      ? <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">
                                          ✓ Contacto Iniciado
                                        </span>
                                      : <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-yellow-100 text-yellow-700">
                                          ... Pendiente de Contacto
                                        </span>;

                                    return (
                                      <>
                                        {/* Sobreescribir el estado de envío con el estado visual específico de WhatsApp */}
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="text-sm font-medium text-gray-800">
                                            {getChannelName(notif.channel)}
                                          </span>
                                          {statusDisplay}
                                        </div>
                                        <p className="text-xs text-gray-600 mb-1">
                                          <span className="font-medium">Para:</span> {notif.recipient}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {formatDate(notif.sentAt)}
                                        </p>
                                        {/* Muestra el botón y llama a la función de manejo */}
                                        <button
                                          onClick={() => handleWhatsappClick(notif.id, notif.whatsappLink!)}
                                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition font-medium"
                                        >
                                          <FaWhatsapp />
                                          {isClicked ? 'Volver a Abrir' : 'Abrir WhatsApp'}
                                        </button>
                                        <p className="text-xs text-gray-500 mt-1">
                                          Click para contactar al cliente directamente
                                        </p>
                                      </>
                                    );
                                  })()}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Resumen */}
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">
                            Total: {notifications.length} notificación(es)
                          </span>
                          <div className="flex gap-3">
                            <span className="text-green-600 font-medium">
                              ✓ {notifications.filter(n => n.status === 'SENT').length} enviadas
                            </span>
                            <span className="text-red-600 font-medium">
                              ✗ {notifications.filter(n => n.status === 'FAILED').length} fallidas
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Alerta si no tiene método de envío */}
              {!selectedOrder.shippingMethod && ['READY_TO_SHIP'].includes(selectedOrder.status) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Debes asignar un método de envío antes de poder despachar esta orden
                  </p>
                </div>
              )}

              {/* Notas */}
              {selectedOrder.notes && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Notas</h3>
                  <p className="text-sm text-gray-600 bg-yellow-50 rounded-lg p-3">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}

              {/* Razón de cancelación/rechazo */}
              {selectedOrder.cancellationReason && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    {selectedOrder.status === 'REJECTED' ? 'Motivo de rechazo' : 'Motivo de cancelación'}
                  </h3>
                  <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">
                    {selectedOrder.cancellationReason}
                    {selectedOrder.cancelledBy && (
                      <span className="block mt-1 text-xs">Por: {selectedOrder.cancelledBy}</span>
                    )}
                  </p>
                </div>
              )}

              {/* Productos */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Productos ({selectedOrder.items.length})</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                      <img
                        src={item.productImage || "https://via.placeholder.com/50"}
                        alt={item.productName}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.productName}</h4>
                        <p className="text-xs text-gray-500">
                          {item.quantity} x ${item.unitPrice.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-semibold">${item.subtotal.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span className="text-2xl">${selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Acciones según estado */}
              <div className="space-y-3">
                {selectedOrder.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleReadyToShip(selectedOrder.id)}
                      disabled={actionLoading}
                      className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:bg-gray-400 font-medium"
                    >
                      Confirmar y marcar como listo
                    </button>
                    <button
                      onClick={() => handleRejectOrder(selectedOrder.id)}
                      disabled={actionLoading}
                      className="w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:bg-gray-400 font-medium"
                    >
                      Rechazar orden
                    </button>
                  </>
                )}

                {selectedOrder.status === 'CONFIRMED' && (
                  <button
                    onClick={() => handleReadyToShip(selectedOrder.id)}
                    disabled={actionLoading}
                    className="w-full py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition disabled:bg-gray-400 font-medium"
                  >
                    Marcar como listo para enviar
                  </button>
                )}

                {selectedOrder.status === 'READY_TO_SHIP' && (
                  <button
                    onClick={() => handleMarkShipped(selectedOrder.id, selectedOrder)}
                    disabled={actionLoading || !selectedOrder.shippingMethod}
                    className="w-full py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition disabled:bg-gray-400 font-medium"
                  >
                    Despachar / Marcar como enviado
                  </button>
                )}

                {selectedOrder.status === 'SHIPPED' && (
                  <button
                    onClick={() => handleMarkDelivered(selectedOrder.id)}
                    disabled={actionLoading}
                    className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:bg-gray-400 font-medium"
                  >
                    Marcar como entregado
                  </button>
                )}
                
                {/* Cancelar/Rechazar siempre disponible para estados abiertos */}
                {['PENDING', 'CONFIRMED', 'READY_TO_SHIP', 'SHIPPED'].includes(selectedOrder.status) && (
                  <button
                    onClick={() => handleRejectOrder(selectedOrder.id)}
                    disabled={actionLoading}
                    className="w-full py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition disabled:bg-gray-400 font-medium"
                  >
                    Rechazar/Cancelar (Aplica solo a PENDING/CONFIRMED)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}