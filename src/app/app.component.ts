import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { combineLatest, of, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from './core/services/auth.service';
import { MessageService } from './core/services/message.service';
import { FavoritesService } from './core/services/favorites.service';
import { User } from './models/user.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  currentUser: User | null = null;
  unreadCount = 0;
  favoritesCount = 0;
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private authService: AuthService,
    private messageService: MessageService,
    private favoritesService: FavoritesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((user) => {
          this.currentUser = user;
          return combineLatest([
            user ? this.messageService.getUnreadCount(user.id) : of(0),
            user ? this.favoritesService.favoriteCount$ : of(0)
          ]);
        })
      )
      .subscribe(([unreadCount, favoritesCount]) => {
        this.unreadCount = unreadCount;
        this.favoritesCount = favoritesCount;
      });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        this.router.navigate(['/auth/login']);
      }
    });
  }
}
