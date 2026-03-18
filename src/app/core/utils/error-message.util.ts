import { HttpErrorResponse } from '@angular/common/http';

/** Convert unknown errors to a user-friendly message. */
export function toUserMessage(error: unknown, fallback = 'Une erreur est survenue'): string {
  if (!error) return fallback;

  // Our services often throw `{ message: string }`
  if (typeof error === 'object' && 'message' in (error as any) && typeof (error as any).message === 'string') {
    const msg = String((error as any).message).trim();
    return msg || fallback;
  }

  if (error instanceof HttpErrorResponse) {
    // Prefer backend-provided message if available
    const backendMsg = (error.error && (error.error.message || error.error.error)) ? String(error.error.message || error.error.error) : '';
    if (backendMsg) return backendMsg;
    if (error.status === 0) return 'Connexion réseau impossible';
    if (error.status >= 500) return 'Erreur serveur, réessayez plus tard';
    return error.statusText || fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  if (typeof error === 'string') {
    return error || fallback;
  }

  return fallback;
}
