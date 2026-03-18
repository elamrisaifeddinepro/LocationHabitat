import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo',
  standalone: true
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: Date | string | null | undefined): string {
    if (!value) return 'Date inconnue';

    const date = value instanceof Date ? value : new Date(value);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (Number.isNaN(date.getTime())) return 'Date invalide';
    if (seconds < 60) return 'À l’instant';
    if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)} h`;
    if (seconds < 2592000) return `Il y a ${Math.floor(seconds / 86400)} j`;

    return date.toLocaleDateString('fr-CA');
  }
}
