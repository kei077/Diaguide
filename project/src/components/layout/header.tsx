"use client"
import { useState, useRef, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { useTheme } from "@/contexts/theme-context"
import { Bell, Search, Sun, Moon, User, ChevronDown } from "lucide-react"
import { Notification } from "@/types"
import { fetchNotifications, markNotificationAsRead } from "@/lib/api/notifications"

export function Header() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  // États pour les interactions
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [notifications, setNotifications] = useState<Notification[]>([])
  const unreadCount = notifications.filter(n => !n.is_read).length

  // Refs pour la gestion des clics extérieurs
  const userMenuRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)

  // load notifications when component mounts
  useEffect(() => {
    const token = localStorage.getItem("token") || ""
    fetchNotifications(token).then(setNotifications).catch(console.error)
  }, [])

  // whenever we open the dropdown, refresh (so new ones show up)
  useEffect(() => {
    if (isNotificationOpen) {
      const token = localStorage.getItem("token") || ""
      fetchNotifications(token).then(setNotifications).catch(console.error)
    }
  }, [isNotificationOpen])

  // Fermeture des menus au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Génération de l'avatar utilisateur
  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <header className="relative z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 shadow-sm hover:shadow-md">
      <div className="flex h-16 items-center justify-between px-6 max-w-7xl mx-auto">
        {/* Zone de recherche améliorée */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div
              className={`absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg blur-xl transition-opacity duration-500 ${
                isSearchFocused ? "opacity-100" : "opacity-0"
              }`}
            />
            <div className="relative">
              <Search
                className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-all duration-300 ${
                  isSearchFocused ? "text-green-500 transform scale-110" : "text-gray-400 group-hover:text-green-400"
                }`}
              />
              <input
                type="search"
                placeholder="Search anything..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={`h-10 w-80 rounded-xl border bg-white/50 dark:bg-gray-800/50 pl-10 pr-4 text-sm backdrop-blur-sm transition-all duration-300 ${
                  isSearchFocused
                    ? "border-green-500 ring-4 ring-green-500/20 shadow-lg scale-105 w-96"
                    : "border-gray-200 dark:border-gray-600 hover:border-green-300 hover:shadow-md"
                } focus:outline-none dark:text-gray-100 dark:placeholder-gray-400`}
              />
              {searchValue && (
                <button
                  onClick={() => setSearchValue("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Suggestions de recherche (simulées) */}
            {isSearchFocused && searchValue && (
              <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-600 backdrop-blur-xl z-50 overflow-hidden">
                <div className="p-2 space-y-1">
                  {["Dashboard", "Users", "Settings", "Analytics"]
                    .filter((item) => item.toLowerCase().includes(searchValue.toLowerCase()))
                    .map((item, index) => (
                      <button
                        key={index}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 text-sm"
                      >
                        {item}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions du header */}
        <div className="flex items-center gap-3">
          {/* Bouton de bascule du thème amélioré */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="relative group h-10 w-10 rounded-xl hover:bg-gradient-to-br hover:from-yellow-50 hover:to-orange-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-500 hover:scale-110 active:scale-95"
            title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {theme === "light" ? (
              <Moon className="h-5 w-5 relative z-10 transition-all duration-500 group-hover:rotate-12 group-hover:text-green-600" />
            ) : (
              <Sun className="h-5 w-5 relative z-10 transition-all duration-500 group-hover:rotate-90 group-hover:text-yellow-500" />
            )}
          </Button>

          {/* Bouton de notifications amélioré */}
          <div className="relative" ref={notificationRef}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsNotificationOpen((f) => !f)}
              className="relative group h-10 w-10 rounded-xl hover:bg-gradient-to-br hover:from-red-50 hover:to-pink-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-300 hover:scale-110 active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-400/20 to-pink-400/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Bell className="h-5 w-5 relative z-10 transition-all duration-300 group-hover:rotate-12 group-hover:text-red-500" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-pink-500 text-[10px] text-white font-bold shadow-lg animate-pulse">
                  {unreadCount}
                </span>
              )}
            </Button>

            {/* Dropdown des notifications */}
            {isNotificationOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-600 backdrop-blur-xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      Aucune notification.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-4 flex flex-col hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 cursor-pointer ${
                          n.is_read ? "" : "bg-gray-100 dark:bg-gray-700"
                        }`}
                        onClick={async () => {
                          if (!n.is_read) {
                            const token = localStorage.getItem("token") || "";
                            await markNotificationAsRead(token, n.id);
                            setNotifications((prev) =>
                              prev.map((x) =>
                                x.id === n.id ? { ...x, is_read: true } : x
                              )
                            );
                          }
                        }}
                      >
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {n.title}
                        </span>
                        <small className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(n.timestamp).toLocaleString()}
                        </small>
                        <p className="text-sm mt-1 text-gray-800 dark:text-gray-200">
                          {n.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Affichage des infos utilisateur avec menu dropdown */}
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-300 hover:scale-105 active:scale-95 group"
              >
                {/* Avatar utilisateur */}
                <div className="relative">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                    {getUserInitials(user.name)}
                  </div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400/50 to-emerald-400/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-ping" />
                </div>

                <div className="text-left hidden sm:block">
                  <p className="font-medium text-gray-700 dark:text-gray-200 text-sm">{user.name}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">{user.role}</p>
                </div>

                <ChevronDown
                  className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${
                    isUserMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Menu dropdown utilisateur */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-600 backdrop-blur-xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                        {getUserInitials(user.name)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{user.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.role}</p>
                        {user.email && <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 text-sm flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <a href="/profile"> Profile </a>
                    </button>
                    <button
                      onClick={logout}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 text-sm mt-1"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login">
              <Button className="relative group bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 px-6 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
                <span className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg" />
                <span className="relative z-10">Login</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
