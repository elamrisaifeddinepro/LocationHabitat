import { Component, Input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-photos-gallery',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './photos-gallery.component.html',
  styleUrls: ['./photos-gallery.component.css']
})
export class PhotosGalleryComponent {
  @Input() photos: string[] = [];
  @Input() maxDisplay: number = 5;
  @Input() altText: string = 'Photo';

  currentIndex = 0;
  showLightbox = false;

  get displayedPhotos(): string[] {
    return this.photos.slice(0, this.maxDisplay);
  }

  get remainingCount(): number {
    return Math.max(0, this.photos.length - this.maxDisplay);
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (!this.showLightbox) return;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        this.previousPhoto();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.nextPhoto();
        break;
      case 'Escape':
        event.preventDefault();
        this.closeLightbox();
        break;
    }
  }

  openLightbox(index: number): void {
    this.currentIndex = index;
    this.showLightbox = true;
    document.body.style.overflow = 'hidden';
  }

  closeLightbox(): void {
    this.showLightbox = false;
    document.body.style.overflow = '';
  }

  nextPhoto(): void {
    this.currentIndex = (this.currentIndex + 1) % this.photos.length;
  }

  previousPhoto(): void {
    this.currentIndex = this.currentIndex === 0 ? this.photos.length - 1 : this.currentIndex - 1;
  }
}
