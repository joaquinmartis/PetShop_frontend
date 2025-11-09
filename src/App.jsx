import { useState } from 'react'
import { Home } from './Pages/Home'
import { Cart } from './Pages/Cart'
import { Order } from './Pages/Order'
import { CounterPage } from './Pages/Counter'
import { LoginPage } from './Pages/Login'
import { AuthPromptPage } from "./Pages/AuthPage";
import { RegisterPage } from "./Pages/RegisterPage";
import { ProfilePage } from "./Pages/ProfilePage";
import { Toaster } from "react-hot-toast";

import {
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Route,
  Outlet
} from 'react-router-dom'

import SideBar from './components/Sidebar.tsx'
function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path='/' element={<Root />}>
        <Route index element={<Home />} />
        <Route path='cart' element={<Cart />} />
        <Route path='orders' element={<Order />} />
        <Route path='counter' element={<CounterPage />} />
        <Route path='login' element={<LoginPage />} />
        <Route path="/auth" element={<AuthPromptPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
    )
  )

  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  )
}

export default App

const Root = () => {
  return (
    <>
      <div>
        <SideBar />
      </div>
      <div>
        {/* Acá se van a renderizar las páginas hijas */}
        <Outlet />
        <Toaster position="top-center" reverseOrder={false} />
      </div>
    </>

  )
}
