import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import { Announcement } from '../../models/announcement.model';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';
import { AnnouncementService } from './announcement.service';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private readonly STORAGE_PREFIX = 'favorite_announcements';
  private readonly favoriteIdsSubject = new BehaviorSubject<string[]>([]);
  readonly favoriteIds$ = this.favoriteIdsSubject.asObservable();

  constructor(
    private storageService: StorageService,
    private authService: AuthService,
    private announcementService: AnnouncementService
  ) {
    this.loadFavorites();

    this.authService.currentUser$.subscribe(() => {
      this.loadFavorites();
    });
  }

  get favoriteCount$(): Observable<number> {
    return this.favoriteIds$.pipe(map(ids => ids.length));
  }

  get favoriteIds(): string[] {
    return this.favoriteIdsSubject.value;
  }

  isFavorite(id: string): boolean {
    return this.favoriteIds.includes(id);
  }

  toggle(id: string): boolean {
    const next = this.isFavorite(id)
      ? this.favoriteIds.filter(favoriteId => favoriteId !== id)
      : [...this.favoriteIds, id];

    this.persist(next);
    return next.includes(id);
  }

  remove(id: string): void {
    this.persist(this.favoriteIds.filter(favoriteId => favoriteId !== id));
  }

  clear(): void {
    this.persist([]);
  }

  getFavorites(): Observable<Announcement[]> {
    return combineLatest([this.announcementService.getAll(), this.favoriteIds$]).pipe(
      map(([announcements, favoriteIds]) => announcements.filter(announcement => favoriteIds.includes(announcement.id)))
    );
  }

  private loadFavorites(): void {
    const ids = this.storageService.getItem<string[]>(this.storageKey()) ?? [];
    this.favoriteIdsSubject.next(ids);
  }

  private persist(ids: string[]): void {
    this.storageService.setItem(this.storageKey(), ids);
    this.favoriteIdsSubject.next(ids);
  }

  private storageKey(): string {
    const userId = this.authService.currentUserValue?.id ?? 'guest';
    return `${this.STORAGE_PREFIX}_${userId}`;
  }
}
