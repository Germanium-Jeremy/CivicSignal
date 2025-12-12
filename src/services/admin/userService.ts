import { User } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'user' | 'admin' | 'agency';
  status?: 'active' | 'inactive';
}

export async function getUsers({
  page = 1,
  limit = 10,
  search = '',
  role,
  status
}: GetUsersParams = {}): Promise<{
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) params.append('search', search);
  if (role) params.append('role', role);
  if (status) params.append('isActive', status === 'active' ? 'true' : 'false');

  const response = await fetch(`${API_BASE_URL}/api/admin/users?${params.toString()}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to fetch users');
  }

  return response.json();
}

export async function getUserById(userId: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to fetch user');
  }

  const data = await response.json();
  return data.data;
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to update user');
  }

  const data = await response.json();
  return data.data;
}

export async function deleteUser(userId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to delete user');
  }
}

export async function toggleUserStatus(userId: string, isActive: boolean): Promise<User> {
  return updateUser(userId, { isActive });
}
