export interface User {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin' | 'agency';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IssuePhoto {
  url: string;
  key: string;
  description?: string;
  uploadedAt: string;
}

export interface IssueLocation {
  type: 'Point';
  coordinates: [number, number];
  address?: string;
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
}

export interface Issue {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: 'submitted' | 'acknowledged' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  location: IssueLocation;
  photos: IssuePhoto[];
  reportedBy: {
    _id: string;
    fullName: string;
    email: string;
  };
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  trackingNumber: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  notes?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
