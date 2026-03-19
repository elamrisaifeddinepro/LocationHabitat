import { Component, DestroyRef, Input, OnInit, OnDestroy, AfterViewInit, OnChanges, SimpleChanges, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { GeocodingService } from '../../../core/services/geocoding.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-container">
      <div #mapContainer class="map"></div>
      @if (loading) {
        <div class="map-loading">
          <div class="spinner"></div>
          <span>Chargement de la carte...</span>
        </div>
      }
      @if (error) {
        <div class="map-error">
          <span>{{ error }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .map-container { width: 100%; height: 400px; position: relative; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.15); background: #fff; }
    .map { width: 100%; height: 100%; position: absolute; top: 0; left: 0; z-index: 1; }
    .map-loading, .map-error { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; width: 100%; height: 100%; background-color: #f9f9f9; color: #666; font-size: 14px; position: absolute; top: 0; left: 0; z-index: 2; }
    .map-error { color: #d32f2f; background-color: #ffebee; }
    .spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3f51b5; border-radius: 50%; animation: spin 1s linear infinite; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  `]
})
export class MapComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @Input() address: string = '';
  @Input() lat: number | null = null;
  @Input() lng: number | null = null;

  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  private map: L.Map | null = null;
  private marker: L.Marker | null = null;
  private readonly destroyRef = inject(DestroyRef);
  private readonly timers: number[] = [];

  loading = true;
  error: string | null = null;

  constructor(private geocodingService: GeocodingService) {}

  ngOnInit(): void {
    this.fixLeafletIconPaths();
  }

  ngAfterViewInit(): void {
    this.setTimer(() => this.loadMap(), 100);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.mapContainer) return;
    if (changes['lat'] || changes['lng'] || changes['address']) {
      this.setTimer(() => this.loadMap(), 50);
    }
  }

  ngOnDestroy(): void {
    this.clearTimers();
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  private setTimer(fn: () => void, delay: number): void {
    const id = setTimeout(fn, delay) as unknown as number;
    this.timers.push(id);
  }

  private clearTimers(): void {
    for (const id of this.timers) clearTimeout(id);
    this.timers.length = 0;
  }

  private fixLeafletIconPaths(): void {
    const iconDefault = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = iconDefault;
  }

  private loadMap(): void {
    this.loading = true;
    this.error = null;

    const hasCoords = typeof this.lat === 'number' && typeof this.lng === 'number';

    if (hasCoords) {
      this.initializeMap(this.lat as number, this.lng as number);
      return;
    }

    const addr = String(this.address ?? '').trim();
    if (!addr) {
      this.error = 'Aucune adresse fournie';
      this.loading = false;
      return;
    }

    this.geocodingService.geocodeAddress(addr)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) {
          this.initializeMap(result.lat, result.lng);
        } else {
          this.error = 'Impossible de localiser cette adresse';
          this.loading = false;
        }
      });
  }

  private initializeMap(lat: number, lng: number): void {
    if (this.map) this.map.remove();

    this.setTimer(() => {
      try {
        this.map = L.map(this.mapContainer.nativeElement, {
          center: [lat, lng],
          zoom: 14,
          zoomControl: true,
          scrollWheelZoom: true
        });

        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
          minZoom: 3,
          crossOrigin: true
        });

        let tilesLoaded = false;

        tileLayer.on('load', () => {
          if (!tilesLoaded) {
            tilesLoaded = true;
            this.setTimer(() => { this.loading = false; }, 200);
          }
        });

        tileLayer.addTo(this.map);

        this.setTimer(() => { this.map?.invalidateSize(); }, 250);

        const popupText = this.address ? `<strong>${this.address}</strong>` : `<strong>${lat}, ${lng}</strong>`;

        this.marker = L.marker([lat, lng]).addTo(this.map).bindPopup(popupText, { maxWidth: 300 });

        this.setTimer(() => {
          if (this.marker && !this.marker.isPopupOpen()) this.marker.openPopup();
        }, 350);

        this.setTimer(() => {
          if (!tilesLoaded) this.loading = false;
        }, 1500);

      } catch (e) {
        console.error('Error initializing map:', e);
        this.error = 'Erreur lors de l\'initialisation de la carte';
        this.loading = false;
      }
    }, 100);
  }
}