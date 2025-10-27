// API utility functions for CivicSignal app

const API_BASE = process.env.NODE_ENV === 'production' ? `${process.env.NEXT_PUBLIC_APP_URL}/api` : 'http://localhost:3000/api';

// Token management
let accessToken: string | null = null;
let refreshToken: string | null = null;

export const tokenManager = {
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => {
    accessToken = tokens.accessToken;
    refreshToken = tokens.refreshToken;
    sessionStorage.setItem('accessToken', tokens.accessToken);
    sessionStorage.setItem('refreshToken', tokens.refreshToken);
  },

  getTokens: () => {
    if (typeof window !== 'undefined') {
      accessToken = accessToken || sessionStorage.getItem('accessToken');
      refreshToken = refreshToken || sessionStorage.getItem('refreshToken');
    }
    return { accessToken, refreshToken };
  },

  clearTokens: () => {
    accessToken = null;
    refreshToken = null;
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
    }
  },

  refreshAccessToken: async () => {
    const { refreshToken: currentRefreshToken } = tokenManager.getTokens();
    if (!currentRefreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: currentRefreshToken }),
    });

    if (!response.ok) {
      tokenManager.clearTokens();
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    tokenManager.setTokens(data.tokens);
    return data.tokens.accessToken;
  }
};

// Generic API function with automatic token refresh
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const { accessToken: currentAccessToken } = tokenManager.getTokens();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add existing headers if they exist
  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        headers[key] = value;
      }
    });
  }

  if (currentAccessToken) {
    headers.Authorization = `Bearer ${currentAccessToken}`;
  }

  let response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  // If token expired, try to refresh and retry
  if (response.status === 401 && currentAccessToken) {
    try {
      const newAccessToken = await tokenManager.refreshAccessToken();
      headers.Authorization = `Bearer ${newAccessToken}`;
      
      response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });
    } catch (error) {
      // Refresh failed, redirect to login
      tokenManager.clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
      throw new Error('Authentication failed');
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    // For verification required errors, include the full error data
    if (errorData.requiresVerification) {
      const errorWithData = new Error(errorData.error || 'Verification required');
      (errorWithData as any).data = errorData;
      throw errorWithData;
    }
    
    throw new Error(errorData.error || `API Error: ${response.status}`);
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
    return apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  login: async (email: string, password: string, deviceInfo?: any) => {
    const response = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, deviceInfo }),
    });

    console.log("Login Response: ", response.data)
    
    if (response.success && response.tokens) {
      tokenManager.setTokens(response.tokens);
    }
    
    return response;
  },

  logout: async (logoutAll = false) => {
    const { refreshToken: currentRefreshToken } = tokenManager.getTokens();
    
    const response = await apiCall('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ 
        refreshToken: currentRefreshToken, 
        logoutAll 
      }),
    });
    
    tokenManager.clearTokens();
    return response;
  },

  verifyEmail: async (token: string) => {
    return apiCall('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },

  verifyPhone: async (phone: string, code: string) => {
    return apiCall('/auth/verify-phone', {
      method: 'POST',
      body: JSON.stringify({ phone, code }),
    });
  },

  resendPhoneVerification: async (phone: string) => {
    return apiCall('/auth/verify-phone', {
      method: 'PATCH',
      body: JSON.stringify({ phone }),
    });
  },

  forgotPassword: async (identifier: string, method: 'email' | 'phone') => {
    return apiCall('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ identifier, method }),
    });
  },

  resetPassword: async (
    identifier: string, 
    resetCode: string, 
    newPassword: string, 
    method: 'email' | 'phone'
  ) => {
    return apiCall('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ identifier, resetCode, newPassword, method }),
    });
  },
};

// Issues API (keeping existing structure)
export const issuesAPI = {
  getAll: async (filters?: { status?: string; priority?: string; category?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.category) params.append('category', filters.category);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiCall(`/issues${query}`);
  },

  getById: async (id: string) => {
    return apiCall(`/issues/${id}`);
  },

  create: async (issueData: any) => {
    return apiCall('/issues', {
      method: 'POST',
      body: JSON.stringify(issueData),
    });
  },

  update: async (id: string, updates: any) => {
    return apiCall(`/issues/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  updateStatus: async (id: string, status: string) => {
    return apiCall(`/issues/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};

// User API
export const userAPI = {
  getProfile: async () => {
    return apiCall('/user/profile');
  },

  updateProfile: async (profileData: any) => {
    return apiCall('/user/profile', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  },

  getLoginDevices: async () => {
    return apiCall('/user/devices');
  },

  deactivateDevice: async (deviceId: string) => {
    return apiCall(`/user/devices/${deviceId}`, {
      method: 'DELETE',
    });
  },
};
