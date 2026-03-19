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
    if (!currentUser) return;

    this.isLoading = true;
    this.messageService.getReceivedMessages(currentUser.id).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(messages => {
      this.messages = messages;
      this.isLoading = false;
    });
  }

  toggleMessage(message: Message): void {
    if (this.expandedMessageId === message.id) {
      this.expandedMessageId = null;
    } else {
      this.expandedMessageId = message.id;
      if (!message.read) {
        this.messageService.markAsRead(message.id).subscribe();
      }
    }
  }

  deleteMessage(messageId: string, event: Event): void {
    event.stopPropagation();

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Supprimer le message',
        message: 'Voulez-vous vraiment supprimer ce message de votre boîte de réception ?',
        confirmLabel: 'Supprimer',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;

      this.messageService.delete(messageId).subscribe({
        next: () => {
          this.snackBar.open('Message supprimé', 'Fermer', { duration: 3000 });
        },
        error: () => {
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
        }
      });
    });
  }
}
