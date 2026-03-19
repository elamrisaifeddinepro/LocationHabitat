import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Announcement } from '../../../../models/announcement.model';
import { PricePipe } from '../../../../shared/pipes/price.pipe';
import { AuthService } from '../../../../core/services/auth.service';
import { FavoritesService } from '../../../../core/services/favorites.service';

@Component({
  selector: 'app-announcement-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    PricePipe
  ],
  templateUrl: './announcement-card.component.html',
  styleUrls: ['./announcement-card.component.css']
})
export class AnnouncementCardComponent {
  @Input() announcement!: Announcement;

  constructor(
    private authService: AuthService,
    private favoritesService: FavoritesService,
    private snackBar: MatSnackBar
  ) {}

  get isFavorite(): boolean {
    return this.favoritesService.isFavorite(this.announcement.id);
  }

  toggleFavorite(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

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
}
