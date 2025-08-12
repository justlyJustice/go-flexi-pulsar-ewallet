import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Wallet,
  SendHorizonal,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Smartphone,
  // Tv,
  // Zap,
  // Book,
  // Gift,
  Wifi,
  CreditCard,
  // Repeat,
  // Bitcoin,
  // MessageSquare,
  FolderKanban,
  BadgeDollarSign,
} from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { KycModal } from "./KycModal";

const Sidebar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  const user = useAuthStore((store) => store.user);

  const location = useLocation();

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const toggleDropdown = (dropdownName: string) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  const billPaymentItems = [
    {
      path: "/bill-payment/airtime",
      icon: <Smartphone size={18} />,
      label: "Airtime",
      isActive: location.pathname === "/bill-payment/airtime",
    },
    {
      path: "/bill-payment/data",
      icon: <Wifi size={18} />,
      label: "Data",
      isActive: location.pathname === "/bill-payment/data",
    },
    // {
    //   path: "/bill-payment/recharge-card",
    //   icon: <Gift size={18} />,
    //   label: "Recharge Card",
    //   isActive: location.pathname === "/bill-payment/recharge-card",
    // },
    // {
    //   path: "/bill-payment/cable-tv",
    //   icon: <Tv size={18} />,
    //   label: "Cable TV",
    //   isActive: location.pathname === "/bill-payment/cable-tv",
    // },
    // {
    //   path: "/bill-payment/electricity",
    //   icon: <Zap size={18} />,
    //   label: "Electricity",
    //   isActive: location.pathname === "/bill-payment/electricity",
    // },
    // {
    //   path: "/bill-payment/education-pin",
    //   icon: <Book size={18} />,
    //   label: "Education PIN",
    //   isActive: location.pathname === "/bill-payment/education-pin",
    // },
  ];

  const financialServicesItems = [
    {
      path: "/services/virtual-naira-card",
      icon: <CreditCard size={22} />,
      label: "Naira Virtual Card",
      isActive: location.pathname === "/services/virtual-naira-card",
      // onClick: () => user?.isKYC === 'unverified' /
    },
    {
      path: "/services/virtual-usd-card",
      icon: <CreditCard size={22} />,
      label: "USD Virtual Card",
      isActive: location.pathname === "/services/virtual-usd-card",
    },
    // {
    //   path: "/services/currency-exchange",
    //   icon: <Repeat size={22} />,
    //   label: "Currency Exchange",
    //   isActive: location.pathname === "/services/currency-exchange",
    // },
    // {
    //   path: "/services/usdt-funding",
    //   icon: <Bitcoin size={22} />,
    //   label: "USDT Funding",
    //   isActive: location.pathname === "/services/usdt-funding",
    // },
    // {
    //   path: "/services/bulk-sms",
    //   icon: <MessageSquare size={22} />,
    //   label: "Bulk SMS",
    //   isActive: location.pathname === "/services/bulk-sms",
    // },
  ];

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
      path: user?.isKYC === "verified" ? "/transfer" : "#",
      // path: "/transfer",
      icon: <SendHorizonal size={20} />,
      label: "Transfer",
      onClick: user?.isKYC === "verified" ? () => {} : () => setIsOpen(true),
      isActive: location.pathname === "/transfer",
    },
    {
      type: "dropdown",
      name: "billPayment",
      label: "Bill Payment",
      icon: <FolderKanban size={20} />,
      isOpen: openDropdown === "billPayment",
      toggle: () => toggleDropdown("billPayment"),
      items: billPaymentItems,
    },
    {
      type: "dropdown",
      name: "financialServices",
      label: "Financial Services",
      icon: <BadgeDollarSign size={30} />,
      isOpen: openDropdown === "financialServices",
      toggle: () => toggleDropdown("financialServices"),
      items: financialServicesItems,
    },
    {
      path: "/profile",
      icon: <User size={20} />,
      label: "Profile",
      isActive: location.pathname === "/profile",
    },
  ];

  const renderDropdown = (item: any, isMobile: boolean = false) => (
    <div key={item.name} className="space-y-1">
      <button
        onClick={item.toggle}
        className={`flex items-center justify-between w-full ${
          isMobile ? "px-3 py-2" : "px-3 py-2"
        } rounded-lg transition-colors ${
          item.items.some((subItem: any) => subItem.isActive)
            ? "bg-primary-50 text-primary-700"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        <div className="flex items-center">
          {item.icon}
          <span className={isMobile ? "ml-2" : "ml-3"}>{item.label}</span>
        </div>
        {item.isOpen ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
      </button>

      {item.isOpen && (
        <div className={isMobile ? "ml-8 space-y-1" : "ml-8 space-y-1"}>
          {item.items.map((subItem: any, j: number) => (
            <NavLink
              key={j}
              to={subItem.path}
              onClick={isMobile ? closeMobileMenu : undefined}
              className={`flex items-center ${
                isMobile ? "p-2" : "px-3 py-1"
              } rounded-lg transition-colors ${
                subItem.isActive
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {subItem.icon}
              <span className="ml-3">{subItem.label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <KycModal isOpen={isOpen} setIsOpen={setIsOpen} />

      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed left-4 z-20">
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
          <div className="p-4">
            {/* <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <Wallet className="h-8 w-8 text-primary-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  Rulsar
                </span>
              </div>

              <button onClick={closeMobileMenu} className="lg:hidden">
                <X size={24} className="text-gray-500" />
              </button>
            </div> */}

            <nav className="mt-5">
              {navItems.map((item, i) => {
                if (item.type === "dropdown") {
                  return renderDropdown(item, true);
                }

                return (
                  <NavLink
                    key={i}
                    to={item.path!}
                    onClick={() => {
                      closeMobileMenu();
                      item.onClick && item.onClick();
                    }}
                    className={() =>
                      `flex items-center p-2 rounded-lg transition-colors ${
                        item.isActive
                          ? "bg-primary-50 text-primary-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`
                    }
                  >
                    {item.icon}
                    <span className="ml-3">{item.label}</span>
                  </NavLink>
                );
              })}

              <button
                onClick={() => {
                  logout();
                  closeMobileMenu();
                }}
                className="flex items-center w-full p-3 rounded-lg text-red-700 hover:bg-red-100 transition-colors mt-2"
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

              <nav className="flex-1 px-4 space-y-1">
                {navItems.map((item, i) => {
                  if (item.type === "dropdown") {
                    return renderDropdown(item);
                  }

                  return (
                    <NavLink
                      key={i}
                      to={item.path!}
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
                  );
                })}
              </nav>
            </div>

            <div className="flex-shrink-0 flex border-t border-gray-200 p-1">
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
