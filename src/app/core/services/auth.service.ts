import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../../models/user.model';
import { StorageService } from './storage.service';

interface AuthApiUser {
  id: string;
  nom: string;
  prenom: string;
  numero: string;
  telephone: string;
  courriel: string;
  adresse: string;
  createdAt?: string;
  created_at?: string;
}

interface AuthResponse {
  token: string;
  user: AuthApiUser;
}

interface UpdateProfilePayload {
  nom: string;
  prenom: string;
  numero: string;
  telephone: string;
  courriel: string;
  adresse: string;
  currentPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'authToken';
  private readonly CURRENT_USER_KEY = 'currentUser';

  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor(
    private http: HttpClient,
    private storage: StorageService
  ) {
    this.currentUserSubject = new BehaviorSubject<User | null>(this.readCurrentUserFromStorage());
    this.currentUser$ = this.currentUserSubject.asObservable();

    const token = this.getToken();
    if (environment.authProvider === 'backend' && token) {
      this.fetchMe().subscribe({
        error: () => this.clearSession()
      });
    }
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  register(userData: Omit<User, 'id' | 'createdAt'> & { password: string }): Observable<User> {
    if (environment.authProvider !== 'backend') {
      return throwError(() => ({ message: 'Mode backend non activé dans environment.ts' }));
    }

    return this.http.post<AuthResponse>(`${environment.authApiUrl}/register`, userData).pipe(
      map((response) => this.persistAuthResponse(response)),
      catchError((err) => this.handleError(err, 'Erreur lors de l’inscription'))
    );
  }

  login(courriel: string, password: string): Observable<User> {
    if (environment.authProvider !== 'backend') {
      return throwError(() => ({ message: 'Mode backend non activé dans environment.ts' }));
    }

    return this.http.post<AuthResponse>(`${environment.authApiUrl}/login`, { courriel, password }).pipe(
      map((response) => this.persistAuthResponse(response)),
      catchError((err) => {
        const message = this.extractBackendErrorMessage(err, 'Erreur lors de la connexion');
        return throwError(() => ({ message }));
      })
    );
  }

  logout(): Observable<void> {
    this.clearSession();
    return of(void 0);
  }

  updateProfile(userData: Partial<User>, currentPassword: string): Observable<User> {
    if (environment.authProvider !== 'backend') {
      return throwError(() => ({ message: 'Mode backend non activé dans environment.ts' }));
    }

    const currentUser = this.currentUserValue;
    if (!currentUser) {
      return throwError(() => ({ message: 'Aucun utilisateur connecté' }));
    }

    const payload: UpdateProfilePayload = {
      nom: (userData.nom ?? currentUser.nom).trim(),
      prenom: (userData.prenom ?? currentUser.prenom).trim(),
      numero: (userData.numero ?? currentUser.numero).trim(),
      telephone: (userData.telephone ?? currentUser.telephone).trim(),
      courriel: (userData.courriel ?? currentUser.courriel).trim(),
      adresse: (userData.adresse ?? currentUser.adresse).trim(),
      currentPassword: currentPassword.trim()
    };

    return this.http.put<AuthApiUser>(`${environment.authApiUrl}/me`, payload).pipe(
      map((apiUser) => {
        const user = this.normalizeUser(apiUser, currentUser.createdAt);
        this.persistCurrentUser(user);
        return user;
      }),
      catchError((err) => this.handleError(err, 'Erreur lors de la mise à jour du profil'))
    );
  }

  forgotPassword(courriel: string): Observable<{ message: string; resetToken?: string; note?: string }> {
    return this.http.post<{ message: string; resetToken?: string; note?: string }>(
      `${environment.authApiUrl}/forgot-password`,
      { courriel }
    ).pipe(
      catchError((err) => this.handleError(err, 'Erreur lors de la demande de réinitialisation'))
    );
  }

  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${environment.authApiUrl}/reset-password`,
      { token, newPassword }
    ).pipe(
      catchError((err) => this.handleError(err, 'Erreur lors de la réinitialisation du mot de passe'))
    );
  }

  fetchMe(): Observable<User> {
    return this.http.get<AuthApiUser>(`${environment.authApiUrl}/me`).pipe(
      map((apiUser) => {
        const user = this.normalizeUser(apiUser, this.currentUserValue?.createdAt);
        this.persistCurrentUser(user);
        return user;
      }),
      catchError((err) => this.handleError(err, 'Session invalide ou expirée'))
    );
  }

  getToken(): string | null {
    return this.storage.getItem<string>(this.TOKEN_KEY);
  }

  private extractBackendErrorMessage(err: any, fallbackMessage: string): string {
    if (err?.status === 401) {
      return 'Email non trouvé ou mot de passe incorrect.';
    }

    return (
      err?.error?.message ||
      err?.error?.error ||
      err?.message ||
      fallbackMessage
    );
  }

  private persistAuthResponse(response: AuthResponse): User {
    this.storage.setItem(this.TOKEN_KEY, response.token);

    const user = this.normalizeUser(response.user, this.currentUserValue?.createdAt);
    this.persistCurrentUser(user);

    return user;
  }

  private normalizeUser(apiUser: AuthApiUser, fallbackCreatedAt?: Date): User {
    return {
      id: apiUser.id,
      nom: apiUser.nom,
      prenom: apiUser.prenom,
      numero: apiUser.numero,
      telephone: apiUser.telephone,
      courriel: apiUser.courriel,
      adresse: apiUser.adresse,
      createdAt: apiUser.createdAt
        ? new Date(apiUser.createdAt)
        : apiUser.created_at
          ? new Date(apiUser.created_at)
          : (fallbackCreatedAt ?? new Date())
    };
  }

  private persistCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
    this.storage.setItem(this.CURRENT_USER_KEY, {
      ...user,
      createdAt: user.createdAt.toISOString()
    });
  }

  private readCurrentUserFromStorage(): User | null {
    const raw = this.storage.getItem<any>(this.CURRENT_USER_KEY);
    if (!raw) return null;

    return {
      ...raw,
      createdAt: new Date(raw.createdAt ?? raw.created_at ?? new Date().toISOString())
    } as User;
  }

  private clearSession(): void {
    this.currentUserSubject.next(null);
    this.storage.removeItem(this.TOKEN_KEY);
    this.storage.removeItem(this.CURRENT_USER_KEY);
  }

  private handleError(err: any, fallbackMessage: string): Observable<never> {
    const message =
      err?.error?.message ||
      err?.error?.error ||
      err?.message ||
      fallbackMessage;

    return throwError(() => ({ message }));
  }
}