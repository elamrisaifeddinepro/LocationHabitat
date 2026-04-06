import { Component, DestroyRef, HostListener, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { take } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Announcement } from '../../../../models/announcement.model';
import { AnnouncementService } from '../../../../core/services/announcement.service';
import { AuthService } from '../../../../core/services/auth.service';
import { MessageService } from '../../../../core/services/message.service';
import { FavoritesService } from '../../../../core/services/favorites.service';
import { PricePipe } from '../../../../shared/pipes/price.pipe';
import { MapComponent } from '../../../../shared/ui/map/map.component';
import { Field, customError, form, submit } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { FormErrorsComponent } from '../../../../shared/ui/form-errors/form-errors.component';
import { CONTACT_MESSAGE_SCHEMA, type ContactMessageModel } from '../../../../shared/forms/schemas';

@Component({
  selector: 'app-announcement-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    Field,
    FormErrorsComponent,
    PricePipe,
    MapComponent
  ],
  templateUrl: './announcement-detail.component.html',
  styleUrls: ['./announcement-detail.component.css']
})
export class AnnouncementDetailComponent implements OnInit {
  announcement: Announcement | null = null;
  private readonly contactModel = signal<ContactMessageModel>({ sujet: '', texte: '' });
  readonly contactForm = form(this.contactModel, CONTACT_MESSAGE_SCHEMA);
  submitted = false;
  showContactForm = false;
  isAuthenticated = false;
  isOwner = false;
  currentPhotoIndex = 0;
  private readonly destroyRef = inject(DestroyRef);
  private preloadedImages: HTMLImageElement[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private announcementService: AnnouncementService,
    private authService: AuthService,
    private messageService: MessageService,
    private favoritesService: FavoritesService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();

    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const id = params.get('id');
        if (id) {
          this.loadAnnouncement(id);
        }
      });
  }

  private loadAnnouncement(id: string): void {
    this.announcementService.getById(id)
      .pipe(take(1))
      .subscribe((announcement) => {
        if (!announcement) {
          this.announcement = null;
          return;
        }

        this.announcement = announcement;
        const currentUser = this.authService.currentUserValue;
        this.isOwner = currentUser ? currentUser.id === announcement.ownerId : false;
        this.currentPhotoIndex = 0;

        this.preloadImages(announcement.photos ?? []);

        this.announcementService.incrementViews(id)
          .pipe(take(1))
          .subscribe({
            next: (updatedAnnouncement) => {
              this.announcement = updatedAnnouncement;
            },
            error: () => {}
          });
      });
  }

  private preloadImages(urls: string[]): void {
    this.preloadedImages = [];
    (urls ?? []).forEach((url) => {
      if (!url) return;
      const img = new Image();
      img.src = url;
      this.preloadedImages.push(img);
    });
  }

  get ownerMailtoLink(): string {
    if (!this.announcement) return '#';

    const currentUser = this.authService.currentUserValue;
    const senderName = currentUser ? `${currentUser.prenom} ${currentUser.nom}` : '';
    const senderEmail = currentUser?.courriel ? ` (${currentUser.courriel})` : '';

    const subject = encodeURIComponent(`À propos de l'annonce : ${this.announcement.titre}`);
    const body = encodeURIComponent(
      `Bonjour ${this.announcement.ownerName},\n\n` +
      `Je vous contacte au sujet de votre annonce "${this.announcement.titre}".\n\n` +
      `Nom: ${senderName}${senderEmail}\n\n` +
      `Message :\n`
    );

    return `mailto:${this.announcement.ownerEmail}?subject=${subject}&body=${body}`;
  }

  toggleContactForm(): void {
    this.showContactForm = !this.showContactForm;
    if (!this.showContactForm) {
      this.contactForm().reset({ sujet: '', texte: '' });
      this.submitted = false;
    }
  }

  async sendMessage(event?: Event): Promise<void> {
    event?.preventDefault();

    this.submitted = true;
    if (this.contactForm().invalid() || !this.announcement) return;

    const currentUser = this.authService.currentUserValue;
    if (!currentUser) return;

    const { sujet, texte } = this.contactForm().value();

    await submit(this.contactForm, async () => {
      try {
        await firstValueFrom(this.messageService.send({
          sujet,
          texte,
          senderId: currentUser.id,
          senderName: `${currentUser.prenom} ${currentUser.nom}`,
          receiverId: this.announcement!.ownerId,
          receiverName: this.announcement!.ownerName,
          announcementId: this.announcement!.id,
          announcementTitre: this.announcement!.titre
        }));

        this.snackBar.open('Message envoyé avec succès !', 'Fermer', { duration: 3000 });
        this.contactForm().reset({ sujet: '', texte: '' });
        this.showContactForm = false;
        this.submitted = false;
        return;
      } catch (err: any) {
        const message = err?.message || 'Erreur lors de l’envoi du message';
        this.snackBar.open(message, 'Fermer', { duration: 3000 });

        return customError({
          kind: 'server',
          message,
          field: this.contactForm.texte
        });
      }
    });
  }

  get isFavorite(): boolean {
    return this.announcement ? this.favoritesService.isFavorite(this.announcement.id) : false;
  }

  toggleFavorite(): void {
    if (!this.announcement) return;

    if (!this.authService.isAuthenticated()) {
      this.snackBar.open('Connectez-vous pour enregistrer une annonce.', 'Fermer', { duration: 2500 });
      return;
    }

    const added = this.favoritesService.toggle(this.announcement.id);
    this.snackBar.open(
      added ? 'Annonce enregistrée dans vos favoris.' : 'Annonce retirée de vos favoris.',
      'Fermer',
      { duration: 2200 }
    );
  }

  goBack(): void {
    this.router.navigate(['/announcements']);
  }

  viewOwnerAnnouncements(): void {
    if (this.announcement) {
      this.router.navigate(['/announcements'], {
        queryParams: { ownerId: this.announcement.ownerId }
      });
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (!this.announcement || !this.announcement.photos?.length) return;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        this.previousPhoto();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.nextPhoto();
        break;
    }
  }

  nextPhoto(): void {
    if (this.announcement && this.announcement.photos.length > 0) {
      this.currentPhotoIndex = (this.currentPhotoIndex + 1) % this.announcement.photos.length;
    }
  }

  previousPhoto(): void {
    if (this.announcement && this.announcement.photos.length > 0) {
      this.currentPhotoIndex = this.currentPhotoIndex === 0
        ? this.announcement.photos.length - 1
        : this.currentPhotoIndex - 1;
    }
  }

  goToPhoto(index: number): void {
    if (!this.announcement || !this.announcement.photos.length) return;
    this.currentPhotoIndex = index;
  }
}