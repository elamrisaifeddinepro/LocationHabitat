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
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadAnnouncements();
  }

  private loadAnnouncements(): void {
    this.announcementService.getMyAnnouncements().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (announcements) => {
        this.announcements = announcements;
      },
      error: (err) => {
        this.snackBar.open(
          err?.message || 'Erreur lors du chargement de vos annonces',
          'Fermer',
          { duration: 3500 }
        );
      }
    });
  }

  toggleActive(announcement: Announcement): void {
    this.announcementService.toggleActive(announcement.id).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (updatedAnnouncement) => {
        this.announcements = this.announcements.map((item) =>
          item.id === updatedAnnouncement.id ? updatedAnnouncement : item
        );

        const status = updatedAnnouncement.actif ? 'activée' : 'désactivée';
        this.snackBar.open(`Annonce ${status}`, 'Fermer', { duration: 3000 });
      },
      error: (err) => {
        this.snackBar.open(
          err?.message || 'Erreur lors de la modification',
          'Fermer',
          { duration: 3000 }
        );
      }
    });
  }

  deleteAnnouncement(id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Supprimer l’annonce',
        message: 'Voulez-vous vraiment supprimer cette annonce ?',
        confirmText: 'Supprimer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((confirmed: boolean) => {
      if (!confirmed) {
        return;
      }

      this.announcementService.delete(id).pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        next: () => {
          this.announcements = this.announcements.filter((item) => item.id !== id);
          this.snackBar.open('Annonce supprimée avec succès', 'Fermer', {
            duration: 3000
          });
        },
        error: (err) => {
          this.snackBar.open(
            err?.message || 'Erreur lors de la suppression',
            'Fermer',
            { duration: 3500 }
          );
        }
      });
    });
  }
}