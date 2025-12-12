import { Issue } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface GetIssuesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'submitted' | 'acknowledged' | 'pending' | 'resolved' | 'closed';
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  userId?: string;
}

export async function getIssues({
  page = 1,
  limit = 10,
  search = '',
  status,
  category,
  priority,
  userId
}: GetIssuesParams = {}): Promise<{
  data: Issue[];
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
  if (status) params.append('status', status);
  if (category) params.append('category', category);
  if (priority) params.append('priority', priority);
  if (userId) params.append('userId', userId);

  const response = await fetch(`${API_BASE_URL}/api/issues?${params.toString()}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to fetch issues');
  }

  return response.json();
}

export async function getIssueById(issueId: string): Promise<Issue> {
  const response = await fetch(`${API_BASE_URL}/api/issues/${issueId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to fetch issue');
  }

  const data = await response.json();
  return data.data;
}

export async function updateIssue(issueId: string, updates: Partial<Issue>): Promise<Issue> {
  const response = await fetch(`${API_BASE_URL}/api/issues/${issueId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to update issue');
  }

  const data = await response.json();
  return data.data;
}

export async function updateIssueStatus(issueId: string, status: 'submitted' | 'acknowledged' | 'pending' | 'resolved'): Promise<Issue> {
  return updateIssue(issueId, { status });
}

export async function deleteIssue(issueId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/issues/${issueId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to delete issue');
  }
}

export async function assignIssue(issueId: string, assigneeId: string): Promise<Issue> {
  return updateIssue(issueId, { assignedTo: assigneeId, status: 'pending' });
}
