export interface User {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'citizen' | 'admin' | 'agency_officer';
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
  priority: 'High' | 'Medium' | 'Low';
  location: IssueLocation;
  photos: IssuePhoto[];
  reportedBy: {
    _id: string;
    fullName: string;
    email: string;
  };
  assignedTo?: string;
  trackingNumber: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  notes?: string;
}

export interface ApiResponse<T = any> {
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

// In src/lib/types/api.ts
export interface Agency {
  _id: string;
  agencyName: string;
  type: string;
  registrationNumber: string;
  website?: string;
  address: string;
  district: string;
  sector: string;
  description?: string;
  serviceDomains: string[];
  status: 'pending' | 'approved' | 'rejected';
  approvedAt?: string;
  rejectedAt?: string;
  approvedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}