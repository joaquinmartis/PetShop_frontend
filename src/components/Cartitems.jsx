import React from 'react'
import { AiFillDelete } from 'react-icons/ai'
import { BsArrowLeft } from 'react-icons/bs'

import useCartStore from "../store/cartStore";

import image from '../assets/Dispenser.webp'



const Cartitems = () => {
  const { items, removeFromCart, updateQty } = useCartStore((state) => state);
  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const shipping = 10000; // Assuming 10% tax
  const total = subtotal + shipping;

  return (
    <div className="w-11/12 m-auto py-10">
      <h1 className="text-3xl font-bold ">Carrito de Compras</h1>
      <p className="text-sm text-gray-400">Hay {items.reduce((sum, i) => sum + i.quantity, 0)} items en tu carrito</p>

      <section className="flex justify-between items-center space-x-10">
        <div className="w-[60%] space-y-3">
          <table className="w-full">
            <thead className='border-b'>
              <tr className="text-left text-gray-40">
                <th className="py-2">Producto</th>
                <th className="py-2">Precio</th>
                <th className="py-2">Cantidad</th>
                <th className="py-2">Total</th>
                <th className="py-2 lex justify-center items-center">Eliminar</th>
              </tr>
            </thead>

            <tbody className='space-y-20'>

              {items.map((item) => (



                <tr key={item.id} className="bprder-dashed border-b">
                  <td className="py-5">
                    <div className="flex items-center space-x-3 py-2">
                      <img
                        src={new URL(item.image[0], import.meta.url).href}
                        alt={item.title}
                        width={80}
                        height={80}
                        className="rounded-md mr-4"
                      />
                      <div>
                        <h1 className="text-xl font-bold">{item.title}</h1>
                        <p className="text-sm text-gray-500">Descripción breve</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-gray-700">${item.price.toFixed(2)}</td>

                  <td>
                    <div className="flex flex-col items-center mt-2">
                      {/* Contenedor principal */}
                      <div className="flex items-center border rounded-full overflow-hidden">
                        {/* Botón de restar */}
                        <button
                          onClick={() => updateQty("decrement", item.id)}
                          className="px-3 py-1 text-gray-500 hover:text-gray-700 disabled:text-gray-300"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>

                        {/* Cantidad */}
                        <span className="px-4 text-sm font-medium text-gray-800 select-none">
                          {item.quantity}
                        </span>

                        {/* Botón de sumar */}
                        <button
                          onClick={() => updateQty("increment", item.id)}
                          className="px-3 py-1 text-blue-500 hover:text-blue-700"
                        >
                          +
                        </button>
                      </div>

                      {/* Texto inferior */}
                      <p className="text-xs text-gray-500 mt-1">+ x disponibles (no implementado)</p>
                    </div>

                  </td>

                  <td className="text-gray-700 font-medium">${item.price.toFixed(2) * item.quantity}</td>

                  <td>
                    <button className="flex justify-center items-center text-red-500 hover:text-red-700 transition cursor-pointer w-full h-full"
                      onClick={() => removeFromCart(item.id)}>
                      <AiFillDelete size={"1.5rem"} />
                    </button>
                  </td>
                </tr>

              ))}

            </tbody>
          </table>
        </div>

        {/* Botón continuar comprando */}
        <div className="my-5">
          <button className="flex items-center space-x-3 bg-gray-200 font-semibold rounded p-2 cursor-pointer ">
            <BsArrowLeft />
            <span>Continuar comprando</span>
          </button>
        </div>

        {/* Resumen */}
        <div className="w-[40%] h-fit shadow rounded p-5 space-y-5">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Resumen de Compra
          </h2>
          <div className="flex justify-between items-center border-b border-gray-500 p-2">
            <h1 className='text-xl'>Subtotal</h1>
            <p>${subtotal.toFixed(2)}</p>
          </div>

          <div className="flex justify-between items-center border-b  border-gray-500 p-2">
            <h1 className='text-xl'>Descuento</h1>
            <p>$0.00</p>
          </div>

          <div className="flex justify-between items-center border-gray-500 p-2">
            <h1 className='text-xl'>Envío</h1>
            <p>${shipping.toFixed(2)}</p>
          </div>

          <div className="flex justify-between text-lg font-semibold text-gray-900 border-t border-gray-500 pt-3">
            <h1 className='text-xl'>Total</h1>
            <p>${total.toFixed(2)}</p>
          </div>

          <button className="w-full p-2 bg-gray-800 text-center text-white rounded cursor-pointer ">
            Finalizar Compra
          </button>
        </div>
      </section>
    </div>
  );
};

export default Cartitems