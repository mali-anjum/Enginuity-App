const SHOULD_TRACE = typeof window !== 'undefined';

export function appTrace(scope: string, message: string, meta?: unknown) {
  if (!SHOULD_TRACE) return;
  if (meta === undefined) {
    console.log(`[APP_TRACE][${scope}] ${message}`);
    return;
  }
  console.log(`[APP_TRACE][${scope}] ${message}`, meta);
}
