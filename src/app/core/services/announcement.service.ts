import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  catchError,
  map,
  of,
  switchMap,
  take,
  tap,
  throwError
} from 'rxjs';
import { Announcement } from '../../models/announcement.model';
import { StorageService } from './storage.service';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

type AnnouncementSource = Omit<Announcement, 'dateDisponibilite' | 'createdAt' | 'updatedAt'> & {
  dateDisponibilite: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export interface BusinessAnnouncementResponse {
  id: number;
  title: string;
  description: string;
  shortDescription: string;
  longDescription: string;
  availableDate: string | null;
  photos: string[];
  city: string;
  address: string;
  monthlyRent: number;
  numberOfRooms: number;
  area: number;
  active: boolean;
  viewCount: number;
  ownerAuthUserId: string;
  ownerEmail: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnnouncementPayload {
  title: string;
  shortDescription: string;
  longDescription: string;
  availableDate?: string | null;
  photos?: string[];
  city: string;
  address: string;
  monthlyRent: number;
  numberOfRooms: number;
  area: number;
}

export interface UpdateAnnouncementPayload {
  title?: string;
  shortDescription?: string;
  longDescription?: string;
  availableDate?: string | null;
  photos?: string[];
  city?: string;
  address?: string;
  monthlyRent?: number;
  numberOfRooms?: number;
  area?: number;
}

export interface UploadImageResponse {
  fileName: string;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class AnnouncementService {
  private readonly ANNOUNCEMENTS_KEY = 'announcements';
  private announcementsSubject = new BehaviorSubject<Announcement[]>([]);
  public announcements$: Observable<Announcement[]> = this.announcementsSubject.asObservable();

  constructor(
    private storageService: StorageService,
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.initializeAnnouncements();
  }

  private initializeAnnouncements(): void {
    if (environment.authProvider === 'backend') {
      this.loadActiveAnnouncements().pipe(take(1)).subscribe({
        next: (announcements) => this.persist(announcements),
        error: () => this.persist([])
      });
      return;
    }

    const stored = this.storageService.getItem<AnnouncementSource[]>(this.ANNOUNCEMENTS_KEY);

    if (stored && stored.length > 0) {
      this.persist(this.migrateAnnouncements(stored));
      return;
    }

    this.http.get<AnnouncementSource[]>('assets/mock/announcements.json')
      .pipe(
        take(1),
        map((announcements) => this.migrateAnnouncements(announcements ?? []))
      )
      .subscribe({
        next: (announcements) => this.persist(announcements),
        error: () => this.persist([])
      });
  }

  private normalizeAnnouncement(announcement: AnnouncementSource): Announcement {
    return {
      ...announcement,
      dateDisponibilite: new Date(announcement.dateDisponibilite),
      createdAt: new Date(announcement.createdAt),
      updatedAt: new Date(announcement.updatedAt)
    };
  }

  private migrateAnnouncements(announcements: AnnouncementSource[]): Announcement[] {
    const emailToUserId: Record<string, string> = {
      'marie.tremblay@example.com': 'u1',
      'jean.gagnon@example.com': 'u2',
      'sarah.dupont@example.com': 'u3'
    };

    return announcements.map((raw) => {
      const announcement = this.normalizeAnnouncement(raw);
      const email = (announcement.ownerEmail || '').trim().toLowerCase();

      const mappedByEmail = emailToUserId[email];
      const mappedByLegacyId =
        announcement.ownerId === 'owner1' ? 'u1' :
        announcement.ownerId === 'owner2' ? 'u2' :
        announcement.ownerId === 'owner3' ? 'u3' :
        announcement.ownerId;

      const finalOwnerId = mappedByEmail ?? mappedByLegacyId;

      return {
        ...announcement,
        ownerId: finalOwnerId
      };
    });
  }

  private persist(next: Announcement[]): void {
    this.storageService.setItem(this.ANNOUNCEMENTS_KEY, next);
    this.announcementsSubject.next(next);
  }

  private buildDisplayAddress(address: string, city: string): string {
    const cleanAddress = String(address ?? '').trim();
    const cleanCity = String(city ?? '').trim();

    if (!cleanCity || cleanCity.toLowerCase() === 'ville non précisée') {
      return cleanAddress;
    }

    const normalizedAddress = cleanAddress
      .toLowerCase()
      .replace(/-/g, ' ')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const normalizedCity = cleanCity
      .toLowerCase()
      .replace(/-/g, ' ')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    if (normalizedAddress.includes(normalizedCity)) {
      return cleanAddress;
    }

    return cleanAddress ? `${cleanAddress}, ${cleanCity}` : cleanCity;
  }

  private toFrontendAnnouncement(item: BusinessAnnouncementResponse): Announcement {
    const currentUser = this.authService.currentUserValue;
    const isOwner =
      !!currentUser &&
      currentUser.courriel?.trim().toLowerCase() === item.ownerEmail?.trim().toLowerCase();

    const ownerName = isOwner
      ? `${currentUser!.prenom} ${currentUser!.nom}`.trim()
      : item.ownerEmail || 'Propriétaire';

    const ownerPhone = isOwner ? currentUser!.telephone : '';

    return {
      id: String(item.id),
      titre: item.title,
      descriptionCourte: item.shortDescription || item.description || '',
      descriptionLongue: item.longDescription || item.description || '',
      mensualite: Number(item.monthlyRent),
      dateDisponibilite: item.availableDate
        ? new Date(item.availableDate)
        : new Date(item.createdAt),
      photos: item.photos ?? [],
      adresseLocalisation: this.buildDisplayAddress(item.address, item.city),
      latitude: null,
      longitude: null,
      actif: Boolean(item.active),
      ownerId: item.ownerAuthUserId,
      ownerName,
      ownerEmail: item.ownerEmail,
      ownerPhone,
      vues: Number(item.viewCount ?? 0),
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt)
    };
  }

  private loadActiveAnnouncements(ownerId?: string): Observable<Announcement[]> {
    const query = ownerId ? `?ownerId=${encodeURIComponent(ownerId)}` : '';

    return this.http.get<BusinessAnnouncementResponse[]>(
      `${environment.businessApiUrl}/announcements${query}`
    ).pipe(
      map((items) => (items ?? []).map((item) => this.toFrontendAnnouncement(item))),
      catchError((err) => this.handleError(err, 'Erreur lors du chargement des annonces'))
    );
  }

  private refreshActiveAnnouncements(): Observable<Announcement[]> {
    if (environment.authProvider !== 'backend') {
      return of(this.announcementsSubject.value);
    }

    return this.loadActiveAnnouncements().pipe(
      take(1),
      tap((announcements) => this.persist(announcements))
    );
  }

  getAll(): Observable<Announcement[]> {
    if (environment.authProvider === 'backend') {
      return this.loadActiveAnnouncements().pipe(
        tap((announcements) => this.persist(announcements))
      );
    }

    return this.announcements$;
  }

  getActive(): Observable<Announcement[]> {
    if (environment.authProvider === 'backend') {
      return this.loadActiveAnnouncements().pipe(
        tap((announcements) => this.persist(announcements))
      );
    }

    return this.announcements$.pipe(
      map((announcements) => announcements.filter((a) => a.actif))
    );
  }

  getById(id: string): Observable<Announcement | undefined> {
    if (environment.authProvider === 'backend') {
      return this.http.get<BusinessAnnouncementResponse>(
        `${environment.businessApiUrl}/announcements/${id}`
      ).pipe(
        map((item) => this.toFrontendAnnouncement(item)),
        catchError((err) => this.handleError(err, 'Erreur lors du chargement de l’annonce'))
      );
    }

    return this.announcements$.pipe(
      map((announcements) => announcements.find((a) => a.id === id))
    );
  }

  getOwnedById(id: string): Observable<Announcement | undefined> {
    if (environment.authProvider === 'backend') {
      return this.http.get<BusinessAnnouncementResponse>(
        `${environment.businessApiUrl}/announcements/${id}/owner`
      ).pipe(
        map((item) => this.toFrontendAnnouncement(item)),
        catchError((err) => this.handleError(err, 'Erreur lors du chargement de votre annonce'))
      );
    }

    const currentUser = this.authService.currentUserValue;
    return this.announcements$.pipe(
      map((announcements) => announcements.find((a) => a.id === id && a.ownerId === currentUser?.id))
    );
  }

  getByOwnerId(ownerId: string): Observable<Announcement[]> {
    if (environment.authProvider === 'backend') {
      return this.loadActiveAnnouncements(ownerId);
    }

    return this.announcements$.pipe(
      map((announcements) => announcements.filter((a) => a.ownerId === ownerId && a.actif))
    );
  }

  getMyAnnouncements(): Observable<Announcement[]> {
    if (environment.authProvider === 'backend') {
      return this.http.get<BusinessAnnouncementResponse[]>(
        `${environment.businessApiUrl}/announcements/my`
      ).pipe(
        map((items) => (items ?? []).map((item) => this.toFrontendAnnouncement(item))),
        catchError((err) => this.handleError(err, 'Erreur lors du chargement de vos annonces'))
      );
    }

    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      return of([]);
    }

    return this.announcements$.pipe(
      map((announcements) => announcements.filter((a) => a.ownerId === currentUser.id))
    );
  }

  create(payload: CreateAnnouncementPayload): Observable<Announcement> {
    if (environment.authProvider === 'backend') {
      return this.http.post<BusinessAnnouncementResponse>(
        `${environment.businessApiUrl}/announcements`,
        payload
      ).pipe(
        map((item) => this.toFrontendAnnouncement(item)),
        switchMap((createdAnnouncement) =>
          this.refreshActiveAnnouncements().pipe(
            map(() => createdAnnouncement)
          )
        ),
        catchError((err) => this.handleError(err, 'Erreur lors de la création de l’annonce'))
      );
    }

    return throwError(() => ({
      message: 'Le mode mock pour la création n’est plus utilisé dans cette version.'
    }));
  }

  uploadImages(files: File[]): Observable<UploadImageResponse[]> {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append('files', file);
    });

    return this.http.post<UploadImageResponse[]>(
      `${environment.businessApiUrl}/uploads/images`,
      formData
    ).pipe(
      catchError((err) => this.handleError(err, "Erreur lors de l'upload des images"))
    );
  }

  update(id: string, payload: UpdateAnnouncementPayload): Observable<Announcement> {
    if (environment.authProvider === 'backend') {
      return this.http.put<BusinessAnnouncementResponse>(
        `${environment.businessApiUrl}/announcements/${id}`,
        payload
      ).pipe(
        map((item) => this.toFrontendAnnouncement(item)),
        switchMap((updatedAnnouncement) =>
          this.refreshActiveAnnouncements().pipe(
            map(() => updatedAnnouncement)
          )
        ),
        catchError((err) => this.handleError(err, 'Erreur lors de la modification de l’annonce'))
      );
    }

    return throwError(() => ({
      message: 'La modification n’est pas disponible.'
    }));
  }

  toggleActive(id: string): Observable<Announcement> {
    if (environment.authProvider === 'backend') {
      return this.http.patch<BusinessAnnouncementResponse>(
        `${environment.businessApiUrl}/announcements/${id}/toggle-active`,
        {}
      ).pipe(
        map((item) => this.toFrontendAnnouncement(item)),
        switchMap((updatedAnnouncement) =>
          this.refreshActiveAnnouncements().pipe(
            map(() => updatedAnnouncement)
          )
        ),
        catchError((err) => this.handleError(err, 'Erreur lors du changement de statut'))
      );
    }

    return throwError(() => ({
      message: 'Le changement de statut n’est pas disponible.'
    }));
  }

  incrementViews(id: string): Observable<Announcement> {
    if (environment.authProvider === 'backend') {
      return this.http.post<BusinessAnnouncementResponse>(
        `${environment.businessApiUrl}/announcements/${id}/views`,
        {}
      ).pipe(
        map((item) => this.toFrontendAnnouncement(item)),
        catchError((err) => this.handleError(err, 'Erreur lors de la mise à jour des vues'))
      );
    }

    return this.getById(id).pipe(
      map((announcement) => {
        if (!announcement) {
          throw new Error('Annonce introuvable');
        }

        const updatedAnnouncement: Announcement = {
          ...announcement,
          vues: Number(announcement.vues ?? 0) + 1,
          updatedAt: new Date()
        };

        const updatedAnnouncements = this.announcementsSubject.value.map((item) =>
          item.id === id ? updatedAnnouncement : item
        );

        this.persist(updatedAnnouncements);
        return updatedAnnouncement;
      })
    );
  }

  delete(id: string): Observable<void> {
    if (environment.authProvider === 'backend') {
      return this.http.delete<void>(
        `${environment.businessApiUrl}/announcements/${id}`
      ).pipe(
        switchMap(() =>
          this.refreshActiveAnnouncements().pipe(
            map(() => void 0)
          )
        ),
        catchError((err) => this.handleError(err, 'Erreur lors de la suppression de l’annonce'))
      );
    }

    return throwError(() => ({
      message: 'La suppression n’est pas disponible.'
    }));
  }

  private handleError(err: any, fallbackMessage: string): Observable<never> {
    console.error('Erreur backend complète:', err);

    const fieldErrors = err?.error?.fieldErrors;

    const firstFieldMessage =
      fieldErrors && typeof fieldErrors === 'object'
        ? Object.values(fieldErrors).find(
            (value): value is string =>
              typeof value === 'string' && value.trim().length > 0
          )
        : null;

    const message =
      firstFieldMessage ||
      err?.error?.message ||
      err?.error?.error ||
      err?.message ||
      fallbackMessage;

    return throwError(() => ({
      message,
      fieldErrors,
      raw: err
    }));
  }
}