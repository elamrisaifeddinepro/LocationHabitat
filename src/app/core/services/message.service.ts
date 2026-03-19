import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, defer, delay, map, of, tap } from 'rxjs';
import { Message } from '../../models/message.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private readonly MESSAGES_KEY = 'messages';
  private messagesSubject: BehaviorSubject<Message[]>;
  public messages$: Observable<Message[]>;

  constructor(
    private storageService: StorageService,
    private http: HttpClient
  ) {
    const messages = this.storageService.getItem<Message[]>(this.MESSAGES_KEY) || [];
    this.messagesSubject = new BehaviorSubject<Message[]>(messages);
    this.messages$ = this.messagesSubject.asObservable();
    this.initializeMockMessages();
  }

  private initializeMockMessages(): void {
    const existing = this.storageService.getItem<Message[]>(this.MESSAGES_KEY);
    if (existing?.length) return;

    this.http.get<Message[]>('assets/mock/messages.json').pipe(
      tap(messages => this.persist(messages ?? [])),
      catchError(() => {
        this.persist([]);
        return of([]);
      })
    ).subscribe();
  }

  private persist(next: Message[]): void {
    this.storageService.setItem(this.MESSAGES_KEY, next);
    this.messagesSubject.next(next);
  }

  getReceivedMessages(userId: string): Observable<Message[]> {
    return this.messages$.pipe(
      map(messages => messages.filter(m => m.receiverId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    );
  }

  getSentMessages(userId: string): Observable<Message[]> {
    return this.messages$.pipe(
      map(messages => messages.filter(m => m.senderId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    );
  }

  getUnreadCount(userId: string): Observable<number> {
    return this.messages$.pipe(
      map(messages => messages.filter(m => m.receiverId === userId && !m.read).length)
    );
  }

  send(message: Omit<Message, 'id' | 'read' | 'createdAt'>): Observable<Message> {
    return defer(() => {
      const current = this.messagesSubject.value;
      const newMessage: Message = {
        ...message,
        id: Date.now().toString(),
        read: false,
        createdAt: new Date()
      };
      const next = [...current, newMessage];
      return of(newMessage).pipe(
        delay(300),
        tap(() => this.persist(next))
      );
    });
  }

  markAsRead(messageId: string): Observable<boolean> {
    return defer(() => {
      const current = this.messagesSubject.value;
      const index = current.findIndex(m => m.id === messageId);
      if (index === -1) {
        return of(false).pipe(delay(200));
      }
      const next = [...current];
      next[index] = { ...next[index], read: true };
      return of(true).pipe(
        delay(200),
        tap(() => this.persist(next))
      );
    });
  }

  delete(messageId: string): Observable<boolean> {
    return defer(() => {
      const current = this.messagesSubject.value;
      const next = current.filter(m => m.id !== messageId);
      return of(true).pipe(
        delay(200),
        tap(() => this.persist(next))
      );
    });
  }
}
