import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, defer, map, of, throwError, delay, tap } from 'rxjs';
import { Announcement } from '../../models/announcement.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AnnouncementService {
  private readonly ANNOUNCEMENTS_KEY = 'announcements';
  private announcementsSubject: BehaviorSubject<Announcement[]>;
  public announcements$: Observable<Announcement[]>;

  constructor(private storageService: StorageService) {
    const announcements = this.storageService.getItem<Announcement[]>(this.ANNOUNCEMENTS_KEY) || this.getInitialAnnouncements();
    // Migration: aligner les annonces existantes avec les ids utilisateurs mock (u1/u2/u3)
    const emailToUserId: Record<string, string> = {
      'marie.tremblay@example.com': 'u1',
      'jean.gagnon@example.com': 'u2',
      'sarah.dupont@example.com': 'u3'
    };

    const migrated = announcements.map(a => {
      const email = (a.ownerEmail || '').trim().toLowerCase();
      const mappedByEmail = emailToUserId[email];
      const mappedByLegacyId =
        a.ownerId === 'owner1' ? 'u1' :
        a.ownerId === 'owner2' ? 'u2' :
        a.ownerId;

      const finalOwnerId = mappedByEmail ?? mappedByLegacyId;

      return { ...a, ownerId: finalOwnerId };
    });
    this.storageService.setItem(this.ANNOUNCEMENTS_KEY, migrated);
    this.announcementsSubject = new BehaviorSubject<Announcement[]>(migrated);
    this.announcements$ = this.announcementsSubject.asObservable();
  }

  private persist(next: Announcement[]): void {
    this.storageService.setItem(this.ANNOUNCEMENTS_KEY, next);
    this.announcementsSubject.next(next);
  }

  private getInitialAnnouncements(): Announcement[] {
    return [
      {
        id: '1',
        titre: 'Appartement 5 1/2 centre-ville Montréal',
        descriptionCourte: 'Bel appartement lumineux avec balcon',
        descriptionLongue: 'Magnifique appartement de 5 1/2 situé en plein centre-ville de Montréal. Proche de toutes commodités (métro, commerces, écoles). Comprend un grand salon, 2 chambres, cuisine équipée, salle de bain complète et balcon avec vue dégagée. Chauffage et eau chaude inclus.',
        mensualite: 1850,
        dateDisponibilite: new Date('2024-03-01'),
        photos: [
          'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg',
          'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
          'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg',
          'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg',
          'https://images.pexels.com/photos/1454806/pexels-photo-1454806.jpeg',
          'https://images.pexels.com/photos/2343468/pexels-photo-2343468.jpeg',
          'https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg',
          'https://images.pexels.com/photos/1080696/pexels-photo-1080696.jpeg'
        ],
        adresseLocalisation: '1250 Rue Sainte-Catherine Est, Montréal, QC H2L 2H5',
        actif: true,
        ownerId: 'u1',
        ownerName: 'Marie Tremblay',
        ownerEmail: 'marie.tremblay@example.com',
        ownerPhone: '5148234567',
        vues: 45,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '2',
        titre: 'Studio meublé Vieux-Québec',
        descriptionCourte: 'Studio meublé et équipé',
        descriptionLongue: 'Charmant studio entièrement meublé et équipé, idéal pour étudiant ou jeune professionnel. Situé dans le Vieux-Québec, à proximité de l\'Université Laval. Kitchenette équipée, salle de bain complète. Électricité incluse. Accès internet haute vitesse.',
        mensualite: 1250,
        dateDisponibilite: new Date('2024-02-15'),
        photos: [
          'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg',
          'https://images.pexels.com/photos/439227/pexels-photo-439227.jpeg',
          'https://images.pexels.com/photos/667838/pexels-photo-667838.jpeg',
          'https://images.pexels.com/photos/1909791/pexels-photo-1909791.jpeg'
        ],
        adresseLocalisation: '85 Rue Saint-Jean, Québec, QC G1R 1N8',
        actif: true,
        ownerId: 'u2',
        ownerName: 'Jean Gagnon',
        ownerEmail: 'jean.gagnon@example.com',
        ownerPhone: '5140001111',
        vues: 32,
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20')
      }

      ,
      {
        id: '3',
        titre: 'Condo 3 1/2 moderne à Laval',
        descriptionCourte: 'Condo récent, stationnement inclus',
        descriptionLongue: 'Condo moderne 3 1/2 à Laval, près des transports et commerces. Cuisine ouverte, électroménagers inclus, balcon, stationnement extérieur. Idéal pour jeune couple ou professionnel.',
        mensualite: 1450,
        dateDisponibilite: new Date('2024-04-01'),
        photos: [
          'https://images.pexels.com/photos/439227/pexels-photo-439227.jpeg',
          'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
          'https://images.pexels.com/photos/1909791/pexels-photo-1909791.jpeg'
        ],
        adresseLocalisation: '2200 Boulevard du Souvenir, Laval, QC H7N 0A1',
        actif: true,
        ownerId: 'u3',
        ownerName: 'Sarah Dupont',
        ownerEmail: 'sarah.dupont@example.com',
        ownerPhone: '5142223333',
        vues: 18,
        createdAt: new Date('2024-01-25'),
        updatedAt: new Date('2024-01-25')
      }
    ];
  }

  getAll(): Observable<Announcement[]> {
    return this.announcements$;
  }

  getActive(): Observable<Announcement[]> {
    return this.announcements$.pipe(
      map(announcements => announcements.filter(a => a.actif))
    );
  }

  getById(id: string): Observable<Announcement | undefined> {
    return this.announcements$.pipe(
      map(announcements => announcements.find(a => a.id === id))
    );
  }

  getByOwnerId(ownerId: string): Observable<Announcement[]> {
    return this.announcements$.pipe(
      map(announcements => announcements.filter(a => a.ownerId === ownerId))
    );
  }

  create(announcement: Omit<Announcement, 'id' | 'vues' | 'createdAt' | 'updatedAt'>): Observable<Announcement> {
    return defer(() => {
      const current = this.announcementsSubject.value;
      const newAnnouncement: Announcement = {
        ...announcement,
        id: Date.now().toString(),
        vues: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const next = [...current, newAnnouncement];
      return of(newAnnouncement).pipe(
        delay(500),
        tap(() => this.persist(next))
      );
    });
  }

  update(id: string, announcement: Partial<Announcement>): Observable<Announcement> {
    return defer(() => {
      const current = this.announcementsSubject.value;
      const index = current.findIndex(a => a.id === id);
      if (index === -1) {
        return throwError(() => ({ message: 'Annonce non trouvée' }));
      }

      const updatedAnnouncement: Announcement = {
        ...current[index],
        ...announcement,
        updatedAt: new Date()
      };

      const next = [...current];
      next[index] = updatedAnnouncement;

      return of(updatedAnnouncement).pipe(
        delay(500),
        tap(() => this.persist(next))
      );
    });
  }

  toggleActive(id: string): Observable<Announcement> {
    return defer(() => {
      const current = this.announcementsSubject.value;
      const index = current.findIndex(a => a.id === id);
      if (index === -1) {
        return throwError(() => ({ message: 'Annonce non trouvée' }));
      }

      const updatedAnnouncement: Announcement = {
        ...current[index],
        actif: !current[index].actif,
        updatedAt: new Date()
      };

      const next = [...current];
      next[index] = updatedAnnouncement;

      return of(updatedAnnouncement).pipe(
        delay(300),
        tap(() => this.persist(next))
      );
    });
  }

  incrementViews(id: string): Observable<void> {
    return defer(() => {
      const current = this.announcementsSubject.value;
      const index = current.findIndex(a => a.id === id);
      if (index === -1) {
        return of(void 0);
      }
      const next = [...current];
      next[index] = { ...next[index], vues: (next[index].vues ?? 0) + 1 };
      return of(void 0).pipe(
        delay(100),
        tap(() => this.persist(next))
      );
    });
  }

  delete(id: string): Observable<void> {
    return defer(() => {
      const current = this.announcementsSubject.value;
      const next = current.filter(a => a.id !== id);
      return of(void 0).pipe(
        delay(300),
        tap(() => this.persist(next))
      );
    });
  }
}
