import React from 'react'
import { HiOutlineMenuAlt2, HiOutlineHome } from 'react-icons/hi'
import { CiShoppingCart } from 'react-icons/ci'
import { FiUser } from 'react-icons/fi'
import { NavLink, useNavigate } from 'react-router-dom'

const SideBar = () => {
  const navigate = useNavigate()

  const handleUserClick = () => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      navigate('/profile')
    } else {
      navigate('/login')
    }
  }

  return (
    <div className='fixed top-0 left-0 h-screen bg-gray-100 shadow-md'>
      <ul className='p-5 space-y-8'>
        <li>
          <NavLink to='/'>
            <button className="cursor-pointer p-2 rounded hover:bg-gray-200 transition">
              <HiOutlineHome size={'1.5rem'} />
            </button>
          </NavLink>
        </li>
        <li>
          <NavLink to='/'>
            <button className="cursor-pointer p-2 rounded hover:bg-gray-200 transition">
              <HiOutlineMenuAlt2 size={'1.5rem'} />
            </button>
          </NavLink>
        </li>
        <li>
          <NavLink to='/cart'>
            <button className="cursor-pointer p-2 rounded hover:bg-gray-200 transition">
              <CiShoppingCart size={'1.5rem'} />
            </button>
          </NavLink>
        </li>
        <li>
          <button
            onClick={handleUserClick}
            className="cursor-pointer p-2 rounded hover:bg-gray-200 transition"
          >
            <FiUser size={'1.5rem'} />
          </button>
        </li>
      </ul>
    </div>
  )
}

export default SideBar
