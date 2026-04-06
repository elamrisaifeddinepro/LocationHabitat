import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { Message } from '../../models/message.model';
import { environment } from '../../../environments/environment';

interface BusinessMessageResponse {
  id: number;
  announcementId: number;
  announcementTitle: string;
  senderAuthUserId: string;
  senderEmail: string;
  recipientAuthUserId: string;
  recipientEmail: string;
  subject: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  constructor(private http: HttpClient) {}

  private toFrontendMessage(api: BusinessMessageResponse): Message {
    return {
      id: String(api.id),
      sujet: api.subject,
      texte: api.content,
      senderId: api.senderAuthUserId,
      senderName: api.senderEmail,
      receiverId: api.recipientAuthUserId,
      receiverName: api.recipientEmail,
      announcementId: String(api.announcementId),
      announcementTitre: api.announcementTitle,
      read: api.isRead,
      createdAt: new Date(api.createdAt)
    };
  }

  getReceivedMessages(_userId: string): Observable<Message[]> {
    return this.http.get<BusinessMessageResponse[]>(`${environment.businessApiUrl}/messages/inbox`).pipe(
      map((items) => (items ?? []).map(item => this.toFrontendMessage(item))),
      catchError((err) => this.handleError(err, 'Erreur lors du chargement de la boîte de réception'))
    );
  }

  getSentMessages(_userId: string): Observable<Message[]> {
    return this.http.get<BusinessMessageResponse[]>(`${environment.businessApiUrl}/messages/sent`).pipe(
      map((items) => (items ?? []).map(item => this.toFrontendMessage(item))),
      catchError((err) => this.handleError(err, 'Erreur lors du chargement des messages envoyés'))
    );
  }

  getUnreadCount(_userId: string): Observable<number> {
    return this.getReceivedMessages('').pipe(
      map(messages => messages.filter(m => !m.read).length)
    );
  }

  send(message: Omit<Message, 'id' | 'read' | 'createdAt'>): Observable<Message> {
    const payload = {
      announcementId: Number(message.announcementId),
      subject: message.sujet?.trim(),
      content: message.texte?.trim()
    };

    return this.http.post<BusinessMessageResponse>(`${environment.businessApiUrl}/messages`, payload).pipe(
      map((item) => this.toFrontendMessage(item)),
      catchError((err) => this.handleError(err, 'Erreur lors de l’envoi du message'))
    );
  }

  markAsRead(messageId: string): Observable<Message> {
    return this.http.patch<BusinessMessageResponse>(
      `${environment.businessApiUrl}/messages/${messageId}/read`,
      {}
    ).pipe(
      map((item) => this.toFrontendMessage(item)),
      catchError((err) => this.handleError(err, 'Erreur lors du marquage du message comme lu'))
    );
  }

  delete(messageId: string): Observable<boolean> {
    return this.http.delete<void>(`${environment.businessApiUrl}/messages/${messageId}`).pipe(
      map(() => true),
      catchError((err) => this.handleError(err, 'Erreur lors de la suppression du message'))
    );
  }

  private handleError(err: any, fallbackMessage: string): Observable<never> {
    const message =
      err?.error?.message ||
      err?.error?.error ||
      err?.message ||
      fallbackMessage;

    return throwError(() => ({ message }));
  }
}