import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { Announcement } from '../../../../models/announcement.model';
import { FavoritesService } from '../../../../core/services/favorites.service';
import { AnnouncementCardComponent } from '../../../announcements/components/announcement-card/announcement-card.component';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    AnnouncementCardComponent
  ],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit {
  favorites$!: Observable<Announcement[]>;

  constructor(private favoritesService: FavoritesService) {}

  ngOnInit(): void {
    this.favorites$ = this.favoritesService.getFavorites();
  }

  clearFavorites(): void {
    this.favoritesService.clear();
  }
}
