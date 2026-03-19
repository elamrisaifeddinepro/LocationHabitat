import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Announcement } from '../../../../models/announcement.model';
import { AnnouncementService } from '../../../../core/services/announcement.service';
import { AuthService } from '../../../../core/services/auth.service';
import { PricePipe } from '../../../../shared/pipes/price.pipe';
import { StatusPipe } from '../../../../shared/pipes/status.pipe';
import { ConfirmDialogComponent } from '../../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { TimeAgoPipe } from '../../../../shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-my-announcements',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSnackBarModule,
    MatDialogModule,
    PricePipe,
    StatusPipe,
    TimeAgoPipe
  ],
  templateUrl: './my-announcements.component.html',
  styleUrls: ['./my-announcements.component.css']
})
export class MyAnnouncementsComponent implements OnInit {
  announcements: Announcement[] = [];
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private announcementService: AnnouncementService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadAnnouncements();
  }

  private loadAnnouncements(): void {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) return;

    this.announcementService.getByOwnerId(currentUser.id).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(announcements => {
      this.announcements = announcements;
    });
  }

  toggleActive(announcement: Announcement): void {
    this.announcementService.toggleActive(announcement.id).subscribe({
      next: () => {
        const status = !announcement.actif ? 'activée' : 'désactivée';
        this.snackBar.open(`Annonce ${status}`, 'Fermer', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Erreur lors de la modification', 'Fermer', { duration: 3000 });
      }
    });
  }

  deleteAnnouncement(id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: "Supprimer l'annonce",
        message: 'Cette action est irréversible. Voulez-vous vraiment supprimer cette annonce ?',
        confirmLabel: 'Supprimer',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;

      this.announcementService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Annonce supprimée', 'Fermer', { duration: 3000 });
        },
        error: () => {
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
        }
      });
    });
  }
}

