// Types
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';

// Remix React
import { Form, useLoaderData, useNavigation, useActionData, Link } from '@remix-run/react';

// React
import { useEffect, useRef } from 'react';

// Services
import { requireUserId } from '~/services/auth.server';
import { UserService } from '~/services/user.server';
import type { User } from '~/types/user';

// Inline Types
type LoaderData = {
    user: Pick<User, 'id' | 'email' | 'name' | 'role' | 'createdAt'>;
};
type ActionData = {
    success?: string;
    error?: string;
    user?: Pick<User, 'id' | 'email' | 'name' | 'role' | 'createdAt'>;
};

export async function loader({ request, params }: LoaderFunctionArgs) {
    await requireUserId(request);

    try {
        const user = await UserService.getById(params.id!);

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
            JSON.stringify({
                error: (error as Error).message
            }),
            {
                status: 404,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    }
}

export async function action({ request, params }: ActionFunctionArgs) {
    await requireUserId(request);

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const role = formData.get('role') as 'ADMIN' | 'USER';

    try {
        const updatedUser = await UserService.updateUser(params.id!, {
            name,
            email,
            role,
        });

        return new Response(
            JSON.stringify({
                success: 'User updated successfully',
                user: updatedUser
            }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({
                error: (error as Error).message
            }),
            {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    }
}

export default function EditUser() {
    const { user } = useLoaderData<LoaderData>();
    const actionData = useActionData<ActionData>();
    const navigation = useNavigation();
    const formRef = useRef<HTMLFormElement>(null);

    const isSubmitting = navigation.state === 'submitting';

    // Show the most recent data (either from action or loader)
    const currentUser = actionData?.user || user;

    // Auto-hide success message after 3 seconds
    useEffect(() => {
        if (actionData?.success) {
            const timer = setTimeout(() => {
                // You might want to implement a state management solution
                // to properly clear the success message
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [actionData?.success]);

    return (
        <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Edit User
                    </h3>

                    {/* Success Message */}
                    {actionData?.success && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-green-800">
                                        {actionData.success}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {actionData?.error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-red-800">
                                        {actionData.error}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-5">
                        <Form method="post" ref={formRef} className="space-y-6">
                            <div>
                                <label
                                    htmlFor="name"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Name
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        defaultValue={currentUser.name ?? ''}
                                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Email
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        defaultValue={currentUser.email}
                                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="role"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Role
                                </label>
                                <div className="mt-1">
                                    <select
                                        id="role"
                                        name="role"
                                        defaultValue={currentUser.role}
                                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    >
                                        <option value="USER">User</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <Link
                                    to="/dashboard/user/list"
                                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    );
} 