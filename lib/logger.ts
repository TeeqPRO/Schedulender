export function logAction(action: string, details: Record<string, unknown> = {}) {
  console.info(`[schedulender] ${new Date().toISOString()} ${action}`, details);
}
