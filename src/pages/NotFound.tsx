import React from "react";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <h1 className="text-6xl font-bold text-primary-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          We couldn't find the page you're looking for. Please check the URL or
          go back to the homepage.
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-4 py-1 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <Home className="mr-2 h-3 w-2" />
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
