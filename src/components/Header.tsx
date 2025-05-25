import React from "react";
import { Bell, User } from "lucide-react";
import { useAuthStore } from "../stores/authStore";

const Header: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <header className="bg-white border-b border-gray-200 z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900 lg:hidden">
              Pulsar
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              <span className="sr-only">View notifications</span>
              <Bell className="h-4 w-3" />
            </button>

            <div className="relative flex items-center">
              <div className="flex items-center">
                <div className="hidden md:flex md:flex-col md:items-end md:mr-3">
                  <span className="text-sm font-medium text-gray-900">
                    {user?.fullName}
                  </span>
                  <span className="text-xs text-gray-500">{user?.email}</span>
                </div>
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
                  <User size={18} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
