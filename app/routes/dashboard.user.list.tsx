// Types
import type { UserListItem } from '~/repository/admin/types';
import type { LoaderFunctionArgs } from '@remix-run/node';

// Remix React
import { Link, useLoaderData, useNavigation, Form } from '@remix-run/react';

// Repository
import { list } from '~/repository/admin/index.server';
import { requireUserId } from '~/services/auth.server';

// Inline Types
type LoaderData = {
    data: UserListItem[];
    pagination: {
        nextCursor: string | undefined;
        hasNextPage: boolean;
        limit: number;
    };
};

export async function loader({ request }: LoaderFunctionArgs) {
    await requireUserId(request);

    const url = new URL(request.url);
    const cursor = url.searchParams.get('cursor') || undefined;
    const limit = 10;

    try {
        const { data, pagination } = await list(cursor, limit);

        return new Response(JSON.stringify({ data, pagination }), {
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        return new Response(
            JSON.stringify({ error: 'Failed to load users' }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    }
}

export default function UserList() {
    const { data, pagination } = useLoaderData<LoaderData>();
    const navigation = useNavigation();

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Users</h3>
                <Link
                    to="/dashboard/user/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    Add User
                </Link>
            </div>

            <div className="border-t border-gray-200">
                {data.length === 0 ? (
                    <p className="text-center py-4 text-gray-500">No users found</p>
                ) : (
                    <ul role="list" className="divide-y divide-gray-200">
                        {data.map((item) => (
                            <li key={item.id} className="px-4 py-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                        <p className="text-sm text-gray-500">{item.email}</p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link
                                            to={`/dashboard/user/${item.id}`}
                                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                        >
                                            Edit
                                        </Link>
                                        <Form
                                            method="post"
                                            action={`/dashboard/user/${item.id}/delete`}
                                            onSubmit={(event) => {
                                                if (!confirm('Are you sure you want to delete this user?')) {
                                                    event.preventDefault();
                                                }
                                            }}
                                        >
                                            <button
                                                type="submit"
                                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                            >
                                                Delete
                                            </button>
                                        </Form>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Pagination */}
            {pagination.hasNextPage && (
                <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between items-center">
                        <p className="text-sm text-gray-700">
                            Showing{' '}
                            <span className="font-medium">
                                {pagination.limit}
                            </span>{' '}
                            results per page
                        </p>
                        <div className="flex gap-2">
                            {pagination.nextCursor && (
                                <Link
                                    to={`?cursor=${pagination.nextCursor}`}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    Next
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {navigation.state === 'loading' && (
                <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                    Loading...
                </div>
            )}
        </div>
    );
} 