import React, { useEffect, useRef, useState, ChangeEvent } from "react";
import { CiSearch } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";
import { Product } from "../types/types";

const PAGE_SIZE = 12;

interface Category {
  id: number;
  name: string;
}

export default function Main() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");

  const loaderRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  // Fetch categories once
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

  // Fetch products
  useEffect(() => {
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    const fetchPage = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("size", String(PAGE_SIZE));
        if (selectedCategory !== null) params.set("categoryId", String(selectedCategory));
        if (search.trim()) params.set("name", search.trim());

        const url = `http://localhost:8080/api/products?${params.toString()}`;
        const res = await fetch(url, { credentials: "include", signal: ctrl.signal });
        if (!res.ok) throw new Error("Error al obtener productos");

        const data = await res.json();
        const newItems: Product[] = Array.isArray(data.content) ? data.content : [];

        setProducts((prev) => (page === 0 ? newItems : [...prev, ...newItems]));

        // determinar si hay más
        if (typeof data.last === "boolean") setHasMore(!data.last);
        else setHasMore(newItems.length === PAGE_SIZE);
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") console.error("fetch products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
    return () => ctrl.abort();
  }, [page, selectedCategory, search]);

  // IntersectionObserver para scroll infinito
  useEffect(() => {
    const node = loaderRef.current;
    if (observerRef.current) observerRef.current.disconnect();
    if (!node || loading || !hasMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((p) => p + 1);
        }
      },
      { root: null, rootMargin: "300px", threshold: 0.1 }
    );

    observerRef.current.observe(node);

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [loading, hasMore]);

  // Click fuera para cerrar dropdown
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const btn = document.getElementById("categories-toggle-btn");
      const menu = document.getElementById("categories-menu");
      if (!btn) return;
      if (btn.contains(e.target as Node)) return;
      if (menu && menu.contains(e.target as Node)) return;
      setDropdownOpen(false);
    };

    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  // Helpers
  const resetAndLoad = (newCategory: number | null = null, newSearch = "") => {
    if (abortRef.current) abortRef.current.abort();
    setProducts([]);
    setPage(0);
    setHasMore(true);
    setSelectedCategory(newCategory);
    setSearch(newSearch);
  };

  // Handlers
  const handleCategoryClick = (catId: number) => {
    resetAndLoad(catId, "");
    setDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleVerTodo = () => {
    resetAndLoad(null, "");
    setDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      resetAndLoad(null, v);
    }, 500);
  };

  return (
    <div className="w-full">
      {/* HEADER */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <h1
              className="text-2xl sm:text-3xl font-bold cursor-pointer"
              onClick={() => {
                handleVerTodo();
                navigate("/");
              }}
            >
              PetShop
            </h1>

            {/* CATEGORÍAS */}
            <div className="relative">
              <button
                id="categories-toggle-btn"
                onClick={() => setDropdownOpen((s) => !s)}
                className="bg-black text-white px-4 py-2 rounded-full text-sm"
              >
                Categorías
              </button>

              {dropdownOpen && (
                <div
                  id="categories-menu"
                  className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border p-3 z-40"
                >
                  <button
                    onClick={handleVerTodo}
                    className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200 mb-2"
                  >
                    Ver todo
                  </button>

                  <div className="flex flex-col max-h-56 overflow-auto gap-1">
                    {categories.length === 0 && (
                      <div className="text-sm text-gray-500 px-3 py-2">Cargando...</div>
                    )}
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => handleCategoryClick(c.id)}
                        className={`text-left px-3 py-2 rounded-md text-sm ${
                          selectedCategory === c.id ? "bg-black text-white" : "hover:bg-gray-100"
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* BUSCADOR */}
          <div className="flex items-center bg-gray-100 rounded-full px-3 py-2 w-full md:w-96">
            <input
              type="text"
              placeholder="Buscar..."
              className="bg-transparent outline-none flex-grow text-sm"
              onChange={handleSearchChange}
            />
            <CiSearch size={20} className="text-gray-600" />
          </div>
        </div>
      </div>

      {/* GRID */}
      <div className="max-w-7xl mx-auto p-4 grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {products.length === 0 && !loading ? (
          <div className="col-span-full text-center text-gray-500 py-20">
            No se encontraron productos.
          </div>
        ) : (
          products.map((p) => <ProductCard key={p.id} product={p} />)
        )}
      </div>

      {/* SENTINEL */}
      <div ref={loaderRef} className="flex justify-center p-6">
        {loading ? (
          <p>Cargando...</p>
        ) : hasMore ? (
          <p>Desplazate para cargar más</p>
        ) : (
          <p>Fin del catálogo</p>
        )}
      </div>
    </div>
  );
}
