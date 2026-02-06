export function normalizeFiscal(value: unknown): string {
  return String(value ?? '').trim().toUpperCase();
}

export function emptyToNull(value: unknown): string | null {
  const v = String(value ?? '').trim();
  return v.length > 0 ? v : null;
}
