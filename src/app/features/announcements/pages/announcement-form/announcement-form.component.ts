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
import {
  AnnouncementService,
  CreateAnnouncementPayload,
  UpdateAnnouncementPayload
} from '../../../../core/services/announcement.service';
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

  selectedFiles: File[] = [];
  uploadedImageUrls: string[] = [];
  uploading = false;

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
      .subscribe((params) => {
        this.announcementId = params.get('id');
        if (this.announcementId) {
          this.isEditMode = true;
          this.loadAnnouncement(this.announcementId);
        }
      });

    this.addressInput$
      .pipe(
        map((v) => String(v ?? '').trim()),
        debounceTime(600),
        distinctUntilChanged(),
        switchMap((addr) => {
          this.geocodeWarning.set(null);

          if (!addr || addr.length < 4) {
            this.model.set({ ...this.model(), latitude: null, longitude: null });
            return of({ result: null, quality: 'vague' as const });
          }

          return this.geocodingService.geocodeAddressDetailed(addr);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((res) => {
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

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.selectedFiles = [];
      return;
    }

    this.selectedFiles = Array.from(input.files);
  }

  async uploadSelectedImages(): Promise<void> {
    if (this.selectedFiles.length === 0) {
      this.snackBar.open('Veuillez sélectionner au moins une image', 'Fermer', { duration: 3000 });
      return;
    }

    this.uploading = true;

    try {
      const uploaded = await firstValueFrom(
        this.announcementService.uploadImages(this.selectedFiles)
      );

      const newUrls = uploaded.map((item) => item.url);

      this.uploadedImageUrls = [...this.uploadedImageUrls, ...newUrls];

      this.model.set({
        ...this.model(),
        photos: this.uploadedImageUrls.join(', ')
      });

      this.snackBar.open('Images uploadées avec succès !', 'Fermer', { duration: 3000 });
      this.selectedFiles = [];
    } catch (err: any) {
      this.snackBar.open(
        err?.message || "Erreur lors de l'upload des images",
        'Fermer',
        { duration: 3000 }
      );
    } finally {
      this.uploading = false;
    }
  }

  removeUploadedImage(index: number): void {
    this.uploadedImageUrls = this.uploadedImageUrls.filter((_, i) => i !== index);

    this.model.set({
      ...this.model(),
      photos: this.uploadedImageUrls.join(', ')
    });
  }

  private loadAnnouncement(id: string): void {
    this.announcementService.getOwnedById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((announcement) => {
        if (!announcement) return;

        this.uploadedImageUrls = announcement.photos ?? [];

        this.model.set({
          titre: announcement.titre,
          descriptionCourte: announcement.descriptionCourte,
          descriptionLongue: announcement.descriptionLongue,
          mensualite: announcement.mensualite,
          dateDisponibilite: announcement.dateDisponibilite,
          photos: this.uploadedImageUrls.join(', '),
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

  private extractCityFromAddress(address: string): string {
    const normalized = String(address ?? '').trim().replace(/\s+/g, ' ');
    if (!normalized) return '';

    const source = normalized
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const knownCities: Array<{ regex: RegExp; value: string }> = [
      { regex: /\btrois[-\s]?rivieres\b/i, value: 'Trois-Rivières' },
      { regex: /\bmontreal\b/i, value: 'Montréal' },
      { regex: /\bquebec\b/i, value: 'Québec' },
      { regex: /\blaval\b/i, value: 'Laval' },
      { regex: /\blongueuil\b/i, value: 'Longueuil' },
      { regex: /\bgatineau\b/i, value: 'Gatineau' },
      { regex: /\bsherbrooke\b/i, value: 'Sherbrooke' }
    ];

    for (const city of knownCities) {
      if (city.regex.test(source)) {
        return city.value;
      }
    }

    const parts = normalized
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);

    const provinceOrCountry = /^(qc|québec|quebec|on|ontario|canada)$/i;
    const postalCode = /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i;

    for (let i = parts.length - 1; i >= 0; i--) {
      const part = parts[i];

      if (provinceOrCountry.test(part)) continue;
      if (postalCode.test(part)) continue;
      if (i === 0 && /\d/.test(part)) continue;

      if (/[A-Za-zÀ-ÿ]/.test(part)) {
        return part;
      }
    }

    return '';
  }

  private formatAvailableDate(value: unknown): string | null {
    if (!value) {
      return null;
    }

    const date = value instanceof Date ? value : new Date(value as string);
    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date.toISOString().split('T')[0];
  }

  private parsePhotos(value: unknown): string[] {
    return String(value ?? '')
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  }

  private focusFirstInvalidField(): void {
    setTimeout(() => {
      const firstInvalid = document.querySelector('.form-card .ng-invalid') as HTMLElement | null;
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstInvalid.focus?.();
      }
    }, 0);
  }

  private showValidationMessage(): void {
    this.snackBar.open(
      'Le formulaire contient encore des erreurs. Vérifie surtout le haut de la page.',
      'Fermer',
      { duration: 4500 }
    );
  }

  async onSubmit(event?: Event): Promise<void> {
    event?.preventDefault();

    this.submitted = true;

    if (this.announcementForm().invalid()) {
      this.showValidationMessage();
      this.focusFirstInvalidField();
      return;
    }

    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      this.snackBar.open('Vous devez être connecté', 'Fermer', { duration: 3000 });
      return;
    }

    await submit(this.announcementForm, async (f) => {
      const v = f().value();

      const address = String(v.adresseLocalisation ?? '').trim();
      const city = this.extractCityFromAddress(address);
      const photos = this.parsePhotos(v.photos);

      if (!city) {
        this.geocodeWarning.set(
          'Ajoute la ville dans l’adresse. Exemple : 1056 rue Marguerite Bourgeoys, Trois-Rivières, Canada.'
        );

        this.snackBar.open(
          'Ville introuvable dans l’adresse. Ajoute la ville clairement.',
          'Fermer',
          { duration: 4500 }
        );

        return customError({
          kind: 'cityRequired',
          message: 'La ville est obligatoire dans l’adresse',
          field: this.announcementForm.adresseLocalisation
        });
      }

      const createPayload: CreateAnnouncementPayload = {
        title: String(v.titre ?? '').trim(),
        shortDescription: String(v.descriptionCourte ?? '').trim(),
        longDescription: String(v.descriptionLongue ?? '').trim(),
        availableDate: this.formatAvailableDate(v.dateDisponibilite),
        photos,
        city,
        address,
        monthlyRent: Number(v.mensualite),
        numberOfRooms: 1,
        area: 55
      };

      const updatePayload: UpdateAnnouncementPayload = {
        title: createPayload.title,
        shortDescription: createPayload.shortDescription,
        longDescription: createPayload.longDescription,
        availableDate: createPayload.availableDate,
        photos: createPayload.photos,
        city: createPayload.city,
        address: createPayload.address,
        monthlyRent: createPayload.monthlyRent,
        numberOfRooms: createPayload.numberOfRooms,
        area: createPayload.area
      };

      try {
        if (this.isEditMode && this.announcementId) {
          await firstValueFrom(this.announcementService.update(this.announcementId, updatePayload));
          this.formSubmitted.set(true);
          this.snackBar.open('Annonce modifiée avec succès !', 'Fermer', { duration: 3000 });
        } else {
          await firstValueFrom(this.announcementService.create(createPayload));
          this.formSubmitted.set(true);
          this.snackBar.open('Annonce créée avec succès !', 'Fermer', { duration: 3000 });
        }

        this.router.navigate(['/my-announcements']);
        return;
      } catch (err: any) {
        const message = err?.message || 'Erreur lors de la sauvegarde';

        this.snackBar.open(message, 'Fermer', { duration: 4000 });

        return customError({
          kind: 'server',
          message,
          field: this.announcementForm.titre
        });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/my-announcements']);
  }
}