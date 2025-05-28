import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Wallet,
  SendHorizonal,
  User,
  LogOut,
  // BarChart,
  Menu,
  X,
} from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { KycModal } from "./KycModal";

const Sidebar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  const location = useLocation();

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const navItems = [
    {
      path: "/dashboard",
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
      isActive: location.pathname === "/dashboard",
    },
    {
      path: "/add-funds",
      icon: <Wallet size={20} />,
      label: "Add Funds",
      isActive: location.pathname === "/add-funds",
    },
    {
      path: "#",
      icon: <SendHorizonal size={20} />,
      label: "Transfer",
      onClick: () => setIsOpen(true),
      isActive: false,
    },
    {
      path: "/profile",
      icon: <User size={20} />,
      label: "Profile",
      isActive: location.pathname === "/profile",
    },
  ];

  return (
    <>
      <KycModal isOpen={isOpen} setIsOpen={setIsOpen} />

      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-20">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-white shadow-md text-gray-700"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-10 lg:hidden transition-opacity duration-300 ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-gray-900 opacity-50"
          onClick={closeMobileMenu}
        ></div>

        <div className="absolute inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out">
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <Wallet className="h-8 w-8 text-primary-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  Rulsar
                </span>
              </div>
              <button onClick={closeMobileMenu} className="lg:hidden">
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    closeMobileMenu();
                    item.onClick && item.onClick();
                  }}
                  className={() =>
                    `flex items-center p-3 rounded-lg transition-colors ${
                      item.isActive
                        ? "bg-primary-50 text-primary-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`
                  }
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </NavLink>
              ))}

              <button
                onClick={() => {
                  logout();
                  closeMobileMenu();
                }}
                className="flex items-center w-full p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <LogOut size={20} />
                <span className="ml-3">Logout</span>
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-white border-r border-gray-200">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4 mb-5">
                <Wallet className="h-8 w-8 text-primary-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  Rulsar
                </span>
              </div>

              <nav className="mt-5 flex-1 px-4 space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => item.onClick && item.onClick()}
                    className={() =>
                      `flex items-center px-3 py-2 rounded-lg transition-colors ${
                        item.isActive
                          ? "bg-primary-50 text-primary-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`
                    }
                  >
                    {item.icon}
                    <span className="ml-3">{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <button
                onClick={logout}
                className="flex items-center w-full px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <LogOut size={20} />
                <span className="ml-2">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
