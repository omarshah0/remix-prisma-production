// Types
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';

// Remix React
import { Form, Link, redirect, useActionData, useNavigation } from '@remix-run/react';

// React
import { useEffect, useRef } from 'react';

// Repository
import { createUserSession, getUserSession } from '~/services/auth.server';
import { getUserByEmail, verifyUserPassword } from '~/repository/user/index.server';

// Inline Types
type ActionData = {
    error?: string;
};

export async function loader({ request }: LoaderFunctionArgs) {
    const session = await getUserSession(request);
    if (session.has('userId')) {
        return redirect('/dashboard');
    }
    return new Response(null, { status: 200 });
}

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const email = formData.get('email');
    const password = formData.get('password');

    if (
        typeof email !== 'string' ||
        typeof password !== 'string'
    ) {
        return new Response(
            JSON.stringify({ error: 'Invalid form submission' }),
            {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    }

    try {
        const isValid = await verifyUserPassword(email, password);
        if (!isValid) {
            throw new Error('Invalid credentials');
        }

        const user = await getUserByEmail(email);
        return createUserSession(user.id, '/dashboard');
    } catch (error) {
        return new Response(
            JSON.stringify({ error: 'Invalid credentials' }),
            {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    }
}

export default function Login() {
    const actionData = useActionData<ActionData>();
    const navigation = useNavigation();
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    const isSubmitting = navigation.state === 'submitting';

    useEffect(() => {
        if (actionData?.error) {
            emailRef.current?.focus();
        }
    }, [actionData]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Sign in to your account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Or{' '}
                    <Link
                        to="/register"
                        className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                        create a new account
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <Form method="post" className="space-y-6">
                        {actionData?.error && (
                            <div className="rounded-md bg-red-50 p-4">
                                <div className="flex">
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">
                                            {actionData.error}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    ref={emailRef}
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    ref={passwordRef}
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                {isSubmitting ? 'Signing in...' : 'Sign in'}
                            </button>
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    );
} 