export type Category = {
  id: number;
  name: string;
  description: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Product = {




  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;

  category: Category;

  imageUrl: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;


};