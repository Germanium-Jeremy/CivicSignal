import { NextRequest } from 'next/server';

export interface TenantContext {
  tenantId: string;
  tenantSlug: string;
}

export const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID || 'public';
export const DEFAULT_TENANT_SLUG = process.env.DEFAULT_TENANT_SLUG || 'public';

const SAFE_TENANT_PATTERN = /^[a-zA-Z0-9_-]{2,64}$/;

function normalizeTenantValue(value: string | null | undefined, fallback: string): string {
  const normalized = (value || '').trim();
  if (!normalized) return fallback;
  if (!SAFE_TENANT_PATTERN.test(normalized)) return fallback;
  return normalized;
}

export function resolveTenantContext(request?: NextRequest): TenantContext {
  if (!request) {
    return {
      tenantId: DEFAULT_TENANT_ID,
      tenantSlug: DEFAULT_TENANT_SLUG,
    };
  }

  const headerTenantId = request.headers.get('x-tenant-id');
  const headerTenantSlug = request.headers.get('x-tenant-slug');

  return {
    tenantId: normalizeTenantValue(headerTenantId, DEFAULT_TENANT_ID),
    tenantSlug: normalizeTenantValue(headerTenantSlug, DEFAULT_TENANT_SLUG),
  };
}

export function buildTenantQuery(tenantId: string) {
  return {
    $or: [{ tenantId }, { tenantId: { $exists: false } }],
  };
}

