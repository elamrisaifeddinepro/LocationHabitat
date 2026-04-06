import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Message } from '../../../../models/message.model';
import { MessageService } from '../../../../core/services/message.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfirmDialogComponent } from '../../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { TimeAgoPipe } from '../../../../shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-inbox',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatDividerModule,
    MatSnackBarModule,
    MatDialogModule,
    TimeAgoPipe
  ],
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.css']
})
export class InboxComponent implements OnInit {
  messages: Message[] = [];
  expandedMessageId: string | null = null;
  isLoading = true;
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private messageService: MessageService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadMessages();
  }

  private loadMessages(): void {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      this.isLoading = false;
      this.messages = [];
      return;
    }

    this.isLoading = true;

    this.messageService.getReceivedMessages(currentUser.id).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (messages) => {
        this.messages = messages;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open(
          err?.message || 'Erreur lors du chargement des messages',
          'Fermer',
          { duration: 3000 }
        );
      }
    });
  }

  toggleMessage(message: Message): void {
    if (this.expandedMessageId === message.id) {
      this.expandedMessageId = null;
      return;
    }

    this.expandedMessageId = message.id;

    if (!message.read) {
      this.messageService.markAsRead(message.id).pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        next: (updatedMessage) => {
          this.messages = this.messages.map(m =>
            m.id === updatedMessage.id ? updatedMessage : m
          );
        },
        error: (err) => {
          this.snackBar.open(
            err?.message || 'Impossible de marquer le message comme lu',
            'Fermer',
            { duration: 3000 }
          );
        }
      });
    }
  }

  deleteMessage(messageId: string, event: Event): void {
    event.stopPropagation();

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '380px',
      data: {
        title: 'Supprimer le message',
        message: 'Voulez-vous vraiment supprimer ce message ?',
        confirmText: 'Supprimer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((confirmed) => {
      if (!confirmed) return;

      this.messageService.delete(messageId).pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        next: () => {
          this.messages = this.messages.filter(message => message.id !== messageId);

          if (this.expandedMessageId === messageId) {
            this.expandedMessageId = null;
          }

          this.snackBar.open('Message supprimé avec succès', 'Fermer', {
            duration: 2500
          });
        },
        error: (err) => {
          this.snackBar.open(
            err?.message || 'Erreur lors de la suppression du message',
            'Fermer',
            { duration: 3500 }
          );
        }
      });
    });
  }
}