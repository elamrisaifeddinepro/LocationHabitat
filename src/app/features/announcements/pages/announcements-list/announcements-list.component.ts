import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Observable, combineLatest, map, startWith, switchMap } from 'rxjs';
import { Announcement } from '../../../../models/announcement.model';
import { AnnouncementService } from '../../../../core/services/announcement.service';
import { AnnouncementCardComponent } from '../../components/announcement-card/announcement-card.component';

@Component({
  selector: 'app-announcements-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    AnnouncementCardComponent
  ],
  templateUrl: './announcements-list.component.html',
  styleUrls: ['./announcements-list.component.css']
})
export class AnnouncementsListComponent implements OnInit {
  announcements$!: Observable<Announcement[]>;
  searchControl = new FormControl('');
  minPriceControl = new FormControl<number | null>(null);
  maxPriceControl = new FormControl<number | null>(null);
  ownerName: string | null = null;

  constructor(
    private announcementService: AnnouncementService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.announcements$ = this.route.queryParams.pipe(
      switchMap(params => {
        const ownerId = params['ownerId'];
        const search = params['search'] ?? '';
        const minPrice = params['minPrice'] ? Number(params['minPrice']) : null;
        const maxPrice = params['maxPrice'] ? Number(params['maxPrice']) : null;

        this.searchControl.setValue(search, { emitEvent: false });
        this.minPriceControl.setValue(minPrice, { emitEvent: false });
        this.maxPriceControl.setValue(maxPrice, { emitEvent: false });

        const baseAnnouncements$ = ownerId
          ? this.announcementService.getByOwnerId(ownerId)
          : this.announcementService.getActive();

        return combineLatest([
          baseAnnouncements$,
          this.searchControl.valueChanges.pipe(startWith(this.searchControl.value ?? '')),
          this.minPriceControl.valueChanges.pipe(startWith(this.minPriceControl.value)),
          this.maxPriceControl.valueChanges.pipe(startWith(this.maxPriceControl.value))
] ).pipe(
          map(([announcements, currentSearch, currentMinPrice, currentMaxPrice]) => {
            if (announcements.length > 0 && ownerId) {
              this.ownerName = announcements[0].ownerName;
            } else if (!ownerId) {
              this.ownerName = null;
            }

            const filtered = announcements.filter(announcement => {
              const normalizedSearch = (currentSearch ?? '').toLowerCase().trim();
              const matchesSearch = !normalizedSearch ||
                announcement.titre.toLowerCase().includes(normalizedSearch) ||
                announcement.descriptionCourte.toLowerCase().includes(normalizedSearch) ||
                announcement.adresseLocalisation.toLowerCase().includes(normalizedSearch);

              const matchesMinPrice = !currentMinPrice || announcement.mensualite >= currentMinPrice;
              const matchesMaxPrice = !currentMaxPrice || announcement.mensualite <= currentMaxPrice;

              return matchesSearch && matchesMinPrice && matchesMaxPrice;
            });

            return filtered;
          })
        );
      })
    );
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.minPriceControl.setValue(null);
    this.maxPriceControl.setValue(null);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { search: null, minPrice: null, maxPrice: null },
      queryParamsHandling: 'merge'
    });
  }
}

