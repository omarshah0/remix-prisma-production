// Types
import type { LoaderFunctionArgs } from '@remix-run/node';
import type { User } from '~/types/user';

// Remix React
import { Link, Outlet, useLoaderData, Form } from '@remix-run/react';

// Repository
import { requireUserId } from '~/services/auth.server';
import { UserRepository } from '~/repository/user/index.server';

// Inline Types
type LoaderData = {
  user: Pick<User, 'id' | 'email' | 'name' | 'role'>;
};

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);

  try {
    const user = await UserRepository.getById(userId);

    return new Response(
      JSON.stringify({ user }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'User not found' }),
      {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

export default function Dashboard() {
  const { user } = useLoaderData<LoaderData>();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/dashboard" className="flex-shrink-0 flex items-center">
                Dashboard
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/dashboard/user/list"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Users
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700 mr-4">{user.email}</span>
              <Form action="/logout" method="post">
                <button
                  type="submit"
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Logout
                </button>
              </Form>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
} 