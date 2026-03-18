import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/services/auth.service';
import { Field, customError, form, submit } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { FormErrorsComponent } from '../../../../shared/ui/form-errors/form-errors.component';
import { REGISTER_SCHEMA, type RegisterModel } from '../../../../shared/forms/schemas';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    Field,
    FormErrorsComponent
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  private readonly model = signal<RegisterModel>({
    nom: '',
    prenom: '',
    numero: '',
    telephone: '',
    courriel: '',
    password: '',
    confirmPassword: '',
    adresse: ''
  });

  readonly registerForm = form(this.model, REGISTER_SCHEMA);
  submitted = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  get loading(): boolean {
    return this.registerForm().submitting();
  }

  async onSubmit(event?: Event): Promise<void> {
    event?.preventDefault();
    event?.stopPropagation();
    this.submitted = true;
    if (this.registerForm().invalid()) return;

    await submit(this.registerForm, async (f) => {
      const v = f().value();
      const { confirmPassword, ...payload } = v;
      try {
        await firstValueFrom(this.authService.register(payload));
        this.snackBar.open('Inscription réussie!', 'Fermer', { duration: 3000 });
        this.router.navigate(['/announcements']);
        return;
      } catch (err: any) {
        this.snackBar.open(err?.message || 'Erreur lors de l\'inscription', 'Fermer', { duration: 4000 });
        return customError({
          kind: 'server',
          message: err?.message || 'Erreur lors de l\'inscription',
          field: this.registerForm.courriel
        });
      }
    });
  }
}
