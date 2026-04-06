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

export type IssueStatus = 'submitted' | 'acknowledged' | 'pending' | 'resolved' | 'closed';

export interface IssueLocation {
  type: 'Point';
  coordinates: [number, number];
  address?: string;
  district?: string;
  sector?: string;
}

export interface IssueMedia {
  url: string;
  thumbnailUrl?: string;
  uploadedAt: string;
  size: number;
  mimeType: string;
  mediaType: 'image' | 'audio' | 'video';
}

export interface Issue {
  _id: string;
  tenantId: string;
  tenantSlug?: string;
  trackingNumber: string;
  title: string;
  description?: string;
  category: string;
  categoryTemplateId?: string;
  categoryTemplateVersion?: number;
  priority: 'High' | 'Medium' | 'Low';
  status: IssueStatus;
  location?: IssueLocation;
  media: IssueMedia[];
  customFields: Record<string, any>;
  reportMarkdown?: string;
  slaDeadline?: string;
  slaStatus: 'within_sla' | 'at_risk' | 'breached';
  reportedBy: string;
  reporterDevice: {
    deviceId: string;
    deviceModel?: string;
    osVersion?: string;
    appVersion?: string;
    registeredAt: string;
  };
  isVerifiedReporter: boolean;
  assignedAgency?: string;
  assignedOfficer?: string;
  assignedAt?: string;
  submittedAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  activities: Array<{
    action: IssueStatus | 'status_changed' | 'sla_breached' | 'assigned' | 'submitted';
    description: string;
    performedBy: string;
    performedByModel: 'User' | 'Agency';
    timestamp: string;
    metadata?: Record<string, any>;
  }>;
  workflowHistory: Array<{
    fromStatus?: IssueStatus;
    toStatus: IssueStatus;
    changedAt: string;
    changedBy: string;
    changedByModel: 'User' | 'Agency';
    comment?: string;
  }>;
  isPublic: boolean;
  showOnMap: boolean;
  viewCount: number;
  upvoteCount: number;
  upvotedBy: string[];
  resolutionNotes?: string;
  resolutionMedia: IssueMedia[];
  source: 'web' | 'mobile' | 'ios' | 'android' | 'api';
  tags?: string[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
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
