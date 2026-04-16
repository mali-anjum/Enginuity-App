import Constants from 'expo-constants';

function getExpoExtra(): Record<string, unknown> {
  return (Constants.expoConfig?.extra ?? {}) as Record<string, unknown>;
}

function requireEnvValue(keys: string[], prettyName: string): string {
  const processEnv = process?.env as Record<string, string | undefined> | undefined;

  for (const key of keys) {
    const fromProcessEnv = processEnv?.[key];

    if (typeof fromProcessEnv === 'string' && fromProcessEnv.trim().length > 0) {
      return fromProcessEnv;
    }

    const fromExtra = getExpoExtra()[key];
    if (typeof fromExtra === 'string' && fromExtra.trim().length > 0) {
      return fromExtra;
    }
  }

  throw new Error(`${prettyName} is missing. Set one of: ${keys.join(', ')}`);
}

export function getSupabaseUrl(): string {
  return requireEnvValue(['EXPO_PUBLIC_SUPABASE_URL', 'SUPABASE_URL'], 'Supabase URL');
}

export function getSupabaseAnonKey(): string {
  return requireEnvValue(
    ['EXPO_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY'],
    'Supabase anon key'
  );
}
