import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, delay, from, map, of, switchMap, throwError, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../../models/user.model';
import { StorageService } from './storage.service';
import { SupabaseService } from './supabase.service';

type StoredUser = User & { password: string };
type StoredUserDto = Omit<StoredUser, 'createdAt'> & { createdAt?: string; created_at?: string };

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly USERS_KEY = 'mock_users';
  private readonly CURRENT_USER_KEY = 'currentUser';

  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor(
    private http: HttpClient,
    private storage: StorageService,
    private supabaseService: SupabaseService
  ) {
    // Initialise immédiatement depuis le storage (important pour les guards au refresh)
    this.currentUserSubject = new BehaviorSubject<User | null>(this.readCurrentUserFromStorage());
    this.currentUser$ = this.currentUserSubject.asObservable();

    if (environment.authProvider === 'supabase') {
      this.initializeSupabaseAuth();
    } else {
      this.initializeMockAuth();
    }
  }

  // -----------------------------
  // Public API
  // -----------------------------

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }

  register(userData: Omit<User, 'id' | 'createdAt'> & { password: string }): Observable<User> {
    return environment.authProvider === 'supabase'
      ? this.registerSupabase(userData)
      : this.registerMock(userData);
  }

  login(courriel: string, password: string): Observable<User> {
    return environment.authProvider === 'supabase'
      ? this.loginSupabase(courriel, password)
      : this.loginMock(courriel, password);
  }

  logout(): Observable<void> {
    return environment.authProvider === 'supabase'
      ? this.logoutSupabase()
      : this.logoutMock();
  }

  updateProfile(userData: Partial<User>, currentPassword: string): Observable<User> {
    return environment.authProvider === 'supabase'
      ? this.updateProfileSupabase(userData, currentPassword)
      : this.updateProfileMock(userData, currentPassword);
  }

  // -----------------------------
  // Mock mode (TP)
  // -----------------------------

  private initializeMockAuth(): void {
    // Charger la liste des utilisateurs depuis assets/mock/users.json si le storage est vide
    const existing = this.storage.getItem<StoredUserDto[]>(this.USERS_KEY);
    if (existing && existing.length) return;

    this.http.get<StoredUserDto[]>('assets/mock/users.json').pipe(
      map(list => (list ?? []).map(u => this.dtoToStoredUser(u))),
      tap(list => this.storage.setItem(this.USERS_KEY, list)),
      catchError(() => {
        // Si le fichier n'existe pas, on initialise quand même une liste vide
        this.storage.setItem(this.USERS_KEY, []);
        return of([]);
      })
    ).subscribe();
  }

  private loginMock(courriel: string, password: string): Observable<User> {
    const users = this.readUsersFromStorage();

    const found = users.find(u =>
      u.courriel.trim().toLowerCase() === courriel.trim().toLowerCase() &&
      u.password === password
    );

    if (!found) {
      return throwError(() => ({ message: 'Email ou mot de passe incorrect' }));
    }

    const user: User = this.stripPassword(found);
    this.persistCurrentUser(user);

    return of(user).pipe(delay(200));
  }

  private registerMock(userData: Omit<User, 'id' | 'createdAt'> & { password: string }): Observable<User> {
    const users = this.readUsersFromStorage();
    const exists = users.some(u => u.courriel.trim().toLowerCase() === userData.courriel.trim().toLowerCase());
    if (exists) {
      return throwError(() => ({ message: 'Cet email est déjà utilisé' }));
    }

    const id = (globalThis.crypto?.randomUUID?.() ?? `u_${Date.now()}`);
    const createdAt = new Date();

    const stored: StoredUser = {
      id,
      nom: userData.nom,
      prenom: userData.prenom,
      numero: userData.numero,
      telephone: userData.telephone,
      courriel: userData.courriel,
      adresse: userData.adresse,
      createdAt,
      password: userData.password
    };

    const next = [stored, ...users];
    this.storage.setItem(this.USERS_KEY, next);

    const user: User = this.stripPassword(stored);
    this.persistCurrentUser(user);

    return of(user).pipe(delay(200));
  }

  private logoutMock(): Observable<void> {
    return of(void 0).pipe(
      tap(() => {
        this.currentUserSubject.next(null);
        this.storage.removeItem(this.CURRENT_USER_KEY);
      })
    );
  }

  private updateProfileMock(userData: Partial<User>, currentPassword: string): Observable<User> {
    const current = this.currentUserValue;
    if (!current) return throwError(() => ({ message: 'Aucun utilisateur connecté' }));

    const users = this.readUsersFromStorage();
    const idx = users.findIndex(u => u.id === current.id);
    if (idx < 0) return throwError(() => ({ message: 'Utilisateur introuvable' }));

    if (users[idx].password !== currentPassword) {
      return throwError(() => ({ message: 'Mot de passe incorrect' }));
    }

    const updated: StoredUser = {
      ...users[idx],
      nom: userData.nom ?? users[idx].nom,
      prenom: userData.prenom ?? users[idx].prenom,
      numero: userData.numero ?? users[idx].numero,
      telephone: userData.telephone ?? users[idx].telephone,
      courriel: userData.courriel ?? users[idx].courriel,
      adresse: userData.adresse ?? users[idx].adresse
    };

    users[idx] = updated;
    this.storage.setItem(this.USERS_KEY, users);

    const user: User = this.stripPassword(updated);
    this.persistCurrentUser(user);

    return of(user).pipe(delay(200));
  }

  private readUsersFromStorage(): StoredUser[] {
    const raw = this.storage.getItem<any[]>(this.USERS_KEY) ?? [];
    return raw.map((u) => ({
      ...u,
      createdAt: new Date(u.createdAt ?? u.created_at ?? new Date().toISOString())
    })) as StoredUser[];
  }

  private readCurrentUserFromStorage(): User | null {
    const raw = this.storage.getItem<any>(this.CURRENT_USER_KEY);
    if (!raw) return null;
    return {
      ...raw,
      createdAt: new Date(raw.createdAt ?? raw.created_at ?? new Date().toISOString())
    } as User;
  }

  private persistCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
    this.storage.setItem(this.CURRENT_USER_KEY, {
      ...user,
      createdAt: user.createdAt.toISOString()
    });
  }

  private stripPassword(u: StoredUser): User {
    const { password, ...rest } = u;
    return rest;
  }

  private dtoToStoredUser(dto: StoredUserDto): StoredUser {
    return {
      id: dto.id,
      nom: dto.nom,
      prenom: dto.prenom,
      numero: dto.numero,
      telephone: dto.telephone,
      courriel: dto.courriel,
      adresse: dto.adresse,
      createdAt: new Date(dto.createdAt ?? dto.created_at ?? new Date().toISOString()),
      password: (dto as any).password ?? 'Test1234!'
    };
  }

  // -----------------------------
  // Supabase mode (optionnel)
  // -----------------------------

  private async initializeSupabaseAuth(): Promise<void> {
    const { data } = await this.supabaseService.auth.getSession();
    if (data.session) {
      await this.loadUserProfile(data.session.user.id);
    }

    this.supabaseService.auth.onAuthStateChange(async (_event: any, session: any) => {
      if (session?.user) {
        await this.loadUserProfile(session.user.id);
      } else {
        this.currentUserSubject.next(null);
        this.storage.removeItem(this.CURRENT_USER_KEY);
      }
    });
  }

  private async loadUserProfile(userId: string): Promise<void> {
    const { data, error } = await this.supabaseService.from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!error && data) {
      const user: User = {
        id: data.id,
        nom: data.nom,
        prenom: data.prenom,
        numero: data.numero,
        telephone: data.telephone,
        courriel: data.courriel,
        adresse: data.adresse,
        createdAt: new Date(data.created_at)
      };
      this.currentUserSubject.next(user);
      this.storage.setItem(this.CURRENT_USER_KEY, { ...user, createdAt: user.createdAt.toISOString() });
    }
  }

  private registerSupabase(userData: Omit<User, 'id' | 'createdAt'> & { password: string }): Observable<User> {
    const { password, ...userProfile } = userData;

    return from(
      this.supabaseService.auth.signUp({
        email: userData.courriel,
        password: password
      })
    ).pipe(
      switchMap(({ data, error }) => {
        if (error) throw error;
        if (!data.user) throw new Error('Erreur lors de la création du compte');

        return from(
          this.supabaseService.from('users').insert({
            id: data.user.id,
            nom: userProfile.nom,
            prenom: userProfile.prenom,
            numero: userProfile.numero,
            telephone: userProfile.telephone,
            courriel: userProfile.courriel,
            adresse: userProfile.adresse
          }).select().single()
        );
      }),
      map(({ data, error }) => {
        if (error) throw error;
        const user: User = {
          id: data.id,
          nom: data.nom,
          prenom: data.prenom,
          numero: data.numero,
          telephone: data.telephone,
          courriel: data.courriel,
          adresse: data.adresse,
          createdAt: new Date(data.created_at)
        };
        this.currentUserSubject.next(user);
        this.storage.setItem(this.CURRENT_USER_KEY, { ...user, createdAt: user.createdAt.toISOString() });
        return user;
      }),
      catchError(error => throwError(() => ({ message: error.message || 'Erreur lors de l\'inscription' })))
    );
  }

  private loginSupabase(courriel: string, password: string): Observable<User> {
    return from(
      this.supabaseService.auth.signInWithPassword({
        email: courriel,
        password: password
      })
    ).pipe(
      switchMap(({ data, error }) => {
        if (error) throw error;
        const userId = data.user?.id;
        if (!userId) throw new Error('Erreur de connexion');

        return from(
          this.supabaseService.from('users').select('*').eq('id', userId).maybeSingle()
        ).pipe(
          switchMap(({ data: profile, error: profileError }) => {
            if (profileError) throw profileError;
            if (profile) return of(profile);

            // Profil manquant => on crée un profil minimal pour ne pas bloquer la connexion
            return from(
              this.supabaseService.from('users').insert({
                id: userId,
                nom: '',
                prenom: '',
                numero: '',
                telephone: '',
                courriel: courriel,
                adresse: ''
              }).select().single()
            ).pipe(
              map(({ data: inserted, error: insertErr }) => {
                if (insertErr) throw insertErr;
                return inserted;
              })
            );
          }),
          map((profile: any) => {
            const user: User = {
              id: profile.id,
              nom: profile.nom,
              prenom: profile.prenom,
              numero: profile.numero,
              telephone: profile.telephone,
              courriel: profile.courriel,
              adresse: profile.adresse,
              createdAt: new Date(profile.created_at)
            };
            this.currentUserSubject.next(user);
            this.storage.setItem(this.CURRENT_USER_KEY, { ...user, createdAt: user.createdAt.toISOString() });
            return user;
          })
        );
      }),
      catchError(() => throwError(() => ({ message: 'Email ou mot de passe incorrect' })))
    );
  }

  private logoutSupabase(): Observable<void> {
    return from(this.supabaseService.auth.signOut()).pipe(
      map(() => {
        this.currentUserSubject.next(null);
        this.storage.removeItem(this.CURRENT_USER_KEY);
      }),
      catchError(error => throwError(() => ({ message: error.message })))
    );
  }

  private updateProfileSupabase(userData: Partial<User>, currentPassword: string): Observable<User> {
    const currentUser = this.currentUserValue;
    if (!currentUser) {
      return throwError(() => ({ message: 'Aucun utilisateur connecté' }));
    }

    return from(
      this.supabaseService.auth.signInWithPassword({
        email: currentUser.courriel,
        password: currentPassword
      })
    ).pipe(
      switchMap(({ error: authError }) => {
        if (authError) throw new Error('Mot de passe incorrect');

        return from(
          this.supabaseService.from('users')
            .update({
              nom: userData.nom,
              prenom: userData.prenom,
              numero: userData.numero,
              telephone: userData.telephone,
              courriel: userData.courriel,
              adresse: userData.adresse,
              updated_at: new Date().toISOString()
            })
            .eq('id', currentUser.id)
            .select()
            .single()
        );
      }),
      map(({ data, error }) => {
        if (error) throw error;
        const user: User = {
          id: data.id,
          nom: data.nom,
          prenom: data.prenom,
          numero: data.numero,
          telephone: data.telephone,
          courriel: data.courriel,
          adresse: data.adresse,
          createdAt: new Date(data.created_at)
        };
        this.currentUserSubject.next(user);
        this.storage.setItem(this.CURRENT_USER_KEY, { ...user, createdAt: user.createdAt.toISOString() });
        return user;
      }),
      catchError(error => throwError(() => ({ message: error.message || 'Erreur lors de la mise à jour' })))
    );
  }
}
