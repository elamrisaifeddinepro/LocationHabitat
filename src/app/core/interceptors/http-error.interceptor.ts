import { HttpContextToken, HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { ErrorService } from '../services/error.service';

/** Use this context token to silence global HTTP snackbars for a request. */
export const SILENT_HTTP_ERROR = new HttpContextToken<boolean>(() => false);

export function httpErrorInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const errorService = inject(ErrorService);
  const silent = req.context.get(SILENT_HTTP_ERROR);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (!silent && err instanceof HttpErrorResponse) {
        errorService.notify(err);
      }
      return throwError(() => err);
    })
  );
}
