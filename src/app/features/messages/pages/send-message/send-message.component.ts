import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MessageService } from '../../../../core/services/message.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Field, customError, form, submit } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { FormErrorsComponent } from '../../../../shared/ui/form-errors/form-errors.component';
import { SEND_MESSAGE_SCHEMA, type SendMessageModel } from '../../../../shared/forms/schemas';

@Component({
  selector: 'app-send-message',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    Field,
    FormErrorsComponent
  ],
  templateUrl: './send-message.component.html',
  styleUrls: ['./send-message.component.css']
})
export class SendMessageComponent implements OnInit {
  private readonly model = signal<SendMessageModel>({ objet: '', contenu: '' });
  readonly messageForm = form(this.model, SEND_MESSAGE_SCHEMA);

  submitted = false;
  error: string | null = null;
  announcementId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.announcementId = this.route.snapshot.queryParamMap.get('announcementId');

    if (!this.announcementId) {
      this.error = 'Annonce non spécifiée';
    }
  }

  get loading(): boolean {
    return this.messageForm().submitting();
  }

  async onSubmit(event?: Event): Promise<void> {
    event?.preventDefault();

    this.submitted = true;

    if (this.messageForm().invalid() || !this.announcementId) {
      return;
    }

    this.error = null;

    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      this.error = 'Vous devez être connecté pour envoyer un message';
      return;
    }

    const messageData = {
      senderId: currentUser.id,
      senderName: `${currentUser.prenom} ${currentUser.nom}`,
      receiverId: '',
      receiverName: '',
      announcementId: this.announcementId,
      announcementTitre: '',
      sujet: this.messageForm().value().objet,
      texte: this.messageForm().value().contenu
    };

    await submit(this.messageForm, async () => {
      try {
        await firstValueFrom(this.messageService.send(messageData));
        await this.router.navigate(['/messages']);
        return;
      } catch (err: any) {
        this.error = err?.message || 'Erreur lors de l’envoi du message';

        return customError({
          kind: 'server',
          message: this.error ?? undefined,
          field: this.messageForm.contenu
        });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/messages']);
  }
}