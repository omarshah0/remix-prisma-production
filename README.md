# Remix User Management System

A full-stack web application built with Remix, Prisma, and PostgreSQL for user management with authentication.

## Features

- 🔐 Authentication (Login/Register)
- 👥 User Management (CRUD operations)
- 📊 Paginated User List
- 🔒 Protected Routes
- 🎨 Tailwind CSS Styling
- 🗄️ PostgreSQL Database
- 🔍 Type-safe with TypeScript

## Tech Stack

- **Framework**: [Remix](https://remix.run)
- **Database**: PostgreSQL
- **ORM**: [Prisma](https://prisma.io)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **Authentication**: Cookie-based sessions
- **Container**: Docker (for PostgreSQL)

## Project Structure

```
├── app/
│   ├── routes/                    # Application routes
│   │   ├── _index.tsx            # Home page
│   │   ├── login.tsx             # Login page
│   │   ├── logout.tsx            # Logout action
│   │   ├── register.tsx          # Registration page
│   │   ├── dashboard.tsx         # Dashboard layout
│   │   └── dashboard/
│   │       └── user/
│   │           ├── list.tsx      # User list
│   │           ├── $id.tsx       # User edit
│   │           └── $id.delete.tsx# User delete
│   ├── services/                 # Business logic
│   │   ├── auth.server.ts        # Authentication service
│   │   ├── db.server.ts          # Database service
│   │   └── user.server.ts        # User service
│   ├── styles/                   # Styling
│   │   └── app.css              # Global styles and Tailwind imports
│   └── types/                    # TypeScript types
│       └── user.ts              # User-related types
├── prisma/
│   └── schema.prisma            # Database schema
├── public/                      # Static assets
├── Makefile                     # Database management commands
├── package.json                 # Project dependencies
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── .env                        # Environment variables
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Docker
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <project-name>
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Start the PostgreSQL database:
```bash
make db-start
```

5. Initialize the database:
```bash
make init
```

6. Start the development server:
```bash
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:12121/remixapp"
SESSION_SECRET="your-secret-key-here"
```

### Database Management

The project includes a Makefile with useful commands:

- `make db-start`: Start PostgreSQL container
- `make db-stop`: Stop PostgreSQL container
- `make db-restart`: Restart PostgreSQL container
- `make db-logs`: View database logs
- `make init`: Initialize database and generate Prisma client

## Routes

- `/` - Home page (public)
- `/login` - User login
- `/register` - User registration
- `/dashboard` - Protected dashboard
- `/dashboard/user/list` - User list with pagination
- `/dashboard/user/:id` - Edit user details
- `/dashboard/user/:id/delete` - Delete user (resource route)

## Authentication

The application uses cookie-based sessions for authentication. Protected routes are handled through the `requireUserId` middleware in the auth service.

## Development

### Code Organization

Routes follow a consistent pattern:
1. Type imports
2. Remix Node imports
3. Remix React imports
4. React imports
5. Third-party packages
6. Services (auth first)

Example:
```typescript
// Types
import type { LoaderFunctionArgs } from '@remix-run/node';

// Remix Node
import { redirect } from '@remix-run/node';

// Remix React
import { Form, useLoaderData } from '@remix-run/react';

// Services
import { requireUserId } from '~/services/auth.server';
import { UserService } from '~/services/user.server';
```

### Response Format

All routes use consistent response formatting:
```typescript
return new Response(
  JSON.stringify(data),
  {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
  }
);
```

### Error Handling

Consistent error responses:
```typescript
return new Response(
  JSON.stringify({ error: error.message }),
  {
    status: 400,
    headers: {
      'Content-Type': 'application/json',
    },
  }
);
```

## API Endpoints

### User Management

- `GET /dashboard/user/list` - List users (paginated)
- `GET /dashboard/user/:id` - Get user details
- `POST /dashboard/user/:id` - Update user
- `POST /dashboard/user/:id/delete` - Delete user

### Authentication

- `POST /login` - User login
- `POST /register` - User registration
- `POST /logout` - User logout

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request