export function toError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  if (typeof error === 'string') {
    return new Error(error);
  }

  if (typeof error === 'number' || typeof error === 'boolean' || typeof error === 'bigint') {
    return new Error(String(error));
  }

  if (error && typeof error === 'object') {
    try {
      return new Error(JSON.stringify(error));
    } catch {
      return new Error('Unknown error');
    }
  }

  return new Error('Unknown error');
}

export function mapAuthErrorMessage(rawMessage: string): string {
  const message = rawMessage.toLowerCase();

  if (message.includes('email not confirmed')) {
    return 'Please check your inbox and click the confirmation link before signing in.';
  }

  if (message.includes('invalid login credentials')) {
    return 'Incorrect email or password. If you just signed up, confirm your email first.';
  }

  return rawMessage;
}
