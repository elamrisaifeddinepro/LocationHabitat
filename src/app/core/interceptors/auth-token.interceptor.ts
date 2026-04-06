import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { StorageService } from '../services/storage.service';
import { environment } from '../../../environments/environment';

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const storage = inject(StorageService);
  const token = storage.getItem<string>('authToken');

  const isAuthApi = req.url.startsWith(environment.authApiUrl);
  const isBusinessApi = req.url.startsWith(environment.businessApiUrl);

  const isPublicAuthRoute =
    req.url.startsWith(`${environment.authApiUrl}/login`) ||
    req.url.startsWith(`${environment.authApiUrl}/register`) ||
    req.url.startsWith(`${environment.authApiUrl}/forgot-password`) ||
    req.url.startsWith(`${environment.authApiUrl}/reset-password`);

  if (!token || !(isAuthApi || isBusinessApi) || isPublicAuthRoute) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authReq);
};