export interface User {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: "citizen" | "admin" | "agency_officer";
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IssueMedia {
  url: string;
  key: string;
  description?: string;
  uploadedAt: string;
  mediaType: "image" | "audio" | "video";
}

export interface IssueLocation {
  type: "Point";
  coordinates: [number, number];
  address?: string;
  district?: string;
}

export interface Issue {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: "submitted" | "acknowledged" | "pending" | "resolved" | "closed";
  priority: "High" | "Medium" | "Low";
  location: IssueLocation;
  media: IssueMedia[];
  photos?: IssueMedia[];
  customFields: Record<string, any>;
  categoryTemplateId?: string;
  categoryTemplateVersion?: number;
  slaDeadline?: string;
  slaStatus: "within_sla" | "at_risk" | "breached";
  assignedTo?: string;
  trackingNumber: string;
  date: string; // For compatibility with React Native structure
  submittedAt: string;
  createdAt: string;
  success?: boolean;
}

export interface AdminIssuesPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminIssuesResponse {
  success: boolean;
  message?: string;
  data?: {
    issues: Issue[];
    pagination: AdminIssuesPagination;
  };
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
  data: T[] | any;
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
  status: "pending" | "approved" | "rejected";
  approvedAt?: string;
  rejectedAt?: string;
  approvedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
