import React, { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import toast from "react-hot-toast";
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt,
  FaBell,
  FaChevronRight
} from "react-icons/fa";
import { MdEmail, MdSms } from "react-icons/md";
import { FaWhatsapp, FaTelegram } from "react-icons/fa";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  role: string;
}

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
}

export function ProfileInfoPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estados para información personal
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // Estados para notificaciones
  const [notifPrefs, setNotifPrefs] = useState<NotificationPreferences | null>(null);
  const [prefsExist, setPrefsExist] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [smsNumber, setSmsNumber] = useState("");
  const [telegramEnabled, setTelegramEnabled] = useState(false);
  const [telegramChatId, setTelegramChatId] = useState("");

  useEffect(() => {
    loadUserData();
    loadNotificationPreferences();
  }, []);

  const loadUserData = async () => {
    try {
      const res = await fetch(`${BASE_URL}/users/profile`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        toast.error("Error al cargar datos");
        navigate("/auth");
        return;
      }

      const userData = await res.json();
      setUser(userData);
      
      // Cargar datos en los estados
      setFirstName(userData.firstName || "");
      setLastName(userData.lastName || "");
      setAddress(userData.address || "");
      setPhone(userData.phone || "");
      setHasChanges(false);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar perfil");
    } finally {
      setLoading(false);
    }
  };

  const loadNotificationPreferences = async () => {
    try {
      const res = await fetch(`${BASE_URL}/notifications/preferences/status`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        if (data.exists) {
          setPrefsExist(true);
          setNotifPrefs(data.preferences);
          setEmailEnabled(data.preferences.emailEnabled);
          setWhatsappEnabled(data.preferences.whatsappEnabled);
          // Cargar número de WhatsApp o usar el del perfil con +549
          if (data.preferences.whatsappNumber) {
            setWhatsappNumber(data.preferences.whatsappNumber);
          }
          setSmsEnabled(data.preferences.smsEnabled);
          // Cargar número de SMS o usar el del perfil con +549
          if (data.preferences.smsNumber) {
            setSmsNumber(data.preferences.smsNumber);
          }
          setTelegramEnabled(data.preferences.telegramEnabled);
          setTelegramChatId(data.preferences.telegramChatId || "");
        } else {
          setPrefsExist(false);
        }
      }
    } catch (error) {
      console.error("Error al cargar preferencias:", error);
    }
  };



  const validatePhone = (phoneNumber: string): boolean => {
    return phoneNumber.trim().length === 0 || phoneNumber.trim().length >= 6;
  };

  const handleSavePersonalInfo = async () => {
    if (phone && !validatePhone(phone)) {
      toast.error("El teléfono debe tener al menos 6 dígitos");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/users/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          address
        }),
      });

      if (!res.ok) throw new Error("Error al actualizar");

      const updatedUser = await res.json();
      setUser(updatedUser);
      setHasChanges(false);
      toast.success("Información actualizada correctamente");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al guardar cambios");
    } finally {
      setSaving(false);
    }
  };

  const handleDiscardChanges = () => {
    if (!user) return;
    setFirstName(user.firstName || "");
    setLastName(user.lastName || "");
    setAddress(user.address || "");
    setPhone(user.phone || "");
    setHasChanges(false);
    toast.success("Cambios descartados");
  };

  const handleToggleNotification = async (
    field: string,
    currentValue: boolean,
    setter: (val: boolean) => void
  ) => {
    const newValue = !currentValue;
    setter(newValue);

    // Autocompletar número si está activando WhatsApp o SMS
    if (newValue && user && user.phone) {
      if (field === "whatsappEnabled" && !whatsappNumber) {
        // Agregar +549 si no lo tiene
        const formattedPhone = user.phone
        setWhatsappNumber(formattedPhone);
      } else if (field === "smsEnabled" && !smsNumber) {
        // Agregar +549 si no lo tiene
        const formattedPhone = user.phone
        setSmsNumber(formattedPhone);
      }
    }

    try {
      let res;
      
      // Si no existen preferencias, crear con POST
      if (!prefsExist) {
        res = await fetch(`${BASE_URL}/notifications/preferences`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ [field]: newValue }),
        });
        
        if (res.ok) {
          setPrefsExist(true);
        }
      } else {
        // Si ya existen, actualizar con PUT
        res = await fetch(`${BASE_URL}/notifications/preferences`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ [field]: newValue }),
        });
      }

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Error al actualizar preferencia");
      }

      const data = await res.json();
      setNotifPrefs(data);
      toast.success("Preferencia actualizada");
    } catch (error) {
      console.error("Error:", error);
      toast.error(error instanceof Error ? error.message : "Error al actualizar notificación");
      // Revertir cambio
      setter(currentValue);
    }
  };

  const handleUpdateNotificationField = async (field: string, value: string) => {
    // Validar según el campo
    if ((field === "whatsappNumber" || field === "smsNumber") && value && value.trim().length > 0 && value.trim().length < 6) {
      toast.error("El número debe tener al menos 6 dígitos");
      return;
    }

    if (field === "telegramChatId" && value && !/^\d+$/.test(value)) {
      toast.error("El Chat ID debe ser numérico");
      return;
    }

    try {
      // Si no existen preferencias, primero crearlas
      if (!prefsExist) {
        const createRes = await fetch(`${BASE_URL}/notifications/preferences`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ [field]: value }),
        });

        if (createRes.ok) {
          setPrefsExist(true);
          const data = await createRes.json();
          setNotifPrefs(data);
          toast.success("Preferencias creadas y actualizado correctamente");
          return;
        }
      }

      // Si ya existen, actualizar
      const res = await fetch(`${BASE_URL}/notifications/preferences`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ [field]: value }),
      });

      if (!res.ok) throw new Error("Error al actualizar");

      const data = await res.json();
      setNotifPrefs(data);
      toast.success("Actualizado correctamente");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al actualizar");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100 py-6 sm:py-8 px-3 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-gray-600 bg-white px-4 py-3 rounded-lg shadow-sm">
          <NavLink 
            to="/profile" 
            className="hover:text-blue-600 transition"
          >
            Mi Perfil
          </NavLink>
          <FaChevronRight className="mx-2 text-gray-400" size={12} />
          <span className="text-gray-800 font-medium">Información de tu perfil</span>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Información de Perfil
          </h1>
          <p className="text-sm text-gray-500">
            Gestiona tu información personal y preferencias
          </p>
        </div>

        {/* Información Personal */}
        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-50 rounded-lg">
              <FaUser className="text-xl text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                Información Personal
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Actualiza tus datos personales
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    setHasChanges(true);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Tu nombre"
                />
              </div>

              {/* Apellido */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apellido
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    setHasChanges(true);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Tu apellido"
                />
              </div>
            </div>

            {/* Dirección */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaMapMarkerAlt className="inline mr-2 text-gray-500" />
                Dirección
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  setHasChanges(true);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Calle, número, ciudad, provincia"
              />
            </div>
          </div>
        </div>

        {/* Datos de la Cuenta */}
        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-50 rounded-lg">
              <FaEnvelope className="text-xl text-green-600" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                Datos de la Cuenta
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Información de contacto
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Email (no editable) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaEnvelope className="inline mr-2 text-gray-500" />
                Email
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                El email no puede modificarse
              </p>
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaPhone className="inline mr-2 text-gray-500" />
                Teléfono
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setHasChanges(true);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="351 123 4567"
              />
              <p className="text-xs text-gray-500 mt-1">
                Ingresa tu número de teléfono
              </p>
            </div>
          </div>
        </div>

        {/* Botones Guardar y Descartar */}
        {hasChanges && (
          <div className="flex justify-end gap-3">
            <button
              onClick={handleDiscardChanges}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition shadow-md"
            >
              Descartar
            </button>
            <button
              onClick={handleSavePersonalInfo}
              disabled={saving}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        )}

        {/* Preferencias de Notificaciones */}
        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-50 rounded-lg">
              <FaBell className="text-xl text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                Preferencias de Notificaciones
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Elige cómo recibir actualizaciones de tus pedidos
              </p>
            </div>
          </div>

          {!prefsExist && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ℹ️ Aún no has configurado tus preferencias de notificación. Activa cualquier canal para comenzar.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {/* Email Notifications */}
            <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <MdEmail className="text-2xl text-red-500" />
                  <div>
                    <p className="font-medium text-gray-800">Email</p>
                    <p className="text-xs text-gray-500">
                      Notificaciones por correo electrónico
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailEnabled}
                    onChange={() =>
                      handleToggleNotification(
                        "emailEnabled",
                        emailEnabled,
                        setEmailEnabled
                      )
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <FaWhatsapp className="text-2xl text-green-500" />
                  <div>
                    <p className="font-medium text-gray-800">WhatsApp</p>
                    <p className="text-xs text-gray-500">
                      Notificaciones por WhatsApp
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={whatsappEnabled}
                    onChange={() =>
                      handleToggleNotification(
                        "whatsappEnabled",
                        whatsappEnabled,
                        setWhatsappEnabled
                      )
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
              {whatsappEnabled && (
                <div className="mt-3 pl-11">
                  <input
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    onBlur={(e) => handleUpdateNotificationField("whatsappNumber", e.target.value)}
                    placeholder="+549 351 123 4567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Formato: +549 + código de área + número
                  </p>
                </div>
              )}
            </div>

            {/* SMS */}
            <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <MdSms className="text-2xl text-purple-500" />
                  <div>
                    <p className="font-medium text-gray-800">SMS</p>
                    <p className="text-xs text-gray-500">
                      Notificaciones por mensaje de texto
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={smsEnabled}
                    onChange={() =>
                      handleToggleNotification(
                        "smsEnabled",
                        smsEnabled,
                        setSmsEnabled
                      )
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              {smsEnabled && (
                <div className="mt-3 pl-11">
                  <input
                    type="tel"
                    value={smsNumber}
                    onChange={(e) => setSmsNumber(e.target.value)}
                    onBlur={(e) => handleUpdateNotificationField("smsNumber", e.target.value)}
                    placeholder="+549 351 123 4567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Formato: +549 + código de área + número
                  </p>
                </div>
              )}
            </div>

            {/* Telegram */}
            <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <FaTelegram className="text-2xl text-blue-400" />
                  <div>
                    <p className="font-medium text-gray-800">Telegram</p>
                    <p className="text-xs text-gray-500">
                      Notificaciones por Telegram
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={telegramEnabled}
                    onChange={() =>
                      handleToggleNotification(
                        "telegramEnabled",
                        telegramEnabled,
                        setTelegramEnabled
                      )
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-400"></div>
                </label>
              </div>
              {telegramEnabled && (
                <div className="mt-3 pl-11">
                  <input
                    type="text"
                    value={telegramChatId}
                    onChange={(e) => setTelegramChatId(e.target.value)}
                    onBlur={(e) => handleUpdateNotificationField("telegramChatId", e.target.value)}
                    placeholder="123456789"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Obtén tu Chat ID hablando con @virtualpet88_bot en Telegram
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> Activa múltiples canales para no perderte
              ninguna actualización de tus pedidos
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileInfoPage;