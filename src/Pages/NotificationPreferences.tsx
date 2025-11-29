import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { IoMdNotificationsOutline } from "react-icons/io";
import { MdEmail, MdSms } from "react-icons/md";
import { FaWhatsapp, FaTelegram } from "react-icons/fa";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

interface NotificationPreferences {
  id: number;
  userId: number;
  emailEnabled: boolean;
  whatsappEnabled: boolean;
  whatsappNumber: string | null;
  smsEnabled: boolean;
  smsNumber: string | null;
  telegramEnabled: boolean;
  telegramChatId: string | null;
  createdAt: string;
  updatedAt: string;
}

export function NotificationPreferences() {
  const navigate = useNavigate();
  const [preferences, setPreferences] =
    useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [exists, setExists] = useState(false);

  // Estados para los campos editables
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [smsNumber, setSmsNumber] = useState("");
  const [telegramEnabled, setTelegramEnabled] = useState(false);
  const [telegramChatId, setTelegramChatId] = useState("");

  useEffect(() => {
    checkPreferencesStatus();
  }, []);

  const checkPreferencesStatus = async () => {
    try {
      const res = await fetch(`${BASE_URL}/notifications/preferences/status`, {
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) {
          toast.error("Debes iniciar sesión");
          navigate("/login");
          return;
        }
        throw new Error("Error al verificar preferencias");
      }

      const data = await res.json();

      if (data.exists) {
        setExists(true);
        setPreferences(data.preferences);
        loadPreferencesIntoState(data.preferences);
      } else {
        // No existen, crear preferencias por defecto
        await createDefaultPreferences();
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar preferencias");
    } finally {
      setLoading(false);
    }
  };

  const createDefaultPreferences = async () => {
    try {
      const res = await fetch(`${BASE_URL}/notifications/preferences`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });

      if (!res.ok) throw new Error("Error al crear preferencias");

      const data = await res.json();
      setExists(true);
      setPreferences(data);
      loadPreferencesIntoState(data);
      toast.success("Preferencias creadas");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al crear preferencias");
    }
  };

  const loadPreferencesIntoState = (prefs: NotificationPreferences) => {
    setEmailEnabled(prefs.emailEnabled);
    setWhatsappEnabled(prefs.whatsappEnabled);
    setWhatsappNumber(prefs.whatsappNumber || "");
    setSmsEnabled(prefs.smsEnabled);
    setSmsNumber(prefs.smsNumber || "");
    setTelegramEnabled(prefs.telegramEnabled);
    setTelegramChatId(prefs.telegramChatId || "");
  };

  const updatePreference = async (field: string, value: any) => {
    try {
      const body: any = { [field]: value };

      const res = await fetch(`${BASE_URL}/notifications/preferences`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Error al actualizar preferencia");

      const data = await res.json();
      setPreferences(data);
      toast.success("Preferencia actualizada");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al actualizar");
    }
  };

  const handleToggle = (
    field: string,
    currentValue: boolean,
    setter: (val: boolean) => void
  ) => {
    const newValue = !currentValue;
    setter(newValue);
    updatePreference(field, newValue);
  };

  const handleTextUpdate = (field: string, value: string) => {
    updatePreference(field, value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando preferencias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <IoMdNotificationsOutline className="text-3xl text-blue-500" />
            <h1 className="text-2xl font-bold text-gray-800">
              Preferencias de Notificaciones
            </h1>
          </div>
          <p className="text-gray-600 text-sm">
            Configura cómo quieres recibir notificaciones cuando tus pedidos
            cambien de estado
          </p>
        </div>

        {/* Email */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <MdEmail className="text-2xl text-red-500" />
              <div>
                <h3 className="font-semibold text-gray-800">Email</h3>
                <p className="text-sm text-gray-500">
                  Recibir notificaciones por correo electrónico
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={emailEnabled}
                onChange={() =>
                  handleToggle("emailEnabled", emailEnabled, setEmailEnabled)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* WhatsApp */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FaWhatsapp className="text-2xl text-green-500" />
              <div>
                <h3 className="font-semibold text-gray-800">WhatsApp</h3>
                <p className="text-sm text-gray-500">
                  Recibir notificaciones por WhatsApp
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={whatsappEnabled}
                onChange={() =>
                  handleToggle(
                    "whatsappEnabled",
                    whatsappEnabled,
                    setWhatsappEnabled
                  )
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          {whatsappEnabled && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de WhatsApp
              </label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                onBlur={(e) =>
                  handleTextUpdate("whatsappNumber", e.target.value)
                }
                placeholder="+543515551234"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Formato: +54 + código de área + número
              </p>
            </div>
          )}
        </div>

        {/* SMS */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <MdSms className="text-2xl text-purple-500" />
              <div>
                <h3 className="font-semibold text-gray-800">SMS</h3>
                <p className="text-sm text-gray-500">
                  Recibir notificaciones por mensaje de texto
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={smsEnabled}
                onChange={() =>
                  handleToggle("smsEnabled", smsEnabled, setSmsEnabled)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          {smsEnabled && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de teléfono
              </label>
              <input
                type="text"
                value={smsNumber}
                onChange={(e) => setSmsNumber(e.target.value)}
                onBlur={(e) => handleTextUpdate("smsNumber", e.target.value)}
                placeholder="+543515551234"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Formato: +54 + código de área + número
              </p>
            </div>
          )}
        </div>

        {/* Telegram */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FaTelegram className="text-2xl text-blue-400" />
              <div>
                <h3 className="font-semibold text-gray-800">Telegram</h3>
                <p className="text-sm text-gray-500">
                  Recibir notificaciones por Telegram
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={telegramEnabled}
                onChange={() =>
                  handleToggle(
                    "telegramEnabled",
                    telegramEnabled,
                    setTelegramEnabled
                  )
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          {telegramEnabled && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chat ID de Telegram
              </label>
              <input
                type="text"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
                onBlur={(e) =>
                  handleTextUpdate("telegramChatId", e.target.value)
                }
                placeholder="123456789"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Obtén tu Chat ID hablando con @userinfobot
              </p>
            </div>
          )}
        </div>

        {/* Info adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">ℹ️ Información</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>
              • Las notificaciones se envían cuando tu pedido cambia de estado
            </li>
            <li>
              • Recibirás una notificación especial cuando tu pedido sea
              entregado
            </li>
            <li>• Puedes activar múltiples canales simultáneamente</li>
            <li>• Los cambios se guardan automáticamente</li>
          </ul>
        </div>

        {/* Debug info */}
        {preferences && (
          <div className="mt-6 bg-gray-100 rounded-lg p-4">
            <details>
              <summary className="cursor-pointer font-semibold text-gray-700">
                🔍 Debug - Datos actuales
              </summary>
              <pre className="mt-2 text-xs bg-white p-3 rounded overflow-auto">
                {JSON.stringify(preferences, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
