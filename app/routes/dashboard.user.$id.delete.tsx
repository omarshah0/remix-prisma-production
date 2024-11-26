// Types
import type { ActionFunctionArgs } from '@remix-run/node';

// Remix Node
import { redirect } from '@remix-run/node';

// Services
import { requireUserId } from '~/services/auth.server';
import { UserService } from '~/services/user.server';

export async function action({ request, params }: ActionFunctionArgs) {
    await requireUserId(request);

    try {
        await UserService.deleteUser(params.id!);
        return redirect('/dashboard/user/list');
    } catch (error) {
        return new Response(
            JSON.stringify({ error: (error as Error).message }),
            {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    }
}

// Resource route doesn't need a default export 