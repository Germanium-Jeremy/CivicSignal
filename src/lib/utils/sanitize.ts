type UnknownRecord = Record<string, unknown>;

export function sanitizeText(input: unknown, maxLength = 2000): string {
  const normalized = String(input ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .trim();

  if (!normalized) return '';
  return normalized.length > maxLength ? normalized.slice(0, maxLength) : normalized;
}

export function sanitizeRecord(input: UnknownRecord): UnknownRecord {
  const output: UnknownRecord = {};

  for (const [key, value] of Object.entries(input)) {
    if (!/^[a-zA-Z0-9_-]{1,64}$/.test(key)) {
      continue;
    }

    if (typeof value === 'string') {
      output[key] = sanitizeText(value, 5000);
      continue;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      output[key] = value;
      continue;
    }

    if (Array.isArray(value)) {
      output[key] = value.slice(0, 100).map((item) => (typeof item === 'string' ? sanitizeText(item, 500) : item));
      continue;
    }
  }

  return output;
}

