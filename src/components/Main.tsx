import React, { useEffect, useRef, useState, ChangeEvent } from "react";
import { CiSearch } from "react-icons/ci";
import { useNavigate, useLocation } from "react-router-dom";
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
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const loaderRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  // 🔹 Derivar parámetros de la URL (single source of truth)
  const params = new URLSearchParams(location.search);
  const categoryName = params.get("category");
  const searchTerm = params.get("search") || "";

  const selectedCategory = categories.find(
    c => c.name.toLowerCase() === categoryName?.toLowerCase()
  )?.id ?? null;

  // 🔹 Cargar categorías
  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const res = await fetch("http://localhost:8080/api/categories", {
          credentials: "include",
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error("No se pudieron cargar categorías");
        const data: Category[] = await res.json();
        if (Array.isArray(data)) setCategories(data);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") console.error(err);
      }
    })();
    return () => ctrl.abort();
  }, []);

  // 🔹 Resetear cuando cambian los filtros (URL)
  useEffect(() => {
    setProducts([]);
    setPage(0);
    setHasMore(true);
  }, [categoryName, searchTerm]);

  // 🔹 Cargar productos
  useEffect(() => {
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    const fetchPage = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("size", String(PAGE_SIZE));

        if (selectedCategory !== null)
          params.set("categoryId", String(selectedCategory));

        if (searchTerm.trim())
          params.set("name", searchTerm.trim());

        const res = await fetch(
          `http://localhost:8080/api/products?${params.toString()}`,
          { credentials: "include", signal: ctrl.signal }
        );
        
        if (!res.ok) throw new Error("Error al obtener productos");

        const data = await res.json();
        const newItems: Product[] = Array.isArray(data.content) ? data.content : [];

        if (!ctrl.signal.aborted) {
          setProducts((prev) => (page === 0 ? newItems : [...prev, ...newItems]));
          setHasMore(typeof data.last === "boolean" ? !data.last : newItems.length === PAGE_SIZE);
        }
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError")
          console.error("fetch products:", err);
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    };

    fetchPage();
    return () => ctrl.abort();
  }, [page, selectedCategory, searchTerm]);

  // 🔹 Scroll infinito
  useEffect(() => {
    const node = loaderRef.current;
    if (!node) return;

    if (observerRef.current) observerRef.current.disconnect();

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((p) => p + 1);
        }
      },
      { root: null, rootMargin: "300px", threshold: 0.1 }
    );

    observer.observe(node);
    observerRef.current = observer;

    return () => observer.disconnect();
  }, [loading, hasMore]);

  // 🔹 Helpers - Solo actualizan la URL
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    
    searchTimerRef.current = setTimeout(() => {
      const newParams = new URLSearchParams();
      if (v.trim()) newParams.set("search", v.trim());
      navigate(`/?${newParams.toString()}`);
    }, 400);
  };

  const handleCategoryClick = (categoryName: string) => {
    const newParams = new URLSearchParams();
    newParams.set("category", categoryName);
    navigate(`/?${newParams.toString()}`);
  };

  const handleVerTodo = () => {
    navigate("/");
  };

  return (
    <div className="w-full">
      {/* HEADER */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <h1
              className="text-2xl sm:text-3xl font-bold cursor-pointer"
              onClick={handleVerTodo}
            >
              PetShop
            </h1>

            <div className="flex items-center bg-gray-100 rounded-full px-3 py-2 w-full md:w-96">
              <input
                type="text"
                placeholder="Buscar..."
                defaultValue={searchTerm}
                className="bg-transparent outline-none flex-grow text-sm"
                onChange={handleSearchChange}
              />
              <CiSearch size={20} className="text-gray-600" />
            </div>
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