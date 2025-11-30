import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ProductCard from "./ProductCard";
import { Product } from "../types/types";

const PAGE_SIZE = 12;
const BASE_URL = import.meta.env.VITE_BACKEND_URL;

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

  const navigate = useNavigate();
  const location = useLocation();

  // Obtener parámetros desde la URL
  const params = new URLSearchParams(location.search);
  const categoryName = params.get("category");
  const searchTerm = params.get("search")?.trim() || "";

  // Obtener categoryId a partir de categories
  const selectedCategory =
    categories.find(
      (c) => c.name.toLowerCase() === categoryName?.toLowerCase()
    )?.id ?? null;

  // --- Cargar categorías
  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/categories`, {
          credentials: "include",
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error("No se pudieron cargar categorías");
        const data: Category[] = await res.json();
        if (!ctrl.signal.aborted && Array.isArray(data)) setCategories(data);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") console.error(err);
      }
    })();
    return () => ctrl.abort();
  }, []);

  // --- Reset productos al cambiar filtros
  useEffect(() => {
    // esperar a que las categorías estén listas si hay categoryName
    if (categoryName && categories.length === 0) return;

    // abort cualquier fetch anterior
    if (abortRef.current) abortRef.current.abort();

    setProducts([]);
    setPage(0);
    setHasMore(true);
  }, [categoryName, searchTerm, categories]);

  // --- Fetch productos
  useEffect(() => {
    if (categoryName && categories.length === 0) return;

    const ctrl = new AbortController();
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = ctrl;

    const fetchPage = async () => {
      try {
        setLoading(true);

        const q = new URLSearchParams();
        q.set("page", String(page));
        q.set("size", String(PAGE_SIZE));
        if (selectedCategory !== null) q.set("categoryId", String(selectedCategory));
        if (searchTerm) q.set("name", searchTerm);

        const res = await fetch(`${BASE_URL}/products?${q.toString()}`, {
          credentials: "include",
          signal: ctrl.signal,
        });

        if (!res.ok) throw new Error(`Error al obtener productos: ${res.status}`);

        const data = await res.json();
        const newItems: Product[] = Array.isArray(data.content) ? data.content : [];

        if (!ctrl.signal.aborted) {
          setProducts((prev) => (page === 0 ? newItems : [...prev, ...newItems]));
          setHasMore(typeof data.last === "boolean" ? !data.last : newItems.length === PAGE_SIZE);
        }
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") console.error(err);
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    };

    fetchPage();

    return () => ctrl.abort();
  }, [page, selectedCategory, searchTerm, categories, categoryName]);

  // --- Scroll infinito
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
  }, [loading, hasMore, products.length]);

  return (
    <div className="w-full">
      {/* GRID */}
      <div className="max-w-7xl mx-auto p-4 grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {products.length === 0 && !loading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 px-4">
            <div className="w-24 h-24 mb-6 text-gray-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No se encontraron productos
            </h3>
            <p className="text-gray-500 text-center max-w-md">
              {searchTerm
                ? `No hay resultados para "${searchTerm}". Intenta con otro término de búsqueda.`
                : categoryName
                  ? `No hay productos en esta categoría por el momento.`
                  : "El catálogo está vacío."}
            </p>
          </div>
        ) : (
          products.map((p) => <ProductCard key={p.id} product={p} />)
        )}
      </div>

      {/* SENTINEL */}
      <div ref={loaderRef} className="flex justify-center p-8">
        {loading ? (
          <div className="flex flex-col items-center gap-3">

            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando Productos...</p>
          </div>
        ) : hasMore ? (
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6 animate-bounce"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
              />
            </svg>
            <p className="text-sm">Desplázate para ver más</p>
          </div>
        ) : products.length > 0 ? (
          <div className="flex flex-col items-center gap-3 py-8">

            <div className="text-center">
              <p className="text-sm text-gray-500">
                Has llegado al final del catálogo
              </p>
            </div>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="mt-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18"
                />
              </svg>
              Volver arriba
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}