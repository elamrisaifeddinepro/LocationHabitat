import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Observable, map } from 'rxjs';
import { Announcement } from '../../../../models/announcement.model';
import { AnnouncementService } from '../../../../core/services/announcement.service';
import { AnnouncementCardComponent } from '../../../announcements/components/announcement-card/announcement-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    AnnouncementCardComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  cityControl = new FormControl('');
  minPriceControl = new FormControl<number | null>(null);
  maxPriceControl = new FormControl<number | null>(null);
  featuredAnnouncements$!: Observable<Announcement[]>;

  constructor(
    private announcementService: AnnouncementService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.featuredAnnouncements$ = this.announcementService.getActive().pipe(
      map(announcements => announcements.slice(0, 3))
    );
  }

  searchAnnouncements(): void {
    this.router.navigate(['/announcements'], {
      queryParams: {
        search: this.cityControl.value || null,
        minPrice: this.minPriceControl.value || null,
        maxPrice: this.maxPriceControl.value || null
      },
      queryParamsHandling: ''
    });
  }
}
