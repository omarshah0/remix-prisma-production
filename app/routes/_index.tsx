// Remix React
import { Link } from '@remix-run/react';

// React
import type { ReactNode } from 'react';

export default function Index(): ReactNode {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Welcome to Our Application
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            Please login to access the dashboard
          </p>
          <div className="mt-5">
            <Link
              to="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 