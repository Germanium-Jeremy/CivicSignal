// API utility functions for CivicSignal app
import {
  User,
  Issue,
  PaginatedResponse,
  AdminIssuesResponse,
  ApiResponse,
} from "@/lib/types/api";
const API_BASE =
  process.env.NODE_ENV === "production"
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api`
    : "http://localhost:3000/api";

// Token management
let accessToken: string | null = null;
let refreshToken: string | null = null;

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const normalizePhone = (phone: string) => phone.trim().replace(/\s+/g, "");

export class APIError extends Error {
  data?: Record<string, unknown>;

  constructor(message: string, data?: Record<string, unknown>) {
    super(message);
    this.name = "APIError";
    this.data = data;
  }
}

export const tokenManager = {
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => {
    accessToken = tokens.accessToken;
    refreshToken = tokens.refreshToken;
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", tokens.accessToken);
      localStorage.setItem("refreshToken", tokens.refreshToken);
    }
  },

  getTokens: () => {
    if (typeof window !== "undefined") {
      accessToken = accessToken || localStorage.getItem("accessToken");
      refreshToken = refreshToken || localStorage.getItem("refreshToken");
    }
    return { accessToken, refreshToken };
  },

  clearTokens: () => {
    accessToken = null;
    refreshToken = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  },

  refreshAccessToken: async () => {
    const { refreshToken: currentRefreshToken } = tokenManager.getTokens();
    if (!currentRefreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: currentRefreshToken }),
    });

    if (!response.ok) {
      tokenManager.clearTokens();
      throw new Error("Token refresh failed");
    }

    const data = await response.json();
    tokenManager.setTokens(data.tokens);
    return data.tokens.accessToken;
  },
};

// Generic API function with automatic token refresh
async function apiCall<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const { accessToken: currentAccessToken } = tokenManager.getTokens();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Add existing headers if they exist
  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      if (typeof value === "string") {
        headers[key] = value;
      }
    });
  }

  if (currentAccessToken) {
    headers.Authorization = `Bearer ${currentAccessToken}`;
  }

  let response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: "include",
    headers,
  });

  // If token expired, try to refresh and retry
  if (response.status === 401 && currentAccessToken) {
    try {
      const newAccessToken = await tokenManager.refreshAccessToken();
      headers.Authorization = `Bearer ${newAccessToken}`;

      response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        credentials: "include",
        headers,
      });
    } catch (error) {
      // Let the caller decide how to present an expired session.
      tokenManager.clearTokens();
      throw new Error("Authentication failed");
    }
  }

  if (!response.ok) {
    const errorData: Record<string, unknown> = await response
      .json()
      .catch(() => ({}));
    const message =
      typeof errorData.error === "string"
        ? errorData.error
        : `API Error: ${response.status}`;
    throw new APIError(message, errorData);
  }

  return response.json();
}

// Authentication API
export const authAPI = {
  register: async (userData: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    return apiCall("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  login: async (email: string, password: string, deviceInfo?: any) => {
    const response = await apiCall("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: normalizeEmail(email),
        password,
        deviceInfo,
      }),
    });

    if (response.success && response.tokens) {
      tokenManager.setTokens(response.tokens);
    }

    return response;
  },

  logout: async (logoutAll = false) => {
    const { refreshToken: currentRefreshToken } = tokenManager.getTokens();

    const response = await apiCall("/auth/logout", {
      method: "POST",
      body: JSON.stringify({
        refreshToken: currentRefreshToken,
        logoutAll,
      }),
    });

    tokenManager.clearTokens();
    return response;
  },

  verifyEmail: async (email: string, code: string) => {
    const response = await apiCall("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ email: normalizeEmail(email), code }),
    });
    if (response.success && response.tokens)
      tokenManager.setTokens(response.tokens);
    return response;
  },

  verifyPhone: async (phone: string, code: string) => {
    const response = await apiCall("/auth/verify-phone", {
      method: "POST",
      body: JSON.stringify({ phone: normalizePhone(phone), code }),
    });
    if (response.success && response.tokens)
      tokenManager.setTokens(response.tokens);
    return response;
  },

  resendEmailVerification: async (email: string) => {
    return apiCall("/auth/verify-email", {
      method: "PATCH",
      body: JSON.stringify({ email: normalizeEmail(email) }),
    });
  },

  resendPhoneVerification: async (phone: string) => {
    return apiCall("/auth/verify-phone", {
      method: "PATCH",
      body: JSON.stringify({ phone: normalizePhone(phone) }),
    });
  },

  getVerificationStatus: async (email: string) => {
    return apiCall(
      `/auth/verify-email?email=${encodeURIComponent(normalizeEmail(email))}`,
    );
  },

  forgotPassword: async (identifier: string, method: "email" | "phone") => {
    return apiCall("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({
        identifier:
          method === "email"
            ? normalizeEmail(identifier)
            : normalizePhone(identifier),
        method,
      }),
    });
  },

  verifyResetCode: async (
    identifier: string,
    resetCode: string,
    method: "email" | "phone",
  ) => {
    return apiCall("/auth/verify-reset-code", {
      method: "POST",
      body: JSON.stringify({
        identifier:
          method === "email"
            ? normalizeEmail(identifier)
            : normalizePhone(identifier),
        resetCode,
        method,
      }),
    });
  },

  resetPassword: async (
    identifier: string,
    resetCode: string,
    newPassword: string,
    method: "email" | "phone",
  ) => {
    return apiCall("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({
        identifier:
          method === "email"
            ? normalizeEmail(identifier)
            : normalizePhone(identifier),
        resetCode,
        newPassword,
        method,
      }),
    });
  },

  registerAgency: async (agencyData: {
    agencyName: string;
    agencyType: string;
    registrationNumber: string;
    website?: string;
    address: string;
    district: string;
    sector: string;
    description?: string;
    serviceDomains: string[];
  }) => {
    return apiCall("/auth/register-agency", {
      method: "POST",
      body: JSON.stringify(agencyData),
    });
  },

  getAgencyStatus: async () => {
    return apiCall("/auth/register-agency", {
      method: "GET",
    });
  },
};

// Issues API (keeping existing structure)
export const issuesAPI = {
  getAll: async (filters?: {
    status?: string;
    priority?: string;
    category?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.priority) params.append("priority", filters.priority);
    if (filters?.category) params.append("category", filters.category);

    const query = params.toString() ? `?${params.toString()}` : "";
    return apiCall(`/issues${query}`);
  },

  getById: async (id: string) => {
    return apiCall(`/issues/${id}`);
  },

  create: async (issueData: any) => {
    return apiCall("/issues", {
      method: "POST",
      body: JSON.stringify(issueData),
    });
  },

  update: async (id: string, updates: any) => {
    return apiCall(`/issues/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },

  updateStatus: async (id: string, status: string) => {
    return apiCall(`/issues/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
};

// User API
export const userAPI = {
  getProfile: async (userId?: string) => {
    if (userId) {
      return apiCall(`/user/profile?userId=${encodeURIComponent(userId)}`);
    }
    return apiCall("/user/profile");
  },

  updateProfile: async (profileData: any) => {
    return apiCall("/user/profile", {
      method: "PATCH",
      body: JSON.stringify(profileData),
    });
  },

  getLoginDevices: async () => {
    return apiCall("/user/devices");
  },

  deactivateDevice: async (deviceId: string) => {
    return apiCall(`/user/devices/${deviceId}`, {
      method: "DELETE",
    });
  },
};

// Admin API
export const adminAPI = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    return apiCall("/admin/stats");
  },

  // Get all agencies
  getAllAgencies: async () => {
    return apiCall("/admin/agencies");
  },

  // Get single agency
  getAgency: async (agencyId: string) => {
    return apiCall(`/admin/agencies/${agencyId}`);
  },

  // Approve agency
  approveAgency: async (agencyId: string, notes?: string) => {
    return apiCall(`/admin/agencies/${agencyId}/approve`, {
      method: "PATCH",
      body: JSON.stringify({ notes }),
    });
  },

  // Reject agency
  rejectAgency: async (agencyId: string, notes?: string) => {
    return apiCall(`/admin/agencies/${agencyId}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ notes }),
    });
  },

  // Delete agency
  deleteAgency: async (agencyId: string) => {
    return apiCall(`/admin/agencies/${agencyId}`, {
      method: "DELETE",
    });
  },

  // Category templates (dynamic form/workflow builder)
  getCategoryTemplates: () => apiCall("/admin/categories"),

  updateCategoryTemplates: (categories: unknown[]) =>
    apiCall("/admin/categories", {
      method: "PUT",
      body: JSON.stringify({ categories }),
    }),

  getUsers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    role?: string;
  }) =>
    apiCall<PaginatedResponse<User>>(
      `/admin/users?${new URLSearchParams(params as any).toString()}`,
    ),

  createUser: (userData: Omit<User, "_id" | "createdAt" | "updatedAt">) =>
    apiCall<User>("/admin/users", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  updateUser: (userId: string, updates: Partial<User>) =>
    apiCall<User>(`/admin/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    }),

  deleteUser: (userId: string) =>
    apiCall<{ success: boolean }>(`/admin/users/${userId}`, {
      method: "DELETE",
    }),

  toggleUserStatus: (userId: string, isActive: boolean) =>
    apiCall<User>(`/admin/users/${userId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    }),

  // Issues
  getIssues: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    category?: string;
  }) =>
    apiCall<AdminIssuesResponse>(
      `/admin/issues?${new URLSearchParams(params as any).toString()}`,
    ),

  getIssue: (issueId: string) =>
    apiCall<ApiResponse<{ issue: Issue }>>(`/admin/issues/${issueId}`),

  updateIssue: (issueId: string, updates: Partial<Issue>) =>
    apiCall<ApiResponse<{ issue: Issue }>>(`/admin/issues/${issueId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    }),

  deleteIssue: (issueId: string) =>
    apiCall<{ success: boolean }>(`/admin/issues/${issueId}`, {
      method: "DELETE",
    }),

  updateIssueStatus: (
    issueId: string,
    status: Issue["status"],
    comment?: string,
  ) =>
    apiCall<ApiResponse<Issue>>(`/admin/issues/${issueId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, comment }),
    }),

  assignIssue: (issueId: string, assigneeId: string) =>
    apiCall<Issue>(`/admin/issues/${issueId}/assign`, {
      method: "PATCH",
      body: JSON.stringify({ assigneeId }),
    }),
};

// Agency API (for agency officers)
export const agencyAPI = {
  // Get agency dashboard data
  getDashboardData: async () => {
    return apiCall("/agency/dashboard");
  },

  // Get issues for agency - using the dedicated agency issues endpoint
  getIssues: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
    priority?: string;
    category?: string;
    search?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    return apiCall(`/agency/issues${queryString ? "?" + queryString : ""}`);
  },

  // Update issue status
  updateIssueStatus: async (
    issueId: string,
    status: string,
    comment?: string,
  ) => {
    return apiCall(`/agency/issues/${issueId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, comment }),
    });
  },
};

// Issue API (for citizens and mobile app)
export const issueAPI = {
  // Get issue categories
  getCategories: async () => {
    return apiCall("/issues/categories");
  },

  // Create new issue
  createIssue: async (issueData: {
    title: string;
    description?: string;
    category: string;
    location?: {
      latitude?: number;
      longitude?: number;
      address?: string;
      district?: string;
      sector?: string;
    };
    media?: Array<{
      url: string;
      mediaType: "image" | "audio" | "video";
      thumbnailUrl?: string;
      size?: number;
      mimeType?: string;
    }>;
    customFields?: Record<string, any>;
    deviceInfo: {
      deviceId: string;
      deviceModel?: string;
      osVersion?: string;
      appVersion?: string;
    };
    priority?: "low" | "medium" | "high" | "urgent";
    source?: "web" | "mobile" | "ios" | "android" | "api";
  }) => {
    return apiCall("/issues", {
      method: "POST",
      body: JSON.stringify(issueData),
    });
  },

  // Get issues list with filters
  getIssues: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    category?: string;
    district?: string;
    sector?: string;
    userId?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    return apiCall(`/issues${queryString ? "?" + queryString : ""}`);
  },

  // Get single issue by ID
  getIssue: async (issueId: string) => {
    return apiCall<ApiResponse<{ issue: Issue }>>(`/issues/${issueId}`);
  },

  // Get issues by tracking number
  getIssueByTracking: async (trackingNumber: string) => {
    return apiCall(`/issues/tracking/${trackingNumber}`);
  },

  // Upload issue photos
  uploadPhotos: async (
    images: Array<{
      data: string; // base64 string
      mimeType: string;
    }>,
  ) => {
    return apiCall("/issues/upload", {
      method: "POST",
      body: JSON.stringify({ images }),
    });
  },

  // Upvote an issue
  upvoteIssue: async (issueId: string) => {
    return apiCall(`/issues/${issueId}/upvote`, {
      method: "POST",
    });
  },

  // Remove upvote
  removeUpvote: async (issueId: string) => {
    return apiCall(`/issues/${issueId}/upvote`, {
      method: "DELETE",
    });
  },

  // Get user's own issues
  getMyIssues: async (
    userId: string,
    params?: { page?: number; limit?: number },
  ) => {
    return issueAPI.getIssues({ ...params, userId });
  },

  // Get nearby issues
  getNearbyIssues: async (
    latitude: number,
    longitude: number,
    radius?: number,
    params?: { page?: number; limit?: number },
  ) => {
    return issueAPI.getIssues({ ...params, latitude, longitude, radius });
  },
};
