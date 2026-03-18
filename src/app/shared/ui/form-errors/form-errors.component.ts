import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import type { FieldTree, ValidationError } from '@angular/forms/signals';

@Component({
  selector: 'app-form-errors',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule],
  template: `
    @if (shouldShow) {
      @for (e of errors; track $index) {
        <mat-error>{{ messageFor(e) }}</mat-error>
      }
    }
  `
})
export class FormErrorsComponent {
  // IMPORTANT: avoid `any` here, because `FieldTree<any>` becomes the compat type.
  @Input({ required: true }) field!: FieldTree<unknown>;
  @Input() submitted = false;

  get shouldShow(): boolean {
    const s = this.field();
    return !!this.submitted || !!s.touched();
  }

  get errors(): readonly ValidationError.WithField[] {
    return this.field().errors();
  }

  messageFor(err: ValidationError): string {
    if (err.message) return err.message;
    switch (err.kind) {
      case 'required':
        return 'Champ requis';
      case 'email':
        return 'Email invalide';
      case 'minLength':
        return 'Trop court';
      case 'maxLength':
        return 'Trop long';
      case 'min':
        return 'Valeur trop petite';
      case 'max':
        return 'Valeur trop grande';
      case 'pattern':
        return 'Format invalide';
      default:
        return 'Champ invalide';
    }
  }
}
