import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AnnouncementService } from '../../../../core/services/announcement.service';
import { AuthService } from '../../../../core/services/auth.service';
import { GeocodingService } from '../../../../core/services/geocoding.service';
import { CanComponentDeactivate } from '../../../../core/guards/form-leave.guard';
import { Field, customError, form, submit } from '@angular/forms/signals';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, firstValueFrom, of, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs';
import { FormErrorsComponent } from '../../../../shared/ui/form-errors/form-errors.component';
import { ANNOUNCEMENT_SCHEMA, type AnnouncementFormModel } from '../../../../shared/forms/schemas';

@Component({
  selector: 'app-announcement-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    Field,
    FormErrorsComponent
  ],
  templateUrl: './announcement-form.component.html',
  styleUrls: ['./announcement-form.component.css']
})
export class AnnouncementFormComponent implements OnInit, CanComponentDeactivate {
  private readonly model = signal<AnnouncementFormModel>({
    titre: '',
    descriptionCourte: '',
    descriptionLongue: '',
    mensualite: '',
    dateDisponibilite: '',
    photos: '',
    adresseLocalisation: '',
    latitude: null,
    longitude: null
  });

  readonly announcementForm = form(this.model, ANNOUNCEMENT_SCHEMA);

  submitted = false;
  isEditMode = false;
  announcementId: string | null = null;

  readonly geocodeWarning = signal<string | null>(null);

  private readonly destroyRef = inject(DestroyRef);
  private readonly formSubmitted = signal(false);
  private readonly addressInput$ = new Subject<string>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private announcementService: AnnouncementService,
    private authService: AuthService,
    private geocodingService: GeocodingService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        this.announcementId = params.get('id');
        if (this.announcementId) {
          this.isEditMode = true;
          this.loadAnnouncement(this.announcementId);
        }
      });

    this.addressInput$
      .pipe(
        map(v => String(v ?? '').trim()),
        debounceTime(600),
        distinctUntilChanged(),
        switchMap(addr => {
          this.geocodeWarning.set(null);

          if (!addr || addr.length < 4) {
            this.model.set({ ...this.model(), latitude: null, longitude: null });
            return of({ result: null, quality: 'vague' as const });
          }

          return this.geocodingService.geocodeAddressDetailed(addr);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (!res?.result) {
          this.model.set({ ...this.model(), latitude: null, longitude: null });
          const addr = String(this.model().adresseLocalisation ?? '').trim();
          if (addr.length >= 4) {
            this.geocodeWarning.set('Adresse introuvable. Ajoute numéro + rue + ville + pays.');
          }
          return;
        }

        this.model.set({
          ...this.model(),
          latitude: res.result.lat,
          longitude: res.result.lng
        });

        if (res.quality === 'vague') {
          this.geocodeWarning.set('Adresse trop vague : ajoute numéro + rue + code postal.');
          return;
        }

        if (res.quality === 'approx') {
          this.geocodeWarning.set('Localisation approximative : ajoute numéro + code postal pour plus de précision.');
          return;
        }

        this.geocodeWarning.set(null);
      });
  }

  canDeactivate(): boolean {
    if (this.formSubmitted() || !this.announcementForm().dirty()) return true;
    return false;
  }

  onAddressInput(value: string): void {
    this.addressInput$.next(value);
  }

  private loadAnnouncement(id: string): void {
    this.announcementService.getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(announcement => {
        if (!announcement) return;

        this.model.set({
          titre: announcement.titre,
          descriptionCourte: announcement.descriptionCourte,
          descriptionLongue: announcement.descriptionLongue,
          mensualite: announcement.mensualite,
          dateDisponibilite: announcement.dateDisponibilite,
          photos: announcement.photos.join(', '),
          adresseLocalisation: announcement.adresseLocalisation,
          latitude: announcement.latitude ?? null,
          longitude: announcement.longitude ?? null
        });

        const addr = String(announcement.adresseLocalisation ?? '').trim();
        if (addr && (announcement.latitude == null || announcement.longitude == null)) {
          this.addressInput$.next(addr);
        }
      });
  }

  async onSubmit(event?: Event): Promise<void> {
    event?.preventDefault();

    this.submitted = true;
    if (this.announcementForm().invalid()) return;

    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      this.snackBar.open('Vous devez être connecté', 'Fermer', { duration: 3000 });
      return;
    }

    await submit(this.announcementForm, async (f) => {
      const v = f().value();

      const photosArray = String(v.photos ?? '')
        .split(',')
        .map((url) => url.trim())
        .filter(Boolean);

      const announcementData = {
        ...v,
        photos: photosArray,
        mensualite: Number(v.mensualite),
        dateDisponibilite: v.dateDisponibilite instanceof Date
          ? v.dateDisponibilite
          : new Date(String(v.dateDisponibilite)),
        ownerId: currentUser.id,
        ownerName: `${currentUser.prenom} ${currentUser.nom}`,
        ownerEmail: currentUser.courriel,
        ownerPhone: currentUser.telephone,
        actif: true,
        latitude: this.model().latitude,
        longitude: this.model().longitude
      };

      try {
        if (this.isEditMode && this.announcementId) {
          await firstValueFrom(this.announcementService.update(this.announcementId, announcementData));
          this.formSubmitted.set(true);
          this.snackBar.open('Annonce modifiée avec succès!', 'Fermer', { duration: 3000 });
          this.router.navigate(['/my-announcements']);
        } else {
          await firstValueFrom(this.announcementService.create(announcementData));
          this.formSubmitted.set(true);
          this.snackBar.open('Annonce créée avec succès!', 'Fermer', { duration: 3000 });
          this.router.navigate(['/my-announcements']);
        }
        return;
      } catch (err: any) {
        return customError({
          kind: 'server',
          message: err?.message || 'Erreur lors de la sauvegarde',
          field: this.announcementForm.titre
        });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/my-announcements']);
  }
}