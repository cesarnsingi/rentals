import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Search, Heart, Bell, ChevronDown, LogOut, Settings, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { Button } from '../ui';

export default function Navbar() {
  const { user, logout, isAuth } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQ.trim()) navigate(`/listings?search=${encodeURIComponent(searchQ)}`);
  };

  return (
    <nav className="sticky top-0 z-40 bg-gray-950/95 backdrop-blur border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm">AR</span>
            </div>
            <span className="font-bold text-white text-lg hidden sm:block">Angola<span className="text-gold-400">Rentals</span></span>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-sm hidden md:flex">
            <div className="relative w-full">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Pesquisar imóveis..."
                className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-500"
              />
            </div>
          </form>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/listings" className={({ isActive }) =>
              `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'text-gold-400' : 'text-gray-400 hover:text-white'}`
            }>Imóveis</NavLink>

            {isAuth() ? (
              <>
                <NavLink to="/dashboard/saved" className={({ isActive }) =>
                  `p-2 rounded-lg transition-colors ${isActive ? 'text-gold-400' : 'text-gray-400 hover:text-white'}`
                }>
                  <Heart size={18} />
                </NavLink>

                {/* User dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen((v) => !v)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-800 transition-colors"
                  >
                    <img
                      src={user?.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name ?? 'U')}&background=c9a84c&color=000`}
                      alt={user?.name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <span className="text-sm text-white font-medium max-w-[100px] truncate">{user?.name?.split(' ')[0]}</span>
                    <ChevronDown size={14} className="text-gray-400" />
                  </button>

                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0" onClick={() => setDropdownOpen(false)} />
                      <div className="absolute right-0 mt-2 w-52 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl py-1 z-50">
                        <Link to="/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white">
                          <LayoutDashboard size={15} /> Dashboard
                        </Link>
                        <Link to="/dashboard/saved" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white">
                          <Heart size={15} /> Guardados
                        </Link>
                        {user?.role === 'admin' && (
                          <Link to="/admin" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white">
                            <Settings size={15} /> Admin
                          </Link>
                        )}
                        <hr className="my-1 border-gray-800" />
                        <button onClick={() => { logout(); setDropdownOpen(false); navigate('/'); }} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-gray-800 w-full text-left">
                          <LogOut size={15} /> Sair
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login"><Button variant="ghost" size="sm">Entrar</Button></Link>
                <Link to="/register"><Button size="sm">Registar</Button></Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMobileOpen((v) => !v)} className="md:hidden p-2 text-gray-400 hover:text-white">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-800 bg-gray-950 px-4 py-4 space-y-2">
          <form onSubmit={handleSearch} className="mb-3">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="Pesquisar..."
                className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-500" />
            </div>
          </form>
          <Link to="/listings" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-gray-300 hover:text-white font-medium">Imóveis</Link>
          {isAuth() ? (
            <>
              <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-gray-300 hover:text-white">Dashboard</Link>
              <Link to="/dashboard/saved" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-gray-300 hover:text-white">Guardados</Link>
              <button onClick={() => { logout(); setMobileOpen(false); navigate('/'); }} className="block px-3 py-2 text-red-400 font-medium text-left w-full">Sair</button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1"><Button variant="secondary" className="w-full">Entrar</Button></Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1"><Button className="w-full">Registar</Button></Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
