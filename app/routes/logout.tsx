// Types
import type { ActionFunctionArgs } from '@remix-run/node';

// Remix Node
import { redirect } from '@remix-run/node';

// Repository
import { logout } from '~/services/auth.server';

export async function action({ request }: ActionFunctionArgs) {
  return logout(request);
}

export async function loader() {
  return redirect('/');
} 