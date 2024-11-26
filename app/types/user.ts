export interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'ADMIN' | 'USER';
  createdAt: Date;
  updatedAt: Date;
}

export type UserListItem = Pick<User, 'id' | 'email' | 'name' | 'role' | 'createdAt'>; 