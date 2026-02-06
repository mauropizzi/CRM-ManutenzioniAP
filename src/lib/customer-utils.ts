export function normalizeItalianFiscal(value: unknown): string {
  return String(value ?? '').trim().toUpperCase();
}
