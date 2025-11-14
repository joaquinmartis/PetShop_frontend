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
