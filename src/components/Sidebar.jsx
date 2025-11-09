import React, { useState, useEffect, useRef } from "react";
import { HiOutlineMenuAlt2, HiOutlineHome } from "react-icons/hi";
import { CiShoppingCart } from "react-icons/ci";
import { FiUser } from "react-icons/fi";
import { NavLink, useNavigate } from "react-router-dom";

const SideBar = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [showCategories, setShowCategories] = useState(false);
  const menuRef = useRef(null);

  // 🔹 Cargar categorías del backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/products/categories");
        if (!response.ok) throw new Error("Error al obtener categorías");
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error("Error cargando categorías:", err);
      }
    };
    fetchCategories();
  }, []);

  // 🔹 Cerrar el menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowCategories(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUserClick = () => navigate("/profile");

  const handleCategoryClick = (categoryName) => {
    navigate(`/?category=${encodeURIComponent(categoryName)}`);
    setShowCategories(false);
  };

  const handleVerTodo = () => {
    navigate("/");
    setShowCategories(false);
  };

  return (
    <div className="fixed top-0 left-0 h-screen bg-gray-100 shadow-md z-50">
      <ul className="p-5 space-y-8 relative">

        <li>
          <NavLink to="/">
            <button className="cursor-pointer p-2 rounded hover:bg-gray-200 transition">
              <HiOutlineHome size={"1.5rem"} />
            </button>
          </NavLink>
        </li>


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
            <div className="absolute left-12 top-0 w-64 bg-white rounded-lg shadow-lg border p-3 z-40">
              <button
                onClick={handleVerTodo}
                className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200 mb-2"
              >
                Ver todo
              </button>

              <div className="flex flex-col max-h-56 overflow-auto gap-1">
                {categories.length === 0 ? (
                  <div className="text-sm text-gray-500 px-3 py-2">Cargando...</div>
                ) : (
                  categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleCategoryClick(c.name)}
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
