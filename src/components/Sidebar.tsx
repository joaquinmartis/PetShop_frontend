import React, { useEffect, useRef, useState, ChangeEvent, KeyboardEvent } from "react";
import { HiOutlineMenuAlt2, HiOutlineHome } from "react-icons/hi";
import { CiShoppingCart, CiSearch } from "react-icons/ci";
import { FiUser } from "react-icons/fi";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import useCartStore from "../store/cartStore";

interface Category {
  id: number;
  name: string;
}

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const SideBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategories, setShowCategories] = useState(false);
  const [open, setOpen] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);

  const count = useCartStore((state) =>
    state.items.reduce((acc, item) => acc + item.quantity, 0)
  );

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputMobileRef = useRef<HTMLInputElement>(null);
  const searchInputDesktopRef = useRef<HTMLInputElement>(null);

  const params = new URLSearchParams(location.search);
  const searchTerm = params.get("search") || "";
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/categories`, {
          credentials: "include",
          signal: ctrl.signal,
        });
        const data = (await res.json()) as Category[];
        setCategories(data);
      } catch (err) {
        if ((err as any)?.name !== "AbortError") console.error(err);
      }
    })();
    return () => ctrl.abort();
  }, []);

  // Limpiar ambos inputs cuando cambia la URL sin parámetro search
  useEffect(() => {
    if (!searchTerm) {
      if (searchInputMobileRef.current) searchInputMobileRef.current.value = "";
      if (searchInputDesktopRef.current) searchInputDesktopRef.current.value = "";
    }
  }, [searchTerm]);

  const goToCategory = (c: Category) => {
    navigate(`/?category=${encodeURIComponent(c.name)}`);
    setShowCategories(false);
    setOpen(false);
  };

  const closeSidebar = () => setOpen(false);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Sincronizar ambos inputs
    if (searchInputMobileRef.current) searchInputMobileRef.current.value = value;
    if (searchInputDesktopRef.current) searchInputDesktopRef.current.value = value;
    
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    // Solo buscar automáticamente si estamos en home
    if (isHomePage) {
      searchTimerRef.current = setTimeout(() => {
        const newParams = new URLSearchParams();
        if (value.trim()) newParams.set("search", value.trim());
        navigate(`/?${newParams.toString()}`);
      }, 400);
    }
  };

  const handleSearchSubmit = () => {
    const value = searchInputMobileRef.current?.value || searchInputDesktopRef.current?.value || "";
    const newParams = new URLSearchParams();
    if (value.trim()) newParams.set("search", value.trim());
    navigate(`/?${newParams.toString()}`);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  return (
    <>
      {/* HEADER MOBILE */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-white shadow z-50 flex items-center justify-between px-3 gap-3 lg:hidden">
        <button className="p-2 rounded bg-gray-100" onClick={() => setOpen(true)}>
          <HiOutlineMenuAlt2 size={22} />
        </button>

        {/* LOGO + BUSCADOR */}
        <div className="flex flex-1 justify-center items-center gap-3">
          <h1
            className="text-2xl font-bold cursor-pointer whitespace-nowrap"
            onClick={() => navigate("/")}
          >
            PetShop
          </h1>

          <div className="flex items-center bg-gray-100 rounded-full px-3 py-2 w-[30%] sm:w-[50%]">
            <input
              ref={searchInputMobileRef}
              type="text"
              placeholder="Buscar..."
              defaultValue={searchTerm}
              className="bg-transparent outline-none flex-grow text-sm"
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
            />
            <CiSearch
              size={20}
              onClick={handleSearchSubmit}
              className="text-gray-600 cursor-pointer hover:scale-110 transition"
            />
          </div>
        </div>
      </header>

      {/* HEADER DESKTOP */}
      <header className="
  hidden lg:flex fixed top-0 left-0 right-0
  h-16 bg-white shadow z-40 items-center justify-between px-6 gap-6
">
        <h1
          className="text-3xl font-bold cursor-pointer whitespace-nowrap"
          onClick={() => navigate("/")}
        >
          PetShop
        </h1>

        <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 w-96">
          <input
            ref={searchInputDesktopRef}
            type="text"
            placeholder="Buscar productos..."
            defaultValue={searchTerm}
            className="bg-transparent outline-none flex-grow text-sm"
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
          />
          <CiSearch
            size={22}
            onClick={handleSearchSubmit}
            className="text-gray-600 cursor-pointer hover:scale-110 transition"
          />
        </div>
      </header>

      {/* OVERLAY */}
      <div
        onClick={closeSidebar}
        className={`lg:hidden fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* SIDEBAR */}
      <aside
  onMouseEnter={() => setSidebarHovered(true)}
  onMouseLeave={() => {
    setSidebarHovered(false);
    setShowCategories(false);
  }}
  className={`
    fixed top-0 left-0 h-screen bg-white shadow-xl
    pt-16 lg:pt-16
    transform transition-all duration-300 ease-out

    w-64
    ${open ? "translate-x-0" : "-translate-x-full"}

    lg:translate-x-0
    ${sidebarHovered ? "lg:w-64" : "lg:w-16"}

    z-50 lg:z-30   /* 📌 AQUÍ el truco */
  `}
>
        <nav className="flex flex-col gap-2 px-3 py-4">

          <NavLink
            to="/"
            onClick={closeSidebar}
            className="flex items-center gap-3 p-2 rounded hover:bg-gray-100"
            title="Inicio"
          >
            <HiOutlineHome size={20} className="flex-shrink-0" /> 
            <span className={`whitespace-nowrap ${sidebarHovered ? "" : "lg:hidden"}`}>Inicio</span>
          </NavLink>

          <button
            onClick={() => setShowCategories(!showCategories)}
            className="flex items-center gap-3 p-2 rounded hover:bg-gray-100"
            title="Categorías"
          >
            <HiOutlineMenuAlt2 size={20} className="flex-shrink-0" />
            <span className={`whitespace-nowrap ${sidebarHovered ? "" : "lg:hidden"}`}>Categorías</span>
          </button>

          <div
            className={`transition-all duration-300 overflow-hidden ${
              showCategories ? "max-h-[600px]" : "max-h-0"
            }`}
          >
            <div className="ml-6 mt-1 border-l border-gray-200 pl-2 py-2 flex flex-col gap-1">
              <button
                onClick={() => {
                  navigate("/");
                  setShowCategories(false);
                  closeSidebar();
                }}
                className="block text-left px-2 py-1 rounded hover:bg-gray-100 text-sm"
              >
                Ver todo
              </button>

              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => goToCategory(c)}
                  className="block w-full text-left px-2 py-1 rounded hover:bg-gray-100 text-sm"
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              navigate("/cart");
              closeSidebar();
            }}
            className="relative flex items-center gap-3 p-2 rounded hover:bg-gray-100"
            title="Carrito"
          >
            <CiShoppingCart size={22} className="flex-shrink-0" />
            <span className={`whitespace-nowrap ${sidebarHovered ? "" : "lg:hidden"}`}>Carrito</span>

          </button>

          <button
            onClick={() => {
              navigate("/profile");
              closeSidebar();
            }}
            className="flex items-center gap-3 p-2 rounded hover:bg-gray-100"
            title="Perfil"
          >
            <FiUser size={20} className="flex-shrink-0" />
            <span className={`whitespace-nowrap ${sidebarHovered ? "" : "lg:hidden"}`}>Perfil</span>
          </button>
        </nav>
      </aside>
    </>
  );
};

export default SideBar;