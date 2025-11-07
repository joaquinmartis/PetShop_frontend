import React, { useState } from 'react'


import { CiShoppingCart, CiSearch } from 'react-icons/ci'
const Dispenser = '../assets/Dispenser.webp'
import { Product } from "../types/types";
import useCartStore from "../store/cartStore";


import { useNavigate } from 'react-router-dom';

function ProductCard({ product }: { product: Product }) {
  const addToCart = useCartStore((state) => state.addToCart);
  const navigate = useNavigate();

  const handleAddToCart = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/auth"); // redirige a la página de login/registro
      return;
    }
    addToCart(product);
  };

  return (
    <div className="product h-[300px] bg-white drop-shadow-2xl p-2 rounded">
      <img
        src={new URL(product.image[0], import.meta.url).href}
        alt={product.title}
        className="w-full h-[60%] object-cover p-2"
      />
      <div className="m-2 bg-gray-100 p-2">
        <h1 className="text-xl font-semibold">{product.title}</h1>
        <p className="text-sm">{product.description}</p>
        <div className="flex justify-between items-center">
          <p className="text-xl font-bold">${product.price}.00</p>
          <button
            className="cursor-pointer p-2 rounded hover:bg-gray-200 transition"
            onClick={handleAddToCart}
          >
            <CiShoppingCart size={"1.4rem"} />
          </button>
        </div>
      </div>
    </div>
  );
}




const Main = () => {
  const Products: Product[] = [
    {
      id: 1,
      title: "Dispenser",
      price: 2300,
      description: "lorem",
      image: [Dispenser],
    },
    {
      id: 2,
      title: "Dispenser caro",
      price: 4300,
      description: "lorem",
      image: [Dispenser],
    },
  ];

  const [filteredProducts, setFilteredProducts] = useState<Product[]>(Products);

  const searchHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    const filteredArray = Products.filter((product) =>
      product.title.toLowerCase().includes(value)
    );
    setFilteredProducts(filteredArray.length > 0 ? filteredArray : Products);
  };

  return (
    <div className="w-full relative">
      <div className="sticky top-0 z-10">
        {/* Header */}
        <div className="header flex justify-between items-center p-4 bg-white">
          <h1 className="text-3xl font-bold">PetShop</h1>
          <div className="search flex justify-between items-center px-5 py-2 bg-gray-100 rounded">
            <input
              type="text"
              placeholder="Search Product"
              className="bg-transparent outline-0"
              onChange={searchHandler}
            />
            <button>
              <CiSearch />
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="categories w-full flex space-x-8 px-2 py-10">
          <div className="bg-black text-white px-5 py-2 rounded-full drop-shadow-xl">
            <p>Perros</p>
          </div>
          <div className="bg-white text-black px-5 py-2 rounded-full drop-shadow-xl">
            <p>Gatos</p>
          </div>
        </div>

        {/* Products */}
        <div className="products grid grid-cols-2 xl:grid-cols-5 lg:grid-cols-3 gap-9 p-4 z-20">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Main