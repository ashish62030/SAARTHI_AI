import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import logo from "../assets/logo.png"
import { FiLogOut, FiMenu, FiX } from "react-icons/fi"
import axios from 'axios'
import { ServerUrl } from '../App'
import toast from 'react-hot-toast'

const links = [
  { to: "/builder", label: "Assistant Builder" },
  { to: "/billing", label: "Billing" },
]

function Navbar({ user, setUser }) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "U"

  const handleLogout = async () => {
    try {
      await axios.get(ServerUrl + "/api/auth/logout", { withCredentials: true })
      setUser(null)
      toast.success("Logged out")
      navigate("/login")
    } catch (error) {
      toast.error("Could not log out. Please try again.")
      console.error(error)
    }
  }

  const desktopLinkClass = ({ isActive }) =>
    `rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${isActive
      ? "bg-purple-50 text-purple-700"
      : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`

  const mobileLinkClass = ({ isActive }) =>
    `rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${isActive
      ? "bg-purple-50 text-purple-700"
      : "text-slate-600 hover:bg-slate-50"}`

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 rounded-xl text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-500"
          aria-label="Saarthi AI home"
        >
          <img src={logo} alt="" className="h-9 w-auto object-contain" />
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Saarthi<span className="bg-gradient-to-r from-purple-500 to-emerald-500 bg-clip-text text-transparent">AI</span>
          </span>
        </button>

        {user && (
          <div className="hidden items-center gap-2 md:flex">
            <nav aria-label="Main navigation" className="flex items-center gap-1">
              {links.map((link) => (
                <NavLink key={link.to} to={link.to} className={desktopLinkClass}>
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <div className="ml-3 flex items-center gap-3 border-l border-slate-200 pl-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-emerald-500 text-sm font-bold text-white shadow-sm">
                {initial}
              </div>
              <div className="max-w-[150px]">
                <p className="truncate text-sm font-semibold text-slate-800">{user.name}</p>
                <p className="truncate text-xs text-slate-500">{user.email}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Log out"
                title="Log out"
                className="ml-1 rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-500"
              >
                <FiLogOut size={18} />
              </button>
            </div>
          </div>
        )}

        {user && (
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            className="rounded-xl p-2.5 text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-500 md:hidden"
          >
            {menuOpen ? <FiX size={21} /> : <FiMenu size={21} />}
          </button>
        )}
      </div>

      {user && menuOpen && (
        <div className="border-t border-slate-100 px-4 pb-4 pt-3 md:hidden">
          <div className="mx-auto max-w-7xl rounded-2xl border border-slate-200 bg-white p-3 shadow-lg shadow-slate-900/5">
            <div className="flex items-center gap-3 border-b border-slate-100 px-2 pb-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-emerald-500 text-sm font-bold text-white">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">{user.name}</p>
                <p className="truncate text-xs text-slate-500">{user.email}</p>
              </div>
            </div>

            <nav aria-label="Mobile navigation" className="mt-2 flex flex-col gap-1">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={mobileLinkClass}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <button
              type="button"
              onClick={() => { setMenuOpen(false); handleLogout() }}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
            >
              <FiLogOut size={16} /> Log out
            </button>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
