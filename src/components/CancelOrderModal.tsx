// src/components/CancelOrderModal.tsx
import React, { useState } from "react";
import { AiOutlineClose } from "react-icons/ai";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  loading?: boolean;
}

export function CancelOrderModal({ isOpen, onClose, onConfirm, loading }: Props) {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-fadeIn">
        
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Cancelar pedido</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <AiOutlineClose size={18} />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Por favor, ingresa el motivo por el cual deseas cancelar el pedido.
        </p>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full h-28 p-3 border border-gray-300 rounded-lg text-sm resize-none focus:ring focus:ring-indigo-200"
          placeholder="Describa el motivo..."
        />

        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="flex-1 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Cerrar
          </button>

          <button
            disabled={loading || reason.trim().length === 0}
            onClick={() => onConfirm(reason)}
            className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
          >
            {loading ? "Cancelando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}
