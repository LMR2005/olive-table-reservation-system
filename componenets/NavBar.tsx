import Link from 'next/link'
import React from 'react'

const NavBar = () => {
  return (
    <div>
        <header className="relative z-50 bg-[#24483D] text-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-10">
            <Link href="/" className="font-serif text-xl tracking-wide sm:text-2xl">The Olive Table<span className="text-[#D8BC8D]">.</span></Link>
            <nav className="hidden items-center gap-9 text-sm font-medium md:flex">
              <a href="#about" className="hover:text-[#D8BC8D]">Our Story</a>
              <a href="#menu" className="hover:text-[#D8BC8D]">Menu</a>
              <a href="#visit" className="hover:text-[#D8BC8D]">Visit Us</a>
            </nav>
            <a href="/reservation" className="rounded-sm border border-white/80 bg-transparent px-4 py-3 text-[10px] font-bold uppercase tracking-[.13em] text-white transition hover:border-[#D8BC8D] hover:bg-white/10 hover:text-[#F4D5A3] sm:px-5 sm:text-xs">Reserve a Table</a>
          </div>
        </header>
    </div>
  )
}

export default NavBar