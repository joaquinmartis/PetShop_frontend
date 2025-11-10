import React, { useState, useEffect, useRef } from "react";
import { HiOutlineMenuAlt2, HiOutlineHome } from "react-icons/hi";
import { CiShoppingCart } from "react-icons/ci";
import { FiUser } from "react-icons/fi";
import { NavLink, useNavigate } from "react-router-dom";

interface Category {
  id: number;
  name: string;
}

const SideBar = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategories, setShowCategories] = useState(false);
  const menuRef = useRef<HTMLLIElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // 🔹 Cargar categorías del backend
  useEffect(() => {
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    (async () => {
      try {
        const res = await fetch("http://localhost:8080/api/categories", {
          credentials: "include",
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error("No se pudieron cargar categorías");
        const data: Category[] = await res.json();
        if (Array.isArray(data)) setCategories(data);
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error(err);
        }
      }
    })();

    return () => ctrl.abort();
  }, []);

  // 🔹 Cerrar menú al hacer clic fuera
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowCategories(false);
      }
    };

    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const handleUserClick = () => navigate("/profile");

  // 🔹 Navegación por categoría
  const handleCategoryClick = (cat: Category) => {
    navigate(`/?category=${encodeURIComponent(cat.name)}`);
    setShowCategories(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 🔹 "Ver todo" -> quita el parámetro de categoría
  const handleVerTodo = () => {
    navigate("/"); // quita el query param
    setShowCategories(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="fixed top-0 left-0 h-screen bg-gray-100 shadow-md z-50">
      <ul className="p-5 space-y-8 relative">
        {/* 🏠 Home */}
        <li>
          <NavLink to="/">
            <button className="cursor-pointer p-2 rounded hover:bg-gray-200 transition">
              <HiOutlineHome size={"1.5rem"} />
            </button>
          </NavLink>
        </li>

        {/* 📂 Categorías */}
        <li className="relative" ref={menuRef}>
          <button
            className={`cursor-pointer p-2 rounded transition ${
              showCategories ? "bg-gray-200" : "hover:bg-gray-200"
            }`}
            onClick={() => setShowCategories((prev) => !prev)}
          >
            <HiOutlineMenuAlt2 size={"1.5rem"} />
          </button>

          {showCategories && (
            <div className="absolute left-full ml-2 top-0 w-64 bg-white rounded-lg shadow-lg border p-3 z-40">

              <button
                onClick={handleVerTodo}
                className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200 mb-2"
              >
                Ver todo
              </button>

              <div className="flex flex-col max-h-56 overflow-auto gap-1">
                {categories.length === 0 ? (
                  <div className="text-sm text-gray-500 px-3 py-2">
                    Cargando...
                  </div>
                ) : (
                  categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleCategoryClick(c)}
                      className="text-left px-3 py-2 rounded-md text-sm hover:bg-gray-100"
                    >
                      {c.name}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </li>

        {/* 🛒 Carrito */}
        <li>
          <NavLink to="/cart">
            <button className="cursor-pointer p-2 rounded hover:bg-gray-200 transition">
              <CiShoppingCart size={"1.5rem"} />
            </button>
          </NavLink>
        </li>

        {/* 👤 Usuario */}
        <li>
          <button
            onClick={handleUserClick}
            className="cursor-pointer p-2 rounded hover:bg-gray-200 transition"
          >
            <FiUser size={"1.5rem"} />
          </button>
        </li>
      </ul>
    </div>
  );
};

export default SideBar;
