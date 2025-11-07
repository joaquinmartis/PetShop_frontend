import React from 'react'
import { HiOutlineMenuAlt2, HiOutlineHome } from 'react-icons/hi'
import { CiShoppingCart, CiDeliveryTruck } from 'react-icons/ci'
import { IoHeadsetOutline } from 'react-icons/io5'
import { NavLink } from 'react-router-dom'

const SideBar = () => {
    return (

        <div className='fixed top-0 left-0 h-screen  bg-gray-100'>

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

            </ul>
        </div>
    )
}

export default SideBar