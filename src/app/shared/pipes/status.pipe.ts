import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'status',
  standalone: true
})
export class StatusPipe implements PipeTransform {
  transform(active: boolean): string {
    return active ? 'Actif' : 'Inactif';
  }
}
