// Admin configuration
// TODO: Move credentials to environment variables in production
// For now, hardcoded for development purposes

export const ADMIN_CONFIG = {
  email: 'admin@civicsignal.rw',
  password: 'Admin@CivicSignal2024!', // Change this in production
  fullName: 'System Administrator',
  role: 'admin' as const
};

// Helper function to check if credentials match admin
export function isAdminCredentials(email: string, password: string): boolean {
  return email === ADMIN_CONFIG.email && password === ADMIN_CONFIG.password;
}

// Helper function to check if user is admin by role
export function isAdmin(role: string): boolean {
  return role === 'admin';
}
