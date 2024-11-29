import type { LinksFunction, MetaFunction } from '@remix-run/node';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
} from '@remix-run/react';
import styles from '~/styles/app.css';

export const meta: MetaFunction = () => {
  return [
    { title: 'Remix App' },
    { name: 'description', content: 'A modern web application built with Remix' },
    { name: 'viewport', content: 'width=device-width,initial-scale=1' },
    { charSet: 'utf-8' },
  ];
};

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: styles },
];

function Document({
  children,
  title = 'Remix App',
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        {children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <Document title={`${error.status} ${error.statusText}`}>
        <div className="flex min-h-screen flex-col items-center justify-center">
          <h1 className="text-4xl font-bold">
            {error.status} {error.statusText}
          </h1>
          <p className="mt-4 text-lg text-gray-600">{error.data}</p>
        </div>
      </Document>
    );
  }

  return (
    <Document title="Error">
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-4xl font-bold">Application Error</h1>
        <p className="mt-4 text-lg text-gray-600">
          Something went wrong. Please try again later.
        </p>
      </div>
    </Document>
  );
} 