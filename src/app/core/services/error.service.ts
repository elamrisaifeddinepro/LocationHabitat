import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, OperatorFunction, catchError, throwError } from 'rxjs';
import { toUserMessage } from '../utils/error-message.util';

@Injectable({ providedIn: 'root' })
export class ErrorService {
  constructor(private snackBar: MatSnackBar) {}

  notify(error: unknown, fallbackMessage?: string): void {
    const msg = toUserMessage(error, fallbackMessage);
    this.snackBar.open(msg, 'Fermer', { duration: 3500 });
  }

  /**
   * RxJS operator that shows a snackbar and rethrows the error.
   */
  handle<T>(fallbackMessage?: string, opts?: { silent?: boolean }): OperatorFunction<T, T> {
    return (source: Observable<T>) =>
      source.pipe(
        catchError((err) => {
          if (!opts?.silent) {
            this.notify(err, fallbackMessage);
          }
          return throwError(() => err);
        })
      );
  }
}
